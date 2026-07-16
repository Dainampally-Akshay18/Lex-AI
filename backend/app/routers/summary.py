"""Summary API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.summary import SummaryResponse
from app.services.summary_service import SummaryService
from app.dependencies import get_kernel_dependency, get_database_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/summary", tags=["Summary"])
logger = get_logger(__name__)


@router.get("/{document_id}", response_model=SummaryResponse)
async def get_summary(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
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
        document_id: Document ID
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        
    Returns:
        SummaryResponse containing all summary components
    """
    logger.info(f"Received summary generation request for document: {document_id}")
    
    # Create service instance
    summary_service = SummaryService(kernel, db)
    
    # Generate summary
    result = await summary_service.generate_summary(document_id)
    
    logger.info("Summary generation request completed successfully")
    return result
