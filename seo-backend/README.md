# Backend — Competitive keyword search API

FastAPI service for SEO keyword extraction, competitor analysis, and content optimization (CrewAI agents + Azure OpenAI).

**Monorepo:** this folder is **`seo-backend/`** in [seo-agent](https://github.com/Ruchitas123/seo-agent). For the repo overview and copy-paste steps for your Azure key, read **[../README.md](../README.md)**.

## API key and environment variables

**You must configure Azure OpenAI before the server can call the model.**

1. Copy the example file (run from **inside `seo-backend/`**):

   ```bash
   cp .env.example .env
   ```

   Or from the repository root:

   ```bash
   cp seo-backend/.env.example seo-backend/.env
   ```

2. Edit `.env` in **`seo-backend/`** (same folder as `main.py`) and set:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AZURE_OPENAI_API_KEY` | **Yes** | Your Azure OpenAI API key |
   | `AZURE_OPENAI_ENDPOINT` | **Yes** | Resource URL, e.g. `https://YOUR_RESOURCE.openai.azure.com` |
   | `AZURE_OPENAI_DEPLOYMENT_NAME` | Recommended | Deployment name in Azure |
   | `AZURE_OPENAI_API_VERSION` | Recommended | API version (match Azure portal) |

3. **Do not commit** `.env`. It is listed in `.gitignore`.

The app loads **`seo-backend/.env`** via `main.py` and `backend/config.py` so it works even when your shell’s current directory is the monorepo root.

### Optional: set variables in the shell (same as `.env`)

From **`seo-backend/`**, after activating your venv:

```bash
export AZURE_OPENAI_ENDPOINT="https://YOUR_RESOURCE.openai.azure.com"
export AZURE_OPENAI_DEPLOYMENT_NAME="gpt-4o"
export AZURE_OPENAI_API_VERSION="2024-02-01"
export AZURE_OPENAI_API_KEY="your-key-here"
export LLM_PROVIDER=azure

uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Then open **http://127.0.0.1:8000/** for the API home page, **http://127.0.0.1:8000/docs** for Swagger, or **http://127.0.0.1:8000/health** for a JSON health check.

**Never paste real API keys into chat, tickets, or Git.** If a key was exposed, rotate it in the Azure portal and update `.env` only on your machine.

## Prerequisites

- Python 3.8+
- pip
- Virtual environment (recommended)

## Installation

From the **repository root**:

```bash
cd seo-backend
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
| GET | `/` | API info / catalog |
| GET | `/api` | API catalog (JSON or HTML) |
| GET | `/api/info` | OpenAPI-style index |
| GET | `/api/products` | Product list |
| POST | `/api/competitors` | Competitors for a product |
| POST | `/api/analyze` | Analyze URL for keywords |
| POST | `/api/rewrite-content` | SEO content rewrite |

## Project structure (`seo-backend/`)

```
seo-backend/
├── agents/                  # CrewAI agents
├── backend/                 # Python package (config, LLM, scrapers)
│   ├── config.py
│   ├── llm_client.py
│   ├── scraper.py
│   └── semrush.py
├── main.py                  # FastAPI app
├── crew.py                  # Agent orchestration
├── requirements.txt
├── .env.example
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
