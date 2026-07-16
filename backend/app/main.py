"""FastAPI application entry point"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import get_settings
from app.database import close_database_connection
from app.routers import health, summary, risk, documents, chat, financial, translate, auth
from app.middleware.exception_handler import (
    lexai_exception_handler,
    global_exception_handler
)
from app.utils.exceptions import LexAIException
from app.utils.logger import setup_logging, get_logger

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan management"""
    # Startup
    settings = get_settings()
    logger.info(f"Starting {settings.APP_NAME} in {settings.APP_ENV} mode")
    
    yield
    
    # Shutdown
    logger.info("Shutting down application")
    await close_database_connection()


# Initialize FastAPI application
app = FastAPI(
    title="LexAI",
    description="AI-powered legal document analysis platform",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register exception handlers
app.add_exception_handler(LexAIException, lexai_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Register routers
app.include_router(health.router)
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(summary.router)
app.include_router(risk.router)
app.include_router(chat.router)
app.include_router(financial.router)
app.include_router(translate.router)

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to LexAI API",
        "version": "1.0.0",
        "status": "operational"
    }


if __name__ == "__main__":
    import uvicorn
    
    settings = get_settings()
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.DEBUG
    )
