import threading
from datetime import datetime, timedelta
from typing import Dict, Optional
from backend.app.core.config import settings
from backend.app.chat.history import ConversationSession

class InMemorySessionStore:
    def __init__(self):
        self._sessions: Dict[str, ConversationSession] = {}
        self._lock = threading.Lock()

    def get_session(self, conversation_id: str) -> ConversationSession:
        with self._lock:
            # Clean expired sessions first to free memory
            self._cleanup_expired()
            
            if conversation_id not in self._sessions:
                self._sessions[conversation_id] = ConversationSession(conversation_id)
            else:
                # Update session activity
                self._sessions[conversation_id].updated_at = datetime.utcnow()
                
            return self._sessions[conversation_id]

    def delete_session(self, conversation_id: str) -> bool:
        with self._lock:
            if conversation_id in self._sessions:
                del self._sessions[conversation_id]
                return True
            return False

    def _cleanup_expired(self) -> None:
        expiry_limit = datetime.utcnow() - timedelta(minutes=settings.CHAT_SESSION_TTL_MINUTES)
        expired_ids = []
        for cid, sess in self._sessions.items():
            if sess.updated_at < expiry_limit:
                expired_ids.append(cid)
        for cid in expired_ids:
            del self._sessions[cid]

_session_store_instance: Optional[InMemorySessionStore] = None

def get_session_store() -> InMemorySessionStore:
    global _session_store_instance
    if _session_store_instance is None:
        _session_store_instance = InMemorySessionStore()
    return _session_store_instance
