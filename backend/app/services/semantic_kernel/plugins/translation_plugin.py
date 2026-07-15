"""Translation plugin for Semantic Kernel"""
from semantic_kernel.functions import kernel_function
from app.services.prompts import TRANSLATION_SYSTEM_PROMPT, TRANSLATION_USER_PROMPT


class TranslationPlugin:
    """Plugin for translation using Semantic Kernel"""
    
    @kernel_function(
        name="translate_content",
        description="Translates content to a target language"
    )
    def translate_content(self, content: str, target_language: str, content_type: str) -> str:
        """
        Translate content to target language.
        
        Args:
            content: Content to translate
            target_language: Target language
            content_type: Type of content
            
        Returns:
            Translated text
        """
        # This function signature is used by Semantic Kernel
        # The actual prompt engineering is handled by the service layer
        return content
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for translation"""
        return TRANSLATION_SYSTEM_PROMPT
    
    def get_user_prompt(self, content: str, target_language: str, content_type: str) -> str:
        """Get the user prompt for translation"""
        return TRANSLATION_USER_PROMPT.format(
            content=content,
            target_language=target_language,
            content_type=content_type
        )
