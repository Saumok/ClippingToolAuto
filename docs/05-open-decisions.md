# 05 — Open Decisions & What I Need From You

I can proceed on sensible defaults for almost everything. These are the few items
that genuinely change the build or that only you can supply.

## Decisions I've already made for you (defaults — tell me if you disagree)

| Decision | Default chosen | Why |
|---|---|---|
| Project name | **ClipPilot** | Clear, memorable, mobile-pilot metaphor. |
| Dashboard | Next.js App Router PWA on Vercel | Free, mobile-first, matches your stack. |
| DB/Auth/Storage | Supabase free tier | One service covers three needs; free. |
| Worker language | Python + FastAPI | Best video/AI library support; matches OpenShorts. |
| Reuse base | OpenShorts (MIT) editing core | Only server-shaped, permissively licensed base. |
| Captions | faster-whisper (local) | Free, no AssemblyAI bill. |
| Notifications | Telegram bot | Free, reliable mobile push, deep-links. |
| Default publish mode | **Approve-first** (not auto) | Safety; you asked for explicit consent by default. |

## Things only you can provide (needed before the relevant step)

1. **A stream source you own/are authorized to clip** — the live URL(s) we target.
   (Core legal assumption; see feasibility doc.)
2. **Google Cloud project + OAuth client** (YouTube Data API enabled) and the
   **Gemini API key** — via env vars/secrets, never in code. I'll give exact steps.
3. **A Telegram bot token + your chat ID** — 2-minute setup; I'll give steps.
4. **Worker host choice** — the one decision that affects "runs while I'm away."

## Worker host — DECIDED

**Your own PC ($0)** for the first working version. Fastest iteration, zero spend.
Trade-off acknowledged: monitoring only runs while the PC is awake/online. The worker
is built host-agnostic (all config in env vars, `restart=always` friendly) so moving
to a VPS/Oracle later is a deploy, not a rewrite.
