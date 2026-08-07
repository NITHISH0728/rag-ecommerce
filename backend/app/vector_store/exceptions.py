class VectorStoreError(Exception):
    """Base exception for all Vector Store related errors."""
    pass

class VectorStoreInitializationError(VectorStoreError):
    """Raised when Vector Store initialization fails."""
    pass

class CollectionNotFoundError(VectorStoreError):
    """Raised when the requested collection does not exist."""
    pass

class CollectionCompatibilityError(VectorStoreError):
    """Raised when the collection metadata is incompatible with current configuration."""
    pass

class InvalidEmbeddingError(VectorStoreError):
    """Raised when an embedding vector is empty, contains NaN/Inf, or is not numeric."""
    pass

class EmbeddingDimensionMismatchError(VectorStoreError):
    """Raised when embedding dimension does not match collection config."""
    pass

class VectorUpsertError(VectorStoreError):
    """Raised when upserting vector records fails."""
    pass

class VectorDeleteError(VectorStoreError):
    """Raised when deleting vector records fails."""
    pass

class VectorSearchError(VectorStoreError):
    """Raised when performing similarity search fails."""
    pass

class MetadataValidationError(VectorStoreError):
    """Raised when metadata values are invalid or incompatible."""
    pass

class CollectionVerificationError(VectorStoreError):
    """Raised when collection verification fails or detects critical errors."""
    pass

class ConcurrentWriteError(VectorStoreError):
    """Raised when another write operation is in progress (lock file exists)."""
    pass
