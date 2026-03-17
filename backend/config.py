from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    device: str = "auto"

    # STT
    stt_provider: str = "local"
    whisper_model: str = "small"
    whisper_compute_type: str = "int8"

    # TTS
    tts_provider: str = "local"
    piper_voice: str = "de_DE-thorsten-high"
    chatterbox_url: str = "http://gpu00.node:4123"
    chatterbox_voice: str = "default"

    # Translate (ollama_* vars work with any OpenAI-compatible server: Ollama, llama.cpp, vLLM, etc.)
    translate_provider: str = "local"
    ollama_model: str = "gemma3:4b"
    ollama_url: str = "http://localhost:11434"

    # OpenAI-compatible translation
    openai_compat_url: str = ""
    openai_compat_model: str = ""

    # Optional cloud keys
    openai_api_key: str | None = None
    elevenlabs_api_key: str | None = None
    deepl_api_key: str | None = None
    deepl_free: bool = True

    # ElevenLabs
    elevenlabs_model: str = "eleven_multilingual_v2"
    elevenlabs_voice_id: str = ""

    # Provider Chains (comma-separated, priority order)
    tts_chain: str = "chatterbox,piper,elevenlabs"
    translate_chain: str = "ollama,deepl"

    @property
    def tts_chain_list(self) -> list[str]:
        return [p.strip() for p in self.tts_chain.split(",") if p.strip()]

    @property
    def translate_chain_list(self) -> list[str]:
        return [p.strip() for p in self.translate_chain.split(",") if p.strip()]

    # Auth (OAuth2 via Gitea)
    auth_enabled: bool = False
    auth_gitea_url: str = ""           # e.g. https://gitea.example.com
    auth_client_id: str = ""
    auth_client_secret: str = ""
    auth_admin_users: str = "Admin_Lance,LL4nc33"  # comma-separated Gitea usernames
    auth_session_secret: str = "change-me-in-production"
    auth_site_url: str = ""            # e.g. https://dolmtschr.example.com

    @property
    def auth_admin_list(self) -> list[str]:
        return [u.strip() for u in self.auth_admin_users.split(",") if u.strip()]

    # CORS
    cors_origins: str = "http://localhost:5173,http://localhost:4173"

    # Gateway
    gateway_enabled: bool = True
    gateway_api_keys: str = ""          # comma-separated, empty = no auth
    gateway_rate_limit: int = 60        # requests per minute per key
    gateway_max_audio_mb: int = 25      # max upload size in MB

    # Database
    database_url: str = ""

    # Chat History
    history_enabled: bool = True
    audio_storage_path: str = "data/audio"

    # Embeddings
    embedding_provider: str = "ollama"
    embedding_model: str = "nomic-embed-text"
    embedding_url: str = "http://localhost:11434"

    model_config = {"env_file": ".env"}
