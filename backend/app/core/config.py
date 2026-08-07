import os
from typing import Optional, List
from pydantic import model_validator, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    APP_ENV: str = "development"
    PRODUCT_DATA_PATH: str = "./data/products.json"
    EMBEDDING_PROVIDER: str = "local"
    LOCAL_EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    
    EMBEDDING_BATCH_SIZE: int = 50
    CHUNK_SIZE: int = 1200
    CHUNK_OVERLAP: int = 150
    
    VECTOR_COLLECTION_NAME: str = "shopsmart-products"
    VECTOR_DB_PATH: str = "./storage/chroma"
    
    INGESTION_MAX_RETRIES: int = 3
    INGESTION_LOG_LEVEL: str = "INFO"

    # Phase 5 settings: Groq LLM integration
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.1-8b-instant"
    GROQ_TEMPERATURE: float = 0.1
    GROQ_MAX_TOKENS: int = 1200
    GROQ_TIMEOUT_SECONDS: float = 30.0
    GROQ_MAX_RETRIES: int = 3

    # RAG Settings
    RAG_TOP_K_CHUNKS: int = 12
    RAG_TOP_K_PRODUCTS: int = 5
    RAG_MIN_RESULTS: int = 1
    RAG_MAX_CONTEXT_CHARACTERS: int = 16000
    RAG_HISTORY_MESSAGE_LIMIT: int = 8
    RAG_HISTORY_CHARACTER_LIMIT: int = 8000
    RAG_ENABLE_QUERY_REWRITE: bool = True
    RAG_ENABLE_PRODUCT_DEDUPLICATION: bool = True
    RAG_ENABLE_RESPONSE_VALIDATION: bool = True
    RAG_ENABLE_STREAMING: bool = True

    # Chat & Security settings
    CHAT_MAX_MESSAGE_LENGTH: int = 2000
    CHAT_SESSION_TTL_MINUTES: int = 60
    CHAT_RATE_LIMIT_PER_MINUTE: int = 20

    # CORS Settings
    CORS_ALLOWED_ORIGINS: str = "http://localhost:5173"

    model_config = SettingsConfigDict(
        env_file=[".env", "backend/.env"],
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("GROQ_TEMPERATURE")
    @classmethod
    def validate_temp(cls, v: float) -> float:
        if not 0.0 <= v <= 2.0:
            raise ValueError("GROQ_TEMPERATURE must be between 0.0 and 2.0")
        return v

    @field_validator(
        "RAG_TOP_K_CHUNKS", "RAG_TOP_K_PRODUCTS", "RAG_MIN_RESULTS",
        "RAG_MAX_CONTEXT_CHARACTERS", "RAG_HISTORY_MESSAGE_LIMIT",
        "RAG_HISTORY_CHARACTER_LIMIT", "CHAT_MAX_MESSAGE_LENGTH",
        "CHAT_SESSION_TTL_MINUTES", "CHAT_RATE_LIMIT_PER_MINUTE"
    )
    @classmethod
    def validate_positives(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Value must be a positive integer")
        return v

    @property
    def cors_origins_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ALLOWED_ORIGINS.split(",") if x.strip()]

    @model_validator(mode="after")
    def validate_provider_keys(self) -> "Settings":
        # Validate Embedding Key
        provider = self.EMBEDDING_PROVIDER.lower()
        if provider != "local":
            raise ValueError(f"Unsupported EMBEDDING_PROVIDER: '{self.EMBEDDING_PROVIDER}'. Must be 'local'.")

        # Validate RAG config limits
        if self.RAG_TOP_K_PRODUCTS > self.RAG_TOP_K_CHUNKS:
            raise ValueError("RAG_TOP_K_PRODUCTS cannot be greater than RAG_TOP_K_CHUNKS")

        # Validate Groq Key
        if not self.GROQ_API_KEY:
            raise ValueError("GROQ_API_KEY is required.")

        return self

settings = Settings()
