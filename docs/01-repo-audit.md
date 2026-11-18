# 01 — GitHub Repository Audit

Four repos audited from their READMEs. The single most important finding:
**all four are VOD/batch tools. None ingests a live stream in real time.** Every one
takes a finished video or a VOD URL, processes it start-to-finish, and outputs clips.
So for the *live* half of this product there is no existing repo to reuse — we build
the ingestion/rolling-buffer/signal layer ourselves and feed **completed segments**
into a reused editing core.

## Comparison table

| Repository | Main function | Stack | License | Live? | Real-time? | Vertical crop | Captions | AI detection | YT upload | Reusability |
|---|---|---|---|---|---|---|---|---|---|---|
| **gastonmorsetto/openshorts** | Long→Shorts platform (web) | Python 3.11 **FastAPI** + React/Vite; yt-dlp, faster-whisper, YOLOv8, MediaPipe, OpenCV, Gemini, FFmpeg | **MIT** (core) | ❌ | ❌ (batch) | ✅ scene-aware, face track, multi-layout | ✅ word-level + hooks | ✅ Gemini on transcript | ✅ direct publish | **Reusable with modifications — chosen base** |
| **JeremySNR/cutawan** | Long→Shorts desktop app | **Electron** + TS + React; FFmpeg, faster-whisper, UltraFace + LR-ASD (ONNX), yt-dlp | **MIT** | via URL only | ❌ (batch) | ✅ active-speaker reframe, auto-zoom | ✅ 12 styles, karaoke | ✅ virality scoring | ❌ caption only, manual upload | **Reference (best speaker-tracking ideas)** |
| **FujiwaraChoki/supoclip** | OpusClip-style clipper | **FastAPI + ARQ** worker + **Next.js**; AssemblyAI, Gemini/OpenAI/Anthropic/Ollama, Docker | **Noncommercial** source license | ❌ | ❌ (batch) | ✅ face-crop | ✅ AssemblyAI (paid) | ✅ LLM virality | ✅ scheduling | **Reference (ARQ queue + Next.js pattern)** |
| **ColinGPT9/clips-studio** ("Clips Kitty") | Local AI clipper, broadest feature set | Python + **Electron**/React; YOLOv8, TalkNet-ASD, faster-whisper, Ollama, FFmpeg | **AGPL-3.0** | ❌ by design (VOD only) | ❌ (batch) | ✅ speaker/ball tracking, crop-only | ✅ word-sync, 19-lang | ✅ **multimodal** (transcript+audio+visual+reaction) | ✅ direct + hands-off auto-post | **Reference (best detection + auto-post model); license blocks direct reuse** |

## Per-repo notes

### openshorts — CHOSEN BASE (reuse with modifications)
The only one that is **server/web-shaped** out of the box (FastAPI backend + React
frontend, Docker), MIT-licensed, and already wires together exactly our editing
toolchain: `yt-dlp`, `faster-whisper`, `YOLOv8`, `MediaPipe`, `OpenCV`, `FFmpeg`,
and Gemini. We keep its clip-extraction → reframe → caption → metadata → publish
pipeline and **bolt a live-ingestion front-end onto it** (the part it lacks). MIT
means no legal friction for a hosted/commercial product.

### cutawan — reference
Cleanest license (MIT) and the **strongest active-speaker reframing** (UltraFace +
LR-ASD via ONNX Runtime) and caption styling (karaoke/libass). But it's Electron
desktop — wrong shape for an always-on headless worker. We **port its reframing +
caption-style ideas** into the OpenShorts worker rather than adopting the app.

### supoclip — reference
Architecturally the closest to what we want on the *backend* (**FastAPI + ARQ job
worker + Next.js frontend + Docker Compose**) — a good blueprint for our queue. But
its license is **noncommercial only**, and it leans on **paid AssemblyAI** for
captions. We mirror its queue/worker **pattern**, not its code, and use local
faster-whisper instead of AssemblyAI.

### clips-studio / "Clips Kitty" — reference (license-blocked for direct reuse)
Feature-richest: true **multimodal scoring** (transcript + audio dynamics + visual +
reaction/chat), TalkNet active-speaker, and — crucially — a **"hands-off automatic
posting for watched channels"** model that is conceptually exactly your auto-publish
goal. But: (a) **AGPL-3.0** — if we host it, the whole service's source must be
offered under AGPL, a real constraint for a SaaS; (b) it's a **local GPU desktop app**
(wants an RTX card). We **study its detection design and auto-post flow** and
reimplement the ideas inside the MIT OpenShorts worker; we do not vendor its code.

## Classification summary

- **Directly reusable:** none (all are batch/desktop; none is live).
- **Reusable with modifications:** **openshorts** → our worker's editing core.
- **Useful as reference:** cutawan (reframing/captions), supoclip (queue arch),
  clips-studio (multimodal detection + auto-post UX).
- **Not suitable as-is:** clips-studio & cutawan as *apps* (Electron desktop),
  supoclip as a *product* (noncommercial license), AssemblyAI dependency (paid).

## What none of them give us (we build this)

1. Live HLS **rolling buffer** with reconnect.
2. **Streaming signal detectors** (chat-spike z-score, audio-RMS window, scene-change) that run on the live edge.
3. **Mobile PWA control dashboard** with server-persisted approve/publish.
4. **Telegram** notification + deep-link approval.
5. Multi-stream orchestration + crash/disconnect **recovery**.
