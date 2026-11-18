"""Typed configuration loaded from the worker's .env (never from the browser)."""
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    worker_id: str = "home-pc-1"

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    supabase_storage_bucket: str = "clips"

    google_client_id: str = ""
    google_client_secret: str = ""
    gemini_api_key: str = ""

    telegram_bot_token: str = ""
    telegram_chat_id: str = ""

    buffer_dir: Path = Path("./buffer")
    clips_dir: Path = Path("./clips")
    tmp_dir: Path = Path("./tmp")

    heartbeat_seconds: int = 30

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    def ensure_dirs(self) -> None:
        for d in (self.buffer_dir, self.clips_dir, self.tmp_dir):
            d.mkdir(parents=True, exist_ok=True)


settings = Settings()
