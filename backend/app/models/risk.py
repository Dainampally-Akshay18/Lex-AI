"""Risk analysis response models"""
from pydantic import BaseModel, Field
from typing import List, Dict
from enum import Enum


class RiskLevel(str, Enum):
    """Risk level enumeration"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class RiskCategory(BaseModel):
    """Individual risk category details"""
    category: str = Field(..., description="Risk category name")
    level: RiskLevel = Field(..., description="Risk severity level")
    score: float = Field(..., ge=0.0, le=10.0, description="Risk score from 0-10")
    description: str = Field(..., description="Detailed risk description")
    recommendation: str = Field(..., description="Mitigation recommendation")


class RiskResponse(BaseModel):
    """Risk analysis response"""
    overall_risk_score: float = Field(..., ge=0.0, le=10.0, description="Overall risk score from 0-10")
    overall_risk_level: RiskLevel = Field(..., description="Overall risk severity level")
    risk_breakdown: List[RiskCategory] = Field(..., description="Individual risk categories")
    summary: str = Field(..., description="Executive risk summary")
    recommendations: List[str] = Field(default_factory=list, description="Key recommendations")
    
    class Config:
        json_schema_extra = {
            "example": {
                "overall_risk_score": 6.5,
                "overall_risk_level": "medium",
                "risk_breakdown": [
                    {
                        "category": "Payment Risk",
                        "level": "high",
                        "score": 7.5,
                        "description": "Payment terms are ambiguous",
                        "recommendation": "Clarify payment schedule and penalties"
                    }
                ],
                "summary": "The document presents moderate risk...",
                "recommendations": ["Review payment terms", "Add termination safeguards"]
            }
        }
