"""Health check endpoints for infrastructure monitoring"""
from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from semantic_kernel import Kernel
from azure.ai.inference import ChatCompletionsClient
from app.dependencies import (
    get_database_dependency,
    get_kernel_dependency,
    get_foundry_client_dependency
)
from app.utils.logger import get_logger

router = APIRouter(prefix="/health", tags=["Health"])
logger = get_logger(__name__)


@router.get("/")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "service": "LexAI Backend"
    }


@router.get("/database")
async def database_health(db: AsyncIOMotorDatabase = Depends(get_database_dependency)):
    """Check MongoDB connection health"""
    try:
        await db.command("ping")
        return {
            "status": "healthy",
            "service": "MongoDB",
            "message": "Database connection is active"
        }
    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "MongoDB",
            "error": str(e)
        }


@router.get("/kernel")
def kernel_health(kernel: Kernel = Depends(get_kernel_dependency)):
    """Check Semantic Kernel initialization"""
    try:
        services = kernel.services
        return {
            "status": "healthy",
            "service": "Semantic Kernel",
            "message": "Kernel is initialized",
            "services_count": len(services)
        }
    except Exception as e:
        logger.error(f"Kernel health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "Semantic Kernel",
            "error": str(e)
        }


@router.get("/foundry")
def foundry_health(client: ChatCompletionsClient = Depends(get_foundry_client_dependency)):
    """Check Microsoft AI Foundry client initialization"""
    try:
        # Verify client is initialized (no inference performed)
        if client is not None:
            return {
                "status": "healthy",
                "service": "Microsoft AI Foundry",
                "message": "Client is initialized"
            }
        else:
            return {
                "status": "unhealthy",
                "service": "Microsoft AI Foundry",
                "error": "Client not initialized"
            }
    except Exception as e:
        logger.error(f"Foundry health check failed: {str(e)}")
        return {
            "status": "unhealthy",
            "service": "Microsoft AI Foundry",
            "error": str(e)
        }
