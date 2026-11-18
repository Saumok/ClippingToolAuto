# ClipPilot

Autonomous, mobile-controlled AI pipeline that monitors YouTube live streams,
detects engaging moments in **near real-time**, cuts them into captioned 9:16
Shorts, and publishes them to your channel after a one-tap approval from your phone.

> **Status:** Planning. No application code yet. This repo currently contains
> the architecture, feasibility assessment, repo audit, and roadmap. Read
> [`docs/00-feasibility.md`](docs/00-feasibility.md) **first** — it tells you
> honestly what will work, what needs compromise, and what cannot be guaranteed.

## The one-sentence honest verdict

Yes, we can build this — **as a near-real-time (not instant) system, running on a
small always-on worker (not purely free), publishing to channels you own or are
authorized to clip (not arbitrary streamers), with Shorts auto-posted after your
one-tap approval.** Every one of those qualifiers is explained in the docs.

## Document map

| Doc | What it answers |
|-----|-----------------|
| [`docs/00-feasibility.md`](docs/00-feasibility.md) | What is real vs. marketing. The hard limits (live feed, quota, auto-publish, copyright). |
| [`docs/01-repo-audit.md`](docs/01-repo-audit.md) | Detailed audit of the 4 repos + comparison table + reuse decision. |
| [`docs/02-architecture.md`](docs/02-architecture.md) | Components, data flow, and how it survives laptop-closed / crash / disconnect. |
| [`docs/03-cost.md`](docs/03-cost.md) | 3 deployment scenarios (free / low-cost / reliable) with real numbers. |
| [`docs/04-mvp-roadmap.md`](docs/04-mvp-roadmap.md) | Phased build plan, what ships first, end-to-end-first ordering. |
| [`docs/05-open-decisions.md`](docs/05-open-decisions.md) | The decisions/credentials I need from you to proceed. |

## Chosen stack (summary — rationale in architecture doc)

- **Dashboard:** Next.js (App Router) PWA on Vercel free tier — mobile-first.
- **Shared state / DB / auth / storage:** Supabase free tier (Postgres + Storage + Auth).
- **Worker (the always-on brain):** Python + FastAPI, reusing **OpenShorts** (MIT)
  processing core, extended with a live-ingestion layer. Runs on one persistent
  host (your PC, a cheap VPS, or Oracle Cloud Free) — **not** Vercel.
- **Ingestion:** `yt-dlp` rolling HLS buffer + `chat-downloader` for chat-spike signal.
- **Detection:** chat-spike + audio-RMS + scene-change heuristics, scored, with
  optional Gemini contextual pass. **No per-frame paid AI.**
- **Edit:** FFmpeg + faster-whisper captions + YOLOv8/MediaPipe reframing (all local).
- **Publish:** YouTube Data API v3 (resumable upload) from the worker.
- **Notifications:** Telegram bot (free, reliable mobile push, deep-links to approve).
