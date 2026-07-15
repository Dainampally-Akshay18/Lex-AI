"""Document repository for MongoDB operations"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List, Optional
from datetime import datetime
from bson import ObjectId
from app.models.document import DocumentCreate, DocumentResponse, DocumentWithText
from app.utils.exceptions import NotFoundError, DatabaseError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DocumentRepository:
    """Repository for document database operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize document repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.documents
    
    async def create_document(self, document: DocumentCreate) -> str:
        """
        Create a new document record in MongoDB.
        
        Args:
            document: Document data to create
            
        Returns:
            Created document ID as string
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            document_dict = document.model_dump()
            document_dict["uploadedAt"] = datetime.utcnow()
            
            result = await self.collection.insert_one(document_dict)
            document_id = str(result.inserted_id)
            
            logger.info(f"Document created with ID: {document_id}")
            return document_id
            
        except Exception as e:
            logger.error(f"Failed to create document: {str(e)}")
            raise DatabaseError(f"Failed to create document: {str(e)}")
    
    async def get_document_by_id(self, document_id: str, include_text: bool = False) -> Optional[dict]:
        """
        Get a document by ID.
        
        Args:
            document_id: Document ID
            include_text: Whether to include document text in response
            
        Returns:
            Document data or None if not found
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            if not ObjectId.is_valid(document_id):
                raise NotFoundError(f"Document not found: {document_id}")
            
            projection = None if include_text else {"documentText": 0}
            
            document = await self.collection.find_one(
                {"_id": ObjectId(document_id)},
                projection
            )
            
            if document:
                document["_id"] = str(document["_id"])
            
            return document
            
        except NotFoundError:
            raise
        
        except Exception as e:
            logger.error(f"Failed to get document: {str(e)}")
            raise DatabaseError(f"Failed to get document: {str(e)}")
    
    async def list_documents(self, limit: int = 100, skip: int = 0) -> tuple[List[dict], int]:
        """
        List all documents with pagination.
        
        Args:
            limit: Maximum number of documents to return
            skip: Number of documents to skip
            
        Returns:
            Tuple of (documents list, total count)
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            # Get documents without text field
            cursor = self.collection.find(
                {},
                {"documentText": 0}
            ).sort("uploadedAt", -1).skip(skip).limit(limit)
            
            documents = await cursor.to_list(length=limit)
            
            # Convert ObjectId to string
            for doc in documents:
                doc["_id"] = str(doc["_id"])
            
            # Get total count
            total = await self.collection.count_documents({})
            
            return documents, total
            
        except Exception as e:
            logger.error(f"Failed to list documents: {str(e)}")
            raise DatabaseError(f"Failed to list documents: {str(e)}")
    
    async def delete_document(self, document_id: str) -> bool:
        """
        Delete a document by ID.
        
        Args:
            document_id: Document ID to delete
            
        Returns:
            True if deleted, False if not found
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            if not ObjectId.is_valid(document_id):
                raise NotFoundError(f"Document not found: {document_id}")
            
            result = await self.collection.delete_one({"_id": ObjectId(document_id)})
            
            if result.deleted_count == 0:
                raise NotFoundError(f"Document not found: {document_id}")
            
            logger.info(f"Document deleted: {document_id}")
            return True
            
        except NotFoundError:
            raise
        
        except Exception as e:
            logger.error(f"Failed to delete document: {str(e)}")
            raise DatabaseError(f"Failed to delete document: {str(e)}")
