from typing import List, Dict, Union, Optional
from pydantic import BaseModel, Field

MetadataValue = Union[str, int, float, bool]

class VectorRecord(BaseModel):
    id: str
    embedding: List[float]
    document: str
    metadata: Dict[str, MetadataValue]

class StoredVectorRecord(BaseModel):
    id: str
    embedding: Optional[List[float]] = None
    document: str
    metadata: Dict[str, MetadataValue]

class VectorSearchResult(BaseModel):
    id: str
    product_id: str
    document: str
    metadata: Dict[str, MetadataValue]
    distance: float
    similarity_score: float
    rank: int

class UpsertResult(BaseModel):
    inserted_count: int
    updated_count: int
    success: bool

class DeleteResult(BaseModel):
    deleted_count: int
    success: bool

class VerificationResult(BaseModel):
    success: bool
    total_records: int
    valid_records: int
    invalid_records: int
    warnings: List[str] = []
    errors: List[str] = []
    embedding_dimension: Optional[int] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    schema_version: Optional[str] = None
