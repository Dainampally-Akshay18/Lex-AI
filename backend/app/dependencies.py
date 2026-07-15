"""Reusable FastAPI dependencies for dependency injection"""
from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from semantic_kernel import Kernel
from azure.ai.inference import ChatCompletionsClient
from app.config import get_settings
from app.config.settings import Settings
from app.database import get_database
from app.services.semantic_kernel import get_kernel
from app.services.foundry import get_foundry_client


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
