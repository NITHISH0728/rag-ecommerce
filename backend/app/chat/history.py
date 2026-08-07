from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings

class ChatHistoryMessage:
    def __init__(
        self,
        role: str,
        content: str,
        applied_filters: Optional[Dict[str, Any]] = None,
        recommended_product_ids: Optional[List[str]] = None,
        timestamp: Optional[str] = None
    ):
        self.role = role
        self.content = content
        self.applied_filters = applied_filters or {}
        self.recommended_product_ids = recommended_product_ids or []
        self.timestamp = timestamp or datetime.utcnow().isoformat() + "Z"

    def to_dict(self) -> Dict[str, Any]:
        return {
            "role": self.role,
            "content": self.content,
            "applied_filters": self.applied_filters,
            "recommended_product_ids": self.recommended_product_ids,
            "timestamp": self.timestamp
        }

class ConversationSession:
    def __init__(self, conversation_id: str):
        self.conversation_id = conversation_id
        self.messages: List[ChatHistoryMessage] = []
        self.updated_at = datetime.utcnow()

    def add_message(self, msg: ChatHistoryMessage) -> None:
        self.messages.append(msg)
        self.updated_at = datetime.utcnow()
        self.enforce_limits()

    def enforce_limits(self) -> None:
        # Enforce message count limit
        limit_count = settings.RAG_HISTORY_MESSAGE_LIMIT
        if len(self.messages) > limit_count:
            self.messages = self.messages[-limit_count:]
            
        # Enforce total character size limit
        limit_chars = settings.RAG_HISTORY_CHARACTER_LIMIT
        total_len = sum(len(m.content) for m in self.messages)
        while total_len > limit_chars and len(self.messages) > 1:
            removed = self.messages.pop(0)
            total_len -= len(removed.content)
            
    def get_recent_messages(self) -> List[ChatHistoryMessage]:
        return self.messages

    def get_last_applied_filters(self) -> Dict[str, Any]:
        # Return filters of the last assistant or user message
        for msg in reversed(self.messages):
            if msg.applied_filters:
                return msg.applied_filters
        return {}

    def get_last_recommended_product_ids(self) -> List[str]:
        for msg in reversed(self.messages):
            if msg.recommended_product_ids:
                return msg.recommended_product_ids
        return []
