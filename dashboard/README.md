# ClipPilot Dashboard — Vice City Control

GTA VI / Vice City–themed, mobile-first PWA for the ClipPilot platform.
Next.js 16 (App Router) + React 19 + Tailwind v4.

## Pages
- **Overview** `/` — stats + system status + quick actions.
- **Channels** `/channels` — add YouTuber channels (@handle / URL / UC… id), assign publish destination.
- **Who's Live** `/live` — scan your roster and see who's streaming **right now** (YouTube Data API).
- **Clips** `/clips` — approval desk; review AI-cut Shorts, approve/reject.
- **Settings** `/settings` — publish mode, privacy, max/day, automation toggles, emergency stop.
- **AI Tasks** `/chatgpt` — copy-paste prompts to offload work to ChatGPT.

## Deploy on Vercel
1. Import the GitHub repo in Vercel.
2. **Set Root Directory = `dashboard`** (the Next app lives in this subfolder).
3. Add env vars (see `.env.example`):
   - `YOUTUBE_API_KEY` — enables the live scan (free, YouTube Data API v3).
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — lets Clips read worker output.
4. Deploy. Add to your phone's home screen (PWA) for an app-like experience.

## Local dev
```powershell
cd dashboard
npm install
npm run dev   # http://localhost:3000
```

## Honest status
- UI, navigation, theming, Channels (local storage), Who's-Live scan (real YouTube API): **working**.
- Clips approve/reject + stats: **wired to Supabase; become live when the worker + Supabase env are connected (M1/M2)**.
- No fake clip data is shown — empty/configure states are explicit.
