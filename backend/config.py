"""
Configuration settings for the SEO Agent
"""

import os
from pathlib import Path

from dotenv import load_dotenv

# Load .env from project root (folder that contains `backend/` and `main.py`),
# so Azure settings work even if uvicorn is started from another cwd.
_REPO_ROOT = Path(__file__).resolve().parent.parent
load_dotenv(_REPO_ROOT / ".env")
load_dotenv()  # optional: cwd .env overrides


def _normalize_azure_endpoint(raw: str) -> str:
    """Ensure Azure base URL has https:// so httpx never gets a scheme-less URL."""
    url = (raw or "").strip().rstrip("/")
    if not url:
        return ""
    if not url.startswith(("http://", "https://")):
        return "https://" + url
    return url


def get_azure_openai_settings() -> dict:
    """
    Read Azure OpenAI settings from the environment on each call.
    Use this for outbound HTTP requests so .env is always respected (correct cwd, edits, etc.).
    """
    endpoint = _normalize_azure_endpoint(os.getenv("AZURE_OPENAI_ENDPOINT", ""))
    deployment = (os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME") or "gpt-4o").strip()
    api_version = (os.getenv("AZURE_OPENAI_API_VERSION") or "2024-02-01").strip()
    api_key = (os.getenv("AZURE_OPENAI_API_KEY") or "").strip()
    chat_url = ""
    if endpoint:
        chat_url = (
            f"{endpoint}/openai/deployments/{deployment}/chat/completions"
            f"?api-version={api_version}"
        )
    return {
        "endpoint": endpoint,
        "deployment": deployment,
        "api_version": api_version,
        "api_key": api_key,
        "chat_url": chat_url,
    }


# Azure OpenAI Configuration (module-level snapshot after .env load; prefer get_azure_openai_settings() for requests)
AZURE_OPENAI_ENDPOINT = _normalize_azure_endpoint(os.getenv("AZURE_OPENAI_ENDPOINT", ""))
AZURE_OPENAI_DEPLOYMENT_NAME = (os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME") or "gpt-4o").strip()
AZURE_OPENAI_API_VERSION = (os.getenv("AZURE_OPENAI_API_VERSION") or "2024-02-01").strip()
AZURE_OPENAI_API_KEY = (os.getenv("AZURE_OPENAI_API_KEY") or "").strip()

# LLM Provider
LLM_PROVIDER = os.getenv("LLM_PROVIDER", "azure")

# Product-specific competitor configurations
# Only basic info - all URLs are discovered dynamically
PRODUCT_COMPETITORS = {
    "Assets": [
        {"name": "Bynder", "url": "https://www.bynder.com/"},
        {"name": "Brandfolder", "url": "https://brandfolder.com/"},
        {"name": "Canto", "url": "https://www.canto.com/"},
        {"name": "Widen", "url": "https://www.widen.com/"}
    ],
    "Forms": [
        {"name": "Typeform", "url": "https://www.typeform.com/"},
        {"name": "Jotform", "url": "https://www.jotform.com/"},
        {"name": "Formstack", "url": "https://www.formstack.com/"},
        {"name": "Wufoo", "url": "https://www.wufoo.com/"}
    ],
    "Sites": [
        {"name": "Wix", "url": "https://www.wix.com/"},
        {"name": "Squarespace", "url": "https://www.squarespace.com/"},
        {"name": "Webflow", "url": "https://webflow.com/"},
        {"name": "WordPress", "url": "https://wordpress.com/"}
    ]
}


# Default competitors (for backward compatibility)
COMPETITORS = PRODUCT_COMPETITORS["Forms"]

# SEMrush base URL format
SEMRUSH_URL_TEMPLATE = "https://www.semrush.com/analytics/keywordmagic/?q={keyword}&db=us"

# Server settings
SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8000

