from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.api.v1.chat import router as chat_router
from backend.app.api.v1.assistant import router as assistant_router
from backend.app.api.v1.health import router as health_router

app = FastAPI(
    title="ShopSmart RAG AI Assistant API",
    description="Conversational shopping discovery, semantic retrieval, and product recommendations using ChromaDB and Groq",
    version="1.0.0"
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(chat_router, prefix="/api/v1")
app.include_router(assistant_router, prefix="/api/v1")
app.include_router(health_router, prefix="/api/v1/assistant")  # Conforms to GET /api/v1/assistant/health

ingestion_state = {"status": "starting", "count": 0}

def _background_auto_ingest():
    from backend.app.core.logging_config import logger
    from backend.app.vector_store.vector_store_interface import get_vector_store
    from backend.app.ingestion.pipeline import IngestionPipeline

    try:
        store = get_vector_store()
        record_count = store.count()
        if record_count == 0:
            ingestion_state["status"] = "indexing"
            logger.info(f"Vector collection '{settings.VECTOR_COLLECTION_NAME}' is empty. Running background auto-ingestion from {settings.PRODUCT_DATA_PATH}...")
            pipeline = IngestionPipeline()
            result = pipeline.run(settings.PRODUCT_DATA_PATH)
            ingestion_state["status"] = "ready"
            ingestion_state["count"] = result.embedded_count
            logger.info(f"Background auto-ingestion complete: {result.embedded_count} chunks embedded successfully.")
        else:
            ingestion_state["status"] = "ready"
            ingestion_state["count"] = record_count
            logger.info(f"Vector collection '{settings.VECTOR_COLLECTION_NAME}' loaded with {record_count} chunks.")
    except Exception as e:
        ingestion_state["status"] = f"error: {str(e)}"
        logger.error(f"Background auto-ingestion failed: {e}")

@app.on_event("startup")
def trigger_startup_ingestion():
    """Triggers non-blocking background ingestion thread so server binds to PORT immediately."""
    import threading
    threading.Thread(target=_background_auto_ingest, daemon=True).start()


@app.get("/health", tags=["System"])
def health_check():
    """Simple system health and status check."""
    return {
        "status": "healthy",
        "ingestion_status": ingestion_state["status"],
        "vector_count": ingestion_state["count"],
        "app_env": settings.APP_ENV,
        "embedding_provider": settings.EMBEDDING_PROVIDER,
        "embedding_model": settings.LOCAL_EMBEDDING_MODEL,
        "collection_name": settings.VECTOR_COLLECTION_NAME
    }

@app.get("/config", tags=["System"])
def get_config_summary():
    """Returns a sanitized configuration summary (excludes API keys)."""
    return {
        "APP_ENV": settings.APP_ENV,
        "PRODUCT_DATA_PATH": settings.PRODUCT_DATA_PATH,
        "EMBEDDING_PROVIDER": settings.EMBEDDING_PROVIDER,
        "EMBEDDING_BATCH_SIZE": settings.EMBEDDING_BATCH_SIZE,
        "CHUNK_SIZE": settings.CHUNK_SIZE,
        "CHUNK_OVERLAP": settings.CHUNK_OVERLAP,
        "VECTOR_COLLECTION_NAME": settings.VECTOR_COLLECTION_NAME,
        "VECTOR_DB_PATH": settings.VECTOR_DB_PATH,
        "INGESTION_MAX_RETRIES": settings.INGESTION_MAX_RETRIES,
        "INGESTION_LOG_LEVEL": settings.INGESTION_LOG_LEVEL,
        "GROQ_MODEL": settings.GROQ_MODEL,
        "GROQ_TEMPERATURE": settings.GROQ_TEMPERATURE,
        "GROQ_MAX_TOKENS": settings.GROQ_MAX_TOKENS,
        "RAG_TOP_K_CHUNKS": settings.RAG_TOP_K_CHUNKS,
        "RAG_TOP_K_PRODUCTS": settings.RAG_TOP_K_PRODUCTS
    }
