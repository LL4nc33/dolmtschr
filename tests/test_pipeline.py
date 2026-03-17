"""Tests for POST /api/pipeline."""

import io

from httpx import AsyncClient


async def test_pipeline_with_audio_returns_200(client: AsyncClient) -> None:
    """Valid audio file should produce a full pipeline response."""
    # MockSTT returns "Hallo Welt" for any non-empty audio
    fake_audio = b"\x00" * 1024
    resp = await client.post(
        "/api/pipeline",
        files={"file": ("test.wav", io.BytesIO(fake_audio), "audio/wav")},
        params={"target_lang": "en", "tts": "false"},
    )
    assert resp.status_code == 200
    data = resp.json()

    # Response shape
    assert "original_text" in data
    assert "detected_language" in data
    assert "translated_text" in data
    assert "duration_ms" in data
    assert "stt_ms" in data
    assert "translate_ms" in data

    # Values from mocks
    assert data["original_text"] == "Hallo Welt"
    assert data["detected_language"] == "de"
    assert "[translated:en]" in data["translated_text"]


async def test_pipeline_with_tts_returns_audio(client: AsyncClient) -> None:
    """When tts=true, the response should include base64 audio."""
    fake_audio = b"\x00" * 512
    resp = await client.post(
        "/api/pipeline",
        files={"file": ("test.wav", io.BytesIO(fake_audio), "audio/wav")},
        params={"target_lang": "de", "tts": "true"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["audio"] is not None
    assert data["tts_ms"] is not None


async def test_pipeline_empty_audio_returns_400(client: AsyncClient) -> None:
    """Empty audio (MockSTT returns empty text) should produce 400."""
    resp = await client.post(
        "/api/pipeline",
        files={"file": ("empty.wav", io.BytesIO(b""), "audio/wav")},
        params={"target_lang": "en"},
    )
    assert resp.status_code == 400
    assert "no speech" in resp.json()["detail"].lower()


async def test_pipeline_missing_file_returns_422(client: AsyncClient) -> None:
    """Missing required 'file' field should produce a validation error."""
    resp = await client.post("/api/pipeline", params={"target_lang": "en"})
    assert resp.status_code == 422
