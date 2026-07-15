"""Summary API endpoints"""
from fastapi import APIRouter, Depends, Query
from semantic_kernel import Kernel
from app.models.summary import SummaryResponse
from app.services.summary_service import SummaryService
from app.dependencies import get_kernel_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/summary", tags=["Summary"])
logger = get_logger(__name__)


@router.get("/", response_model=SummaryResponse)
async def get_summary(
    document_text: str = Query(..., description="The full text of the legal document to summarize"),
    kernel: Kernel = Depends(get_kernel_dependency)
):
    """
    Generate comprehensive summary of a legal document.
    
    This endpoint analyzes a legal document and provides:
    - Executive summary
    - Quick summary
    - Detailed summary
    - Key clauses
    - Rights
    - Obligations
    - Important dates
    
    Args:
        document_text: The full text of the legal document
        kernel: Semantic Kernel instance (injected)
        
    Returns:
        SummaryResponse containing all summary components
    """
    logger.info("Received summary generation request")
    
    # Create service instance
    summary_service = SummaryService(kernel)
    
    # Generate summary
    result = await summary_service.generate_summary(document_text)
    
    logger.info("Summary generation request completed successfully")
    return result
