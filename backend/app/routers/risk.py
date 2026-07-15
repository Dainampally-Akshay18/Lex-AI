"""Risk analysis API endpoints"""
from fastapi import APIRouter, Depends, Query
from semantic_kernel import Kernel
from app.models.risk import RiskResponse
from app.services.risk_service import RiskService
from app.dependencies import get_kernel_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/risk", tags=["Risk"])
logger = get_logger(__name__)


@router.get("/analysis", response_model=RiskResponse)
async def get_risk_analysis(
    document_text: str = Query(..., description="The full text of the legal document to analyze"),
    kernel: Kernel = Depends(get_kernel_dependency)
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
        document_text: The full text of the legal document
        kernel: Semantic Kernel instance (injected)
        
    Returns:
        RiskResponse containing risk analysis across all categories
    """
    logger.info("Received risk analysis request")
    
    # Create service instance
    risk_service = RiskService(kernel)
    
    # Analyze risk
    result = await risk_service.analyze_risk(document_text)
    
    logger.info("Risk analysis request completed successfully")
    return result
