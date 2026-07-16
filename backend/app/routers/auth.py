"""Authentication API endpoints"""
from fastapi import APIRouter, Depends, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import AuthService
from app.dependencies import get_database_dependency, get_current_user
from app.utils.logger import get_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
):
    """
    Register a new user.
    
    Requirements:
    - Unique email address
    - Valid email format
    - Password minimum 8 characters
    
    Args:
        user_data: User registration data
        db: MongoDB database (injected)
        
    Returns:
        UserResponse with created user details (without password)
    """
    logger.info("Received user registration request")
    
    # Create service instance
    auth_service = AuthService(db)
    
    # Register user
    result = await auth_service.register(user_data)
    
    logger.info("User registration completed successfully")
    return result


@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_database_dependency)
):
    """
    Authenticate user and get access token.
    
    Args:
        credentials: User login credentials
        db: MongoDB database (injected)
        
    Returns:
        TokenResponse with JWT access token
    """
    logger.info("Received login request")
    
    # Create service instance
    auth_service = AuthService(db)
    
    # Authenticate and get token
    result = await auth_service.login(credentials)
    
    logger.info("Login completed successfully")
    return result


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header.
    
    Args:
        current_user: Current authenticated user (injected)
        
    Returns:
        UserResponse with user details
    """
    return UserResponse(**current_user)
