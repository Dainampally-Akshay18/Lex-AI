"""Risk analysis API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.risk import RiskResponse
from app.services.analysis_service import AnalysisService
from app.dependencies import get_kernel_dependency, get_database_dependency, get_current_user
from app.utils.logger import get_logger
from app.utils.exceptions import NotFoundError

router = APIRouter(prefix="/risk", tags=["Risk"])
logger = get_logger(__name__)


@router.get("/analysis/{document_id}", response_model=RiskResponse)
async def get_risk_analysis(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Get cached risk analysis for a legal document.
    
    This endpoint retrieves comprehensive cached risk analysis across 8 categories:
    - Payment Risk
    - Liability Risk
    - Confidentiality Risk
    - Compliance Risk
    - Jurisdiction Risk
    - Renewal Risk
    - Penalty Risk
    - Termination Risk
    
    Returns overall risk score, individual risk breakdown, and recommendations.
    
    Args:
        document_id: Document ID
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        RiskResponse containing risk analysis across all categories
    """
    logger.info(f"Received risk analysis request for document: {document_id} from user: {current_user['_id']}")
    
    # Create service instance
    analysis_service = AnalysisService(kernel, db)
    
    # Get cached analysis
    analysis = await analysis_service.get_analysis(document_id, current_user["_id"])
    
    # Extract risk analysis from cached analysis
    if not analysis.risk_analysis:
        raise NotFoundError(f"Risk analysis not available for document: {document_id}")
    
    # Convert to RiskResponse
    result = RiskResponse(**analysis.risk_analysis)
    
    logger.info("Risk analysis retrieval completed successfully")
    return result
