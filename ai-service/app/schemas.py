"""
Pydantic schemas for API request/response validation.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class EmbeddingResponse(BaseModel):
    success: bool = True
    message: str = "Embedding generated successfully"
    embedding: List[float]
    dimension: int


class MatchCandidate(BaseModel):
    id: str
    embedding: List[float]


class MatchRequest(BaseModel):
    query_embedding: List[float] = Field(..., description="Query image embedding vector")
    candidates: List[MatchCandidate] = Field(..., description="Candidate items with embeddings")
    top_k: int = Field(default=10, ge=1, le=100)
    threshold: float = Field(default=0.3, ge=0.0, le=1.0)


class MatchResult(BaseModel):
    id: str
    similarity: float


class MatchResponse(BaseModel):
    success: bool = True
    message: str = "Matching completed"
    matches: List[MatchResult]
    total_candidates: int
    matches_found: int


class HealthResponse(BaseModel):
    status: str = "healthy"
    model_loaded: bool
    device: str
    model_name: str
