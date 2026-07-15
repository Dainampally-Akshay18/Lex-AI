"""Prompt templates module"""
from .summary_prompts import SUMMARY_SYSTEM_PROMPT, SUMMARY_USER_PROMPT
from .risk_prompts import RISK_SYSTEM_PROMPT, RISK_USER_PROMPT

__all__ = [
    "SUMMARY_SYSTEM_PROMPT",
    "SUMMARY_USER_PROMPT",
    "RISK_SYSTEM_PROMPT",
    "RISK_USER_PROMPT"
]
