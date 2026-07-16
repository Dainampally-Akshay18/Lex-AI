"""Document management service"""
import os
import uuid
from pathlib import Path
from fastapi import UploadFile
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from app.models.document import (
    DocumentCreate,
    DocumentResponse,
    DocumentWithText,
    DocumentListResponse,
    UploadResponse,
    DeleteResponse
)
from app.database.repositories import DocumentRepository
from app.services.pdf_processor import extract_text_from_pdf, extract_text_from_docx
from app.config import get_settings
from app.utils.exceptions import ValidationError, NotFoundError, AuthorizationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class DocumentService:
    """Service for document upload, extraction, storage, and management"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize document service.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.repository = DocumentRepository(db)
        self.settings = get_settings()
        
        # Ensure upload directory exists
        self.upload_dir = Path(self.settings.UPLOAD_DIRECTORY)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
    
    def _validate_file(self, file: UploadFile) -> str:
        """
        Validate uploaded file.
        
        Args:
            file: Uploaded file
            
        Returns:
            File type (pdf or docx)
            
        Raises:
            ValidationError: If validation fails
        """
        # Check if file exists
        if not file:
            raise ValidationError("No file provided")
        
        # Check if filename exists
        if not file.filename:
            raise ValidationError("Filename is missing")
        
        # Get file extension
        file_extension = Path(file.filename).suffix.lower().lstrip(".")
        
        # Validate extension
        if file_extension not in self.settings.supported_file_types_list:
            raise ValidationError(
                f"Unsupported file type: {file_extension}. "
                f"Supported types: {', '.join(self.settings.supported_file_types_list)}"
            )
        
        # Validate MIME type
        valid_mime_types = {
            "pdf": ["application/pdf"],
            "docx": [
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "application/octet-stream"  # Some browsers send this for docx
            ]
        }
        
        if file.content_type not in valid_mime_types.get(file_extension, []):
            logger.warning(f"MIME type mismatch: {file.content_type} for {file_extension}")
        
        return file_extension
    
    async def _save_file(self, file: UploadFile, file_type: str) -> tuple[str, int]:
        """
        Save uploaded file to disk.
        
        Args:
            file: Uploaded file
            file_type: File type (pdf or docx)
            
        Returns:
            Tuple of (stored filename, file size in bytes)
            
        Raises:
            ValidationError: If file save fails
        """
        try:
            # Generate unique filename
            unique_filename = f"{uuid.uuid4()}.{file_type}"
            file_path = self.upload_dir / unique_filename
            
            # Read file content
            content = await file.read()
            file_size = len(content)
            
            # Validate file size
            max_size_bytes = self.settings.MAX_FILE_SIZE_MB * 1024 * 1024
            if file_size > max_size_bytes:
                raise ValidationError(
                    f"File size ({file_size / 1024 / 1024:.2f} MB) exceeds "
                    f"maximum allowed size ({self.settings.MAX_FILE_SIZE_MB} MB)"
                )
            
            # Check for empty file
            if file_size == 0:
                raise ValidationError("File is empty")
            
            # Save file
            with open(file_path, "wb") as f:
                f.write(content)
            
            logger.info(f"File saved: {unique_filename} ({file_size} bytes)")
            return unique_filename, file_size
            
        except ValidationError:
            raise
        
        except Exception as e:
            logger.error(f"Failed to save file: {str(e)}")
            raise ValidationError(f"Failed to save file: {str(e)}")
    
    def _extract_text(self, stored_filename: str, file_type: str) -> str:
        """
        Extract text from uploaded file.
        
        Args:
            stored_filename: Stored filename on disk
            file_type: File type (pdf or docx)
            
        Returns:
            Extracted text content
            
        Raises:
            ValidationError: If extraction fails
        """
        file_path = str(self.upload_dir / stored_filename)
        
        if file_type == "pdf":
            return extract_text_from_pdf(file_path)
        elif file_type == "docx":
            return extract_text_from_docx(file_path)
        else:
            raise ValidationError(f"Unsupported file type for extraction: {file_type}")
    
    async def upload_document(
        self,
        file: UploadFile,
        user_id: str = None
    ) -> UploadResponse:
        """
        Upload, extract, and store a legal document.
        
        Args:
            file: Uploaded file
            user_id: User ID (placeholder for future auth)
            
        Returns:
            UploadResponse with document details
            
        Raises:
            ValidationError: If validation or processing fails
        """
        logger.info(f"Upload started: {file.filename}")
        stored_filename = None
        
        try:
            # Validate file
            file_type = self._validate_file(file)
            
            # Save file to disk
            stored_filename, file_size = await self._save_file(file, file_type)
            
            # Extract text
            document_text = self._extract_text(stored_filename, file_type)
            logger.info(f"Text extraction completed: {len(document_text)} characters")
            
            # Create document record
            document_create = DocumentCreate(
                fileName=file.filename,
                storedFileName=stored_filename,
                fileType=file_type,
                fileSize=file_size,
                documentText=document_text,
                userId=user_id
            )
            
            # Store in database
            document_id = await self.repository.create_document(document_create)
            logger.info(f"Document stored in database: {document_id}")
            
            # Trigger analysis generation in background
            try:
                from app.services.analysis_service import AnalysisService
                from app.services.semantic_kernel import get_kernel
                
                analysis_service = AnalysisService(get_kernel(), self.db)
                await analysis_service.generate_analysis(document_id, user_id)
                logger.info(f"Analysis generation triggered for document: {document_id}")
            except Exception as e:
                logger.error(f"Failed to trigger analysis generation: {str(e)}")
                # Don't fail the upload if analysis trigger fails
            
            # Return response
            return UploadResponse(
                message="Document uploaded successfully",
                document_id=document_id,
                fileName=file.filename,
                fileSize=file_size,
                text_length=len(document_text)
            )
            
        except Exception as e:
            # Clean up file if database operation failed
            if stored_filename:
                try:
                    file_path = self.upload_dir / stored_filename
                    if file_path.exists():
                        os.remove(file_path)
                        logger.info(f"Cleaned up file after error: {stored_filename}")
                except Exception as cleanup_error:
                    logger.error(f"Failed to cleanup file: {str(cleanup_error)}")
            
            raise
    
    async def get_document(self, document_id: str, include_text: bool = False):
        """
        Get a document by ID.
        
        Args:
            document_id: Document ID
            include_text: Whether to include extracted text
            
        Returns:
            DocumentResponse or DocumentWithText
            
        Raises:
            NotFoundError: If document not found
        """
        document = await self.repository.get_document_by_id(document_id, include_text)
        
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")
        
        if include_text:
            return DocumentWithText(**document)
        else:
            return DocumentResponse(**document)
    
    async def list_documents(
        self,
        limit: int = 100,
        skip: int = 0
    ) -> DocumentListResponse:
        """
        List all documents with pagination.
        
        Args:
            limit: Maximum number of documents to return
            skip: Number of documents to skip
            
        Returns:
            DocumentListResponse with documents list
        """
        documents, total = await self.repository.list_documents(limit, skip)
        
        document_responses = [DocumentResponse(**doc) for doc in documents]
        
        return DocumentListResponse(
            documents=document_responses,
            total=total
        )
    
    async def delete_document(self, document_id: str) -> DeleteResponse:
        """
        Delete a document by ID.
        
        Args:
            document_id: Document ID
            
        Returns:
            DeleteResponse
            
        Raises:
            NotFoundError: If document not found
        """
        logger.info(f"Deleting document: {document_id}")
        
        # Get document to retrieve stored filename
        document = await self.repository.get_document_by_id(document_id, include_text=False)
        
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")
        
        # Delete from database
        await self.repository.delete_document(document_id)
        logger.info(f"Document deleted from database: {document_id}")
        
        # Delete file from disk
        try:
            stored_filename = document.get("storedFileName")
            if stored_filename:
                file_path = self.upload_dir / stored_filename
                if file_path.exists():
                    os.remove(file_path)
                    logger.info(f"File deleted from disk: {stored_filename}")
        except Exception as e:
            logger.error(f"Failed to delete file from disk: {str(e)}")
            # Continue even if file deletion fails
        
        return DeleteResponse(
            message="Document deleted successfully",
            document_id=document_id
        )

    async def list_user_documents(
        self,
        user_id: str,
        limit: int = 100,
        skip: int = 0
    ) -> DocumentListResponse:
        """
        List all documents for a specific user with pagination.
        
        Args:
            user_id: User ID to filter documents
            limit: Maximum number of documents to return
            skip: Number of documents to skip
            
        Returns:
            DocumentListResponse with user's documents list
        """
        documents, total = await self.repository.list_user_documents(user_id, limit, skip)
        
        document_responses = [DocumentResponse(**doc) for doc in documents]
        
        return DocumentListResponse(
            documents=document_responses,
            total=total
        )
    
    async def get_user_document(
        self,
        document_id: str,
        user_id: str,
        include_text: bool = False
    ):
        """
        Get a document by ID with ownership verification.
        
        Args:
            document_id: Document ID
            user_id: User ID to verify ownership
            include_text: Whether to include extracted text
            
        Returns:
            DocumentResponse or DocumentWithText
            
        Raises:
            NotFoundError: If document not found
            AuthorizationError: If user doesn't own the document
        """
        document = await self.repository.get_document_by_id(document_id, include_text)
        
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")
        
        # Verify ownership
        if document.get("userId") != user_id:
            raise AuthorizationError("Access denied: You don't have permission to access this document")
        
        if include_text:
            return DocumentWithText(**document)
        else:
            return DocumentResponse(**document)
    
    async def delete_user_document(self, document_id: str, user_id: str) -> DeleteResponse:
        """
        Delete a document by ID with ownership verification.
        
        Args:
            document_id: Document ID
            user_id: User ID to verify ownership
            
        Returns:
            DeleteResponse
            
        Raises:
            NotFoundError: If document not found
            AuthorizationError: If user doesn't own the document
        """
        logger.info(f"Deleting document: {document_id} for user: {user_id}")
        
        # Get document to retrieve stored filename and verify ownership
        document = await self.repository.get_document_by_id(document_id, include_text=False)
        
        if not document:
            raise NotFoundError(f"Document not found: {document_id}")
        
        # Verify ownership
        if document.get("userId") != user_id:
            raise AuthorizationError("Access denied: You don't have permission to delete this document")
        
        # Delete from database
        await self.repository.delete_document(document_id)
        logger.info(f"Document deleted from database: {document_id}")
        
        # Delete file from disk
        try:
            stored_filename = document.get("storedFileName")
            if stored_filename:
                file_path = self.upload_dir / stored_filename
                if file_path.exists():
                    os.remove(file_path)
                    logger.info(f"File deleted from disk: {stored_filename}")
        except Exception as e:
            logger.error(f"Failed to delete file from disk: {str(e)}")
            # Continue even if file deletion fails
        
        return DeleteResponse(
            message="Document deleted successfully",
            document_id=document_id
        )
