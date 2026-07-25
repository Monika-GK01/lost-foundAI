"""
Embedding generation service using OpenCLIP.
"""

import torch
import numpy as np
from typing import List

from app.models.clip_model import model_manager
from app.services.preprocessing import preprocess_image
from app.utils.logger import get_logger

logger = get_logger(__name__)


def generate_embedding(image_bytes: bytes) -> List[float]:
    """
    Generate a normalized embedding vector for a given image.
    Returns a list of floats representing the embedding.
    """
    image_tensor = preprocess_image(image_bytes)
    device = model_manager.device
    image_tensor = image_tensor.to(device)

    with torch.no_grad():
        image_features = model_manager.model.encode_image(image_tensor)
        # L2 normalize
        image_features = image_features / image_features.norm(dim=-1, keepdim=True)

    embedding = image_features.cpu().numpy().flatten().tolist()
    logger.info(f"Generated embedding of dimension {len(embedding)}")
    return embedding


def compute_cosine_similarity(vec_a: List[float], vec_b: List[float]) -> float:
    """
    Compute cosine similarity between two embedding vectors.
    Both vectors are assumed to be L2-normalized.
    """
    a = np.array(vec_a, dtype=np.float32)
    b = np.array(vec_b, dtype=np.float32)

    dot_product = np.dot(a, b)
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)

    if norm_a == 0 or norm_b == 0:
        return 0.0

    return float(dot_product / (norm_a * norm_b))


def find_top_k_matches(
    query_embedding: List[float],
    candidate_embeddings: List[dict],
    top_k: int = 10,
    threshold: float = 0.3,
) -> List[dict]:
    """
    Find top-K nearest neighbours from candidate embeddings.

    Args:
        query_embedding: The query image embedding.
        candidate_embeddings: List of dicts with 'id' and 'embedding' keys.
        top_k: Number of top matches to return.
        threshold: Minimum similarity score to include.

    Returns:
        List of dicts with 'id' and 'similarity' keys, sorted by similarity desc.
    """
    results = []

    for candidate in candidate_embeddings:
        similarity = compute_cosine_similarity(
            query_embedding, candidate["embedding"]
        )
        if similarity >= threshold:
            results.append({
                "id": candidate["id"],
                "similarity": round(similarity, 6),
            })

    # Sort by similarity descending
    results.sort(key=lambda x: x["similarity"], reverse=True)

    return results[:top_k]
