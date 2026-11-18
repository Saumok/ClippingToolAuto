# 04 — MVP Scope & Roadmap

Principle: **one complete end-to-end thread first**, then widen. A thin slice that
goes live-URL → detect → clip → caption → phone-approve → upload beats ten
half-features. "Deadline tomorrow" means we ship Milestone 1 as a real vertical slice,
not a fake demo.

## Honest scope for "by tomorrow"

Achievable as a **working vertical slice in ~1 day**:
- Dashboard (add stream, see clips, approve) + Supabase schema + auth.
- Worker that ingests one public YouTube live URL, buffers it, detects **chat-spike +
  audio-energy** moments, cuts a 20s clip, reframes to 9:16, burns Whisper captions,
  generates a title, stores it, pings Telegram.
- One-tap approve on phone → worker uploads to **your** channel (private until Google
  verification).

**Not** by tomorrow (honest): Google public-publish verification (external, weeks),
polished multi-speaker tracking, full multi-stream scale, visual-AI scene semantics.
Those are Phase 3–4.

## Milestones (end-to-end-first ordering)

### M0 — Foundation (scaffold)
- [ ] Monorepo: `/dashboard` (Next.js PWA) + `/worker` (FastAPI) + `/db` (SQL).
- [ ] Supabase project: tables `streams`, `clips`, `accounts`, `jobs`, `settings`, `heartbeat`; RLS; Storage buckets.
- [ ] Supabase Auth login on dashboard; shared env/secrets wiring.

### M1 — The vertical slice (the "it actually works" milestone)
- [ ] Worker: ingest one public live URL via yt-dlp → rolling FFmpeg buffer.
- [ ] Detector v1: chat-spike (chat-downloader) + audio-RMS window → scored candidate.
- [ ] Clipper: cut 20s around the moment from the buffer, boundary-snap, dedup.
- [ ] Editor: 9:16 center/face crop (OpenShorts core) + faster-whisper captions.
- [ ] Metadata: title + hashtags (template now, Gemini next).
- [ ] Store clip to Supabase; `pending_review` row; Telegram push with preview link.
- [ ] Dashboard: Overview + Clip Review card + **Approve/Reject** (mobile).
- [ ] Publisher: `approved` → YouTube resumable upload (idempotent) → `published`.
- ✅ **Exit criterion:** a real moment from a real stream becomes a captioned Short you
  approve on your phone and that appears on your channel. Tested, not claimed.

### M2 — Controls & reliability
- [ ] Start/pause/stop monitoring per stream + emergency stop (all from phone).
- [ ] Publishing settings: manual vs. auto-publish, max uploads/day, default privacy/hashtags.
- [ ] Job retries + backoff + dead-letter; worker heartbeat + "worker down" alert.
- [ ] Multi-YouTube-channel OAuth connect + per-stream destination.

### M3 — Smarter detection & editing
- [ ] Scene-change visual signal (sampled frames) added to scorer; configurable weights.
- [ ] Gemini contextual confirm + better titles/"why selected"; local-LLM fallback.
- [ ] Active-speaker reframing (cutawan/TalkNet ideas); caption styles + word highlight.
- [ ] Clip duration presets (15/20/30/45/custom); regenerate captions / reprocess.

### M4 — Scale & automation
- [ ] Multiple simultaneous streams with backpressure.
- [ ] Scheduled publishing queue + max/day enforcement.
- [ ] Move worker to VPS/Oracle; systemd/Docker `restart=always`; backups.
- [ ] Google OAuth verification submitted for **public** auto-publish.

## Build order rationale
M1 proves the hardest unknowns (live ingestion + real cut + real upload) on day one.
Everything after is additive and can't invalidate the core. We never ship a button
without a backend behind it; any temporary mock is labeled `// MOCK` and tracked here.

## Status legend (keep this honest in every update)
`Implemented` · `Tested` · `Partially working` · `Blocked` · `Not implemented`.
Nothing is called "working" until it has actually run against a live stream.
