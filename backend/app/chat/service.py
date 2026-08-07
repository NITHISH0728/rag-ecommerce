import uuid
import logging
from typing import AsyncIterator, Optional
from datetime import datetime
from backend.app.core.config import settings
from backend.app.chat.models import ChatRequest, ChatResponse, ChatStreamEvent
from backend.app.chat.exceptions import MessageTooLongError
from backend.app.chat.session_manager import get_session_store
from backend.app.rag.orchestrator import get_rag_orchestrator

logger = logging.getLogger("shopsmart-chat")

class ChatService:
    def __init__(self):
        self.session_store = get_session_store()
        self.orchestrator = get_rag_orchestrator()

    def _validate_request(self, request: ChatRequest) -> None:
        # Enforce maximum character length check
        if len(request.message) > settings.CHAT_MAX_MESSAGE_LENGTH:
            raise MessageTooLongError(
                f"User message length ({len(request.message)}) exceeds maximum allowed ({settings.CHAT_MAX_MESSAGE_LENGTH} characters)."
            )

    async def process_chat(self, request: ChatRequest) -> ChatResponse:
        self._validate_request(request)
        
        # Resolve conversation session ID
        conv_id = request.conversation_id
        if not conv_id:
            conv_id = f"conv_{uuid.uuid4().hex}"
            request.conversation_id = conv_id
            
        session = self.session_store.get_session(conv_id)
        
        logger.info(f"Processing chat request for session: '{conv_id}'")
        
        # Run through RAG Orchestrator
        response = await self.orchestrator.execute(request, session)
        return response

    async def process_chat_stream(self, request: ChatRequest) -> AsyncIterator[ChatStreamEvent]:
        self._validate_request(request)
        
        conv_id = request.conversation_id
        if not conv_id:
            conv_id = f"conv_{uuid.uuid4().hex}"
            request.conversation_id = conv_id
            
        session = self.session_store.get_session(conv_id)
        
        logger.info(f"Processing streaming chat request for session: '{conv_id}'")
        
        # Yield retrieval events and chunks from orchestrator stream
        async for event in self.orchestrator.execute_stream(request, session):
            yield event

_chat_service_instance: Optional[ChatService] = None

def get_chat_service() -> ChatService:
    global _chat_service_instance
    if _chat_service_instance is None:
        _chat_service_instance = ChatService()
    return _chat_service_instance
