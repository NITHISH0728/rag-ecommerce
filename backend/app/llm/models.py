from typing import Optional, Any
from pydantic import BaseModel

class LLMMessage(BaseModel):
    role: str  # "system", "user", "assistant"
    content: str

class LLMResponse(BaseModel):
    content: str
    raw_response: Any = None
    latency_seconds: float

class LLMStreamChunk(BaseModel):
    text: str
    finish_reason: Optional[str] = None

class LLMHealthResult(BaseModel):
    reachable: bool
    error_message: Optional[str] = None
