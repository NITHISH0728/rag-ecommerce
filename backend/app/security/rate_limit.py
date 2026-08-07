import time
import threading
from typing import Dict, List, Optional
from backend.app.core.config import settings

class InMemoryRateLimiter:
    def __init__(self):
        # Maps client_id to list of request timestamps
        self._history: Dict[str, List[float]] = {}
        self._lock = threading.Lock()

    def is_rate_limited(self, client_id: str) -> bool:
        """
        Tracks sliding window rate limiting.
        Returns True if the client has exceeded limits.
        """
        now = time.time()
        window_start = now - 60.0  # 1 minute window
        limit = settings.CHAT_RATE_LIMIT_PER_MINUTE

        with self._lock:
            # Get timestamps for this client
            timestamps = self._history.get(client_id, [])
            
            # Filter out timestamps older than the window
            timestamps = [ts for ts in timestamps if ts > window_start]
            
            if len(timestamps) >= limit:
                # Update history to clean up old timestamps anyway
                self._history[client_id] = timestamps
                return True
                
            # Add current request timestamp
            timestamps.append(now)
            self._history[client_id] = timestamps
            return False

_rate_limiter_instance: Optional[InMemoryRateLimiter] = None

def get_rate_limiter() -> InMemoryRateLimiter:
    global _rate_limiter_instance
    if _rate_limiter_instance is None:
        _rate_limiter_instance = InMemoryRateLimiter()
    return _rate_limiter_instance
