# SEO Backend - Competitive Vocabulary Intelligence Agent API

FastAPI-based backend for SEO keyword extraction, competitor analysis, and content optimization.

## Quick Start

### Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- Virtual environment (recommended)

### Installation

1. Navigate to the backend directory:
```bash
cd seo-backend
```

2. Create and activate virtual environment:

**Windows (PowerShell):**
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

**Windows (Command Prompt):**
```cmd
python -m venv venv
venv\Scripts\activate.bat
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Running the Backend

#### Standard Mode

```bash
uvicorn main:app --host 127.0.0.1 --port 8000
```

#### Development Mode (with auto-reload)

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### Using Python Module

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Accessing the API

Once running:

- **API Root**: http://127.0.0.1:8000
- **Health Check**: http://127.0.0.1:8000/health
- **API Documentation (Swagger)**: http://127.0.0.1:8000/docs
- **Alternative Docs (ReDoc)**: http://127.0.0.1:8000/redoc

## Environment Variables

Create a `.env` file in the `seo-backend` directory:

```env
# Azure OpenAI Configuration
AZURE_OPENAI_API_KEY=your_api_key_here
AZURE_OPENAI_ENDPOINT=your_endpoint_here
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
AZURE_OPENAI_API_VERSION=2024-02-15-preview
```

## API Endpoints

### Health & Info

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API root information |

### Main Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get list of available products |
| POST | `/api/competitors` | Get competitors for a product |
| POST | `/api/analyze` | Analyze article URL for keywords |
| POST | `/api/rewrite-content` | Rewrite content with SEO keywords |

## Project Structure

```
seo-backend/
├── agents/
│   ├── article_agent.py      # Article content extraction
│   ├── competitor_agent.py   # Competitor analysis
│   └── keyword_agent.py      # Keyword extraction
├── backend/
│   ├── config.py             # Configuration settings
│   └── llm_client.py         # Azure OpenAI client
├── main.py                   # FastAPI application
├── requirements.txt          # Python dependencies
└── .env                      # Environment variables
```

## Features

- **Article Analysis**: Extract content and keywords from URLs
- **Competitor Analysis**: Dynamic competitor content scraping
- **Keyword Extraction**: AI-powered keyword identification
- **Content Rewriting**: SEO-optimized content generation
- **Chunk Processing**: Large content handling with retry logic
- **Dynamic Scraping**: No hardcoded URLs, intelligent discovery

## API Usage Examples

### Analyze URL

```bash
curl -X POST "http://127.0.0.1:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/article",
    "product": "Adobe Express"
  }'
```

### Rewrite Content

```bash
curl -X POST "http://127.0.0.1:8000/api/rewrite-content" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Your content here...",
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "tone": "professional"
  }'
```

## Troubleshooting

### Port Already in Use

Change the port number:

```bash
uvicorn main:app --host 127.0.0.1 --port 8001 --reload
```

### Module Import Errors

Ensure virtual environment is activated and dependencies are installed:

```bash
pip install -r requirements.txt
```

### Azure OpenAI API Errors

1. Verify `.env` file exists with correct credentials
2. Check API key is valid
3. Ensure endpoint URL is correct
4. Verify deployment name matches your Azure setup

### Kill Existing Process

**Windows (PowerShell):**
```powershell
Get-Process -Name "uvicorn","python" | Stop-Process -Force
```

**Linux/Mac:**
```bash
pkill -f uvicorn
```

## Dependencies

Key packages:

- **FastAPI**: Modern web framework
- **Uvicorn**: ASGI server
- **httpx**: HTTP client for scraping
- **BeautifulSoup4**: HTML parsing
- **openai**: Azure OpenAI integration
- **python-dotenv**: Environment variable management

## Security Notes

- Never commit `.env` files to version control
- Keep API keys secure
- Use environment variables for sensitive data
- Enable CORS only for trusted origins

## Production Deployment

For production, use a production-grade ASGI server:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use Gunicorn with Uvicorn workers:

```bash
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## Logging

The application logs to console. Key log prefixes:

- `[ArticleAgent]` - Article processing
- `[CompetitorAgent]` - Competitor analysis
- `[KeywordAgent]` - Keyword extraction
- `[ContentRewriting]` - Content rewriting progress

## Testing

Test the health endpoint:

```bash
curl http://127.0.0.1:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

## License

Internal Adobe Tool

## Support

For issues or questions, contact the development team.
