# Frontend — Competitive keyword search UI

React + Vite app (Adobe React Spectrum) for running analyses against the backend API.

## Backend URL

The UI talks to the API at **`http://127.0.0.1:8000`** by default. That value lives in:

- `src/services/api.js` — `API_BASE_URL`

Change it if your API runs on another host or port. The backend must be running and must have **`AZURE_OPENAI_API_KEY`** and related variables set (see **[root `README.md`](../README.md)** and **[`server/README.md`](../server/README.md)**).

## Prerequisites

- Node.js 16+ (18+ recommended)
- npm

## Install and run

From the **`frontend/`** directory:

```bash
cd frontend
npm install
npm run dev
```

`vite.config.js` sets the dev server to **port 3000** with `host: true` for LAN access.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build → `dist/` |
| `npm run preview` | Preview production build |

## Project structure

```
frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   └── services/
│       └── api.js       # API base URL and fetch helpers
├── public/
├── index.html
├── package.json
├── vite.config.js
└── README.md            # This file
```

## Features

- Product selection (Forms, Assets, Sites)
- URL analysis and keyword views
- Competitor and suggested keywords
- Content rewriting with target keywords
- Spectrum-based UI

## Troubleshooting

- **Cannot reach API** — Start the server from `server/` and confirm http://127.0.0.1:8000/health  
- **CORS errors** — Backend must allow the frontend origin (dev server URL)  
- **Dependency issues** — Remove `node_modules` and `package-lock.json`, then `npm install` again  

## Security note

Do not put API keys in the frontend. Azure keys belong only in **`server/.env`**, never in this app’s source or public env files.
