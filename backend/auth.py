"""OAuth2 authentication via Gitea.

Opt-in via AUTH_ENABLED=true. Provides login/callback/logout/me endpoints
and a `require_admin` dependency for protecting routes.

Session tokens are stored in-memory (no DB needed). For production with
multiple workers, swap _sessions for a shared store (Redis, DB).
"""

import hashlib
import hmac
import logging
import secrets
import time
from typing import Any

import httpx
from fastapi import APIRouter, Cookie, HTTPException, Request, Response
from fastapi.responses import JSONResponse, RedirectResponse

from backend.config import Settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/auth", tags=["auth"])

# In-memory session store: session_id -> {user, expires_at}
_sessions: dict[str, dict[str, Any]] = {}

SESSION_MAX_AGE = 86400 * 7  # 7 days
COOKIE_NAME = "dolmtschr_session"


def _get_settings() -> Settings:
    from backend.dependencies import get_settings
    return get_settings()


def _sign_session(session_id: str, secret: str) -> str:
    sig = hmac.new(secret.encode(), session_id.encode(), hashlib.sha256).hexdigest()[:16]
    return f"{session_id}.{sig}"


def _verify_session(signed: str, secret: str) -> str | None:
    parts = signed.split(".", 1)
    if len(parts) != 2:
        return None
    session_id, sig = parts
    expected = hmac.new(secret.encode(), session_id.encode(), hashlib.sha256).hexdigest()[:16]
    if not hmac.compare_digest(sig, expected):
        return None
    return session_id


def get_current_user(request: Request) -> dict[str, Any] | None:
    """Extract user from session cookie. Returns None if not authenticated."""
    s = _get_settings()
    if not s.auth_enabled:
        return None

    cookie = request.cookies.get(COOKIE_NAME)
    if not cookie:
        return None

    session_id = _verify_session(cookie, s.auth_session_secret)
    if not session_id:
        return None

    session = _sessions.get(session_id)
    if not session or session["expires_at"] < time.time():
        _sessions.pop(session_id, None)
        return None

    return session["user"]


def require_admin(request: Request) -> dict[str, Any]:
    """FastAPI dependency: require authenticated admin user."""
    s = _get_settings()
    if not s.auth_enabled:
        # Auth disabled — allow all
        return {"username": "anonymous", "role": "admin"}

    user = get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user


@router.get("/login")
async def login() -> Response:
    """Redirect to Gitea OAuth2 authorization page."""
    s = _get_settings()
    if not s.auth_enabled:
        raise HTTPException(status_code=404, detail="Auth not enabled")

    redirect_uri = f"{s.auth_site_url}/api/auth/callback"
    url = (
        f"{s.auth_gitea_url}/login/oauth2/authorize"
        f"?client_id={s.auth_client_id}"
        f"&redirect_uri={redirect_uri}"
        f"&response_type=code"
        f"&scope=read:user"
    )
    return RedirectResponse(url)


@router.get("/callback")
async def callback(code: str) -> Response:
    """Handle Gitea OAuth2 callback, exchange code for token, create session."""
    s = _get_settings()
    if not s.auth_enabled:
        raise HTTPException(status_code=404, detail="Auth not enabled")

    redirect_uri = f"{s.auth_site_url}/api/auth/callback"

    # Exchange code for access token
    async with httpx.AsyncClient(timeout=10) as client:
        token_resp = await client.post(
            f"{s.auth_gitea_url}/login/oauth2/access_token",
            data={
                "client_id": s.auth_client_id,
                "client_secret": s.auth_client_secret,
                "code": code,
                "grant_type": "authorization_code",
                "redirect_uri": redirect_uri,
            },
            headers={"Accept": "application/json"},
        )
        if token_resp.status_code != 200:
            logger.warning("Token exchange failed: %s", token_resp.text)
            raise HTTPException(status_code=502, detail="Token exchange failed")

        token_data = token_resp.json()
        access_token = token_data.get("access_token")
        if not access_token:
            raise HTTPException(status_code=502, detail="No access token received")

        # Fetch user info
        user_resp = await client.get(
            f"{s.auth_gitea_url}/api/v1/user",
            headers={"Authorization": f"token {access_token}"},
        )
        if user_resp.status_code != 200:
            raise HTTPException(status_code=502, detail="Failed to fetch user info")

        user_data = user_resp.json()

    username = user_data.get("login", "")
    role = "admin" if username in s.auth_admin_list else "user"

    user = {
        "username": username,
        "display_name": user_data.get("full_name") or username,
        "avatar_url": user_data.get("avatar_url", ""),
        "role": role,
    }

    # Create session
    session_id = secrets.token_urlsafe(32)
    _sessions[session_id] = {
        "user": user,
        "expires_at": time.time() + SESSION_MAX_AGE,
    }

    signed = _sign_session(session_id, s.auth_session_secret)
    response = RedirectResponse(url=s.auth_site_url or "/", status_code=302)
    response.set_cookie(
        key=COOKIE_NAME,
        value=signed,
        max_age=SESSION_MAX_AGE,
        httponly=True,
        samesite="lax",
        path="/",
    )
    return response


@router.get("/me")
async def me(request: Request) -> JSONResponse:
    """Return current user info, or null if not authenticated."""
    s = _get_settings()
    if not s.auth_enabled:
        return JSONResponse({"user": None, "auth_enabled": False})

    user = get_current_user(request)
    return JSONResponse({"user": user, "auth_enabled": True})


@router.post("/logout")
async def logout(request: Request) -> Response:
    """Clear session cookie and remove session."""
    s = _get_settings()
    cookie = request.cookies.get(COOKIE_NAME)
    if cookie:
        session_id = _verify_session(cookie, s.auth_session_secret)
        if session_id:
            _sessions.pop(session_id, None)

    response = JSONResponse({"ok": True})
    response.delete_cookie(key=COOKIE_NAME, path="/")
    return response
