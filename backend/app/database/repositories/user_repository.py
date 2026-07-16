"""User repository for MongoDB operations"""
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import Optional
from datetime import datetime
from bson import ObjectId
from app.utils.exceptions import DatabaseError
from app.utils.logger import get_logger

logger = get_logger(__name__)


class UserRepository:
    """Repository for user database operations"""
    
    def __init__(self, db: AsyncIOMotorDatabase):
        """
        Initialize user repository.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.users
    
    async def create_user(self, name: str, email: str, password_hash: str) -> str:
        """
        Create a new user in MongoDB.
        
        Args:
            name: User's full name
            email: User's email address
            password_hash: Hashed password
            
        Returns:
            Created user ID as string
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            user_dict = {
                "name": name,
                "email": email.lower(),  # Store emails in lowercase
                "passwordHash": password_hash,
                "createdAt": datetime.utcnow()
            }
            
            result = await self.collection.insert_one(user_dict)
            user_id = str(result.inserted_id)
            
            logger.info(f"User created with ID: {user_id}")
            return user_id
            
        except Exception as e:
            logger.error(f"Failed to create user: {str(e)}")
            raise DatabaseError(f"Failed to create user: {str(e)}")
    
    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """
        Get a user by email address.
        
        Args:
            email: User's email address
            
        Returns:
            User data or None if not found
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            user = await self.collection.find_one({"email": email.lower()})
            
            if user:
                user["_id"] = str(user["_id"])
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to get user by email: {str(e)}")
            raise DatabaseError(f"Failed to get user by email: {str(e)}")
    
    async def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """
        Get a user by ID.
        
        Args:
            user_id: User ID
            
        Returns:
            User data or None if not found
            
        Raises:
            DatabaseError: If database operation fails
        """
        try:
            if not ObjectId.is_valid(user_id):
                return None
            
            user = await self.collection.find_one({"_id": ObjectId(user_id)})
            
            if user:
                user["_id"] = str(user["_id"])
            
            return user
            
        except Exception as e:
            logger.error(f"Failed to get user by ID: {str(e)}")
            raise DatabaseError(f"Failed to get user by ID: {str(e)}")
    
    async def email_exists(self, email: str) -> bool:
        """
        Check if an email already exists.
        
        Args:
            email: Email address to check
            
        Returns:
            True if email exists, False otherwise
        """
        try:
            count = await self.collection.count_documents({"email": email.lower()})
            return count > 0
        except Exception as e:
            logger.error(f"Failed to check email existence: {str(e)}")
            raise DatabaseError(f"Failed to check email existence: {str(e)}")
