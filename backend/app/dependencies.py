"""Reusable FastAPI dependencies for dependency injection"""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorDatabase
from semantic_kernel import Kernel
from azure.ai.inference import ChatCompletionsClient
from app.config import get_settings
from app.config.settings import Settings
from app.database import get_database
from app.services.semantic_kernel import get_kernel
from app.services.foundry import get_foundry_client
from app.utils.jwt import decode_access_token
from app.utils.exceptions import AuthenticationError
from app.utils.logger import get_logger

logger = get_logger(__name__)

# HTTP Bearer security scheme
security = HTTPBearer()


async def get_settings_dependency() -> Settings:
    """Dependency for injecting application settings"""
    return get_settings()


async def get_database_dependency() -> AsyncIOMotorDatabase:
    """Dependency for injecting MongoDB database"""
    return await get_database()


def get_kernel_dependency() -> Kernel:
    """Dependency for injecting Semantic Kernel"""
    return get_kernel()


def get_foundry_client_dependency() -> ChatCompletionsClient:
    """Dependency for injecting Microsoft AI Foundry client"""
    return get_foundry_client()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
) -> dict:
    """
    Dependency for getting the current authenticated user.
    
    Args:
        credentials: HTTP authorization credentials
        db: MongoDB database instance
        
    Returns:
        Current user data
        
    Raises:
        HTTPException: If authentication fails
    """
    try:
        # Decode JWT token
        token = credentials.credentials
        payload = decode_access_token(token)
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise AuthenticationError("Invalid token payload")
        
        # Get user from database
        from app.database.repositories.user_repository import UserRepository
        user_repo = UserRepository(db)
        user = await user_repo.get_user_by_id(user_id)
        
        if user is None:
            raise AuthenticationError("User not found")
        
        return user
        
    except AuthenticationError as e:
        logger.warning(f"Authentication failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
