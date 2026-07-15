"""Centralized exception handling"""


class LexAIException(Exception):
    """Base exception for LexAI application"""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ConfigurationError(LexAIException):
    """Raised when configuration is invalid or missing"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)


class DatabaseError(LexAIException):
    """Raised when database operations fail"""
    def __init__(self, message: str):
        super().__init__(message, status_code=500)


class AIServiceError(LexAIException):
    """Raised when AI service operations fail"""
    def __init__(self, message: str):
        super().__init__(message, status_code=503)


class ValidationError(LexAIException):
    """Raised when input validation fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=400)


class AuthenticationError(LexAIException):
    """Raised when authentication fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=401)


class AuthorizationError(LexAIException):
    """Raised when authorization fails"""
    def __init__(self, message: str):
        super().__init__(message, status_code=403)


class NotFoundError(LexAIException):
    """Raised when a resource is not found"""
    def __init__(self, message: str):
        super().__init__(message, status_code=404)
