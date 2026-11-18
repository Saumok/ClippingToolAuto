# ClipPilot — Setup Checklist

Do these once. They unblock the M1 end-to-end slice (detect → clip → approve → upload).
Nothing here costs money. Paste results into `worker/.env` (copied from `.env.example`).

## 1. Supabase (free) — state + storage + auth
1. Create a project at https://supabase.com (free tier).
2. **SQL Editor** → paste all of `db/schema.sql` → Run.
3. **Storage** → create a public bucket named `clips`.
4. **Project Settings → API**: copy `Project URL` → `SUPABASE_URL`, and the
   **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (server-side only — never in the browser).

## 2. Google / YouTube (free) — publishing
1. https://console.cloud.google.com → new project.
2. **APIs & Services → Enable APIs** → enable **YouTube Data API v3**.
3. **OAuth consent screen**: External; add your Google account as a **Test user**
   (lets you upload while the app is unverified — clips land `private`; see feasibility doc).
4. **Credentials → Create OAuth client ID → Web application**. Copy client ID/secret →
   `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.
5. (Public auto-publish later needs Google's verification/audit — weeks. Private works now.)

## 3. Gemini (free, optional) — better titles/context
1. https://aistudio.google.com/apikey → create key → `GEMINI_API_KEY`.
   (Optional: the pipeline falls back to templates/local LLM without it.)

## 4. Telegram (free) — mobile push + one-tap approve
1. In Telegram, message **@BotFather** → `/newbot` → copy token → `TELEGRAM_BOT_TOKEN`.
2. Message your new bot once, then get your chat id (message **@userinfobot**) →
   `TELEGRAM_CHAT_ID`.

## 5. Point the worker at a stream you own/are authorized to clip
The live URL(s) we target. This is the core legal assumption (see `docs/00-feasibility.md`).

---

When 1–4 are in `worker/.env`, tell me and I'll wire the M1 pipeline + dashboard against
your real project and we test the full thread end to end.
