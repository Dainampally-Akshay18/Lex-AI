"""Global exception handler middleware"""
from fastapi import Request, status
from fastapi.responses import JSONResponse
from app.utils.exceptions import LexAIException
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def lexai_exception_handler(request: Request, exc: LexAIException):
    """Handle LexAI custom exceptions"""
    logger.error(f"LexAI Exception: {exc.message}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.__class__.__name__,
            "message": exc.message,
            "status_code": exc.status_code
        }
    )


async def global_exception_handler(request: Request, exc: Exception):
    """Handle unexpected exceptions"""
    logger.error(f"Unexpected exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "InternalServerError",
            "message": "An unexpected error occurred",
            "status_code": 500
        }
    )
