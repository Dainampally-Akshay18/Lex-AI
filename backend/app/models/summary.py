"""Summary response models"""
from pydantic import BaseModel, Field
from typing import List


class SummaryResponse(BaseModel):
    """Document summarization response"""
    executive_summary: str = Field(..., description="High-level executive summary")
    quick_summary: str = Field(..., description="Brief overview of the document")
    detailed_summary: str = Field(..., description="Comprehensive detailed summary")
    key_clauses: List[str] = Field(default_factory=list, description="Important clauses in the document")
    rights: List[str] = Field(default_factory=list, description="Rights granted in the document")
    obligations: List[str] = Field(default_factory=list, description="Obligations specified in the document")
    important_dates: List[str] = Field(default_factory=list, description="Key dates mentioned in the document")
    
    class Config:
        json_schema_extra = {
            "example": {
                "executive_summary": "This is a commercial lease agreement between landlord and tenant...",
                "quick_summary": "Lease agreement for office space...",
                "detailed_summary": "This document establishes a lease agreement...",
                "key_clauses": ["Payment terms", "Termination clause", "Maintenance obligations"],
                "rights": ["Right to use premises", "Right to terminate with notice"],
                "obligations": ["Monthly rent payment", "Property maintenance"],
                "important_dates": ["Lease start: January 1, 2024", "Lease end: December 31, 2024"]
            }
        }
