"""Translation API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from app.models.translation import TranslationRequest, TranslationResponse
from app.services.translation_service import TranslationService
from app.dependencies import get_kernel_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/language", tags=["Translation"])
logger = get_logger(__name__)


@router.post("/translate", response_model=TranslationResponse)
async def translate_content(
    request: TranslationRequest,
    kernel: Kernel = Depends(get_kernel_dependency)
):
    """
    Translate AI-generated content to a target language.
    
    Supported languages:
    - English
    - Telugu
    - Hindi
    - Tamil
    - Kannada
    - Malayalam
    
    Supported content types:
    - Chat responses
    - Summary
    - Risk analysis
    - Financial extraction
    
    Args:
        request: Translation request with content and target language
        kernel: Semantic Kernel instance (injected)
        
    Returns:
        TranslationResponse with translated content
    """
    logger.info(f"Received translation request: {request.content_type} to {request.target_language}")
    
    # Create service instance
    translation_service = TranslationService(kernel)
    
    # Translate content
    result = await translation_service.translate_content(
        content=request.content,
        target_language=request.target_language,
        content_type=request.content_type
    )
    
    logger.info("Translation completed successfully")
    return result
