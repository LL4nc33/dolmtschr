"""Language coverage endpoint — returns per-language TTS/Translate support."""

from fastapi import APIRouter, Query

from backend.dependencies import get_settings
from backend.providers.language_support import get_language_coverage

router = APIRouter(prefix="/api", tags=["languages"])


@router.get("/languages")
async def languages(
    tts_chain: str | None = Query(None, description="Comma-separated TTS chain override"),
    translate_chain: str | None = Query(None, description="Comma-separated translate chain override"),
) -> dict:
    s = get_settings()
    tts = [p.strip() for p in tts_chain.split(",") if p.strip()] if tts_chain else s.tts_chain_list
    trans = [p.strip() for p in translate_chain.split(",") if p.strip()] if translate_chain else s.translate_chain_list
    return get_language_coverage(tts, trans)
