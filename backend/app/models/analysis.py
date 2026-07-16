"""Analysis models"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from enum import Enum


class AnalysisStatus(str, Enum):
    """Analysis processing status"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class AnalysisCreate(BaseModel):
    """Analysis creation model"""
    document_id: str
    user_id: str
    status: AnalysisStatus = AnalysisStatus.PENDING


class AnalysisResponse(BaseModel):
    """Analysis response model"""
    id: str = Field(..., alias="_id", description="Analysis ID")
    document_id: str = Field(..., description="Document ID")
    user_id: str = Field(..., description="User ID")
    status: AnalysisStatus = Field(..., description="Analysis status")
    summary: Optional[dict] = Field(None, description="Cached summary")
    risk_analysis: Optional[dict] = Field(None, description="Cached risk analysis")
    financial_terms: Optional[dict] = Field(None, description="Cached financial terms")
    generated_at: Optional[datetime] = Field(None, description="Generation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    model_name: Optional[str] = Field(None, description="AI model name")
    model_version: Optional[str] = Field(None, description="AI model version")
    error_message: Optional[str] = Field(None, description="Error message if failed")
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "_id": "507f1f77bcf86cd799439011",
                "document_id": "507f1f77bcf86cd799439012",
                "user_id": "507f1f77bcf86cd799439013",
                "status": "completed",
                "summary": {},
                "risk_analysis": {},
                "financial_terms": {},
                "generated_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "model_name": "gpt-4",
                "model_version": "2024-01-01"
            }
        }
