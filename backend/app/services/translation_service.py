"""Translation service"""
import time
from semantic_kernel import Kernel
from semantic_kernel.contents import ChatHistory
from app.models.translation import TranslationResponse, LanguageCode, ContentType
from app.services.semantic_kernel.plugins.translation_plugin import TranslationPlugin
from app.utils.exceptions import AIServiceError, ValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class TranslationService:
    """Service for content translation using Semantic Kernel"""
    
    def __init__(self, kernel: Kernel):
        """
        Initialize translation service.
        
        Args:
            kernel: Configured Semantic Kernel instance
        """
        self.kernel = kernel
        self.plugin = TranslationPlugin()
    
    async def translate_content(
        self,
        content: str,
        target_language: LanguageCode,
        content_type: ContentType
    ) -> TranslationResponse:
        """
        Translate content to target language.
        
        Args:
            content: Content to translate
            target_language: Target language
            content_type: Type of content
            
        Returns:
            TranslationResponse with translated content
            
        Raises:
            ValidationError: If inputs are invalid
            AIServiceError: If AI processing fails
        """
        # Validate input
        if not content or not content.strip():
            raise ValidationError("Content cannot be empty")
        
        logger.info(f"Translation started: {content_type} to {target_language}")
        start_time = time.time()
        
        try:
            # Prepare chat history with system and user prompts
            chat_history = ChatHistory()
            chat_history.add_system_message(self.plugin.get_system_prompt())
            chat_history.add_user_message(
                self.plugin.get_user_prompt(content, target_language.value, content_type.value)
            )
            
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
            
            # Extract translated content
            translated_content = str(response).strip()
            
            duration = time.time() - start_time
            logger.info(f"Translation completed in {duration:.2f} seconds")
            
            return TranslationResponse(
                original_content=content,
                translated_content=translated_content,
                source_language="english",
                target_language=target_language,
                content_type=content_type
            )
            
        except ValidationError:
            raise
        
        except Exception as e:
            logger.error(f"Translation failed: {str(e)}")
            raise AIServiceError(f"Failed to translate content: {str(e)}")
