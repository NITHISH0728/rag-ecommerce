from fastapi import Request, HTTPException
from backend.app.core.config import settings
from backend.app.chat.service import ChatService, get_chat_service
from backend.app.security.rate_limit import InMemoryRateLimiter, get_rate_limiter

def get_settings():
    return settings

def get_chat_service_dep() -> ChatService:
    return get_chat_service()

def rate_limit_check(request: Request):
    """
    Rate limiting dependency. Rejects client requests exceeding limits with a 429 error.
    """
    limiter = get_rate_limiter()
    # Resolve client IP safely, default to host
    client_ip = request.client.host if request.client else "unknown_ip"
    
    # Try reading Session header or Query params if available
    session_id = request.headers.get("X-Session-ID", client_ip)
    
    if limiter.is_rate_limited(session_id):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. You can send up to 20 chat messages per minute. Please try again shortly."
        )
