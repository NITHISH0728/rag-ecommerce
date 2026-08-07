from abc import ABC, abstractmethod
from typing import List, Optional

class EmbeddingProvider(ABC):
    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of document chunks."""
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Generate embedding for a search query."""
        pass

    @abstractmethod
    def get_model_name(self) -> str:
        """Return the active model name."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Return the provider name (e.g. 'openai' or 'gemini')."""
        pass

    @abstractmethod
    def get_embedding_dimension(self) -> Optional[int]:
        """Return the output dimension size (if known/detected)."""
        pass

def get_provider() -> EmbeddingProvider:
    from backend.app.core.config import settings
    provider_name = settings.EMBEDDING_PROVIDER.lower()
    if provider_name == "local":
        from backend.app.embeddings.local_embedding import LocalEmbeddingProvider
        return LocalEmbeddingProvider()
    elif provider_name == "openai":
        from backend.app.providers.openai_embedding_provider import OpenAIEmbeddingProvider
        return OpenAIEmbeddingProvider()
    elif provider_name in ("gemini", "google"):
        from backend.app.providers.gemini_embedding_provider import GeminiEmbeddingProvider
        return GeminiEmbeddingProvider()
    else:
        raise ValueError(f"Unknown embedding provider: {provider_name}")
