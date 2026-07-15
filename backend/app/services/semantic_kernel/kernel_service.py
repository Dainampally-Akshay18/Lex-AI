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
            chat_service = AzureChatCompletion(
                deployment_name=settings.CHAT_DEPLOYMENT,
                endpoint=settings.FOUNDRY_PROJECT_ENDPOINT,
                api_key=settings.FOUNDRY_API_KEY,
            )
            
            # Add service to kernel
            _kernel.add_service(chat_service)
            
            logger.info("Semantic Kernel initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize Semantic Kernel: {str(e)}")
            raise
    
    return _kernel
