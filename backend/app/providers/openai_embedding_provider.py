from typing import List, Optional
from langchain_openai import OpenAIEmbeddings
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from backend.app.core.config import settings
from backend.app.core.logging_config import logger
from backend.app.providers.embedding_provider import EmbeddingProvider

class OpenAIEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is not configured")
        
        self.client = OpenAIEmbeddings(
            openai_api_key=settings.OPENAI_API_KEY,
            model=settings.OPENAI_EMBEDDING_MODEL
        )
        self._detected_dimension: Optional[int] = None

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception),
        before_sleep=lambda retry_state: logger.warning(
            f"OpenAI Embedding API call failed. Retrying in {retry_state.next_action.sleep} seconds..."
        )
    )
    def _embed_documents_with_retry(self, texts: List[str]) -> List[List[float]]:
        return self.client.embed_documents(texts)

    @retry(
        stop=stop_after_attempt(5),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        retry=retry_if_exception_type(Exception)
    )
    def _embed_query_with_retry(self, text: str) -> List[float]:
        return self.client.embed_query(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        
        embeddings = self._embed_documents_with_retry(texts)
        
        # Verify result counts and dimensions
        if len(embeddings) != len(texts):
            raise ValueError(f"OpenAI embedding count mismatch: expected {len(texts)}, got {len(embeddings)}")
        
        for idx, vec in enumerate(embeddings):
            if not vec:
                raise ValueError(f"Empty embedding vector received at index {idx}")
            if any(val is None or val != val for val in vec): # check NaN (x != x is True for NaN)
                raise ValueError(f"Invalid NaN/None value found in embedding vector at index {idx}")
            
            # Detect or verify dimensions
            if self._detected_dimension is None:
                self._detected_dimension = len(vec)
            elif len(vec) != self._detected_dimension:
                raise ValueError(
                    f"Inconsistent embedding dimension at index {idx}. "
                    f"Expected {self._detected_dimension}, got {len(vec)}"
                )
                
        return embeddings

    def embed_query(self, text: str) -> List[float]:
        if not text:
            raise ValueError("Query text cannot be empty")
        return self._embed_query_with_retry(text)

    def get_model_name(self) -> str:
        return settings.OPENAI_EMBEDDING_MODEL

    def get_provider_name(self) -> str:
        return "openai"

    def get_embedding_dimension(self) -> Optional[int]:
        return self._detected_dimension
