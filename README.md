# Backend — Competitive keyword search API

FastAPI service for SEO keyword extraction, competitor analysis, and content optimization (CrewAI agents + Azure OpenAI).

## API key and environment variables

**You must configure Azure OpenAI before the server can call the model.**

1. Copy the example file:

   ```bash
   cp .env.example .env
   ```

2. Edit `.env` in the **project root** (same folder as `main.py`) and set:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AZURE_OPENAI_API_KEY` | **Yes** | Your Azure OpenAI API key |
   | `AZURE_OPENAI_ENDPOINT` | **Yes** | Resource URL, e.g. `https://YOUR_RESOURCE.openai.azure.com` |
   | `AZURE_OPENAI_DEPLOYMENT_NAME` | Recommended | Deployment name in Azure |
   | `AZURE_OPENAI_API_VERSION` | Recommended | API version (match Azure portal) |

3. **Do not commit** `.env`. It is listed in `.gitignore`.

## Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

## Installation

From the **project root** (clone folder — where `main.py` lives):

```bash
python -m venv venv
```

**Windows (PowerShell):** `.\venv\Scripts\Activate.ps1`  
**Windows (CMD):** `venv\Scripts\activate.bat`  
**macOS / Linux:** `source venv/bin/activate`

```bash
pip install -r requirements.txt
```

## Run the API

```bash
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Or:

```bash
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### URLs

- API root: http://127.0.0.1:8000  
- Health: http://127.0.0.1:8000/health  
- Swagger: http://127.0.0.1:8000/docs  
- ReDoc: http://127.0.0.1:8000/redoc  

## API endpoints (summary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/` | API info |
| GET | `/api/products` | Product list |
| POST | `/api/competitors` | Competitors for a product |
| POST | `/api/analyze` | Analyze URL for keywords |
| POST | `/api/rewrite-content` | SEO content rewrite |

## Project structure

```
.
├── agents/                  # CrewAI agents
├── backend/
│   ├── config.py            # Settings (from environment)
│   ├── llm_client.py        # Azure OpenAI client
│   ├── scraper.py
│   └── semrush.py
├── main.py                  # FastAPI app
├── crew.py                  # Agent orchestration
├── requirements.txt
├── .env.example             # Template — copy to .env
└── README.md                # This file
```

## Example: analyze URL

```bash
curl -X POST "http://127.0.0.1:8000/api/analyze" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/forms/example",
    "product": "Forms",
    "time_range": "month"
  }'
```

## Troubleshooting

- **401 / errors from OpenAI** — Check `AZURE_OPENAI_API_KEY`, endpoint, deployment name, and API version in `.env`.
- **Port in use** — Change port: `uvicorn main:app --host 127.0.0.1 --port 8001 --reload`
- **Import errors** — Activate the venv and run `pip install -r requirements.txt` again.

## Security

- Never commit `.env` or real keys.
- Restrict CORS in production to known origins.
