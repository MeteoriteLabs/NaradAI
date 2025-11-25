# Narada AI - Voice-Guided Website Experience Platform

## Product Overview
Narada AI is a voice-based website guide that understands user behavior, listens to speech, reads page context, and guides visitors through digital journeys using contextual AI + UI highlights + voice narration — embeddable with one script.

## Architecture

### Two-Part System

**1. Control Plane (Dashboard)** - React TypeScript web app where businesses:
- Create AI voice agents with personas
- Add knowledge base (Q&A)
- Define Event Tags (sections/elements to track)
- Create Journeys / Guided Flows with Joyride
- Configure voice style
- Generate embed snippet
- View analytics, transcripts, and leads

**2. Runtime Widget (Embeddable Snippet)** - Lightweight script for any website:
```html
<script src="https://cdn.narada.ai/embed.js" data-agent-id="narada_123" async></script>
```

The widget:
- Tracks event tags (view, click, scroll, custom)
- Handles voice input/output with OpenAI Realtime API
- Connects to backend via WebSocket
- Runs Joyride for guided tours
- Displays responses in voice + bubble UI
- Uses Shadow DOM for style isolation

## Tech Stack

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for SPA navigation
- **Styling**: Tailwind CSS + Shadcn UI components
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: TanStack Query (React Query)
- **Guided Tours**: React Joyride
- **Build**: Vite

### Backend (Python + FastAPI)
- **Framework**: FastAPI for REST API and WebSocket
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Voice AI**: OpenAI Realtime API (speech-to-text, text-to-speech, function calling)
- **Real-time**: WebSocket for bidirectional communication
- **Validation**: Pydantic models

### Database Schema (PostgreSQL)

**agents** - AI voice agent configurations
- id, name, persona, voiceStyle, createdAt

**knowledge_items** - Q&A knowledge base
- id, agentId, question, answer, createdAt

**event_tags** - Page elements/sections to track
- id, agentId, label, selector, eventType, pagePattern, createdAt

**flows** - Guided journey definitions
- id, agentId, name, pageUrl, createdAt

**steps** - Individual steps in a flow
- id, flowId, selector, title, tooltipText, voiceScript, order, createdAt

**leads** - Captured visitor information
- id, agentId, name, phone, email, context, createdAt

**conversations** - Chat transcripts and analytics
- id, agentId, transcript, context, flowsTriggered, leadCaptured, createdAt

## Design System

### Dual Design Strategy
- **Dashboard**: Material Design-inspired for productivity and data density
- **Widget**: Intercom/Linear-inspired for approachability and trust

### Typography
- **Primary**: Inter (headings, body text)
- **Code/Data**: JetBrains Mono

### Colors
- Primary: Deep blue (220, 85%, 35%) - professional, trustworthy
- Accent: Light blue-gray for highlights
- Background: Neutral grays with subtle elevation

### Spacing System
Tailwind units: 2, 4, 6, 8, 12, 16, 24 (px multiples)

## Key Features

### MVP Features
1. Agent creation and management dashboard
2. Knowledge base Q&A system
3. Event tagging system for user tracking
4. Journey/flow builder with Joyride highlights
5. Embeddable widget script (Google Analytics-style)
6. Real-time WebSocket communication
7. Voice pipeline with OpenAI Realtime API
8. Context-aware AI responses
9. Floating voice avatar with chat UI
10. Lead capture forms
11. Analytics dashboard
12. Shadow DOM widget isolation

### Future Features
- PDF and website crawler for knowledge automation
- ElevenLabs premium voice upgrade
- Advanced analytics with sentiment analysis
- Multi-language support
- A/B testing framework

## Development Workflow

### Frontend Development
```bash
npm run dev  # Starts Vite dev server + Express backend
```

### Backend Development (Python)
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 3001
```

### Database Migrations
```bash
npm run db:push  # Push schema changes to PostgreSQL
```

### Widget Build
```bash
npm run build:widget  # Creates embeddable widget bundle
```

## API Routes

### REST Endpoints
- `POST /api/agents` - Create agent
- `GET /api/agents/:id` - Get agent
- `POST /api/agents/:id/knowledge` - Add knowledge
- `GET /api/agents/:id/knowledge` - List knowledge
- `POST /api/agents/:id/tags` - Create event tag
- `GET /api/agents/:id/tags` - List event tags
- `POST /api/agents/:id/flows` - Create flow
- `GET /api/agents/:id/flows` - List flows
- `POST /api/flows/:id/steps` - Create step
- `GET /api/flows/:id/steps` - List steps
- `POST /api/agents/:id/leads` - Capture lead
- `GET /api/agents/:id/leads` - List leads
- `GET /api/agents/:id/analytics` - Get analytics

### WebSocket
- `/ws/agents/:agentId/sessions/:sessionId` - Real-time voice interaction

## Project Structure

```
narada-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Shadcn UI components
│   │   ├── pages/          # Dashboard pages
│   │   ├── lib/            # Utils, query client
│   │   └── App.tsx         # Main app with routing
│   └── index.html
├── backend/                # Python FastAPI backend
│   ├── main.py            # FastAPI app entry
│   ├── routes/            # API route handlers
│   ├── models/            # SQLAlchemy models
│   ├── utils/             # Helpers (OpenAI, DB)
│   └── requirements.txt
├── widget/                 # Embeddable widget
│   ├── src/
│   │   ├── NaradaWidget.tsx
│   │   ├── components/
│   │   └── embed.ts       # Script injection logic
│   └── vite.config.ts
├── shared/
│   └── schema.ts          # Shared TypeScript types
└── design_guidelines.md   # Design system documentation
```

## Recent Changes
- 2024-01-25: Initial project setup with schema definition
- Configured Inter and JetBrains Mono fonts
- Defined complete database schema for all MVP features
- Set up dual design system (Dashboard + Widget)
