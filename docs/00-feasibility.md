# 00 — Feasibility Assessment (read this first)

No hype. This is what is achievable, what needs a compromise, and what cannot be
guaranteed. Items are marked: ✅ works · ⚠️ works with a real compromise · ❌ not realistic.

## The question you asked

> Can we build a system that continuously monitors selected YouTube livestreams,
> detects interesting moments in near real time, creates professionally formatted
> vertical Shorts, and lets me approve and publish them entirely from my phone?

**Yes — with four honest qualifiers.** They are the backbone of the whole design.

### Qualifier 1 — "Near real-time," not instant ⚠️

YouTube's official API **does not give you the live video/audio feed**. It gives
metadata and live chat only. The only practical way to get live pixels/audio is to
pull the stream's public **HLS manifest with `yt-dlp`**, which is delivered in
segments. Combined with buffering, transcription, and encoding, realistic latency
from "moment happens" to "clip is in your approval queue" is **~60–180 seconds**.
That is near-real-time, and it's fine for Shorts. It is not sub-second.

A livestream also usually carries a broadcaster-set delay. So this is monitoring a
**public URL via yt-dlp**, which is categorically different from, and less reliable
than, ingesting a feed you own via RTMP. If you own the source stream, we can take
the RTMP/local feed directly and latency + reliability both improve dramatically.

### Qualifier 2 — "Free" has one unavoidable paid-ish component ⚠️

The dashboard (Vercel) and database (Supabase) are genuinely free at this scale.
The problem is the **worker**: continuous video decode + Whisper + FFmpeg is CPU-heavy
and **cannot run on Vercel** (no long-running processes; 300s cap) nor on any
"scale-to-zero" free tier. You need **one always-on machine**. Options, cheapest first:

- **Your own PC**, always on — truly $0, but then "works while my laptop is closed"
  is only true if that PC stays awake. A phone can't be the worker.
- **Oracle Cloud Always Free (ARM Ampere, 4 cores/24GB)** — $0 if available in your
  region and not reclaimed; setup friction and occasional capacity denials.
- **A small VPS (Hetzner/Contabo/etc.)** — **~$5–12/month**, boringly reliable. This
  is my recommendation and it is the honest price of "runs while I'm unavailable."

### Qualifier 3 — Auto-publishing publicly needs Google verification ⚠️

With the YouTube Data API, an **unverified** OAuth app can upload — but uploaded
videos are **forced to `private`** and cannot be made public. To publish **public**
Shorts you must pass **Google OAuth verification (app audit)** for the sensitive
`youtube.upload` scope. That review takes **days to weeks**. Until it clears, the
system works end-to-end but videos land as **private/unlisted** for you to flip
manually. Also: default upload **quota is 10,000 units/day ≈ 6 uploads/day**; more
requires a quota-increase request. This is a Google policy limit, not a code limit.

### Qualifier 4 — Copyright / ToS reality ⚠️❌

Auto-clipping **someone else's** livestream and reposting to your channel invites
Content ID claims and strikes, and may violate YouTube ToS. The system is safe and
sustainable only for streams you **own or are explicitly authorized** to clip. The
product is built on that assumption. I will not build it around scraping arbitrary
creators — that's the fast path to a terminated channel.

## Component-by-component feasibility

| Capability | Verdict | Note |
|---|---|---|
| Add/select live stream URLs, assign dest channel | ✅ | Trivial CRUD. |
| Detect stream live/offline | ✅ | `yt-dlp`/API metadata poll. |
| Get live **chat** signal | ✅ | `chat-downloader` (no quota) or liveChat API (quota-heavy). |
| Get live **video/audio** | ⚠️ | `yt-dlp` HLS of a public URL; fragile vs. owned RTMP feed. |
| Rolling buffer + timestamped cut | ✅ | We build this; FFmpeg segment muxer. |
| Chat-spike detection | ✅ | Rolling-window z-score. Cheap, effective. |
| Audio-energy / laughter / shouting | ✅ (basic) ⚠️ (semantic) | RMS/onset is easy; "laughter vs applause" classification is heavier. |
| Visual scene-change sampling | ✅ | Sampled frames, not every frame. |
| Contextual AI "is this actually good" | ✅ | Gemini on the transcript window; optional, rate-limited, replaceable. |
| 9:16 reframe w/ speaker tracking | ✅ | YOLOv8 + MediaPipe / active-speaker (proven in all 4 repos). |
| Word-level captions | ✅ | faster-whisper, local, free. |
| AI titles/hashtags/description | ✅ | Gemini or local LLM. |
| Mobile PWA dashboard + approve | ✅ | Next.js PWA; approval persists server-side. |
| Upload continues after browser closed | ✅ | Worker owns the job, not the browser. |
| One-tap approve → auto-publish | ✅ (private) ⚠️ (public) | Public needs Qualifier 3 verification. |
| Telegram push notifications | ✅ | Free, reliable, deep-links to the clip. |
| Multiple simultaneous streams | ⚠️ | Each stream ≈ a full CPU core. 1–2 on free/small hardware, more needs a bigger box. |
| Fully hands-off auto-posting (no approval) | ✅ technically, ⚠️ advised against | Supported as a toggle, but auto-publishing AI picks unsupervised risks bad/again-copyright posts. Default = approve-first. |

## Biggest technical challenges (ranked)

1. **Reliable live ingestion** from a public HLS URL that can rotate/expire mid-stream — needs auto-reconnect + buffer continuity.
2. **Precision of "the moment"** — turning noisy signals into a clip that starts/ends on a clean beat without cutting dialogue.
3. **Staying inside quota + Google verification** for real public publishing.
4. **Doing all of this on one modest CPU box** without falling behind the live edge (backpressure + graceful signal degradation).
5. **Crash/disconnect recovery** so it genuinely runs while you're away.

## What I will NOT promise

- Sub-30-second end-to-end latency.
- 100% free with cloud reliability (one ~$5–12/mo box is the honest floor).
- Instant public auto-publishing before Google app verification clears.
- Clipping arbitrary third-party streamers without copyright risk.
- 4+ concurrent streams on free-tier hardware.
