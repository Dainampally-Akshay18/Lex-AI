"""Text extraction from PDF and DOCX files"""
import pymupdf
from docx import Document
from pathlib import Path
from app.utils.exceptions import ValidationError
from app.utils.logger import get_logger

logger = get_logger(__name__)


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text from a PDF file using PyMuPDF.
    
    Args:
        file_path: Path to the PDF file
        
    Returns:
        Extracted text content
        
    Raises:
        ValidationError: If PDF is corrupted or extraction fails
    """
    try:
        logger.info(f"Extracting text from PDF: {file_path}")
        
        # Open PDF document
        doc = pymupdf.open(file_path)
        
        # Extract text from all pages
        text_parts = []
        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text()
            if text.strip():
                text_parts.append(text)
        
        doc.close()
        
        # Combine all text
        full_text = "\n\n".join(text_parts)
        
        if not full_text.strip():
            raise ValidationError("PDF file contains no readable text")
        
        logger.info(f"Successfully extracted {len(full_text)} characters from PDF")
        return full_text
        
    except pymupdf.FileDataError as e:
        logger.error(f"Corrupted PDF file: {str(e)}")
        raise ValidationError("PDF file is corrupted or invalid")
    
    except Exception as e:
        logger.error(f"Failed to extract text from PDF: {str(e)}")
        raise ValidationError(f"Failed to extract text from PDF: {str(e)}")


def extract_text_from_docx(file_path: str) -> str:
    """
    Extract text from a DOCX file using python-docx.
    
    Args:
        file_path: Path to the DOCX file
        
    Returns:
        Extracted text content
        
    Raises:
        ValidationError: If DOCX is corrupted or extraction fails
    """
    try:
        logger.info(f"Extracting text from DOCX: {file_path}")
        
        # Open DOCX document
        doc = Document(file_path)
        
        # Extract text from all paragraphs
        text_parts = []
        for paragraph in doc.paragraphs:
            if paragraph.text.strip():
                text_parts.append(paragraph.text)
        
        # Combine all text
        full_text = "\n\n".join(text_parts)
        
        if not full_text.strip():
            raise ValidationError("DOCX file contains no readable text")
        
        logger.info(f"Successfully extracted {len(full_text)} characters from DOCX")
        return full_text
        
    except Exception as e:
        logger.error(f"Failed to extract text from DOCX: {str(e)}")
        raise ValidationError(f"Failed to extract text from DOCX: {str(e)}")
