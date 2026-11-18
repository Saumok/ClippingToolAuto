"""ClipPilot worker — FastAPI control surface + background heartbeat.

M0 foundation: boots, exposes health, emits a heartbeat so the dashboard can show
the worker is alive. The ingestion → detection → clip → edit → publish pipeline
(M1) plugs into the background loop started here. Host-agnostic: runs identically
on your PC now and on a VPS later (only env vars change).

Run:  uvicorn app.main:app --reload --port 8000   (from the worker/ directory)
"""
from __future__ import annotations

import asyncio
import contextlib
import logging
from datetime import datetime, timezone

from fastapi import FastAPI

from .config import settings
from . import db

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s %(message)s")
log = logging.getLogger("clippilot")

app = FastAPI(title="ClipPilot Worker", version="0.1.0")
_started_at = datetime.now(timezone.utc)


async def _heartbeat_loop() -> None:
    """Emit a heartbeat every N seconds (worker up/down signal for the dashboard)."""
    while True:
        try:
            db.beat({"started_at": _started_at.isoformat()})
        except Exception as e:  # never let the loop die on a transient error
            log.warning("heartbeat failed: %s", e)
        await asyncio.sleep(settings.heartbeat_seconds)


@app.on_event("startup")
async def _startup() -> None:
    settings.ensure_dirs()
    log.info("worker '%s' starting | supabase=%s", settings.worker_id, settings.supabase_configured)
    app.state.heartbeat_task = asyncio.create_task(_heartbeat_loop())


@app.on_event("shutdown")
async def _shutdown() -> None:
    task = getattr(app.state, "heartbeat_task", None)
    if task:
        task.cancel()
        with contextlib.suppress(asyncio.CancelledError):
            await task


@app.get("/health")
async def health() -> dict:
    return {
        "status": "ok",
        "worker_id": settings.worker_id,
        "supabase_configured": settings.supabase_configured,
        "uptime_seconds": (datetime.now(timezone.utc) - _started_at).total_seconds(),
    }
