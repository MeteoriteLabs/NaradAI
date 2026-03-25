# NaradAI

NaradAI is an open-source **voice-guided website experience platform**. It combines a control-plane dashboard for configuring AI agents with an embeddable widget that can be added to any website.

## What it does

- Create and manage AI agents with custom persona + voice style.
- Maintain a Q&A knowledge base per agent.
- Track user behavior with event tags.
- Build guided tours/flows with ordered steps.
- Capture leads and view conversation analytics.
- Embed a floating, Shadow DOM-isolated widget using a script tag.

## Architecture overview

This repository currently includes:

1. **Primary app runtime (TypeScript / Node.js)**
   - React + Vite dashboard (`client/`)
   - Express API + WebSocket server (`server/`)
   - Drizzle + PostgreSQL schema (`shared/schema.ts`)
   - `/embed.js` endpoint served by the app for external websites

2. **Python FastAPI backend (legacy/alternate implementation)**
   - Separate API scaffold in `backend/`
   - Useful for experimentation, not the default runtime path used by the dashboard app in this repo

## Tech stack

- **Frontend**: React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind CSS, shadcn/ui
- **Backend**: Express, WebSocket (`ws`), OpenAI SDK
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod + drizzle-zod

## Monorepo structure

```text
.
├── client/               # Dashboard frontend + widget React UI
├── server/               # Express API, embed endpoint, WebSocket logic
├── shared/               # Drizzle schema + shared TS types
├── backend/              # Python FastAPI backend (alternate/legacy)
├── drizzle.config.ts     # Drizzle migration config
└── start-backend.sh      # Helper script for Python backend
```

## Prerequisites

- **Node.js 20+**
- **npm 10+**
- **PostgreSQL** database
- **OpenAI API key** (for AI chat/audio features)

## Environment variables

Create a `.env` file in the repository root for the Node runtime:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
OPENAI_API_KEY=sk-...
PORT=5000
```

For the Python backend (`backend/`), `DATABASE_URL` is also required.

## Quick start (default: Node/TypeScript runtime)

```bash
npm install
npm run db:push
npm run dev
```

Then open the app at `http://localhost:5000` (or your configured `PORT`).

### Production build

```bash
npm run build
npm run start
```

## Embedding the widget

The app serves an embeddable script at `/embed.js`.

```html
<script
  src="https://YOUR_DOMAIN/embed.js"
  data-agent-id="YOUR_AGENT_ID"
  data-api-base="https://YOUR_DOMAIN"
  async
></script>
```

Notes:
- `data-agent-id` is required.
- `data-api-base` is optional and useful when API/WebSocket are hosted on a different origin.

## Available npm scripts

- `npm run dev` — run development server (Express + Vite middleware).
- `npm run build` — build client and bundle server into `dist/`.
- `npm run start` — start the production bundle.
- `npm run check` — run TypeScript type checking.
- `npm run db:push` — push Drizzle schema changes to PostgreSQL.

## API surface (Node runtime)

Common routes:

- `POST /api/agents`, `GET /api/agents`, `GET/PUT/DELETE /api/agents/:id`
- `POST/GET /api/agents/:agentId/knowledge`, `DELETE /api/knowledge/:id`
- `POST/GET /api/agents/:agentId/tags`, `DELETE /api/tags/:id`
- `POST/GET /api/agents/:agentId/flows`, `DELETE /api/flows/:id`
- `POST/GET /api/flows/:flowId/steps`, `DELETE /api/steps/:id`
- `POST/GET /api/agents/:agentId/leads`
- `GET /api/agents/:agentId/analytics`
- `POST /api/agents/:agentId/verify-installation`
- `GET /embed.js`
- `WS /ws`

## Python backend (optional)

If you want to run the FastAPI backend implementation:

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

## Contributing

1. Fork the repo and create a feature branch.
2. Keep changes focused and include tests/checks when possible.
3. Run:
   - `npm run check`
   - any relevant project-specific tests
4. Open a PR with a clear description of behavior changes.

## License

MIT (see `package.json`).
