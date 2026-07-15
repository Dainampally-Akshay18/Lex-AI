"""Financial extraction models"""
from pydantic import BaseModel, Field
from typing import List, Optional


class FinancialTerm(BaseModel):
    """Individual financial term"""
    term_type: str = Field(..., description="Type of financial term")
    value: str = Field(..., description="Extracted value")
    description: Optional[str] = Field(None, description="Additional context")
    
    class Config:
        json_schema_extra = {
            "example": {
                "term_type": "Payment Amount",
                "value": "$10,000 per month",
                "description": "Monthly rent payment"
            }
        }


class FinancialExtractionResponse(BaseModel):
    """Financial extraction response"""
    document_id: str = Field(..., description="Document ID")
    payment_amount: Optional[str] = Field(None, description="Payment amount")
    currency: Optional[str] = Field(None, description="Currency")
    taxes: Optional[str] = Field(None, description="Tax information")
    interest: Optional[str] = Field(None, description="Interest terms")
    due_dates: List[str] = Field(default_factory=list, description="Payment due dates")
    penalties: List[str] = Field(default_factory=list, description="Penalty terms")
    security_deposit: Optional[str] = Field(None, description="Security deposit")
    contract_value: Optional[str] = Field(None, description="Total contract value")
    financial_terms: List[FinancialTerm] = Field(default_factory=list, description="All financial terms")
    
    class Config:
        json_schema_extra = {
            "example": {
                "document_id": "507f1f77bcf86cd799439011",
                "payment_amount": "$10,000",
                "currency": "USD",
                "taxes": "Applicable sales tax to be paid by tenant",
                "interest": "2% per month on late payments",
                "due_dates": ["1st of each month"],
                "penalties": ["$500 late fee after 5 days"],
                "security_deposit": "$20,000",
                "contract_value": "$120,000 per year",
                "financial_terms": []
            }
        }
