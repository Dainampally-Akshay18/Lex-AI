"""Risk analysis plugin for Semantic Kernel"""
from semantic_kernel.functions import kernel_function
from app.services.prompts import RISK_SYSTEM_PROMPT, RISK_USER_PROMPT


class RiskPlugin:
    """Plugin for risk analysis using Semantic Kernel"""
    
    @kernel_function(
        name="analyze_risk",
        description="Analyzes legal document for potential risks"
    )
    def analyze_risk(self, document_text: str) -> str:
        """
        Analyze a legal document for risks across multiple categories.
        
        Args:
            document_text: The full text of the legal document
            
        Returns:
            JSON string containing the risk analysis
        """
        # This function signature is used by Semantic Kernel
        # The actual prompt engineering is handled by the service layer
        return document_text
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for risk analysis"""
        return RISK_SYSTEM_PROMPT
    
    def get_user_prompt(self, document_text: str) -> str:
        """Get the user prompt with document text"""
        return RISK_USER_PROMPT.format(document_text=document_text)
