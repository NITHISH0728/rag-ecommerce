from datetime import datetime
from typing import Dict, Union
from pydantic import BaseModel, Field

MetadataValue = Union[str, int, float, bool]

class RAGDocument(BaseModel):
    document_id: str
    product_id: str
    chunk_id: str
    content: str
    metadata: Dict[str, MetadataValue]
    content_hash: str
    source: str
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
