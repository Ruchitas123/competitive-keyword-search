"""
SEO Agent Backend Server

FastAPI server with endpoints for SEO analysis.
Returns: Article Keywords, Competitor Keywords, Suggested Keywords
Excludes product names from keywords.
No fallbacks - raises exceptions on failure.
"""

import html
import json
from urllib.parse import urlparse

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse, JSONResponse
from pydantic import BaseModel
from typing import List

from backend.config import SERVER_HOST, SERVER_PORT, PRODUCT_COMPETITORS
from crew import seo_crew  # Import the agent orchestrator - ALL operations go through this

# OpenAPI tags (short names so Swagger UI lists operations clearly)
TAG_META = "0. Home & docs"
TAG_HEALTH = "1. Health"
TAG_DATA = "2. Products & competitors"
TAG_ANALYSIS = "3. SEO analysis"
TAG_CONTENT = "4. Content rewrite"

# Minimal URL rules: Experience League docs only, path must match product area.
_PRODUCT_PATH_MARKERS = {
    "Forms": "/content/forms/",
    "Assets": "/content/assets/",
    "Sites": "/content/sites/",
}


def validate_url_for_product(url: str, product: str) -> tuple[bool, str]:
    """https only, host experienceleague.adobe.com, path contains the right /content/<area>/."""
    u = (url or "").strip()
    if not u:
        return False, "URL is required"
    if product not in _PRODUCT_PATH_MARKERS:
        return False, "Invalid product"

    parsed = urlparse(u)
    if parsed.scheme.lower() != "https":
        return False, "URL must start with https://"
    host = (parsed.netloc or "").lower()
    if host != "experienceleague.adobe.com":
        return False, "URL must be on experienceleague.adobe.com"

    path = parsed.path or ""
    marker = _PRODUCT_PATH_MARKERS[product]
    if marker not in path.lower():
        return False, f"For {product}, use an Experience League URL whose path includes {marker}"
    return True, ""


app = FastAPI(
    title="Competitive Vocabulary Intelligence Agent",
    version="1.0.0",
    openapi_tags=[
        {"name": TAG_META, "description": "Landing page and JSON index"},
        {"name": TAG_HEALTH, "description": "Service status"},
        {"name": TAG_DATA, "description": "Product list and competitor URLs"},
        {"name": TAG_ANALYSIS, "description": "Full pipeline: URL → keywords"},
        {"name": TAG_CONTENT, "description": "Rewrite body copy for target keywords"},
    ],
    swagger_ui_parameters={
        "defaultModelsExpandDepth": -1,
        # Collapsed accordions on load; expand a tag to see its operations
        "docExpansion": "none",
        "filter": True,
        "tryItOutEnabled": True,
        # Swagger UI 5: hide OAS badge, spec URL, extra lines in the info header
        "customCss": (
            ".swagger-ui .info .version-stamp,"
            ".swagger-ui .info .title small,"
            ".swagger-ui .info hgroup small,"
            ".swagger-ui .info h2 small,"
            ".swagger-ui .info a.link,"
            ".swagger-ui .info a[href*='openapi'],"
            ".swagger-ui .info .base-url,"
            ".swagger-ui .info .description { display: none !important; }"
        ),
    },
)


def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    app.openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        openapi_version=app.openapi_version,
        summary=app.summary,
        description=None,
        terms_of_service=app.terms_of_service,
        contact=app.contact,
        license_info=app.license_info,
        routes=app.routes,
        webhooks=app.webhooks.routes,
        tags=app.openapi_tags,
        servers=app.servers,
        separate_input_output_schemas=app.separate_input_output_schemas,
        external_docs=app.openapi_external_docs,
    )
    return app.openapi_schema


app.openapi = custom_openapi

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request Models
class AnalyzeRequest(BaseModel):
    url: str
    product: str  # Assets, Forms, Sites - REQUIRED
    time_range: str  # week, month, year - REQUIRED


class ProductRequest(BaseModel):
    product: str


class ContentRewriteRequest(BaseModel):
    content: str
    target_keywords: List[str]
    tone: str = "professional"


