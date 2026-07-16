"""Chat API endpoints"""
from fastapi import APIRouter, Depends
from semantic_kernel import Kernel
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.chat import ChatRequest, ChatResponse, ConversationHistory
from app.services.chat_service import ChatService
from app.dependencies import get_kernel_dependency, get_database_dependency, get_current_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/chat", tags=["Chat"])
logger = get_logger(__name__)


@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Ask a question about a legal document.
    
    Requires authentication. Only allows access to documents owned by the authenticated user.
    
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
        current_user: Authenticated user (injected)
        
    Returns:
        ChatResponse with answer and clause references
    """
    logger.info(f"Received chat request for document: {request.document_id} from user: {current_user['_id']}")
    
    # Create service instance
    chat_service = ChatService(kernel, db)
    
    # Process question with ownership check
    result = await chat_service.ask_question(request.document_id, request.question, current_user["_id"])
    
    logger.info("Chat request completed successfully")
    return result


@router.get("/history/{document_id}", response_model=ConversationHistory)
async def get_conversation_history(
    document_id: str,
    kernel: Kernel = Depends(get_kernel_dependency),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Get conversation history for a document.
    
    Requires authentication. Only allows access to documents owned by the authenticated user.
    
    Args:
        document_id: Document ID
        kernel: Semantic Kernel instance (injected)
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        ConversationHistory with all messages
    """
    logger.info(f"Retrieving conversation history for document: {document_id} from user: {current_user['_id']}")
    
    # Create service instance
    chat_service = ChatService(kernel, db)
    
    # Get history with ownership check
    result = await chat_service.get_conversation_history(document_id, current_user["_id"])
    
    logger.info(f"Retrieved {result.total_messages} messages")
    return result
