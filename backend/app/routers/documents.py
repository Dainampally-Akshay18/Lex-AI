"""Document management API endpoints"""
from fastapi import APIRouter, Depends, UploadFile, File, Query
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Union
from app.models.document import (
    DocumentResponse,
    DocumentWithText,
    DocumentListResponse,
    UploadResponse,
    DeleteResponse
)
from app.services.document_service import DocumentService
from app.dependencies import get_database_dependency, get_current_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/documents", tags=["Documents"])
logger = get_logger(__name__)


@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    file: UploadFile = File(..., description="Legal document file (PDF or DOCX)"),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Upload a legal document for analysis.
    
    Requires authentication. Document will be associated with the authenticated user.
    
    This endpoint:
    1. Validates the uploaded file (type, size, format)
    2. Saves the file to disk
    3. Extracts text content using PyMuPDF (PDF) or python-docx (DOCX)
    4. Stores document metadata and extracted text in MongoDB
    
    Supported formats: PDF, DOCX
    Maximum file size: 25 MB (configurable)
    
    The extracted text will be used by AI features (summary, risk analysis, chat, etc.)
    
    Args:
        file: Uploaded file
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        UploadResponse with document ID and details
    """
    logger.info(f"Received upload request: {file.filename} for user: {current_user['_id']}")
    
    # Create service instance
    document_service = DocumentService(db)
    
    # Upload and process document with user_id
    result = await document_service.upload_document(file, user_id=current_user["_id"])
    
    logger.info(f"Upload completed successfully: {result.document_id}")
    return result


@router.get("/", response_model=DocumentListResponse)
async def list_documents(
    limit: int = Query(100, ge=1, le=500, description="Maximum number of documents to return"),
    skip: int = Query(0, ge=0, description="Number of documents to skip"),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    List all uploaded documents for the authenticated user with pagination.
    
    Requires authentication. Only returns documents owned by the authenticated user.
    
    Returns document metadata without the extracted text content.
    
    Args:
        limit: Maximum number of documents (1-500)
        skip: Pagination offset
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        DocumentListResponse with documents list and total count
    """
    logger.info(f"Received list documents request (limit={limit}, skip={skip}) for user: {current_user['_id']}")
    
    # Create service instance
    document_service = DocumentService(db)
    
    # List user's documents
    result = await document_service.list_user_documents(current_user["_id"], limit, skip)
    
    logger.info(f"Returning {len(result.documents)} documents (total: {result.total})")
    return result


@router.get("/{document_id}", response_model=Union[DocumentWithText, DocumentResponse])
async def get_document(
    document_id: str,
    include_text: bool = Query(True, description="Include extracted document text"),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Get a specific document by ID.
    
    Requires authentication. Only allows access to documents owned by the authenticated user.
    
    Args:
        document_id: Document ID
        include_text: Whether to include extracted text (default: True)
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        DocumentWithText including metadata and extracted text
    """
    logger.info(f"Received get document request: {document_id} for user: {current_user['_id']}")
    
    # Create service instance
    document_service = DocumentService(db)
    
    # Get document with ownership check
    result = await document_service.get_user_document(document_id, current_user["_id"], include_text)
    
    logger.info(f"Returning document: {document_id}")
    return result


@router.delete("/{document_id}", response_model=DeleteResponse)
async def delete_document(
    document_id: str,
    db: AsyncIOMotorDatabase = Depends(get_database_dependency),
    current_user: dict = Depends(get_current_user)
):
    """
    Delete a document by ID.
    
    Requires authentication. Only allows deletion of documents owned by the authenticated user.
    
    This endpoint:
    1. Verifies document ownership
    2. Deletes the document record from MongoDB
    3. Deletes the physical file from disk
    
    Args:
        document_id: Document ID to delete
        db: MongoDB database (injected)
        current_user: Authenticated user (injected)
        
    Returns:
        DeleteResponse with success message
    """
    logger.info(f"Received delete request: {document_id} for user: {current_user['_id']}")
    
    # Create service instance
    document_service = DocumentService(db)
    
    # Delete document with ownership check
    result = await document_service.delete_user_document(document_id, current_user["_id"])
    
    logger.info(f"Delete completed: {document_id}")
    return result
