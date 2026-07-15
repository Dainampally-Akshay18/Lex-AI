"""Structured logging configuration"""
import logging
import sys
from app.config import get_settings


def setup_logging():
    """Configure application-wide logging"""
    settings = get_settings()
    
    # Configure root logger
    logging.basicConfig(
        level=getattr(logging, settings.LOG_LEVEL),
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout)
        ]
    )


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for the given module"""
    return logging.getLogger(name)
