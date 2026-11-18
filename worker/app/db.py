"""Supabase client + the few state helpers the worker needs.

The worker uses the service-role key and is the only component that writes job
state transitions. If Supabase isn't configured yet (early dev), these helpers
degrade to no-ops/logs so the worker still boots and the toolchain can be tested.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any, Optional

from .config import settings

log = logging.getLogger("clippilot.db")

_client = None


def client():
    """Lazily build the Supabase client, or None if not configured."""
    global _client
    if _client is not None:
        return _client
    if not settings.supabase_configured:
        return None
    from supabase import create_client
    _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def beat(info: Optional[dict[str, Any]] = None) -> None:
    """Upsert the worker heartbeat so the dashboard can show worker up/down."""
    c = client()
    now = datetime.now(timezone.utc).isoformat()
    if c is None:
        log.debug("heartbeat (no supabase) @ %s", now)
        return
    c.table("heartbeat").upsert(
        {"worker_id": settings.worker_id, "last_beat": now, "info": info or {}}
    ).execute()


def set_clip_status(clip_id: str, status: str, **fields: Any) -> None:
    """Advance a clip through its lifecycle state machine."""
    c = client()
    patch = {"status": status, **fields}
    if c is None:
        log.info("clip %s -> %s %s (no supabase)", clip_id, status, fields or "")
        return
    c.table("clips").update(patch).eq("id", clip_id).execute()
