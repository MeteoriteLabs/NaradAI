<div align="center">

# 🎙️ NaradAI

**Voice-guided website experiences for products and services**

Turn static pages into narrated, interactive customer journeys.

![Open Source](https://img.shields.io/badge/Open%20Source-Yes-22c55e?style=for-the-badge)
![React](https://img.shields.io/badge/Frontend-React%2018-61dafb?style=for-the-badge)
![Express](https://img.shields.io/badge/Backend-Express-111827?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-a855f7?style=for-the-badge)

</div>

---

## 🌟 Overview

NaradAI is an open-source platform that helps websites **narrate products and services** in a guided, conversational way.

With NaradAI, teams can:
- Configure AI agents with persona + behavior.
- Answer user questions from curated knowledge.
- Guide visitors step-by-step through key pages/features.
- Capture leads during live interaction.
- Embed the assistant on external websites with one script.

---

## 📚 Table of Contents

- [🧩 Core Use Cases](#-core-use-cases)
- [🧭 How narration works on a website](#-how-narration-works-on-a-website)
- [🔌 AI & voice provider flexibility](#-ai--voice-provider-flexibility)
- [🏗️ Architecture](#️-architecture)
- [🧱 Tech Stack](#-tech-stack)
- [🗂️ Repository Structure](#️-repository-structure)
- [✅ Prerequisites](#-prerequisites)
- [🔐 Environment Variables](#-environment-variables)
- [🚀 Quick Start](#-quick-start)
- [🌐 Embed on Any Website](#-embed-on-any-website)
- [🛠️ NPM Scripts](#️-npm-scripts)
- [📡 API Surface](#-api-surface)
- [🐍 Optional Python Backend](#-optional-python-backend)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## 🧩 Core Use Cases

| Use Case | What NaradAI Does |
|---|---|
| Product walkthrough | Narrates features, pricing, and onboarding flows |
| Service explanation | Explains process and offerings step-by-step |
| Guided conversion | Helps users find the right section and actions |
| Lead capture | Collects contact details during conversation |
| Contextual support | Responds based on current page and interaction context |

---

## 🧭 How narration works on a website

NaradAI enables a practical narration flow for real websites:

1. **Create an AI agent in dashboard**
   - Define agent identity, persona, and voice behavior.
   - Add Q&A knowledge about your product/service.

2. **Define journeys + event tags**
   - Build guided flows (multi-step walkthroughs).
   - Track meaningful page elements and behaviors.

3. **Embed NaradAI script**
   - Add a script tag to your website.
   - Widget mounts inside Shadow DOM for style isolation.

4. **Visitor starts conversation**
   - Assistant can greet, answer questions, narrate content, and trigger guided steps.
   - Conversation can end in lead capture + analytics updates.

> ✅ Outcome: NaradAI can narrate your product/service directly inside your website experience.

---

## 🔌 AI & voice provider flexibility

NaradAI is designed to support multiple AI/voice stacks.

- **Current repo implementation:** OpenAI SDK (chat + audio transcription paths).
- **Platform-flexible direction:** can be integrated with providers such as **ElevenLabs** and other TTS/STT/LLM services depending on your architecture and preferences.

This allows teams to optimize for voice quality, latency, region, and pricing.

---

## 🏗️ Architecture

### Primary runtime (default in this repo)

- `client/` → React + Vite dashboard + widget UI
- `server/` → Express REST API + WebSocket server + `/embed.js`
- `shared/` → Drizzle schema + shared TypeScript types

### Alternate path

- `backend/` → FastAPI implementation (optional/legacy path for experimentation)

---

## 🧱 Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 18, TypeScript, Vite, Wouter, TanStack Query, Tailwind, shadcn/ui |
| Backend | Express, ws (WebSocket), OpenAI SDK |
| Data | PostgreSQL, Drizzle ORM |
| Validation | Zod, drizzle-zod |

---

## 🗂️ Repository Structure

```text
.
├── client/               # Dashboard frontend + widget React UI
├── server/               # Express API, embed endpoint, WebSocket logic
├── shared/               # Drizzle schema + shared TS types
├── backend/              # Python FastAPI backend (alternate/legacy)
├── drizzle.config.ts     # Drizzle migration config
└── start-backend.sh      # Helper script for Python backend
```

---

## ✅ Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL
- OpenAI API key (required by current runtime implementation)

---

## 🔐 Environment Variables

Create `.env` in repo root:

```bash
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DB_NAME
OPENAI_API_KEY=sk-...
PORT=5000
```

For `backend/` FastAPI path, `DATABASE_URL` is also required.

---

## 🚀 Quick Start

```bash
npm install
npm run db:push
npm run dev
```

App URL: `http://localhost:5000` (or your configured `PORT`).

### Production

```bash
npm run build
npm run start
```

---

## 🌐 Embed on Any Website

NaradAI serves an embeddable script at `/embed.js`.

```html
<script
  src="https://YOUR_DOMAIN/embed.js"
  data-agent-id="YOUR_AGENT_ID"
  data-api-base="https://YOUR_DOMAIN"
  async
></script>
```

**Attributes:**
- `data-agent-id` (**required**) – the agent to load.
- `data-api-base` (optional) – set when API/WebSocket live on another origin.

---

## 🛠️ NPM Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Start development server (Express + Vite middleware) |
| `npm run build` | Build client and bundle server into `dist/` |
| `npm run start` | Start production bundle |
| `npm run check` | Run TypeScript checks |
| `npm run db:push` | Push Drizzle schema to PostgreSQL |

---

## 📡 API Surface

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

---

## 🐍 Optional Python Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

---

## 🤝 Contributing

1. Fork this repository.
2. Create a focused feature branch.
3. Run checks before opening PR:
   - `npm run check`
   - other relevant tests/checks
4. Open a PR with clear behavior changes.

---

## 📄 License

MIT (see `package.json`).
