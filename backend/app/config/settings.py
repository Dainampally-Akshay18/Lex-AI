"""Application configuration using environment variables"""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "LexAI"
    APP_ENV: str = "development"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    DEBUG: bool = True
    
    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    
    # MongoDB
    MONGODB_URI: str
    DATABASE_NAME: str = "lexai"
    
    # Microsoft AI Foundry
    FOUNDRY_PROJECT_ENDPOINT: str
    FOUNDRY_API_KEY: str
    OPEN_AI_CLIENT : str
    
    # Model Deployments
    CHAT_DEPLOYMENT: str = "gpt-5-mini"
    
    # Frontend
    FRONTEND_URL: str = "http://localhost:3000"
    
    # File Uploads
    UPLOAD_DIRECTORY: str = "uploads"
    MAX_FILE_SIZE_MB: int = 25
    SUPPORTED_FILE_TYPES: str = "pdf,docx"
    
    # AI Settings
    TEMPERATURE: float = 0.2
    MAX_TOKENS: int = 4000
    
    # PDF Processing
    PDF_EXTRACTOR: str = "pymupdf"
    
    # Report Generation
    REPORT_OUTPUT_DIRECTORY: str = "reports"
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    @property
    def supported_file_types_list(self) -> List[str]:
        """Get supported file types as a list"""
        return [ft.strip() for ft in self.SUPPORTED_FILE_TYPES.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
_settings = None


def get_settings() -> Settings:
    """Get application settings (singleton pattern)"""
    global _settings
    if _settings is None:
        _settings = Settings()
    return _settings
