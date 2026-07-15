"""MongoDB connection and lifecycle management"""
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional
from app.config import get_settings
from app.utils.logger import get_logger

logger = get_logger(__name__)

# Global MongoDB client
_mongodb_client: Optional[AsyncIOMotorClient] = None


async def get_database() -> AsyncIOMotorDatabase:
    """
    Get MongoDB database instance with dependency injection support.
    Creates connection on first call and reuses it.
    """
    global _mongodb_client
    
    if _mongodb_client is None:
        settings = get_settings()
        try:
            _mongodb_client = AsyncIOMotorClient(settings.MONGODB_URI)
            # Verify connection
            await _mongodb_client.admin.command("ping")
            logger.info(f"Connected to MongoDB: {settings.DATABASE_NAME}")
        except Exception as e:
            logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise
    
    settings = get_settings()
    return _mongodb_client[settings.DATABASE_NAME]


async def close_database_connection():
    """Close MongoDB connection gracefully"""
    global _mongodb_client
    
    if _mongodb_client is not None:
        _mongodb_client.close()
        _mongodb_client = None
        logger.info("MongoDB connection closed")
