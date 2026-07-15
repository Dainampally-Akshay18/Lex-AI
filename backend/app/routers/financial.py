"""Financial extraction API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.financial import FinancialExtractionResponse
from app.services.financial_service import FinancialService
from app.dependencies import get_kernel_dependency, get_database_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/financial", tags=["Financial"])
logger = get_logger(__name__)


@router.get("/extract/{document_id}", response_model=FinancialExtractionResponse)
async def extract_financial_terms(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
):
    """
    Extract financial terms from a legal document.
    
    This endpoint uses AI to identify and extract:
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
        
    Returns:
        FinancialExtractionResponse with all extracted financial terms
    """
    logger.info(f"Received financial extraction request for document: {document_id}")
    
    # Create service instance
    financial_service = FinancialService(kernel, db)
    
    # Extract financial terms
    result = await financial_service.extract_financial_terms(document_id)
    
    logger.info("Financial extraction completed successfully")
    return result
