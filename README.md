# SEO Agent

Monorepo for **SEO competitive analysis and keyword search**: a FastAPI backend (CrewAI agents + Azure OpenAI) and a React + Vite frontend.

Repository: [https://github.com/Ruchitas123/seo-agent](https://github.com/Ruchitas123/seo-agent)

## Azure OpenAI API key (required)

The backend **will not** call the model until Azure is configured. **Do not commit** real keys.

1. From the **repository root**:

   ```bash
   cp seo-backend/.env.example seo-backend/.env
   ```

2. Edit **`seo-backend/.env`** and set at least:

   | Variable | Required | Description |
   |----------|----------|-------------|
   | `AZURE_OPENAI_API_KEY` | **Yes** | Your Azure OpenAI API key |
   | `AZURE_OPENAI_ENDPOINT` | **Yes** | Resource URL, e.g. `https://YOUR_RESOURCE.openai.azure.com` |
   | `AZURE_OPENAI_DEPLOYMENT_NAME` | Recommended | Deployment name in Azure |
   | `AZURE_OPENAI_API_VERSION` | Recommended | API version (match Azure portal) |

3. **Never paste API keys** into chat, issues, or Git. If a key was exposed, rotate it in the Azure portal and update `.env` only on your machine.

For backend-only details (uvicorn, curl examples, troubleshooting), see **[seo-backend/README.md](seo-backend/README.md)**.

For the UI (npm, `VITE_API_BASE_URL`), see **[seo-frontend/README.md](seo-frontend/README.md)**.

## Quick start (two terminals)

**Terminal 1 — API** (from repo root):

```bash
cd seo-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Open [http://127.0.0.1:8000/](http://127.0.0.1:8000/), [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs), or [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health).

**Terminal 2 — UI**:

```bash
cd seo-frontend
npm install
npm run dev
```

Default Vite URL: [http://localhost:5173](http://localhost:5173). Point the app at the API with `VITE_API_BASE_URL` if needed (see frontend README).

## Layout

```
.
├── README.md              # This file — overview + API key
├── seo-backend/           # FastAPI app, agents, Python package `backend/`
│   ├── README.md
│   ├── main.py
│   ├── crew.py
│   ├── agents/
│   ├── backend/
│   ├── requirements.txt
│   └── .env.example
└── seo-frontend/          # React + Vite UI
    ├── README.md
    └── src/
```

## Security

- Keep `.env` out of version control (ignored under `seo-backend/`).
- Restrict CORS in production to known origins.
