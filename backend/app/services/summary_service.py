"""Document summarization service"""
import json
import time
from semantic_kernel import Kernel
from semantic_kernel.contents import ChatHistory
from app.models.summary import SummaryResponse
from app.services.semantic_kernel.plugins.summary_plugin import SummaryPlugin
from app.utils.exceptions import AIServiceError, ValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class SummaryService:
    """Service for document summarization using Semantic Kernel"""
    
    def __init__(self, kernel: Kernel):
        """
        Initialize summary service with Semantic Kernel.
        
        Args:
            kernel: Configured Semantic Kernel instance
        """
        self.kernel = kernel
        self.plugin = SummaryPlugin()
    
    async def generate_summary(self, document_text: str) -> SummaryResponse:
        """
        Generate comprehensive summary of a legal document.
        
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
            
            # Invoke AI model
            response = await chat_service.get_chat_message_content(
                chat_history=chat_history,
                settings=chat_service.get_prompt_execution_settings_class()(
                    temperature=0.2,
                    max_tokens=4000
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
        
        except ValidationError:
            raise
        
        except Exception as e:
            logger.error(f"Summary generation failed: {str(e)}")
            raise AIServiceError(f"Failed to generate summary: {str(e)}")
