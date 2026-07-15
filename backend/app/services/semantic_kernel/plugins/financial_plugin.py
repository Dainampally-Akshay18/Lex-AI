"""Financial extraction plugin for Semantic Kernel"""
from semantic_kernel.functions import kernel_function
from app.services.prompts import FINANCIAL_SYSTEM_PROMPT, FINANCIAL_USER_PROMPT


class FinancialPlugin:
    """Plugin for financial term extraction using Semantic Kernel"""
    
    @kernel_function(
        name="extract_financial_terms",
        description="Extracts financial terms from a legal document"
    )
    def extract_financial_terms(self, document_text: str) -> str:
        """
        Extract financial terms from a legal document.
        
        Args:
            document_text: The full text of the legal document
            
        Returns:
            JSON string containing extracted financial terms
        """
        # This function signature is used by Semantic Kernel
        # The actual prompt engineering is handled by the service layer
        return document_text
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for financial extraction"""
        return FINANCIAL_SYSTEM_PROMPT
    
    def get_user_prompt(self, document_text: str) -> str:
        """Get the user prompt with document text"""
        return FINANCIAL_USER_PROMPT.format(document_text=document_text)
