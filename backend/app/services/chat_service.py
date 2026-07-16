"""Chat assistant service"""
import json
import time
from semantic_kernel import Kernel
from semantic_kernel.contents import ChatHistory
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.chat import ChatResponse, ConversationHistory, ConversationMessage
from app.services.semantic_kernel.plugins.chat_plugin import ChatPlugin
from app.database.repositories import DocumentRepository, ChatRepository
from app.utils.exceptions import AIServiceError, ValidationError, NotFoundError, AuthorizationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ChatService:
    """Service for chat assistant using Semantic Kernel"""
    
    def __init__(self, kernel: Kernel, db: AsyncIOMotorDatabase):
        """
        Initialize chat service.
        
        Args:
            kernel: Configured Semantic Kernel instance
            db: MongoDB database instance
        """
        self.kernel = kernel
        self.plugin = ChatPlugin()
        self.document_repo = DocumentRepository(db)
        self.chat_repo = ChatRepository(db)
    
    async def ask_question(self, document_id: str, question: str, user_id: str) -> ChatResponse:
        """
        Ask a question about a legal document.
        
        Args:
            document_id: Document ID
            question: User's question
            
        Returns:
            ChatResponse with answer and clause references
            
        Raises:
            ValidationError: If inputs are invalid
            NotFoundError: If document not found
            AIServiceError: If AI processing fails
        """
        # Validate input
        if not question or not question.strip():
            raise ValidationError("Question cannot be empty")
        
        logger.info(f"Chat request started for document: {document_id}")
        start_time = time.time()
        
        try:
            # Retrieve document
            document = await self.document_repo.get_document_by_id(document_id, include_text=True)
            if not document:
                raise NotFoundError(f"Document not found: {document_id}")

            if document.get("userId") != user_id:
                raise AuthorizationError("Access denied: You don't have permission to chat with this document")
            
            document_text = document.get("documentText", "")
            if not document_text:
                raise ValidationError("Document has no text content")
            
            # Retrieve conversation history
            history = await self.chat_repo.get_conversation_history(document_id, limit=10)
            conversation_context = self._format_conversation_history(history)
            
            # Prepare chat history with system and user prompts
            chat_history = ChatHistory()
            chat_history.add_system_message(self.plugin.get_system_prompt())
            chat_history.add_user_message(
                self.plugin.get_user_prompt(document_text, question, conversation_context)
            )
            
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
            
            answer = response_data.get("answer", "")
            clause_references = response_data.get("clause_references", [])
            
            # Save conversation
            await self.chat_repo.save_conversation(
                document_id=document_id,
                question=question,
                answer=answer,
                clause_references=clause_references
            )
            
            duration = time.time() - start_time
            logger.info(f"Chat request completed in {duration:.2f} seconds")
            
            return ChatResponse(
                answer=answer,
                document_id=document_id,
                question=question,
                clause_references=clause_references
            )
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {str(e)}")
            raise AIServiceError("AI returned invalid JSON response")
        
        except (ValidationError, NotFoundError):
            raise
        
        except Exception as e:
            logger.error(f"Chat request failed: {str(e)}", exc_info=True)
            # Check for Azure-specific errors
            error_msg = str(e)
            if "BadRequest" in error_msg or "API version" in error_msg:
                raise AIServiceError(f"Azure AI Foundry error: {error_msg}")
            raise AIServiceError(f"Failed to process chat request: {str(e)}")
    
    def _format_conversation_history(self, history: list) -> str:
        """Format conversation history for context"""
        if not history:
            return "No previous conversation."
        
        formatted = []
        for msg in history[-5:]:  # Last 5 messages for context
            formatted.append(f"Q: {msg.get('question', '')}")
            formatted.append(f"A: {msg.get('answer', '')}")
        
        return "\n".join(formatted)
    
    async def get_conversation_history(self, document_id: str, user_id: str) -> ConversationHistory:
        """
        Get conversation history for a document.
        
        Args:
            document_id: Document ID
            user_id: User ID
            
        Returns:
            ConversationHistory with all messages
        """
        document = await self.document_repo.get_document_by_id(document_id, include_text=False)
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")

        if document.get("userId") != user_id:
            raise AuthorizationError("Access denied: You don't have permission to chat with this document")

        messages = await self.chat_repo.get_conversation_history(document_id)
        
        conversation_messages = [
            ConversationMessage(
                question=msg.get("question", ""),
                answer=msg.get("answer", ""),
                timestamp=msg.get("createdAt"),
                clause_references=msg.get("clauseReferences", [])
            )
            for msg in messages
        ]
        
        return ConversationHistory(
            document_id=document_id,
            messages=conversation_messages,
            total_messages=len(conversation_messages)
        )
