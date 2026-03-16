import time

from fastapi import APIRouter, File, HTTPException, Query, UploadFile

from backend.dependencies import get_stt
from backend.models import STTResponse

router = APIRouter(prefix="/api", tags=["stt"])


@router.post("/stt", response_model=STTResponse)
async def speech_to_text(
    file: UploadFile = File(...),
    language: str | None = Query(None),
) -> STTResponse:
    MAX_AUDIO_BYTES = 25 * 1024 * 1024  # 25 MB
    audio = await file.read()
    if len(audio) > MAX_AUDIO_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Audio too large ({len(audio)} bytes, max {MAX_AUDIO_BYTES})",
        )
    start = time.perf_counter()
    text, detected_lang = await get_stt().transcribe(audio, language)
    duration_ms = int((time.perf_counter() - start) * 1000)
    return STTResponse(text=text, detected_language=detected_lang, duration_ms=duration_ms)