# Health Check
@app.get("/health", tags=[TAG_HEALTH])
async def health_check():
    """Check if the service is running"""
    return {"status": "healthy", "service": "Competitive Vocabulary Intelligence Agent"}


# JSON metadata (for scripts / API clients)
ROOT_API_INFO = {
    "message": "Competitive Vocabulary Intelligence Agent API",
    "version": "1.0.0",
    "documentation": {
        "swagger_ui": "/docs",
        "redoc": "/redoc",
        "openapi_json": "/openapi.json",
    },
    "endpoints": {
        "GET /": "API catalog (JSON from curl; HTML page if you open in a browser)",
        "GET /api": "Same catalog as GET /",
        "GET /api/info": "Same catalog as GET /",
        "GET /health": "Health check",
        "GET /api/products": "Get product list (Forms, Assets, Sites)",
        "POST /api/competitors": "Get competitors for a product",
        "POST /api/analyze": "Analyze URL - returns Article, Competitor, Suggested keywords",
        "POST /api/rewrite-content": "Rewrite content for SEO",
    },
}


def _accepts_html_first(request: Request) -> bool:
    """Browsers send text/html first; curl/API clients usually send */* or application/json."""
    accept = request.headers.get("accept") or ""
    if not accept.strip():
        return False
    first = accept.split(",")[0].strip().split(";")[0].strip().lower()
    return first in ("text/html", "application/xhtml+xml")


def _catalog_response(request: Request):
    """JSON for scripts/curl; simple HTML page when opened in a browser (avoids 'empty' white screen)."""
    if _accepts_html_first(request):
        payload = json.dumps(ROOT_API_INFO, indent=2)
        title = html.escape(ROOT_API_INFO["message"])
        ver = html.escape(str(ROOT_API_INFO["version"]))
        return HTMLResponse(
            content=(
                "<!DOCTYPE html><html lang='en'><head><meta charset='utf-8'/>"
                f"<title>{title}</title>"
                "<style>body{font-family:system-ui,sans-serif;margin:1.25rem;line-height:1.5}"
                "pre{background:#f6f8fa;padding:1rem;border-radius:8px;overflow:auto;font-size:13px}"
                "code{background:#eee;padding:2px 6px;border-radius:4px}</style></head><body>"
                f"<h1 style='font-size:1.25rem'>{title}</h1>"
                f"<p>Version <strong>{ver}</strong> · Interactive docs: <a href='/docs'>/docs</a></p>"
                "<p>For raw JSON, use <code>curl</code> or set header "
                "<code>Accept: application/json</code>.</p>"
                f"<pre>{html.escape(payload)}</pre></body></html>"
            )
        )
    return JSONResponse(content=ROOT_API_INFO)


@app.get("/", tags=[TAG_META])
async def root(request: Request):
    """API catalog: JSON (default for API clients) or readable HTML in the browser."""
    return _catalog_response(request)


@app.get("/api", tags=[TAG_META])
@app.get("/api/info", tags=[TAG_META])
async def api_catalog(request: Request):
    """Same body as GET / (catalog is not empty—browsers used to show blank for raw JSON)."""
    return _catalog_response(request)


# Get Products
@app.get("/api/products", tags=[TAG_DATA])
async def get_products():
    """Get list of available product types"""
    return {
        "status": "success",
        "products": list(PRODUCT_COMPETITORS.keys())
    }


# Get Competitors
@app.post("/api/competitors", tags=[TAG_DATA])
async def get_competitors(request: ProductRequest):
    """Get competitors for a specific product type"""
    if request.product not in PRODUCT_COMPETITORS:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid product. Options: {list(PRODUCT_COMPETITORS.keys())}"
        )
    
    competitors = PRODUCT_COMPETITORS[request.product]
    return JSONResponse(content={
        "status": "success",
        "data": {
            "product": request.product,
            "competitors": competitors
        }
    })


