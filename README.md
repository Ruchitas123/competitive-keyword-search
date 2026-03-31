# SEO Agent

This repository contains two projects:

- **`seo-backend/`** — FastAPI API, CrewAI agents, Azure OpenAI
- **`seo-frontend/`** — React + Vite UI (Adobe Spectrum)

They are **one Git repo** (`seo-agent` on GitHub), not two separate repositories.

## Required: Azure OpenAI API key

The backend calls **Azure OpenAI**. Configure it before running the API.

1. Copy the template:

   ```bash
   cp seo-backend/.env.example seo-backend/.env
   ```

2. Edit **`seo-backend/.env`** and set **`AZURE_OPENAI_API_KEY`**, **`AZURE_OPENAI_ENDPOINT`**, **`AZURE_OPENAI_DEPLOYMENT_NAME`**, and **`AZURE_OPENAI_API_VERSION`** (see Azure portal for your resource).

3. **Never commit** `.env` or real keys.

More detail:

- **[`seo-backend/README.md`](seo-backend/README.md)** — Python API
- **[`seo-frontend/README.md`](seo-frontend/README.md)** — web UI

## Quick start (local)

**Backend**

```bash
cd seo-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
# Ensure seo-backend/.env exists with your Azure variables
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

**Frontend** (another terminal)

```bash
cd seo-frontend
npm install
npm run dev
```

The UI defaults to **`http://127.0.0.1:8000`** for the API (see `seo-frontend/src/services/api.js`).

## Layout

```
.
├── README.md                 # This file
├── seo-backend/              # FastAPI + agents
│   ├── README.md
│   └── ...
└── seo-frontend/             # React app
    ├── README.md
    └── ...
```
