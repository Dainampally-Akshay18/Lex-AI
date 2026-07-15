"""Summary plugin for Semantic Kernel"""
from semantic_kernel.functions import kernel_function
from app.services.prompts import SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_PROMPT


class SummaryPlugin:
    """Plugin for document summarization using Semantic Kernel"""
    
    @kernel_function(
        name="summarize_document",
        description="Analyzes and summarizes a legal document"
    )
    def summarize_document(self, document_text: str) -> str:
        """
        Generate comprehensive summary of a legal document.
        
        Args:
            document_text: The full text of the legal document
            
        Returns:
            JSON string containing the summary analysis
        """
        # This function signature is used by Semantic Kernel
        # The actual prompt engineering is handled by the service layer
        return document_text
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for summarization"""
        return SUMMARY_SYSTEM_PROMPT
    
    def get_user_prompt(self, document_text: str) -> str:
        """Get the user prompt with document text"""
        return SUMMARY_USER_PROMPT.format(document_text=document_text)
