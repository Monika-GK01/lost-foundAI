"""
API routes for the AI microservice.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas import (
    EmbeddingResponse,
    MatchRequest,
    MatchResponse,
    MatchResult,
    HealthResponse,
)
from app.services.embedding import generate_embedding, find_top_k_matches
from app.models.clip_model import model_manager
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)
router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        model_loaded=model_manager._model is not None,
        device=str(model_manager.device),
        model_name=settings.clip_model_name,
    )


@router.post("/generate-embedding", response_model=EmbeddingResponse)
async def generate_embedding_endpoint(file: UploadFile = File(...)):
    """
    Generate an embedding vector from an uploaded image.
    Accepts: multipart/form-data with 'file' field.
    Returns: embedding vector and dimension.
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    try:
        image_bytes = await file.read()

        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file")

        if len(image_bytes) > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")

        embedding = generate_embedding(image_bytes)

        return EmbeddingResponse(
            embedding=embedding,
            dimension=len(embedding),
        )
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Embedding generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Embedding generation failed")


@router.post("/match", response_model=MatchResponse)
async def match_endpoint(request: MatchRequest):
    """
    Find top-K matching items based on embedding similarity.
    Accepts: query embedding + candidate embeddings.
    Returns: ranked matches with similarity scores.
    """
    try:
        candidates = [
            {"id": c.id, "embedding": c.embedding}
            for c in request.candidates
        ]

        matches = find_top_k_matches(
            query_embedding=request.query_embedding,
            candidate_embeddings=candidates,
            top_k=request.top_k,
            threshold=request.threshold,
        )

        match_results = [MatchResult(id=m["id"], similarity=m["similarity"]) for m in matches]

        return MatchResponse(
            matches=match_results,
            total_candidates=len(request.candidates),
            matches_found=len(match_results),
        )
    except Exception as e:
        logger.error(f"Matching failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Matching failed")
