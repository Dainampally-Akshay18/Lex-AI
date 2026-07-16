"""Analysis repository for MongoDB operations"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.models.analysis import AnalysisStatus
from app.utils.exceptions import DatabaseError, NotFoundError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AnalysisRepository:
    """Repository for analysis database operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize analysis repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.analyses
    
    async def create_analysis(self, document_id: str, user_id: str) -> str:
        """
        Create a new analysis record.
        
        Args:
            document_id: Document ID
            user_id: User ID
            
        Returns:
            Created analysis ID
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            analysis_dict = {
                "documentId": document_id,
                "userId": user_id,
                "status": AnalysisStatus.PENDING.value,
                "summary": None,
                "riskAnalysis": None,
                "financialTerms": None,
                "generatedAt": None,
                "updatedAt": datetime.utcnow(),
                "modelName": None,
                "modelVersion": None,
                "errorMessage": None
            }
            
            result = await self.collection.insert_one(analysis_dict)
            analysis_id = str(result.inserted_id)
            
            logger.info(f"Analysis created with ID: {analysis_id}")
            return analysis_id
            
        except Exception as e:
            logger.error(f"Failed to create analysis: {str(e)}")
            raise DatabaseError(f"Failed to create analysis: {str(e)}")
    
    async def get_analysis_by_document_id(self, document_id: str) -> Optional[dict]:
        """
        Get analysis by document ID.
        
        Args:
            document_id: Document ID
            
        Returns:
            Analysis data or None if not found
        """
        try:
            analysis = await self.collection.find_one({"documentId": document_id})
            
            if analysis:
                analysis["_id"] = str(analysis["_id"])
            
            return analysis
            
        except Exception as e:
            logger.error(f"Failed to get analysis: {str(e)}")
            raise DatabaseError(f"Failed to get analysis: {str(e)}")
    
    async def update_status(self, analysis_id: str, status: AnalysisStatus, error_message: Optional[str] = None):
        """
        Update analysis status.
        
        Args:
            analysis_id: Analysis ID
            status: New status
            error_message: Error message if failed
        """
        try:
            if not ObjectId.is_valid(analysis_id):
                raise NotFoundError(f"Invalid analysis ID: {analysis_id}")
            
            update_data = {
                "status": status.value,
                "updatedAt": datetime.utcnow()
            }
            
            if error_message:
                update_data["errorMessage"] = error_message
            
            await self.collection.update_one(
                {"_id": ObjectId(analysis_id)},
                {"$set": update_data}
            )
            
            logger.info(f"Analysis status updated: {analysis_id} -> {status.value}")
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to update analysis status: {str(e)}")
            raise DatabaseError(f"Failed to update analysis status: {str(e)}")
    
    async def update_results(
        self,
        analysis_id: str,
        summary: Optional[dict] = None,
        risk_analysis: Optional[dict] = None,
        financial_terms: Optional[dict] = None,
        model_name: Optional[str] = None,
        model_version: Optional[str] = None
    ):
        """
        Update analysis results.
        
        Args:
            analysis_id: Analysis ID
            summary: Summary data
            risk_analysis: Risk analysis data
            financial_terms: Financial terms data
            model_name: AI model name
            model_version: AI model version
        """
        try:
            if not ObjectId.is_valid(analysis_id):
                raise NotFoundError(f"Invalid analysis ID: {analysis_id}")
            
            update_data = {
                "updatedAt": datetime.utcnow(),
                "generatedAt": datetime.utcnow()
            }
            
            if summary is not None:
                update_data["summary"] = summary
            if risk_analysis is not None:
                update_data["riskAnalysis"] = risk_analysis
            if financial_terms is not None:
                update_data["financialTerms"] = financial_terms
            if model_name is not None:
                update_data["modelName"] = model_name
            if model_version is not None:
                update_data["modelVersion"] = model_version
            
            await self.collection.update_one(
                {"_id": ObjectId(analysis_id)},
                {"$set": update_data}
            )
            
            logger.info(f"Analysis results updated: {analysis_id}")
            
        except NotFoundError:
            raise
        except Exception as e:
            logger.error(f"Failed to update analysis results: {str(e)}")
            raise DatabaseError(f"Failed to update analysis results: {str(e)}")
