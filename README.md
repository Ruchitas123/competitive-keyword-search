# Competitive keyword search

Monorepo for the SEO competitive analysis stack: a **FastAPI** backend (`server/`) and a **React + Vite** frontend (`frontend/`).

## Required: Azure OpenAI API key

The backend calls **Azure OpenAI**. Without valid credentials the API will not work.

1. Copy the example env file and edit it:

   ```bash
   cp server/.env.example server/.env
   ```

2. Open `server/.env` and set at least:

   - **`AZURE_OPENAI_API_KEY`** — your Azure OpenAI key (**required**)
   - **`AZURE_OPENAI_ENDPOINT`** — your resource URL, e.g. `https://YOUR_RESOURCE_NAME.openai.azure.com`
   - **`AZURE_OPENAI_DEPLOYMENT_NAME`** — your deployment name (often a model deployment name in Azure)
   - **`AZURE_OPENAI_API_VERSION`** — API version your resource uses (see Azure docs)

3. **Never commit** `.env` or paste real keys into GitHub. The repository ignores `.env` on purpose.

For run commands, troubleshooting, and endpoint details, see:

- **[`server/README.md`](server/README.md)** — backend
- **[`frontend/README.md`](frontend/README.md)** — frontend

## Quick start (local)

**Terminal 1 — backend**

```bash
cd server
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Ensure server/.env exists with AZURE_OPENAI_API_KEY and related vars set
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

By default the UI is configured to talk to the API at `http://127.0.0.1:8000`. If you deploy elsewhere, point the frontend at that URL (see `frontend/README.md`).

## Repository layout

```
.
├── README.md           # This file (overview + key setup)
├── server/             # FastAPI backend + CrewAI agents
│   ├── README.md       # Backend documentation
│   └── ...
└── frontend/           # React (Vite) UI
    ├── README.md       # Frontend documentation
    └── ...
```
