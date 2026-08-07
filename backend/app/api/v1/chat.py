import json
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from backend.app.chat.models import ChatRequest, ChatResponse
from backend.app.chat.service import ChatService
from backend.app.api.dependencies import get_chat_service_dep, rate_limit_check
from backend.app.chat.session_manager import get_session_store
from backend.app.chat.exceptions import ConversationNotFoundError

router = APIRouter()
logger = logging.getLogger("shopsmart-chat-api")

@router.post("/chat", response_model=ChatResponse, dependencies=[Depends(rate_limit_check)], tags=["Chat"])
async def chat_message(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service_dep)
):
    """
    Standard REST endpoint to post a user query and receive a grounded natural-language RAG answer.
    """
    try:
        response = await chat_service.process_chat(request)
        return response
    except Exception as e:
        logger.exception(f"HTTP Chat Endpoint error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing failed: {str(e)}"
        )

@router.post("/chat/stream", dependencies=[Depends(rate_limit_check)], tags=["Chat"])
async def chat_message_stream(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service_dep)
):
    """
    Server-Sent Events (SSE) streaming endpoint for real-time token delivery and retrieval status reports.
    """
    async def sse_generator():
        try:
            async for stream_event in chat_service.process_chat_stream(request):
                # Format: event: <type>\ndata: <json>\n\n
                yield f"event: {stream_event.event}\ndata: {json.dumps(stream_event.data)}\n\n"
        except Exception as e:
            logger.exception(f"Streaming error occurred: {e}")
            yield f"event: error\ndata: {json.dumps({'code': 'internal_stream_error', 'message': str(e)})}\n\n"

    return StreamingResponse(
        sse_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable buffering in Nginx proxies
        }
    )

@router.get("/chat/conversations/{conversation_id}", tags=["Chat"])
def get_conversation_history(conversation_id: str):
    """Retrieves list of active message histories for a conversation session."""
    session_store = get_session_store()
    session = session_store.get_session(conversation_id)
    if not session or not session.messages:
        return {"conversation_id": conversation_id, "messages": []}
        
    return {
        "conversation_id": conversation_id,
        "messages": [msg.to_dict() for msg in session.get_recent_messages()]
    }

@router.delete("/chat/conversations/{conversation_id}", tags=["Chat"])
def clear_conversation(conversation_id: str):
    """Deletes/Clears conversation history sessions."""
    session_store = get_session_store()
    deleted = session_store.delete_session(conversation_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation session '{conversation_id}' not found."
        )
    return {"status": "success", "message": f"Session '{conversation_id}' cleared successfully."}
