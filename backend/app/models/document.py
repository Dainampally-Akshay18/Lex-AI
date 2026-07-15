"""Document models"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId


class PyObjectId(ObjectId):
    """Custom ObjectId type for Pydantic"""
    @classmethod
    def __get_validators__(cls):
        yield cls.validate
    
    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return ObjectId(v)
    
    @classmethod
    def __get_pydantic_json_schema__(cls, field_schema):
        field_schema.update(type="string")


class DocumentBase(BaseModel):
    """Base document model"""
    fileName: str = Field(..., description="Original filename")
    fileType: str = Field(..., description="File type (pdf, docx)")
    language: str = Field(default="english", description="Document language")


class DocumentCreate(DocumentBase):
    """Document creation model"""
    storedFileName: str = Field(..., description="Stored filename on disk")
    fileSize: int = Field(..., description="File size in bytes")
    documentText: str = Field(..., description="Extracted document text")
    userId: Optional[str] = Field(None, description="User ID (placeholder for future auth)")


class DocumentResponse(BaseModel):
    """Document response model"""
    id: str = Field(..., alias="_id", description="Document ID")
    fileName: str = Field(..., description="Original filename")
    storedFileName: str = Field(..., description="Stored filename")
    fileType: str = Field(..., description="File type")
    fileSize: int = Field(..., description="File size in bytes")
    uploadedAt: datetime = Field(..., description="Upload timestamp")
    language: str = Field(..., description="Document language")
    userId: Optional[str] = Field(None, description="User ID")
    
    class Config:
        populate_by_name = True
        json_encoders = {ObjectId: str}


class DocumentWithText(DocumentResponse):
    """Document response including extracted text"""
    documentText: str = Field(..., description="Extracted document text")


class DocumentListResponse(BaseModel):
    """Document list response"""
    documents: list[DocumentResponse] = Field(..., description="List of documents")
    total: int = Field(..., description="Total number of documents")


class UploadResponse(BaseModel):
    """Upload response model"""
    message: str = Field(..., description="Success message")
    document_id: str = Field(..., description="Created document ID")
    fileName: str = Field(..., description="Original filename")
    fileSize: int = Field(..., description="File size in bytes")
    text_length: int = Field(..., description="Length of extracted text")


class DeleteResponse(BaseModel):
    """Delete response model"""
    message: str = Field(..., description="Success message")
    document_id: str = Field(..., description="Deleted document ID")
