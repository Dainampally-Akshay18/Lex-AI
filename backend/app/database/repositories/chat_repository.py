"""Chat repository for MongoDB operations"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from datetime import datetime
from bson import ObjectId
from app.utils.exceptions import DatabaseError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class ChatRepository:
    """Repository for chat database operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize chat repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.chats
    
    async def save_conversation(
        self,
        document_id: str,
        question: str,
        answer: str,
        clause_references: List[str] = None
    ) -> str:
        """
        Save a conversation message to MongoDB.
        
        Args:
            document_id: Document ID
            question: User's question
            answer: AI's answer
            clause_references: Referenced clauses
            
        Returns:
            Created chat message ID
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            chat_dict = {
                "documentId": document_id,
                "question": question,
                "answer": answer,
                "clauseReferences": clause_references or [],
                "createdAt": datetime.utcnow()
            }
            
            result = await self.collection.insert_one(chat_dict)
            chat_id = str(result.inserted_id)
            
            logger.info(f"Chat message saved with ID: {chat_id}")
            return chat_id
            
        except Exception as e:
            logger.error(f"Failed to save conversation: {str(e)}")
            raise DatabaseError(f"Failed to save conversation: {str(e)}")
    
    async def get_conversation_history(
        self,
        document_id: str,
        limit: int = 50
    ) -> List[dict]:
        """
        Get conversation history for a document.
        
        Args:
            document_id: Document ID
            limit: Maximum number of messages to return
            
        Returns:
            List of conversation messages
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            cursor = self.collection.find(
                {"documentId": document_id}
            ).sort("createdAt", 1).limit(limit)
            
            messages = await cursor.to_list(length=limit)
            
            # Convert ObjectId to string
            for msg in messages:
                msg["_id"] = str(msg["_id"])
            
            return messages
            
        except Exception as e:
            logger.error(f"Failed to get conversation history: {str(e)}")
            raise DatabaseError(f"Failed to get conversation history: {str(e)}")
