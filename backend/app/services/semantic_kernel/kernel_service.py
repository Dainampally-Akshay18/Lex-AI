"""Semantic Kernel initialization and configuration"""
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from typing import Optional
from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global Kernel instance
_kernel: Optional[Kernel] = None


def get_kernel() -> Kernel:
    """
    Get configured Semantic Kernel instance (singleton pattern).
    Acts as the central AI orchestration layer.
    """
    global _kernel
    
    if _kernel is None:
        settings = get_settings()
        
        try:
            # Initialize Kernel
            _kernel = Kernel()
            
            # Configure Azure OpenAI service via AI Foundry
            # Using api_version 2024-02-15-preview which is compatible with Azure AI Foundry
            chat_service = AzureChatCompletion(
                deployment_name=settings.CHAT_DEPLOYMENT,
                endpoint=settings.FOUNDRY_PROJECT_ENDPOINT,
                api_key=settings.FOUNDRY_API_KEY,
                api_version="2024-02-15-preview"
            )
            
            # Add service to kernel
            _kernel.add_service(chat_service)
            
            logger.info(f"Semantic Kernel initialized successfully")
            logger.info(f"Using deployment: {settings.CHAT_DEPLOYMENT}")
            logger.info(f"Endpoint: {settings.FOUNDRY_PROJECT_ENDPOINT}")
            logger.info(f"API Version: 2024-02-15-preview")
            
        except Exception as e:
            logger.error(f"Failed to initialize Semantic Kernel: {str(e)}")
            raise
    
    return _kernel
