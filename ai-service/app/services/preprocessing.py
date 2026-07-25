"""
Image preprocessing utilities for the AI service.
"""

from PIL import Image
import io
from app.models.clip_model import model_manager
from app.utils.logger import get_logger

logger = get_logger(__name__)


def preprocess_image(image_bytes: bytes):
    """
    Preprocess an image for CLIP model input.
    Accepts raw image bytes, returns a preprocessed tensor.
    """
    try:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        preprocess = model_manager.preprocess
        image_tensor = preprocess(image).unsqueeze(0)
        return image_tensor
    except Exception as e:
        logger.error(f"Image preprocessing failed: {str(e)}")
        raise ValueError(f"Invalid image: {str(e)}")
