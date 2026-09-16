import os
from pydantic import BaseModel

class Settings(BaseModel):
    """
    Application configuration settings managed by Pydantic.
    Loads values from environment variables or .env file.
    """
    app_name: str = os.getenv("APP_NAME", "SentinelOps AI Backend")
    environment: str = os.getenv("ENVIRONMENT", "development")
    log_level: str = os.getenv("LOG_LEVEL", "INFO")
    api_key: str = os.getenv("API_KEY", "default-api-key")

settings = Settings()
