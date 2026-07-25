"""
OpenCLIP Model Manager
Loads the model once at startup and provides singleton access.
"""

import open_clip
import torch
from app.config import settings
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ModelManager:
    """Singleton manager for OpenCLIP model and preprocessing."""

    _instance = None
    _model = None
    _preprocess = None
    _tokenizer = None
    _device = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @property
    def device(self) -> torch.device:
        if self._device is None:
            self._device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        return self._device

    def load_model(self) -> None:
        """Load OpenCLIP model into memory. Called once at startup."""
        if self._model is not None:
            logger.info("Model already loaded, skipping.")
            return

        logger.info(
            f"Loading OpenCLIP model: {settings.clip_model_name} "
            f"(pretrained: {settings.clip_pretrained}) on device: {self.device}"
        )

        model, _, preprocess = open_clip.create_model_and_transforms(
            settings.clip_model_name,
            pretrained=settings.clip_pretrained,
            device=self.device,
        )

        tokenizer = open_clip.get_tokenizer(settings.clip_model_name)

        model.eval()
        self._model = model
        self._preprocess = preprocess
        self._tokenizer = tokenizer

        logger.info("✅ OpenCLIP model loaded successfully.")

    @property
    def model(self):
        if self._model is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        return self._model

    @property
    def preprocess(self):
        if self._preprocess is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        return self._preprocess

    @property
    def tokenizer(self):
        if self._tokenizer is None:
            raise RuntimeError("Model not loaded. Call load_model() first.")
        return self._tokenizer


model_manager = ModelManager()
