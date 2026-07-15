"""Chat API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.chat import ChatRequest, ChatResponse, ConversationHistory
from app.services.chat_service import ChatService
from app.dependencies import get_kernel_dependency, get_database_dependency
from app.utils.logger import get_logger

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = get_logger(__name__)


@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
):
    """
    Ask a question about a legal document.
    
    This endpoint provides context-aware chat functionality:
    - Retrieves the uploaded document text
    - Maintains conversation history
    - Answers questions based only on document content
    - Provides clause references when applicable
    - Prevents hallucinations by restricting to document scope
    
    Args:
        request: Chat request with document_id and question
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        
    Returns:
        ChatResponse with answer and clause references
    """
    logger.info(f"Received chat request for document: {request.document_id}")
    
    # Create service instance
    chat_service = ChatService(kernel, db)
    
    # Process question
    result = await chat_service.ask_question(request.document_id, request.question)
    
    logger.info("Chat request completed successfully")
    return result


@router.get("/history/{document_id}", response_model=ConversationHistory)
async def get_conversation_history(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
):
    """
    Get conversation history for a document.
    
    Args:
        document_id: Document ID
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        
    Returns:
        ConversationHistory with all messages
    """
    logger.info(f"Retrieving conversation history for document: {document_id}")
    
    # Create service instance
    chat_service = ChatService(kernel, db)
    
    # Get history
    result = await chat_service.get_conversation_history(document_id)
    
    logger.info(f"Retrieved {result.total_messages} messages")
    return result
