"""Document summarization service"""
import json
import time
from semantic_kernel import Kernel
from semantic_kernel.contents import ChatHistory
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.summary import SummaryResponse
from app.services.semantic_kernel.plugins.summary_plugin import SummaryPlugin
from app.database.repositories import DocumentRepository
from app.config import get_settings
from app.utils.exceptions import AIServiceError, ValidationError, NotFoundError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class SummaryService:
    """Service for document summarization using Semantic Kernel"""
    
    def __init__(self, kernel: Kernel, db: AsyncIOMotorDatabase):
        """
        Initialize summary service with Semantic Kernel.
        
        Args:
            kernel: Configured Semantic Kernel instance
            db: MongoDB database instance
        """
        self.kernel = kernel
        self.plugin = SummaryPlugin()
        self.document_repo = DocumentRepository(db)
    
    async def generate_summary_from_text(self, document_text: str) -> SummaryResponse:
        """
        Generate comprehensive summary from document text.
        Used internally for analysis caching.
        
        Args:
            document_text: The full text of the legal document
            
        Returns:
            SummaryResponse containing all summary components
            
        Raises:
            ValidationError: If document text is empty or invalid
            AIServiceError: If AI processing fails
        """
        # Validate input
        if not document_text or not document_text.strip():
            raise ValidationError("Document text cannot be empty")
        
        logger.info("AI summarization request started")
        start_time = time.time()
        
        try:
            # Prepare chat history with system and user prompts
            chat_history = ChatHistory()
            chat_history.add_system_message(self.plugin.get_system_prompt())
            chat_history.add_user_message(self.plugin.get_user_prompt(document_text))
            
            # Get chat completion service from kernel
            chat_service = self.kernel.get_service()
            
            settings = get_settings()
            logger.info(f"Invoking AI service for summary - Deployment: {settings.CHAT_DEPLOYMENT}")
            
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
            summary_response = SummaryResponse(**response_data)
            
            duration = time.time() - start_time
            logger.info(f"AI summarization completed in {duration:.2f} seconds")
            
            return summary_response
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            raise AIServiceError("AI returned invalid JSON response")
        
        except (ValidationError, NotFoundError):
            raise
        
        except Exception as e:
            logger.error(f"Summary generation failed: {str(e)}", exc_info=True)
            # Check for Azure-specific errors
            error_msg = str(e)
            if "BadRequest" in error_msg or "API version" in error_msg:
                raise AIServiceError(f"Azure AI Foundry error: {error_msg}")
            raise AIServiceError(f"Failed to generate summary: {str(e)}")

    async def generate_summary(self, document_id: str) -> SummaryResponse:
        """
        Generate comprehensive summary of a legal document.
        Retrieves document and calls text-based generation.
        
        Args:
            document_id: Document ID
            
        Returns:
            SummaryResponse containing all summary components
            
        Raises:
            NotFoundError: If document not found
            ValidationError: If document has no text
            AIServiceError: If AI processing fails
        """
        logger.info(f"AI summarization request started for document: {document_id}")
        
        # Retrieve document
        document = await self.document_repo.get_document_by_id(document_id, include_text=True)
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")
        
        document_text = document.get("documentText", "")
        if not document_text:
            raise ValidationError("Document has no text content")
        
        # Generate summary from text
        return await self.generate_summary_from_text(document_text)
