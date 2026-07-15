"""Chat plugin for Semantic Kernel"""
from semantic_kernel.functions import kernel_function
from app.services.prompts import CHAT_SYSTEM_PROMPT, CHAT_USER_PROMPT


class ChatPlugin:
    """Plugin for chat assistant using Semantic Kernel"""
    
    @kernel_function(
        name="answer_question",
        description="Answers questions about a legal document"
    )
    def answer_question(self, document_text: str, question: str, conversation_history: str = "") -> str:
        """
        Answer a question about a legal document.
        
        Args:
            document_text: The full text of the legal document
            question: User's question
            conversation_history: Previous conversation context
            
        Returns:
            JSON string containing the answer and clause references
        """
        # This function signature is used by Semantic Kernel
        # The actual prompt engineering is handled by the service layer
        return question
    
    def get_system_prompt(self) -> str:
        """Get the system prompt for chat"""
        return CHAT_SYSTEM_PROMPT
    
    def get_user_prompt(self, document_text: str, question: str, conversation_history: str = "") -> str:
        """Get the user prompt with document text and question"""
        return CHAT_USER_PROMPT.format(
            document_text=document_text,
            question=question,
            conversation_history=conversation_history
        )
