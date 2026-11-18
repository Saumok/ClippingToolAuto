# 03 — Cost Analysis

Numbers are realistic as of late 2026 for low-volume personal use (1–2 streams,
a handful of clips/day). Everything local-first; cloud AI is optional and capped.

## Cost by category

| Category | Free path | Paid-if-exceeded |
|---|---|---|
| Dashboard hosting | Vercel Hobby — $0 | Pro $20/mo only at real traffic (won't hit it). |
| Database / Auth / Storage | Supabase free (500MB DB, 1GB storage, 2GB egress) — $0 | Pro $25/mo if storage/egress exceeded. **Mitigate: delete published/rejected clips.** |
| **Worker compute** | Your PC $0 **or** Oracle Cloud Always Free $0 | **Small VPS ~$5–12/mo** (recommended for reliability). |
| Video processing | FFmpeg + faster-whisper local — $0 (CPU time only) | GPU VPS $0.2–0.5/hr only if you want speed/scale. |
| Speech-to-text | faster-whisper local — $0 | — (we deliberately avoid paid AssemblyAI). |
| AI metadata/context | Gemini free tier (generous RPM/day) — ~$0 | Few $/mo at high volume; or local Ollama for $0. |
| YouTube Data API | Free | Hard quota (not $): 10k units/day ≈ 6 uploads/day; request increase. |
| Notifications | Telegram Bot — $0 | — (unlimited, free). |
| Domain (optional) | `*.vercel.app` — $0 | ~$10/yr for a custom domain. |

## Three deployment scenarios

### A. Completely free prototype — **$0/mo**
- Vercel + Supabase free + **worker on your own always-on PC**.
- **Works:** full end-to-end pipeline, 1 stream, approve+publish from phone.
- **Limits:** only runs while your PC is awake/online; clips land **private**
  until Google verification; ~6 uploads/day; storage housekeeping needed.
- **When free limits hit:** PC sleeps → monitoring stops; Supabase storage fills →
  prune clips. Good for proving it works, not for "always on while I travel."

### B. Free frontend + low-cost worker — **~$5–12/mo** ✅ recommended
- Vercel + Supabase free + **worker on a $5–12 VPS or Oracle Free ARM**.
- **Works:** genuinely always-on; survives you being away; 1–2 concurrent streams;
  auto-reconnect + auto-retry; Telegram alerts.
- **Limits:** still ~6 uploads/day until quota raised; 2+ heavy streams strain a tiny
  VPS; public auto-publish still gated on Google verification.
- **When limits hit:** add a bigger VPS tier, or stagger streams.

### C. More reliable production — **~$25–60/mo**
- Vercel (likely still Hobby) + **Supabase Pro ($25)** + **4-core/8GB VPS ($15–30)**
  (optionally GPU hours for faster Whisper/reframe).
- **Works:** 3–5 streams, faster turnaround, more storage/egress headroom, raised
  YouTube quota, verified public auto-publish.
- **Limits:** mostly YouTube policy (quota/verification), not infra.

## Recommendation

Build on **Scenario A** for development this week (your PC as worker — zero spend,
fastest iteration), with every config externalized so moving the worker to a **VPS
(Scenario B)** is a deploy, not a rewrite. That's the honest "as free as realistically
possible without it constantly failing" answer: **~$5–12/mo** once you want it truly
unattended.
