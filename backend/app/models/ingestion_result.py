from typing import List, Optional
from pydantic import BaseModel

class IngestionResult(BaseModel):
    started_at: str
    completed_at: str
    duration_seconds: float
    source_file: str
    products_loaded: int
    products_valid: int
    products_invalid: int
    documents_created: int
    chunks_created: int
    new_chunks: int
    updated_chunks: int
    unchanged_chunks: int
    removed_chunks: int
    embedded_chunks: int
    failed_chunks: int
    embedding_provider: str
    embedding_model: str
    embedding_dimension: Optional[int] = None
    collection_name: str
    dry_run: bool
    warnings: List[str] = []
    errors: List[str] = []
    success: bool
