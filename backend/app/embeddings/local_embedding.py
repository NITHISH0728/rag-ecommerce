import torch
import logging
import threading
from typing import List, Optional
from sentence_transformers import SentenceTransformer
from backend.app.core.config import settings
from backend.app.providers.embedding_provider import EmbeddingProvider

logger = logging.getLogger("shopsmart-embeddings")

class LocalEmbeddingProvider(EmbeddingProvider):
    _model_instance: Optional[SentenceTransformer] = None
    _lock = threading.Lock()

    def __init__(self):
        self.model_name = settings.LOCAL_EMBEDDING_MODEL
        self.load_model()

    def load_model(self) -> SentenceTransformer:
        """
        Thread-safe method to load and cache the SentenceTransformer model instance.
        Automatically resolves GPU (CUDA) if available, falling back to CPU.
        """
        if LocalEmbeddingProvider._model_instance is None:
            with LocalEmbeddingProvider._lock:
                if LocalEmbeddingProvider._model_instance is None:
                    # Resolve hardware acceleration device
                    device = "cuda" if torch.cuda.is_available() else "cpu"
                    logger.info(f"Loading local SentenceTransformer model '{self.model_name}' on device '{device}'...")
                    
                    # Initialize local embedding transformer model
                    LocalEmbeddingProvider._model_instance = SentenceTransformer(
                        self.model_name,
                        device=device
                    )
                    logger.info("Local SentenceTransformer model loaded successfully.")
                    
        return LocalEmbeddingProvider._model_instance

    @property
    def model(self) -> SentenceTransformer:
        return self.load_model()

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generates embedding vectors for a list of document chunk texts."""
        return self.embed_batch(texts)

    def embed_query(self, text: str) -> List[float]:
        """Generates embedding vector for a single user search query."""
        logger.debug(f"Generating query embedding locally using '{self.model_name}'...")
        # SentenceTransformers encode returns a numpy array or list of floats
        vector = self.model.encode(text, convert_to_numpy=True)
        return vector.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        """Generates batch embeddings in a single process flow."""
        if not texts:
            return []
            
        logger.info(f"Generating local batch embeddings for {len(texts)} document chunks...")
        # Use default batch size or configured batch size
        batch_size = max(1, settings.EMBEDDING_BATCH_SIZE)
        vectors = self.model.encode(
            texts,
            batch_size=batch_size,
            show_progress_bar=False,
            convert_to_numpy=True
        )
        return vectors.tolist()

    def get_dimension(self) -> int:
        """Returns the embedding vector size dynamically."""
        return self.model.get_embedding_dimension()

    def get_embedding_dimension(self) -> Optional[int]:
        """Fulfills the abstract base class EmbeddingProvider requirements."""
        return self.get_dimension()

    def get_model_name(self) -> str:
        return self.model_name

    def get_provider_name(self) -> str:
        return "local"
