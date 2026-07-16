"""Authentication service"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.models.user import UserCreate, UserLogin, TokenResponse, UserResponse
from app.database.repositories.user_repository import UserRepository
from app.utils.password import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.utils.exceptions import AuthenticationError, ValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class AuthService:
    """Service for authentication operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize auth service.
        
        Args:
            db: MongoDB database instance
        """
        self.user_repo = UserRepository(db)
    
    async def register(self, user_data: UserCreate) -> UserResponse:
        """
        Register a new user.
        
        Args:
            user_data: User registration data
            
        Returns:
            Created user response
            
        Raises:
            ValidationError: If email already exists
        """
        logger.info(f"Registration attempt for email: {user_data.email}")
        
        # Check if email already exists
        if await self.user_repo.email_exists(user_data.email):
            raise ValidationError("Email already registered")
        
        # Hash password
        password_hash = hash_password(user_data.password)
        
        # Create user
        user_id = await self.user_repo.create_user(
            name=user_data.name,
            email=user_data.email,
            password_hash=password_hash
        )
        
        # Retrieve created user
        user = await self.user_repo.get_user_by_id(user_id)
        
        logger.info(f"User registered successfully: {user_id}")
        
        return UserResponse(**user)
    
    async def login(self, credentials: UserLogin) -> TokenResponse:
        """
        Authenticate user and generate access token.
        
        Args:
            credentials: User login credentials
            
        Returns:
            JWT access token
            
        Raises:
            AuthenticationError: If credentials are invalid
        """
        logger.info(f"Login attempt for email: {credentials.email}")
        
        # Get user by email
        user = await self.user_repo.get_user_by_email(credentials.email)
        
        if not user:
            logger.warning(f"Login failed: User not found - {credentials.email}")
            raise AuthenticationError("Invalid email or password")
        
        # Verify password
        if not verify_password(credentials.password, user["passwordHash"]):
            logger.warning(f"Login failed: Invalid password - {credentials.email}")
            raise AuthenticationError("Invalid email or password")
        
        # Create access token
        access_token = create_access_token(
            data={"sub": user["_id"], "email": user["email"]}
        )
        
        logger.info(f"User logged in successfully: {user['_id']}")
        
        return TokenResponse(access_token=access_token)
    
    async def get_user_by_id(self, user_id: str):
        """
        Get user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User response or None if not found
        """
        user = await self.user_repo.get_user_by_id(user_id)
        
        if user:
            return UserResponse(**user)
        
        return None
