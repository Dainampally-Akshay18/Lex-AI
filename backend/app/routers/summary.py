"""Summary API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.summary import SummaryResponse
from app.services.analysis_service import AnalysisService
from app.dependencies import get_kernel_dependency, get_database_dependency, get_current_user
from app.utils.logger import get_logger
from app.utils.exceptions import NotFoundError

router = APIRouter(prefix="/summary", tags=["Summary"])
logger = get_logger(__name__)


@router.get("/{document_id}", response_model=SummaryResponse)
async def get_summary(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Get cached summary of a legal document.
    
    This endpoint retrieves cached summary including:
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
        current_user: Authenticated user (injected)
        
    Returns:
        SummaryResponse containing all summary components
    """
    logger.info(f"Received summary request for document: {document_id} from user: {current_user['_id']}")
    
    # Create service instance
    analysis_service = AnalysisService(kernel, db)
    
    # Get cached analysis
    analysis = await analysis_service.get_analysis(document_id, current_user["_id"])
    
    # Extract summary from cached analysis
    if not analysis.summary:
        raise NotFoundError(f"Summary not available for document: {document_id}")
    
    # Convert to SummaryResponse
    result = SummaryResponse(**analysis.summary)
    
    logger.info("Summary retrieval completed successfully")
    return result
