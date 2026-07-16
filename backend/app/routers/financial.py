"""Financial extraction API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.financial import FinancialExtractionResponse
from app.services.analysis_service import AnalysisService
from app.dependencies import get_kernel_dependency, get_database_dependency, get_current_user
from app.utils.logger import get_logger
from app.utils.exceptions import NotFoundError

router = APIRouter(prefix="/financial", tags=["Financial"])
logger = get_logger(__name__)


@router.get("/extract/{document_id}", response_model=FinancialExtractionResponse)
async def extract_financial_terms(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Get cached financial terms from a legal document.
    
    This endpoint retrieves cached financial extraction including:
    - Payment amounts
    - Currency
    - Taxes
    - Interest rates
    - Due dates
    - Penalties
    - Security deposits
    - Contract value
    
    Args:
        document_id: Document ID
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        FinancialExtractionResponse with all extracted financial terms
    """
    logger.info(f"Received financial extraction request for document: {document_id} from user: {current_user['_id']}")
    
    # Create service instance
    analysis_service = AnalysisService(kernel, db)
    
    # Get cached analysis
    analysis = await analysis_service.get_analysis(document_id, current_user["_id"])
    
    # Extract financial terms from cached analysis
    if not analysis.financial_terms:
        raise NotFoundError(f"Financial terms not available for document: {document_id}")
    
    # Convert to FinancialExtractionResponse
    result = FinancialExtractionResponse(**analysis.financial_terms)
    
    logger.info("Financial extraction retrieval completed successfully")
    return result
