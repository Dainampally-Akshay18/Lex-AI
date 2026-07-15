"""Chat models"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional


class ChatRequest(BaseModel):
    """Chat request model"""
    document_id: str = Field(..., description="Document ID to chat about")
    question: str = Field(..., min_length=1, description="User's question")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "507f1f77bcf86cd799439011",
                "question": "Who is the tenant in this lease agreement?"
            }
        }


class ChatResponse(BaseModel):
    """Chat response model"""
    answer: str = Field(..., description="AI-generated answer")
    document_id: str = Field(..., description="Document ID")
    question: str = Field(..., description="User's question")
    clause_references: List[str] = Field(default_factory=list, description="Referenced clauses")
    
    class Config:
        json_schema_extra = {
            "example": {
                "answer": "The tenant is ABC Technologies Pvt Ltd.",
                "document_id": "507f1f77bcf86cd799439011",
                "question": "Who is the tenant?",
                "clause_references": ["Section 1.2: Tenant Information"]
            }
        }


class ConversationMessage(BaseModel):
    """Single conversation message"""
    question: str = Field(..., description="User question")
    answer: str = Field(..., description="AI answer")
    timestamp: datetime = Field(..., description="Message timestamp")
    clause_references: List[str] = Field(default_factory=list, description="Referenced clauses")


class ConversationHistory(BaseModel):
    """Conversation history response"""
    document_id: str = Field(..., description="Document ID")
    messages: List[ConversationMessage] = Field(..., description="Conversation messages")
    total_messages: int = Field(..., description="Total number of messages")
