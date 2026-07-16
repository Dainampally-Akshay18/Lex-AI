"""Analysis API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.analysis import AnalysisResponse
from app.services.analysis_service import AnalysisService
from app.dependencies import get_kernel_dependency, get_database_dependency, get_current_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/analysis", tags=["Analysis"])
logger = get_logger(__name__)


@router.get("/{document_id}", response_model=AnalysisResponse)
async def get_analysis(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Get cached analysis for a document.
    
    Requires authentication. Returns cached AI-generated analysis including:
    - Summary
    - Risk Analysis
    - Financial Terms
    
    Args:
        document_id: Document ID
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        AnalysisResponse with cached analysis data
    """
    logger.info(f"Received analysis request for document: {document_id} from user: {current_user['_id']}")
    
    # Create service instance
    analysis_service = AnalysisService(kernel, db)
    
    # Get cached analysis
    result = await analysis_service.get_analysis(document_id, current_user["_id"])
    
    logger.info("Analysis retrieval completed successfully")
    return result
