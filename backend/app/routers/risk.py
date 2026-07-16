"""Risk analysis API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.risk import RiskResponse
from app.services.risk_service import RiskService
from app.dependencies import get_kernel_dependency, get_database_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/risk", tags=["Risk"])
logger = get_logger(__name__)


@router.get("/analysis/{document_id}", response_model=RiskResponse)
async def get_risk_analysis(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
):
    """
    Analyze legal document for potential risks.
    
    This endpoint performs comprehensive risk analysis across 8 categories:
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
        
    Returns:
        RiskResponse containing risk analysis across all categories
    """
    logger.info(f"Received risk analysis request for document: {document_id}")
    
    # Create service instance
    risk_service = RiskService(kernel, db)
    
    # Analyze risk
    result = await risk_service.analyze_risk(document_id)
    
    logger.info("Risk analysis request completed successfully")
    return result
