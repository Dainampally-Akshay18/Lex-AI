"""SEMANTIC KERNEL - FINAL FIX WITH CORRECT URL"""
from semantic_kernel import Kernel
from semantic_kernel.connectors.ai.open_ai import AzureChatCompletion
from semantic_kernel.connectors.ai.open_ai.prompt_execution_settings.azure_chat_prompt_execution_settings import (
    AzureChatPromptExecutionSettings,
)
from typing import Optional
from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global Kernel instance
_kernel: Optional[Kernel] = None

# ============================================================
# YOUR WORKING CONFIGURATION
# ============================================================
API_VERSION = "2024-02-15-preview"
# ============================================================


def get_kernel() -> Kernel:
    """Get configured Semantic Kernel instance"""
    global _kernel
    
    if _kernel is None:
        settings = get_settings()
        
        try:
            logger.info("🚀 Initializing Semantic Kernel...")
            
            # ============================================================
            # CRITICAL FIX: Add /openai/ to the endpoint
            # ============================================================
            base_url = settings.FOUNDRY_PROJECT_ENDPOINT.rstrip('/')
            
            # Ensure /openai/ is in the path
            if "/openai/" not in base_url:
                base_url = base_url + "/openai"
            
            logger.info(f"📍 Endpoint: {base_url}")
            logger.info(f"📦 Deployment: {settings.CHAT_DEPLOYMENT}")
            logger.info(f"📌 API Version: {API_VERSION}")
            
            # Initialize Kernel
            _kernel = Kernel()
            
            # Create Azure Chat Completion with CORRECT URL
            chat_completion = AzureChatCompletion(
                deployment_name=settings.CHAT_DEPLOYMENT,
                api_key=settings.FOUNDRY_API_KEY,
                base_url=base_url,  # <-- FIXED: Includes /openai/
                api_version=API_VERSION
            )
            
            _kernel.add_service(chat_completion)
            
            logger.info("✅ Semantic Kernel initialized successfully!")
            logger.info(f"🎯 Target Model: {settings.CHAT_DEPLOYMENT}")
            logger.info(f"🔗 Full URL: {base_url}/deployments/{settings.CHAT_DEPLOYMENT}/chat/completions")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize Semantic Kernel: {str(e)}")
            _kernel = None
            raise
    
    return _kernel


def get_chat_settings(
    temperature: float = 0.7,
    max_completion_tokens: int = 2000,
    top_p: float = 1.0,
    frequency_penalty: float = 0.0,
    presence_penalty: float = 0.0
) -> AzureChatPromptExecutionSettings:
    """Get chat execution settings for GPT-5-mini."""
    return AzureChatPromptExecutionSettings(
        temperature=temperature,
        max_completion_tokens=max_completion_tokens,
        top_p=top_p,
        frequency_penalty=frequency_penalty,
        presence_penalty=presence_penalty
    )


async def execute_prompt(
    prompt: str,
    temperature: float = 0.7,
    max_completion_tokens: int = 2000,
    **kwargs
) -> str:
    """Execute a prompt using the Semantic Kernel."""
    from semantic_kernel.functions import KernelFunction
    from semantic_kernel.functions.kernel_arguments import KernelArguments
    
    try:
        kernel = get_kernel()
        
        settings = get_chat_settings(
            temperature=temperature,
            max_completion_tokens=max_completion_tokens,
            **kwargs
        )
        
        function = KernelFunction.from_prompt(
            prompt=prompt,
            execution_settings=settings,
            description="Execute prompt"
        )
        
        result = await kernel.invoke(
            function,
            arguments=KernelArguments()
        )
        
        return str(result)
        
    except Exception as e:
        logger.error(f"❌ Prompt execution failed: {str(e)}")
        raise