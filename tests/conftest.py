"""Shared test fixtures: mock providers, test client, in-memory DB."""

from __future__ import annotations

import uuid
from collections.abc import AsyncIterator
from datetime import datetime, timezone
from typing import Any
from unittest.mock import AsyncMock, patch

import pytest
from httpx import ASGITransport, AsyncClient

from backend.config import Settings
from backend.providers.base import EmbeddingProvider, STTProvider, TTSProvider, TranslateProvider


# ---------------------------------------------------------------------------
# Mock providers
# ---------------------------------------------------------------------------

class MockSTT(STTProvider):
    """Returns fixed text and detected language."""

    async def transcribe(self, audio: bytes, language: str | None = None) -> tuple[str, str]:
        if not audio:
            return "", "en"
        return "Hallo Welt", "de"


class MockTTS(TTSProvider):
    """Returns fixed WAV bytes."""

    async def synthesize(self, text: str, lang: str, voice: str | None = None, **kwargs: object) -> bytes:
        # Minimal valid WAV header (44 bytes) + silence
        return b"RIFF" + b"\x00" * 40


class MockTranslate(TranslateProvider):
    """Returns a fixed translation string."""

    async def translate(
        self, text: str, source: str, target: str,
        model: str | None = None, **kwargs: object,
    ) -> str:
        return f"[translated:{target}] {text}"


class MockEmbedding(EmbeddingProvider):
    """Returns a fixed embedding vector."""

    async def embed(self, text: str) -> list[float]:
        return [0.0] * 768


# ---------------------------------------------------------------------------
# Settings fixture (no external services)
# ---------------------------------------------------------------------------

@pytest.fixture()
def test_settings() -> Settings:
    """Return a Settings instance that requires no external services."""
    return Settings(
        device="cpu",
        stt_provider="local",
        tts_provider="local",
        translate_provider="local",
        whisper_model="tiny",
        piper_voice="de_DE-thorsten-high",
        ollama_model="gemma3:4b",
        ollama_url="http://localhost:11434",
        chatterbox_url="http://localhost:4123",
        chatterbox_voice="default",
        cors_origins="*",
        history_enabled=False,
        database_url="",
        gateway_enabled=False,
    )


# ---------------------------------------------------------------------------
# Provider injection fixture
# ---------------------------------------------------------------------------

@pytest.fixture()
def mock_providers(test_settings: Settings) -> tuple[MockSTT, MockTTS, MockTranslate]:
    """Inject mock providers into the global singletons."""
    import backend.dependencies as deps

    stt = MockSTT()
    tts_mock = MockTTS()
    translate = MockTranslate()

    deps.init_providers(
        settings=test_settings,
        stt=stt,
        tts=tts_mock,
        translate=translate,
        embedding=None,
    )
    return stt, tts_mock, translate


# ---------------------------------------------------------------------------
# Async test client (skips lifespan — providers are injected by fixture)
# ---------------------------------------------------------------------------

@pytest.fixture()
async def client(mock_providers: tuple[MockSTT, MockTTS, MockTranslate]) -> AsyncIterator[AsyncClient]:
    """Yield an httpx.AsyncClient wired to the FastAPI app, bypassing lifespan."""
    from backend.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


# ---------------------------------------------------------------------------
# In-memory SQLite for session/message tests
# ---------------------------------------------------------------------------

@pytest.fixture()
async def db_session() -> AsyncIterator[Any]:
    """Set up an in-memory SQLite async engine and patch the connection module.

    This replaces the PostgreSQL-specific connection module with an SQLite
    engine so session CRUD tests work without a real database.
    The pgvector Vector column is swapped to Text for SQLite compatibility,
    and Python UUID objects are registered as sqlite3 adapters.
    """
    import sqlite3

    from sqlalchemy import String, Text, event
    from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

    # Register UUID adapter so SQLite can bind Python uuid.UUID values
    sqlite3.register_adapter(uuid.UUID, str)

    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)

    # SQLite needs special handling for foreign key support
    @event.listens_for(engine.sync_engine, "connect")
    def _set_sqlite_pragma(dbapi_conn: Any, _: Any) -> None:
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    from backend.database.models import Base, Message

    # Replace pgvector Vector column with Text so SQLite can create the table.
    # Also replace PostgreSQL UUID columns with String(36) for SQLite.
    _original_col_types: dict[str, Any] = {}
    for table in Base.metadata.tables.values():
        for col in table.columns:
            from pgvector.sqlalchemy import Vector
            from sqlalchemy.dialects.postgresql import UUID

            if isinstance(col.type, Vector):
                _original_col_types[(table.name, col.name)] = col.type
                col.type = Text()
            elif isinstance(col.type, UUID):
                _original_col_types[(table.name, col.name)] = col.type
                col.type = String(36)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    factory = async_sessionmaker(engine, expire_on_commit=False)

    # Patch the connection module so routers use our in-memory DB
    import backend.database.connection as conn_mod

    original_factory = conn_mod._session_factory
    original_engine = conn_mod._engine
    conn_mod._session_factory = factory
    conn_mod._engine = engine

    yield factory

    # Restore original column types so other tests/imports aren't affected
    for (tbl_name, col_name), orig_type in _original_col_types.items():
        table = Base.metadata.tables[tbl_name]
        table.columns[col_name].type = orig_type

    # Restore originals
    conn_mod._session_factory = original_factory
    conn_mod._engine = original_engine

    await engine.dispose()


@pytest.fixture()
async def db_client(
    mock_providers: tuple[MockSTT, MockTTS, MockTranslate],
    db_session: Any,
) -> AsyncIterator[AsyncClient]:
    """Test client with both mock providers AND in-memory database."""
    from backend.main import app

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
