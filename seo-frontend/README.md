# SEO Frontend — Competitive vocabulary UI

React + Vite app for SEO keyword analysis and content optimization against the FastAPI backend.

**Monorepo:** this folder is **`seo-frontend/`** in [seo-agent](https://github.com/Ruchitas123/seo-agent). Repo overview and Azure setup: **[../README.md](../README.md)**. API details: **[../seo-backend/README.md](../seo-backend/README.md)**.

## Quick start

### Prerequisites

- Node.js (v16 or higher)
- npm (comes with Node.js)
- Backend running (default **http://127.0.0.1:8000**)

### Installation

From the **repository root**:

```bash
cd seo-frontend
npm install
```

### Development

```bash
npm run dev
```

Default URL: **http://localhost:5173**.

#### Run on a specific port (e.g. 3000)

```bash
npm run dev -- --port 3000
```

#### Network access

```bash
npm run dev -- --port 3000 --host
```

### Available scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Configuration — backend URL

The client uses **`VITE_API_BASE_URL`** when set; otherwise it falls back to **`http://127.0.0.1:8000`**. The value must include `http://` or `https://`.

Create **`seo-frontend/.env.local`** (optional):

```bash
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Restart `npm run dev` after changing env files.

Logic lives in `src/services/api.js` (`resolveApiBase` / `API_BASE_URL`).

## Project structure

```
seo-frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── services/
│       └── api.js
├── index.html
├── package.json
└── vite.config.js
```

## Features

- Product selection and URL analysis for SEO keywords
- Keyword extraction (article, competitor, suggestions)
- SEO-oriented content rewriting
- UI built with Adobe Spectrum

## Backend integration

Start the API from **`seo-backend/`** (see backend README), then verify:

- Health: http://127.0.0.1:8000/health  
- Docs: http://127.0.0.1:8000/docs  

## Troubleshooting

### Port already in use

```bash
npm run dev -- --port 3001
```

### Cannot connect to backend

1. Confirm the API is running and reachable at your `VITE_API_BASE_URL` (or the default).
2. Check backend CORS if the browser reports cross-origin errors.
3. Ensure firewalls are not blocking the port.

### Module not found

```bash
rm -rf node_modules package-lock.json
npm install
```

## Production build

```bash
npm run build
```

Output: `dist/`. Preview with `npm run preview`.

## Environment

- React 18, Vite, Adobe Spectrum, Fetch API
