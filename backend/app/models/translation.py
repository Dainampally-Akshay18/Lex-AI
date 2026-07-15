"""Translation models"""
from pydantic import BaseModel, Field
from enum import Enum


class LanguageCode(str, Enum):
    """Supported languages"""
    ENGLISH = "english"
    TELUGU = "telugu"
    HINDI = "hindi"
    TAMIL = "tamil"
    KANNADA = "kannada"
    MALAYALAM = "malayalam"


class ContentType(str, Enum):
    """Content types that can be translated"""
    CHAT = "chat"
    SUMMARY = "summary"
    RISK = "risk"
    FINANCIAL = "financial"


class TranslationRequest(BaseModel):
    """Translation request model"""
    document_id: str = Field(..., description="Document ID")
    target_language: LanguageCode = Field(..., description="Target language for translation")
    content_type: ContentType = Field(..., description="Type of content to translate")
    content: str = Field(..., description="Content to translate")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "507f1f77bcf86cd799439011",
                "target_language": "hindi",
                "content_type": "chat",
                "content": "The tenant is ABC Technologies Pvt Ltd."
            }
        }


class TranslationResponse(BaseModel):
    """Translation response model"""
    original_content: str = Field(..., description="Original content")
    translated_content: str = Field(..., description="Translated content")
    source_language: str = Field(default="english", description="Source language")
    target_language: LanguageCode = Field(..., description="Target language")
    content_type: ContentType = Field(..., description="Content type")
    
    class Config:
        json_schema_extra = {
            "example": {
                "original_content": "The tenant is ABC Technologies Pvt Ltd.",
                "translated_content": "किरायेदार ABC Technologies Pvt Ltd है।",
                "source_language": "english",
                "target_language": "hindi",
                "content_type": "chat"
            }
        }
