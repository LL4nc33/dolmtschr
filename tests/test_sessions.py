"""Tests for session CRUD endpoints (POST/GET/DELETE /api/sessions)."""

from __future__ import annotations

from typing import Any

import pytest
from httpx import AsyncClient


@pytest.fixture()
def _patch_profiles(monkeypatch: pytest.MonkeyPatch) -> None:
    """Stub out the profiles import so session creation doesn't fail."""
    import types

    fake_profiles = types.ModuleType("backend.profiles")

    def _get_profile(profile_id: str) -> None:
        return None

    def _get_system_prompt(*args: Any) -> str:
        return ""

    def _get_all_profiles() -> list[Any]:
        return []

    fake_profiles.get_profile = _get_profile  # type: ignore[attr-defined]
    fake_profiles.get_system_prompt = _get_system_prompt  # type: ignore[attr-defined]
    fake_profiles.get_all_profiles = _get_all_profiles  # type: ignore[attr-defined]

    import sys
    monkeypatch.setitem(sys.modules, "backend.profiles", fake_profiles)


@pytest.mark.usefixtures("_patch_profiles")
async def test_create_session(db_client: AsyncClient) -> None:
    resp = await db_client.post(
        "/api/sessions",
        json={
            "source_lang": "de",
            "target_lang": "en",
            "audio_enabled": False,
            "profile_id": None,
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["source_lang"] == "de"
    assert data["target_lang"] == "en"
    assert "id" in data
    assert "created_at" in data


@pytest.mark.usefixtures("_patch_profiles")
async def test_list_sessions(db_client: AsyncClient) -> None:
    # Create two sessions
    for lang in ("en", "fr"):
        await db_client.post(
            "/api/sessions",
            json={
                "source_lang": "de",
                "target_lang": lang,
                "audio_enabled": False,
                "profile_id": None,
            },
        )

    resp = await db_client.get("/api/sessions")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] >= 2
    assert len(data["sessions"]) >= 2


@pytest.mark.usefixtures("_patch_profiles")
async def test_delete_session(db_client: AsyncClient) -> None:
    # Create a session
    create_resp = await db_client.post(
        "/api/sessions",
        json={
            "source_lang": "de",
            "target_lang": "en",
            "audio_enabled": False,
            "profile_id": None,
        },
    )
    session_id = create_resp.json()["id"]

    # Delete it
    del_resp = await db_client.delete(f"/api/sessions/{session_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted"] is True

    # Confirm it's gone
    get_resp = await db_client.get(f"/api/sessions/{session_id}")
    assert get_resp.status_code == 404


@pytest.mark.usefixtures("_patch_profiles")
async def test_delete_nonexistent_session_returns_404(db_client: AsyncClient) -> None:
    import uuid
    fake_id = str(uuid.uuid4())
    resp = await db_client.delete(f"/api/sessions/{fake_id}")
    assert resp.status_code == 404
