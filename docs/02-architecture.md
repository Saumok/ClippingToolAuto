# 02 — System Architecture

A **modular monolith worker** + a **thin web dashboard** + **shared Postgres state**.
No microservices. The guiding rule: the dashboard can die, your phone can sleep, the
browser can close — **the worker and the database are the source of truth**, so work
continues.

## 1. Topology (three processes, one source of truth)

```
┌──────────────────────────┐        ┌───────────────────────────────┐
│  DASHBOARD (Next.js PWA)  │        │  SUPABASE (always-on cloud)   │
│  Vercel free tier         │  <──>  │  Postgres  = state + job queue│
│  - mobile-first UI        │  HTTPS │  Auth      = login            │
│  - approve / reject / edit│        │  Storage   = clip .mp4 + thumb│
│  - system controls        │        │  Realtime  = live UI updates  │
└──────────────────────────┘        └───────────────┬───────────────┘
            ▲  push (Telegram)                        │ poll/listen + read/write
            │                                         ▼
┌───────────┴───────────────────────────────────────────────────────┐
│  WORKER  (Python / FastAPI, always-on host: PC / Oracle Free / VPS)│
│  ────────────────────────────────────────────────────────────────  │
│  Ingestion → Signals → Scorer → Clipper → Editor → Metadata        │
│  → Approval gate → Publisher → Notifier,  all driven by a          │
│  Postgres-backed job queue with retries + idempotency.             │
│  Reuses OpenShorts editing core (MIT).                             │
└───────────────────────────────────────────────────────────────────┘
```

Why the dashboard talks to **Supabase**, not directly to the worker: the worker lives
on a home PC / VPS behind NAT and may restart. Supabase is the stable, always-reachable
rendezvous point. The phone writes an intent ("approve clip 42") to Postgres; the worker
reads it when ready. Nothing is lost if either side is briefly offline.

## 2. Component responsibilities (the 17 logical parts, mapped)

| # | Component | Where it runs | Built from |
|---|---|---|---|
| 1 | Web dashboard | Vercel | New (Next.js PWA) |
| 2 | Authentication | Supabase Auth | Config |
| 3 | YouTube OAuth / channel mgmt | Worker + Supabase | New + google-api-python-client |
| 4 | Stream management (CRUD) | Dashboard + Postgres | New |
| 5 | Live video ingestion | Worker | New (yt-dlp HLS rolling buffer) |
| 6 | Live chat monitoring | Worker | `chat-downloader` |
| 7 | Audio analysis | Worker | FFmpeg/librosa RMS + onset |
| 8 | Viral-moment detection/scoring | Worker | New (weighted scorer) |
| 9 | Clip extraction | Worker | FFmpeg (OpenShorts) |
| 10 | Video editing / 9:16 reframe | Worker | OpenShorts (YOLOv8+MediaPipe) + cutawan ideas |
| 11 | Speech-to-text | Worker | faster-whisper |
| 12 | Caption generation | Worker | OpenShorts + libass styles |
| 13 | Metadata generation | Worker | Gemini / local LLM (pluggable) |
| 14 | Approval management | Postgres state machine | New |
| 15 | YouTube publishing | Worker | YouTube Data API v3 resumable upload |
| 16 | Notifications | Worker | Telegram Bot API |
| 17 | Background job management | Worker | Postgres-backed queue + scheduler |

## 3. Data flow (one moment, end to end)

1. **Monitor** — worker polls each enabled stream: live? If yes, start an ingestion loop.
2. **Ingest** — `yt-dlp` pulls the HLS stream; FFmpeg writes a **rolling buffer** of the
   last N minutes as indexed segments on local disk. Chat tapped in parallel.
3. **Signals (continuous)** — per sliding window compute: chat-spike z-score, audio RMS
   delta, scene-change rate. Each emits a timestamped signal with intensity.
4. **Score** — weighted sum (weights configurable) → candidate moment with a center
   timestamp when it crosses threshold. Debounce so one event ≠ many clips.
5. **Confirm (optional)** — transcribe the window; optional Gemini pass: "is this
   genuinely interesting? give a title." Rate-limited, cached, skippable.
6. **Clip** — cut `center ± (duration/2)` from the buffer, snapped to sentence/scene
   boundaries so dialogue isn't severed. Dedup against recent clips (time + text hash).
7. **Edit** — 9:16 reframe with speaker tracking; burn word-level captions; optional
   hook/zoom. Output 1080×1920 H.264/AAC MP4.
8. **Metadata** — title, description, hashtags, hook, "why selected" summary.
9. **Store + queue** — upload MP4 + thumb to Supabase Storage; insert `clip` row
   (status=`pending_review`).
10. **Notify** — Telegram push with preview + deep link to the approval screen.
11. **Approve** — you tap Approve on your phone → row → `approved`. (Or auto if
    auto-publish toggle on.)
12. **Publish** — worker's publisher picks up `approved` rows, uploads via YouTube API
    (resumable, idempotent), writes back video ID + URL → `published`. Telegram confirms.

## 4. The clip lifecycle state machine (never double-publishes)

```
detected → clipping → editing → pending_review
   → (approve) → queued_for_upload → uploading → published
   → (reject)  → rejected
   any step → failed → (retry/backoff) → back to its step, or → dead_letter
```

Rules enforced in the DB: a clip can be published **only** from `queued_for_upload`;
`published` is terminal; a unique idempotency key per clip prevents duplicate uploads
even if the worker restarts mid-upload. Rejected clips can never be published.

## 5. How it survives failure (the "works while I'm away" contract)

| Failure | Behavior |
|---|---|
| **Laptop/dashboard closed** | Irrelevant — worker + Postgres run independently. |
| **Phone offline** | Approvals wait in Postgres; Telegram delivers when you reconnect. |
| **Browser closed mid-approve** | Approval is a DB write; upload is owned by the worker. |
| **Worker crashes** | systemd/pm2/Docker `restart=always` relaunches it; it resumes from DB job states (every job is persisted, not in-memory). |
| **Stream disconnects** | Ingestion loop auto-reconnects with backoff; marks stream `reconnecting`; resumes buffer. |
| **Upload fails** | Job → `failed`, exponential-backoff retry (resumable upload continues from offset); after N tries → dead_letter + Telegram alert + dashboard "Retry". |
| **Gemini/AI down** | Detection falls back to heuristics-only; metadata falls back to template/local LLM. Pipeline never hard-depends on a cloud AI. |
| **Supabase unreachable** | Worker keeps buffering/detecting locally, queues writes, flushes on reconnect. |
| **Worker host dies entirely** | Health-check cron (Supabase scheduled fn or external uptime ping) misses heartbeat → Telegram "worker down" alert so you know to restart the box. |

Worker writes a `heartbeat` timestamp every ~30s; dashboard shows green/red; a missed
heartbeat is itself a notification.

## 6. Security (baked in, per requirements)

- Google OAuth tokens + Gemini key live **only** on the worker / in Supabase secured
  columns + env vars — **never** shipped to the browser.
- No Google passwords ever touched (OAuth only).
- Dashboard routes behind Supabase Auth; Postgres **Row-Level Security** so a user sees
  only their own streams/clips.
- Input validation on every URL/field; rate-limit control endpoints.
- Upload idempotency + job dedup (section 4) prevent accidental/duplicate publishes.
- Rejected/unapproved clips are structurally unpublishable (state machine).
- Designed for content you own or are authorized to clip (see feasibility doc).
