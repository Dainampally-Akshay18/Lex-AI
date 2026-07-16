"""Analysis generation and caching service"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorDatabase
from semantic_kernel import Kernel
from app.models.analysis import AnalysisStatus, AnalysisResponse
from app.database.repositories import AnalysisRepository, DocumentRepository
from app.services.summary_service import SummaryService
from app.services.risk_service import RiskService
from app.services.financial_service import FinancialService
from app.utils.exceptions import NotFoundError, AuthorizationError
from app.utils.logger import get_logger
from app.config import get_settings

logger = get_logger(__name__)


class AnalysisService:
    """Service for managing document analysis and caching"""
    
    def __init__(self, kernel: Kernel, db: AsyncIOMotorDatabase):
        """
        Initialize analysis service.
        
        Args:
            kernel: Semantic Kernel instance
            db: MongoDB database instance
        """
        self.kernel = kernel
        self.db = db
        self.analysis_repo = AnalysisRepository(db)
        self.document_repo = DocumentRepository(db)
        self.settings = get_settings()
    
    async def generate_analysis(self, document_id: str, user_id: str) -> str:
        """
        Generate comprehensive analysis for a document.
        
        This runs asynchronously and caches results.
        
        Args:
            document_id: Document ID
            user_id: User ID
            
        Returns:
            Analysis ID
        """
        # Create analysis record
        analysis_id = await self.analysis_repo.create_analysis(document_id, user_id)
        
        # Start background processing
        asyncio.create_task(self._process_analysis(analysis_id, document_id, user_id))
        
        return analysis_id
    
    async def _process_analysis(self, analysis_id: str, document_id: str, user_id: str):
        """
        Background task to process analysis.
        
        Args:
            analysis_id: Analysis ID
            document_id: Document ID
            user_id: User ID
        """
        try:
            # Update status to processing
            await self.analysis_repo.update_status(analysis_id, AnalysisStatus.PROCESSING)
            
            # Get document
            document = await self.document_repo.get_document_by_id(document_id, include_text=True)
            if not document:
                raise NotFoundError(f"Document not found: {document_id}")
            
            # Verify ownership
            if document.get("userId") != user_id:
                raise AuthorizationError("Access denied")
            
            document_text = document.get("documentText", "")
            
            # Generate all analyses concurrently
            summary_service = SummaryService(self.kernel, self.db)
            risk_service = RiskService(self.kernel, self.db)
            financial_service = FinancialService(self.kernel, self.db)
            
            # Run all three in parallel
            summary_result, risk_result, financial_result = await asyncio.gather(
                summary_service.generate_summary_from_text(document_text),
                risk_service.analyze_risk_from_text(document_text),
                financial_service.extract_financial_from_text(document_text),
                return_exceptions=True
            )
            
            # Check for exceptions
            failed_components = []
            summary_data = None
            risk_data = None
            financial_data = None

            if isinstance(summary_result, Exception):
                failed_components.append(f"summary: {summary_result}")
            else:
                summary_data = summary_result.model_dump()

            if isinstance(risk_result, Exception):
                failed_components.append(f"risk: {risk_result}")
            else:
                risk_data = risk_result.model_dump()

            if isinstance(financial_result, Exception):
                failed_components.append(f"financial: {financial_result}")
            else:
                financial_data = financial_result.model_dump()

            if failed_components:
                raise RuntimeError("; ".join(failed_components))
            
            # Update results
            await self.analysis_repo.update_results(
                analysis_id,
                summary=summary_data,
                risk_analysis=risk_data,
                financial_terms=financial_data,
                model_name=self.settings.CHAT_DEPLOYMENT,
                model_version="2024-02-15"
            )
            
            # Update status to completed
            await self.analysis_repo.update_status(analysis_id, AnalysisStatus.COMPLETED)
            
            logger.info(f"Analysis completed: {analysis_id}")
            
        except Exception as e:
            logger.error(f"Analysis failed: {analysis_id} - {str(e)}")
            await self.analysis_repo.update_status(
                analysis_id,
                AnalysisStatus.FAILED,
                error_message=str(e)
            )
    
    async def get_analysis(self, document_id: str, user_id: str) -> AnalysisResponse:
        """
        Get cached analysis for a document.
        
        Args:
            document_id: Document ID
            user_id: User ID
            
        Returns:
            AnalysisResponse
            
        Raises:
            NotFoundError: If analysis not found
            AuthorizationError: If user doesn't own the document
        """
        # Get analysis
        analysis = await self.analysis_repo.get_analysis_by_document_id(document_id)
        
        if not analysis:
            raise NotFoundError(f"Analysis not found for document: {document_id}")
        
        # Verify ownership
        if analysis.get("userId") != user_id:
            raise AuthorizationError("Access denied: You don't have permission to access this analysis")
        
        # Convert to camelCase for response
        response_data = {
            "_id": analysis["_id"],
            "document_id": analysis["documentId"],
            "user_id": analysis["userId"],
            "status": analysis["status"],
            "summary": analysis.get("summary"),
            "risk_analysis": analysis.get("riskAnalysis"),
            "financial_terms": analysis.get("financialTerms"),
            "generated_at": analysis.get("generatedAt"),
            "updated_at": analysis["updatedAt"],
            "model_name": analysis.get("modelName"),
            "model_version": analysis.get("modelVersion"),
            "error_message": analysis.get("errorMessage")
        }
        
        return AnalysisResponse(**response_data)
