from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Campus Lost & Found AI Service"
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000

    # OpenCLIP Model Configuration
    clip_model_name: str = "ViT-B-32"
    clip_pretrained: str = "laion2b_s34b_b79k"

    # Embedding Configuration
    embedding_dim: int = 512
    image_size: int = 224

    # Matching Configuration
    default_top_k: int = 10
    similarity_threshold: float = 0.3

    class Config:
        env_file = ".env"
        env_prefix = "AI_"


settings = Settings()
