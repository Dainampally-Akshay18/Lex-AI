"""Risk analysis service"""
import json
import time
from semantic_kernel import Kernel
from semantic_kernel.contents import ChatHistory
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.risk import RiskResponse
from app.services.semantic_kernel.plugins.risk_plugin import RiskPlugin
from app.database.repositories import DocumentRepository
from app.utils.exceptions import AIServiceError, ValidationError, NotFoundError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class RiskService:
    """Service for risk analysis using Semantic Kernel"""
    
    def __init__(self, kernel: Kernel, db: AsyncIOMotorDatabase):
        """
        Initialize risk analysis service with Semantic Kernel.
        
        Args:
            kernel: Configured Semantic Kernel instance
            db: MongoDB database instance
        """
        self.kernel = kernel
        self.plugin = RiskPlugin()
        self.document_repo = DocumentRepository(db)
    
    async def analyze_risk_from_text(self, document_text: str) -> RiskResponse:
        """
        Analyze a legal document text for potential risks.
        Used internally for analysis caching.
        
        Args:
            document_text: The full text of the legal document
            
        Returns:
            RiskResponse containing risk analysis across all categories
            
        Raises:
            ValidationError: If document text is empty or invalid
            AIServiceError: If AI processing fails
        """
        # Validate input
        if not document_text or not document_text.strip():
            raise ValidationError("Document text cannot be empty")
        
        logger.info("AI risk analysis request started")
        start_time = time.time()
        
        try:
            # Prepare chat history with system and user prompts
            chat_history = ChatHistory()
            chat_history.add_system_message(self.plugin.get_system_prompt())
            chat_history.add_user_message(self.plugin.get_user_prompt(document_text))
            
            # Get chat completion service from kernel
            chat_service = self.kernel.get_service()
            
            # Invoke AI model
            response = await chat_service.get_chat_message_content(
                chat_history=chat_history,
                settings=chat_service.get_prompt_execution_settings_class()(
                    temperature=1,
                    max_completion_tokens=4000
                )
            )
            
            # Extract response content
            response_text = str(response)
            
            # Parse JSON response
            try:
                response_data = json.loads(response_text)
            except json.JSONDecodeError:
                # Try to extract JSON from response if wrapped in markdown
                if "```json" in response_text:
                    json_start = response_text.find("```json") + 7
                    json_end = response_text.find("```", json_start)
                    response_text = response_text[json_start:json_end].strip()
                    response_data = json.loads(response_text)
                else:
                    raise
            
            # Validate and create response model
            risk_response = RiskResponse(**response_data)
            
            duration = time.time() - start_time
            logger.info(f"AI risk analysis completed in {duration:.2f} seconds")
            
            return risk_response
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            raise AIServiceError("AI returned invalid JSON response")
        
        except (ValidationError, NotFoundError):
            raise
        
        except Exception as e:
            logger.error(f"Risk analysis failed: {str(e)}", exc_info=True)
            # Check for Azure-specific errors
            error_msg = str(e)
            if "BadRequest" in error_msg or "API version" in error_msg:
                raise AIServiceError(f"Azure AI Foundry error: {error_msg}")
            raise AIServiceError(f"Failed to analyze risk: {str(e)}")

    async def analyze_risk(self, document_id: str) -> RiskResponse:
        """
        Analyze a legal document for potential risks.
        Retrieves document and calls text-based analysis.
        
        Args:
            document_id: Document ID
            
        Returns:
            RiskResponse containing risk analysis across all categories
            
        Raises:
            NotFoundError: If document not found
            ValidationError: If document has no text
            AIServiceError: If AI processing fails
        """
        logger.info(f"AI risk analysis request started for document: {document_id}")
        
        # Retrieve document
        document = await self.document_repo.get_document_by_id(document_id, include_text=True)
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")
        
        document_text = document.get("documentText", "")
        if not document_text:
            raise ValidationError("Document has no text content")
        
        # Analyze risk from text
        return await self.analyze_risk_from_text(document_text)
