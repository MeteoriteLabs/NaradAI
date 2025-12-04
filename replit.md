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
- `POST /api/agents/:id/verify-installation` - Verify widget installation on external site

### WebSocket
- `/ws/agents/:agentId/sessions/:sessionId` - Real-time voice interaction

## Project Structure

```
narada-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   ├── agent-sections/ # Agent-scoped section components
│   │   │   │   ├── knowledge-section.tsx
│   │   │   │   ├── event-tags-section.tsx
│   │   │   │   ├── flows-section.tsx
│   │   │   │   └── analytics-section.tsx
│   │   │   └── app-sidebar.tsx # Navigation sidebar
│   │   ├── pages/
│   │   │   ├── agents.tsx      # Agent cards grid (main page)
│   │   │   ├── agent-detail.tsx # Agent detail with tabs
│   │   │   ├── leads.tsx       # Leads management
│   │   │   └── widget-demo.tsx # Widget preview
│   │   ├── lib/            # Utils, query client
│   │   └── App.tsx         # Main app with routing
│   └── index.html
├── server/                 # Express TypeScript backend
│   ├── routes.ts          # API route handlers
│   ├── storage.ts         # Database storage interface
│   ├── websocket.ts       # WebSocket handler for voice AI
│   └── index-dev.ts       # Development server entry
├── widget/                 # Embeddable widget
│   ├── NaradaWidget.tsx
│   └── embed.ts           # Script injection logic
├── shared/
│   └── schema.ts          # Shared TypeScript types
└── design_guidelines.md   # Design system documentation
```

## UI Architecture

### Navigation Routes
- `/` → Redirects to `/agents`
- `/agents` → Agent cards grid (main agents list)
- `/agents/:id` → Agent detail page with tabbed sections
- `/leads` → Leads management page
- `/docs` → Developer documentation with searchable content

### Agent Detail Tabs
The agent detail page (`/agents/:id`) uses a tabbed interface:
1. **Settings** - Agent name, persona, voice style configuration
2. **Knowledge** - Q&A pairs management
3. **Tags** - Event tracking tags (view, click, scroll, custom)
4. **Flows** - Guided tour steps with Joyride integration
5. **Analytics** - Conversation stats and recent interactions
6. **Embed** - Widget embed code + installation verification tool

### Responsive Design
- Agent cards: 1 column mobile, 2 tablet, 3-4 desktop
- Tab sections stack vertically on mobile
- Touch-friendly targets and spacing

## Recent Changes
- 2024-12-04: Self-hosted embed.js endpoint
  - Added `/embed.js` endpoint that serves the widget JavaScript
  - Widget no longer requires external CDN (cdn.narada.ai)
  - Embed code now uses app's own URL: `${origin}/embed.js`
  - Self-contained widget with Shadow DOM, chat UI, event tracking
- 2024-12-03: Widget installation verification feature
  - Added verification endpoint to check if widget is installed on external sites
  - Enhanced Embed tab with URL input and verification status display
  - Color-coded feedback (green=connected, yellow=partial, red=not found)
- 2024-12-03: Developer documentation page
  - Comprehensive docs at /docs with 8 sections
  - Searchable content with TOC sidebar
  - Code examples with copy-to-clipboard
  - Mobile-responsive accordion layout
- 2024-12-03: Major UI refactor - Card-based agent management
  - Renamed Dashboard to Agents with responsive card grid
  - Created dedicated agent detail page with tabbed sections
  - Extracted reusable agent-scoped section components
  - Simplified sidebar navigation (Agents, Leads, Documentation)
- WebSocket implementation with OpenAI tool-calling loop
- Embeddable widget with Shadow DOM isolation
- Initial project setup with schema definition
- Configured Inter and JetBrains Mono fonts
- Set up dual design system (Dashboard + Widget)
