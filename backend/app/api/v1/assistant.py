import logging
from fastapi import APIRouter, Depends, HTTPException
from backend.app.chat.models import ChatRequest, ChatResponse
from backend.app.api.dependencies import get_chat_service_dep
from backend.app.chat.service import ChatService

router = APIRouter()
logger = logging.getLogger("shopsmart-assistant-api")

@router.post("/debug/retrieval", tags=["Development"])
async def debug_retrieval(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service_dep)
):
    """
    Development-only endpoint to inspect parsed intents, active filters,
    and ranked RAG chunks without triggering LLM text generation.
    Disabled when APP_ENV == 'production'.
    """
    from backend.app.core.config import settings
    if settings.APP_ENV == "production":
        raise HTTPException(status_code=403, detail="Development retrieval debug is disabled in production environment.")
        
    try:
        from backend.app.security.input_guard import normalize_and_validate_message
        from backend.app.rag.query_analyzer import analyze_query_deterministically
        from backend.app.chat.session_manager import get_session_store
        
        # 1. Normalize
        message = normalize_and_validate_message(request.message)
        # 2. Analyze
        analysis = analyze_query_deterministically(message)
        # 3. Retrieve chunks
        session_store = get_session_store()
        session = session_store.get_session(request.conversation_id or "debug_session")
        
        active_filters = chat_service.orchestrator._apply_filter_precedence(request, analysis, session)
        
        raw_chunks = chat_service.orchestrator.search_service.search_chunks(
            query=message,
            top_k=settings.RAG_TOP_K_CHUNKS,
            filters=active_filters
        )
        
        ranked_chunks = chat_service.orchestrator.ranker.rank_products(
            results=raw_chunks,
            requested_use_cases=analysis.use_cases,
            maximum_price=active_filters.maximum_price,
            keywords=analysis.keywords
        )
        
        return {
            "query": message,
            "analysis": analysis.model_dump(),
            "applied_filters": active_filters.model_dump(exclude_none=True),
            "chunks_retrieved_count": len(raw_chunks),
            "ranked_products_count": len(ranked_chunks),
            "ranked_chunks": [
                {
                    "chunk_id": c.id,
                    "product_id": c.product_id,
                    "name": c.metadata.get("name"),
                    "price": c.metadata.get("price"),
                    "score": c.similarity_score
                }
                for c in ranked_chunks
            ]
        }
    except Exception as e:
        logger.error(f"Debug retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
