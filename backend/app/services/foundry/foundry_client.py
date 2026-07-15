"""Microsoft AI Foundry client initialization and configuration"""
from azure.ai.inference import ChatCompletionsClient
from azure.core.credentials import AzureKeyCredential
from typing import Optional
from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global AI Foundry client
_foundry_client: Optional[ChatCompletionsClient] = None


def get_foundry_client() -> ChatCompletionsClient:
    """
    Get configured Microsoft AI Foundry client (singleton pattern).
    Prepares the foundation for AI model inference.
    """
    global _foundry_client
    
    if _foundry_client is None:
        settings = get_settings()
        
        try:
            # Initialize AI Foundry client
            _foundry_client = ChatCompletionsClient(
                endpoint=settings.FOUNDRY_PROJECT_ENDPOINT,
                credential=AzureKeyCredential(settings.FOUNDRY_API_KEY)
            )
            
            logger.info("Microsoft AI Foundry client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize AI Foundry client: {str(e)}")
            raise
    
    return _foundry_client