# Main Analysis Endpoint - Uses ALL 4 AGENTS through seo_crew
@app.post("/api/analyze", tags=[TAG_ANALYSIS])
async def analyze_url(request: AnalyzeRequest):
    """
    Main SEO Analysis Endpoint - Uses All 4 Agents
    
    Agent Pipeline:
    1. CompetitorFetchingAgent - Gets competitor list for the product
    2. KeywordExtractionAgent - Scrapes URL and extracts article keywords
    3. CompetitiveAnalysisAgent - Gets competitor keywords for each article keyword
    
    Returns:
    - Article Keywords (from the URL)
    - Competitor Keywords (what competitors rank for)
    - Suggested Keywords (top 10 high-volume from both sources)
    
    URL: https Experience League page; path must include /content/forms/, /content/assets/, or /content/sites/ for the selected product.
    """
    print(f"\n[API] /api/analyze called")
    print(f"[API] URL: {request.url}")
    print(f"[API] Product: {request.product}")
    print(f"[API] Time Range: {request.time_range}")
    
    # Validate product
    if request.product not in PRODUCT_COMPETITORS:
        print(f"[API] ERROR Invalid product: {request.product}")
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid product. Options: {list(PRODUCT_COMPETITORS.keys())}"
        )
    
    # Validate time_range
    if request.time_range not in ["week", "month", "year"]:
        print(f"[API] ERROR Invalid time_range: {request.time_range}")
        raise HTTPException(status_code=400, detail="time_range must be: week, month, or year")
    
    url = request.url
    product = request.product
    time_range = request.time_range
    
    # Validate URL matches the selected product type
    is_valid, error_message = validate_url_for_product(url, product)
    if not is_valid:
        print(f"[API] ERROR Invalid URL for product {product}: {url}")
        raise HTTPException(status_code=400, detail=error_message)
    
    print(f"[API] Validation passed, starting analysis...")
    
    try:
        # ===== USE SEO_CREW (All 4 Agents) =====
        # This orchestrates: Agent 1 (Competitors) → Agent 2 (Keywords) → Agent 3 (Competitive Analysis)
        result = await seo_crew.full_seo_analysis(
            url=url,
            product=product,
            time_range=time_range
        )
        
        if result.get("status") == "error":
            print(f"[API] ERROR Analysis error: {result.get('error')}")
            raise HTTPException(status_code=400, detail=result.get("error", "Analysis failed"))
        
        print(f"[API] Analysis complete!")
        return JSONResponse(content={"status": "success", "data": result})
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[API] ERROR Exception: {str(e)[:200]}")
        raise HTTPException(status_code=500, detail=str(e)[:500])


# Content Rewriting - Uses ContentRewritingAgent
@app.post("/api/rewrite-content", tags=[TAG_CONTENT])
async def rewrite_content(request: ContentRewriteRequest):
    """
    Rewrite content for SEO optimization using ContentRewritingAgent
    
    Takes content and up to 3 target keywords, returns SEO-optimized content with HTML formatting.
    Uses chunked processing to handle long articles.
    """
    print(f"\n[API] /api/rewrite-content called")
    print(f"[API] Content length: {len(request.content)} chars")
    print(f"[API] Keywords: {request.target_keywords}")
    
    if len(request.target_keywords) > 3:
        raise HTTPException(status_code=400, detail="Maximum 3 keywords allowed")
    
    if not request.content.strip():
        raise HTTPException(status_code=400, detail="Content cannot be empty")
    
    if not request.target_keywords:
        raise HTTPException(status_code=400, detail="At least one keyword required")
    
    try:
        # Use ContentRewritingAgent through seo_crew
        result = await seo_crew.rewrite_content(
            content=request.content,
            target_keywords=request.target_keywords,
            tone=request.tone
        )
        
        if result.get("status") == "error":
            print(f"[API] ERROR Rewrite error: {result.get('error')}")
            raise HTTPException(status_code=400, detail=result.get("error", "Content rewriting failed"))
        
        print(f"[API] Rewrite complete! {result.get('chunks_processed', 0)}/{result.get('total_chunks', 0)} chunks")
        return JSONResponse(content={"status": "success", "data": result})
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[API] ERROR Rewrite exception: {str(e)[:200]}")
        raise HTTPException(status_code=500, detail=f"Content rewriting failed: {str(e)[:300]}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=SERVER_HOST, port=SERVER_PORT)
