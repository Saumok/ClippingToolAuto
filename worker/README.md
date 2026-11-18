# ClipPilot Worker

The always-on processing brain. Python + FastAPI. Reuses the OpenShorts (MIT) editing
core and adds the live-ingestion layer the source repos lack. Host-agnostic — runs on
your PC now, a VPS later, only env vars change.

## Run (dev)
```powershell
cd worker
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
Copy-Item .env.example .env   # then fill it in (see ../SETUP.md)
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
# visit http://localhost:8000/health
```

## Status
- **M0 (done, tested):** boots, `/health` OK, heartbeat loop, config, Supabase/db helpers.
- **M1 (next):** yt-dlp rolling buffer → chat/audio detectors → clipper → 9:16 + captions
  → metadata → Supabase + Telegram → YouTube upload. See `../docs/04-mvp-roadmap.md`.

## Layout
```
app/
  config.py   typed env config (secrets stay here, never in the browser)
  db.py       Supabase client + clip state-machine helpers + heartbeat
  main.py     FastAPI app + background heartbeat loop
```
