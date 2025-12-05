# Narada AI - Voice-Guided Website Experience Platform

Narada AI is a voice-based website guide that understands user behavior, listens to speech, reads page context, and guides visitors through digital journeys using contextual AI, UI highlights, and voice narration. It's embeddable on any website with a single script tag.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Prerequisites](#prerequisites)
5. [Environment Variables](#environment-variables)
6. [Local Development Setup](#local-development-setup)
7. [Database Setup](#database-setup)
8. [Google OAuth Setup](#google-oauth-setup)
9. [Running the Application](#running-the-application)
10. [Building for Production](#building-for-production)
11. [AWS Deployment Guide](#aws-deployment-guide)
12. [Widget Embedding](#widget-embedding)
13. [API Reference](#api-reference)
14. [Package Dependencies](#package-dependencies)

---

## Overview

Narada AI consists of two parts:

### 1. Control Plane (Dashboard)
A React TypeScript web application where businesses can:
- Create and manage AI voice agents with custom personas
- Build knowledge bases (Q&A pairs)
- Define event tags to track user interactions
- Create guided flows/journeys with visual highlights
- Configure voice styles
- Generate embed snippets
- View analytics, transcripts, and captured leads

### 2. Runtime Widget (Embeddable Snippet)
A lightweight JavaScript widget for any website:
```html
<script src="https://your-domain.com/embed.js" data-agent-id="your_agent_id" async></script>
```

The widget features:
- Event tracking (view, click, scroll, custom events)
- Voice input/output via OpenAI Realtime API
- WebSocket connection to backend
- Guided tours with Joyride integration
- Floating voice avatar with chat UI
- Lead capture forms
- Shadow DOM isolation for style encapsulation

---

## Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript** | Type safety |
| **Vite** | Build tool & dev server |
| **Wouter** | Client-side routing |
| **TanStack Query (React Query)** | Server state management & caching |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |
| **Shadcn/UI** | Component library (Radix primitives + Tailwind) |
| **Tailwind CSS** | Utility-first styling |
| **Framer Motion** | Animations |
| **React Joyride** | Guided tours/walkthroughs |
| **Recharts** | Analytics charts |
| **Lucide React** | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js 20+** | Runtime environment |
| **Express.js** | Web framework |
| **TypeScript** | Type safety |
| **express-session** | Session management |
| **connect-pg-simple** | PostgreSQL session store |
| **openid-client** | Google OAuth 2.0 / OIDC |
| **ws** | WebSocket server |
| **OpenAI SDK** | AI/LLM integration |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary database |
| **Drizzle ORM** | Type-safe ORM |
| **drizzle-zod** | Zod schema generation from Drizzle |
| **drizzle-kit** | Database migrations |

### Build Tools
| Technology | Purpose |
|------------|---------|
| **Vite** | Frontend bundling |
| **esbuild** | Server bundling |
| **tsx** | TypeScript execution for development |

---

## Project Structure

```
narada-ai/
├── client/                     # Frontend React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Shadcn UI components
│   │   │   ├── agent-sections/ # Agent detail section components
│   │   │   │   ├── shared/     # Reusable section helpers
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── useAgentResource.ts
│   │   │   │   │   ├── ResourceList.tsx
│   │   │   │   │   └── CreateDialog.tsx
│   │   │   │   ├── knowledge-section.tsx
│   │   │   │   ├── event-tags-section.tsx
│   │   │   │   ├── flows-section.tsx
│   │   │   │   └── analytics-section.tsx
│   │   │   └── app-sidebar.tsx # Navigation sidebar
│   │   ├── widget/             # Embeddable widget components
│   │   │   ├── core/           # Shared widget infrastructure
│   │   │   │   ├── types.ts    # Widget types
│   │   │   │   ├── useVoiceAgent.ts # Core voice agent hook
│   │   │   │   └── components.tsx # Reusable UI primitives
│   │   │   ├── VoiceBar.tsx    # Voice bar widget design
│   │   │   ├── FloatingBubble.tsx # Floating bubble design
│   │   │   ├── CornerCard.tsx  # Corner card design
│   │   │   ├── Widget.tsx      # Main widget component
│   │   │   ├── LeadForm.tsx    # Lead capture form
│   │   │   └── JoyrideFlowWrapper.tsx # Guided tour wrapper
│   │   ├── pages/              # Route pages
│   │   │   ├── landing.tsx     # Public landing page
│   │   │   ├── onboarding.tsx  # User onboarding wizard
│   │   │   ├── agents.tsx      # Agent cards grid
│   │   │   ├── agent-detail.tsx# Agent configuration
│   │   │   ├── leads.tsx       # Leads management
│   │   │   └── docs.tsx        # Developer documentation
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities & query client
│   │   └── App.tsx             # Main app with routing
│   └── index.html
├── server/                     # Backend Express application
│   ├── index-dev.ts            # Development server entry
│   ├── index-prod.ts           # Production server entry
│   ├── routes.ts               # API route handlers
│   ├── storage.ts              # Database storage interface (Drizzle)
│   ├── googleAuth.ts           # Google OAuth authentication
│   ├── websocket.ts            # WebSocket handler for voice AI
│   └── vite.ts                 # Vite dev middleware
├── shared/
│   └── schema.ts               # Shared TypeScript types & Drizzle schema
├── drizzle.config.ts           # Drizzle ORM configuration
├── vite.config.ts              # Vite configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

---

## Prerequisites

Before setting up the project, ensure you have:

- **Node.js** v20.x or higher
- **npm** v10.x or higher (comes with Node.js)
- **PostgreSQL** v14+ (local installation or cloud service)
- **Google Cloud Console** account (for OAuth)
- **OpenAI API** account (for AI features)

---

## Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/narada_db

# Individual PostgreSQL connection details (optional, for some tools)
PGHOST=localhost
PGPORT=5432
PGUSER=username
PGPASSWORD=password
PGDATABASE=narada_db

# Session
SESSION_SECRET=your-super-secret-session-key-min-32-chars

# Google OAuth 2.0
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key

# Environment
NODE_ENV=development
```

### Environment Variable Descriptions

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret key for session encryption (min 32 characters) |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth 2.0 Client ID |
| `GOOGLE_CLIENT_SECRET` | Yes | Google OAuth 2.0 Client Secret |
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI features |
| `NODE_ENV` | No | Set to `production` for production builds |

---

## Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/narada-ai.git
cd narada-ai
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Set Up PostgreSQL Database

#### Option A: Local PostgreSQL

1. Install PostgreSQL on your system
2. Create a new database:

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE narada_db;

# Create user (optional)
CREATE USER narada_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE narada_db TO narada_user;

# Exit
\q
```

3. Update your `.env` file:
```env
DATABASE_URL=postgresql://narada_user:your_password@localhost:5432/narada_db
```

#### Option B: Using Docker

```bash
docker run --name narada-postgres \
  -e POSTGRES_USER=narada_user \
  -e POSTGRES_PASSWORD=your_password \
  -e POSTGRES_DB=narada_db \
  -p 5432:5432 \
  -d postgres:15
```

#### Option C: Cloud PostgreSQL (Neon, Supabase, AWS RDS)

Use the connection string provided by your cloud provider.

### Step 4: Configure Environment Variables

```bash
# Copy example environment file
cp .env.example .env

# Edit with your values
nano .env  # or use your preferred editor
```

### Step 5: Push Database Schema

```bash
npm run db:push
```

This creates all required tables in your PostgreSQL database.

### Step 6: Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

---

## Database Setup

### Database Schema

The application uses the following tables:

| Table | Description |
|-------|-------------|
| `sessions` | User sessions (managed by connect-pg-simple) |
| `users` | User accounts with profile and onboarding data |
| `agents` | AI voice agent configurations |
| `knowledge_items` | Q&A knowledge base entries |
| `event_tags` | Page elements/sections to track |
| `flows` | Guided journey definitions |
| `steps` | Individual steps within flows |
| `leads` | Captured visitor information |
| `conversations` | Chat transcripts and analytics |

### Database Commands

```bash
# Push schema changes to database
npm run db:push

# Generate migrations (if needed)
npm run db:generate

# Open Drizzle Studio (database GUI)
npm run db:studio
```

### Connecting to Database Locally

```bash
# Using psql
psql $DATABASE_URL

# Or with individual params
psql -h localhost -U narada_user -d narada_db
```

---

## Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** > **Credentials**

### Step 2: Configure OAuth Consent Screen

1. Go to **OAuth consent screen**
2. Select **External** user type
3. Fill in app information:
   - App name: `Narada AI`
   - User support email: Your email
   - Developer contact: Your email
4. Add scopes: `email`, `profile`, `openid`
5. Add test users if in testing mode

### Step 3: Create OAuth 2.0 Credentials

1. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client IDs**
2. Application type: **Web application**
3. Name: `Narada AI Web Client`
4. **Authorized JavaScript origins**:
   - `http://localhost:5000` (development)
   - `https://your-domain.com` (production)
5. **Authorized redirect URIs**:
   - `http://localhost:5000/api/callback` (development)
   - `https://your-domain.com/api/callback` (production)
6. Click **Create** and copy the Client ID and Client Secret

### Step 4: Update Environment Variables

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts:
- Express backend server
- Vite development server with HMR
- Both served on port 5000

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Drizzle Studio |
| `npm run check` | TypeScript type checking |

---

## Building for Production

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Build the application
npm run build
```

This creates:
- `dist/public/` - Compiled frontend assets
- `dist/index.js` - Bundled backend server

### Production Output

```
dist/
├── public/           # Static frontend files
│   ├── index.html
│   ├── assets/       # JS, CSS bundles
│   └── embed.js      # Widget bundle
└── index.js          # Backend server bundle
```

---

## AWS Deployment Guide

### Option 1: EC2 Deployment

#### Step 1: Launch EC2 Instance

1. Launch an EC2 instance (Ubuntu 22.04 LTS recommended)
2. Instance type: `t3.small` or larger
3. Configure security group:
   - SSH (22) from your IP
   - HTTP (80) from anywhere
   - HTTPS (443) from anywhere
   - Custom TCP (5000) for direct access (optional)

#### Step 2: Connect to Instance

```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

#### Step 3: Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install -y nginx
```

#### Step 4: Set Up PostgreSQL (RDS Recommended)

**Option A: AWS RDS (Recommended for production)**

1. Create RDS PostgreSQL instance in AWS Console
2. Configure security group to allow EC2 access
3. Note the endpoint URL

**Option B: Local PostgreSQL on EC2**

```bash
sudo apt install -y postgresql postgresql-contrib
sudo -u postgres createuser --interactive
sudo -u postgres createdb narada_db
```

#### Step 5: Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/narada-ai.git
cd narada-ai

# Install dependencies
npm install

# Create environment file
nano .env
# Add all required environment variables

# Push database schema
npm run db:push

# Build application
npm run build

# Start with PM2
pm2 start dist/index.js --name narada-ai
pm2 save
pm2 startup
```

#### Step 6: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/narada-ai
```

Add configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/narada-ai /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Set Up SSL with Let's Encrypt

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

#### Step 8: Update Google OAuth Redirect URI

In Google Cloud Console, add:
- `https://your-domain.com/api/callback`

### Option 2: AWS Elastic Beanstalk

#### Step 1: Install EB CLI

```bash
pip install awsebcli
```

#### Step 2: Initialize Elastic Beanstalk

```bash
cd narada-ai
eb init

# Select region
# Create new application: narada-ai
# Platform: Node.js 20
```

#### Step 3: Create Environment

```bash
eb create narada-production --database.engine postgres
```

#### Step 4: Configure Environment Variables

```bash
eb setenv \
  DATABASE_URL=your-rds-url \
  SESSION_SECRET=your-secret \
  GOOGLE_CLIENT_ID=your-client-id \
  GOOGLE_CLIENT_SECRET=your-client-secret \
  OPENAI_API_KEY=your-openai-key \
  NODE_ENV=production
```

#### Step 5: Deploy

```bash
eb deploy
```

### Option 3: AWS App Runner

1. Push code to GitHub/ECR
2. Create App Runner service in AWS Console
3. Connect to repository
4. Configure environment variables
5. Set port to 5000
6. Deploy

### AWS Architecture Diagram

```
                    ┌─────────────────┐
                    │   Route 53      │
                    │   (DNS)         │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   CloudFront    │
                    │   (CDN/SSL)     │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │   ALB/Nginx     │
                    │   (Load Balancer)│
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
     ┌────────▼────┐  ┌──────▼─────┐  ┌─────▼──────┐
     │   EC2/ECS   │  │  EC2/ECS   │  │  EC2/ECS   │
     │  (Node.js)  │  │  (Node.js) │  │  (Node.js) │
     └──────┬──────┘  └──────┬─────┘  └──────┬─────┘
            │                │               │
            └────────────────┼───────────────┘
                             │
                    ┌────────▼────────┐
                    │   RDS PostgreSQL│
                    │   (Database)    │
                    └─────────────────┘
```

---

## Widget Embedding

### Basic Integration

Add this script to any website:

```html
<script 
  src="https://your-domain.com/embed.js" 
  data-agent-id="your-agent-id" 
  async>
</script>
```

### Configuration Options

```html
<script 
  src="https://your-domain.com/embed.js" 
  data-agent-id="narada_abc123"
  data-position="bottom-right"
  data-theme="auto"
  async>
</script>
```

### Widget Features

- **Voice Input**: Speak to the AI assistant
- **Voice Output**: AI responds with voice
- **Event Tracking**: Tracks configured page elements
- **Guided Tours**: Highlights elements with tooltips
- **Lead Capture**: Collects visitor information
- **Shadow DOM**: Styles isolated from host page

### Widget Design System

The widget supports three visual designs, configurable per agent:

| Design | Description |
|--------|-------------|
| **Voice Bar** | A sleek horizontal bar with mic button, animated waveforms, and transcript display. Great for conversational interfaces. |
| **Floating Bubble** | A compact circular button that expands into a chat panel. Minimal footprint. |
| **Corner Card** | A card-style interface with visible avatar and chat history. More prominent presence. |

All designs share a core infrastructure:

#### Core Components (`client/src/widget/core/`)
- `types.ts` - Shared TypeScript interfaces for widget state
- `useVoiceAgent.ts` - Central hook for WebSocket, recording, TTS, transcript handling
- `components.tsx` - Reusable UI primitives (MicButton, StatusIndicator, Waveform, TranscriptBubble)

#### Shared Primitives
- **MicButton**: Animated microphone button with pulse/recording states
- **StatusIndicator**: Connection/listening/processing status display
- **Waveform**: Audio visualization bars
- **TranscriptBubble**: Chat message display component

---

## API Reference

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/login` | Initiate Google OAuth login |
| GET | `/api/callback` | OAuth callback handler |
| GET | `/api/logout` | Logout user |
| GET | `/api/auth/user` | Get current user |
| POST | `/api/auth/onboarding` | Complete onboarding |

### Agent Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List user's agents |
| POST | `/api/agents` | Create new agent |
| GET | `/api/agents/:id` | Get agent details |
| PATCH | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |

### Knowledge Base Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/:id/knowledge` | List knowledge items |
| POST | `/api/agents/:id/knowledge` | Add knowledge item |
| DELETE | `/api/knowledge/:id` | Delete knowledge item |

### Event Tags Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/:id/tags` | List event tags |
| POST | `/api/agents/:id/tags` | Create event tag |
| DELETE | `/api/tags/:id` | Delete event tag |

### Flows & Steps Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/:id/flows` | List flows |
| POST | `/api/agents/:id/flows` | Create flow |
| GET | `/api/flows/:id/steps` | List flow steps |
| POST | `/api/flows/:id/steps` | Add flow step |

### Leads & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents/:id/leads` | List captured leads |
| POST | `/api/agents/:id/leads` | Capture new lead |
| GET | `/api/agents/:id/analytics` | Get analytics data |

### WebSocket

| Endpoint | Description |
|----------|-------------|
| `wss://your-domain.com/ws` | Real-time voice communication |

---

## Package Dependencies

### Production Dependencies

```json
{
  "express": "^4.21.2",
  "express-session": "^1.18.1",
  "connect-pg-simple": "^10.0.0",
  "drizzle-orm": "^0.39.1",
  "drizzle-zod": "^0.7.0",
  "openid-client": "^6.8.1",
  "passport": "^0.7.0",
  "openai": "^6.9.1",
  "ws": "^8.18.0",
  "zod": "^3.24.2",
  "memoizee": "^0.4.17",
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "wouter": "^3.3.5",
  "@tanstack/react-query": "^5.60.5",
  "react-hook-form": "^7.55.0",
  "@hookform/resolvers": "^3.x",
  "react-joyride": "^2.9.3",
  "recharts": "^2.15.2",
  "framer-motion": "^11.13.1",
  "lucide-react": "^0.453.0",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0",
  "date-fns": "^3.6.0"
}
```

### Development Dependencies

```json
{
  "typescript": "5.6.3",
  "vite": "^5.4.20",
  "@vitejs/plugin-react": "^4.7.0",
  "drizzle-kit": "^0.31.4",
  "esbuild": "^0.25.0",
  "tsx": "^4.20.5",
  "tailwindcss": "^3.4.17",
  "autoprefixer": "^10.4.20",
  "postcss": "^8.4.47",
  "@types/node": "20.16.11",
  "@types/express": "4.17.21",
  "@types/express-session": "^1.18.0",
  "@types/ws": "^8.5.13",
  "@types/react": "^18.3.11",
  "@types/react-dom": "^18.3.1"
}
```

### Shadcn/UI Components (Radix)

```json
{
  "@radix-ui/react-accordion": "^1.2.4",
  "@radix-ui/react-alert-dialog": "^1.1.7",
  "@radix-ui/react-avatar": "^1.1.4",
  "@radix-ui/react-checkbox": "^1.1.5",
  "@radix-ui/react-dialog": "^1.1.7",
  "@radix-ui/react-dropdown-menu": "^2.1.7",
  "@radix-ui/react-label": "^2.1.3",
  "@radix-ui/react-popover": "^1.1.7",
  "@radix-ui/react-progress": "^1.1.3",
  "@radix-ui/react-scroll-area": "^1.2.4",
  "@radix-ui/react-select": "^2.1.7",
  "@radix-ui/react-separator": "^1.1.3",
  "@radix-ui/react-slider": "^1.2.4",
  "@radix-ui/react-switch": "^1.1.4",
  "@radix-ui/react-tabs": "^1.1.4",
  "@radix-ui/react-toast": "^1.2.7",
  "@radix-ui/react-tooltip": "^1.2.0"
}
```

---

## Voice Agent System Architecture

This section provides a detailed technical explanation of how the voice agent system works end-to-end.

### System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL WEBSITE                                    │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │  <script src="https://narada.ai/embed.js" data-agent-id="abc123">       │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         NARADA WIDGET (Shadow DOM)                       │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │    │
│  │  │ Floating     │  │ Chat         │  │ Lead         │  │ Joyride     │  │    │
│  │  │ Avatar       │  │ Interface    │  │ Form         │  │ Tours       │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
                                       │
                    WebSocket (wss://) │ REST API (https://)
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              NARADA BACKEND                                      │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         WebSocket Server (/ws)                           │    │
│  │  • Message Handler (text/audio)                                          │    │
│  │  • OpenAI Integration (GPT-3.5 + Whisper)                                │    │
│  │  • Function Calling (start_flow, capture_lead)                           │    │
│  │  • Conversation Memory                                                   │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
│                                      │                                           │
│                                      ▼                                           │
│  ┌─────────────────────────────────────────────────────────────────────────┐    │
│  │                         PostgreSQL Database                              │    │
│  │  agents │ knowledge_items │ flows │ steps │ leads │ conversations        │    │
│  └─────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Component Details

#### 1. Embed Script (`client/embed/embed.ts`)

The embed script is the entry point for the widget. When loaded on any website:

```javascript
// How it works:
1. Reads `data-agent-id` from script tag
2. Creates Shadow DOM container for style isolation
3. Loads widget.js and widget.css bundles
4. Initializes WebSocket connection
5. Sets up event tracking (IntersectionObserver for visibility, click listeners)
6. Mounts the React widget component
```

**Key Features:**
- **Shadow DOM Isolation**: Widget styles don't leak into host page
- **Dynamic WebSocket URL**: Computes ws/wss based on protocol
- **Event Tracking**: Observes elements with `data-event-tag` attribute

```html
<!-- Example Usage -->
<script 
  src="https://your-domain.com/embed.js" 
  data-agent-id="agent_abc123"
  data-api-base="https://api.narada.ai"
  async>
</script>
```

#### 2. Widget Component (`client/src/widget/Widget.tsx`)

The main React component that orchestrates all widget functionality:

```typescript
// State Management
- isChatOpen: boolean      // Chat panel visibility
- isLeadFormOpen: boolean  // Lead form visibility
- isRecording: boolean     // Voice recording state
- messages: Message[]      // Chat history
- isConnected: boolean     // WebSocket connection status
- joyrideSteps: Step[]     // Current guided tour steps
- runJoyride: boolean      // Tour active state
```

**Lifecycle:**
1. Fetch agent data via REST API
2. Establish WebSocket connection
3. Send `init` message with context (URL, user agent)
4. Receive greeting from agent
5. Handle user interactions (text, voice, flows)

#### 3. Floating Avatar (`client/src/widget/FloatingAvatar.tsx`)

The persistent UI element visible on all pages:

- **Collapsed State**: Shows chat bubble icon with hover tooltip
- **Expanded State**: Shows close button + microphone button
- **Recording State**: Microphone turns red, records audio

```typescript
// Voice Recording Flow
1. User clicks mic button → getUserMedia() for audio access
2. MediaRecorder captures audio chunks
3. After 10 seconds (or stop), creates Blob
4. Converts to base64 and sends via WebSocket
```

#### 4. Chat Interface (`client/src/widget/ChatInterface.tsx`)

Real-time chat UI with:
- Message history with timestamps
- User/assistant message bubbles
- Connection status indicator
- Text input with send button

#### 5. Lead Form (`client/src/widget/LeadForm.tsx`)

Captures visitor contact information:
- Name (required)
- Email (required)
- Phone (optional)
- Message/Notes (optional)

Triggered when AI calls `capture_lead()` function.

#### 6. Joyride Flow Wrapper (`client/src/widget/JoyrideFlowWrapper.tsx`)

Integrates React Joyride for guided tours:
- Receives steps from WebSocket `start_flow` message
- Highlights page elements with tooltips
- Reports step completion back to server
- Styled to match Narada branding

---

### WebSocket Protocol

#### Connection Flow

```
Client                                          Server
  │                                               │
  │──────── WebSocket Connect (/ws) ─────────────▶│
  │                                               │
  │──────── { type: "init", agentId, context } ──▶│
  │                                               │
  │◀─────── { type: "connected", agent } ─────────│
  │                                               │
  │◀─────── { type: "message", content } ─────────│ (greeting)
  │                                               │
```

#### Message Types

| Type | Direction | Payload | Description |
|------|-----------|---------|-------------|
| `init` | Client → Server | `{ agentId, context: { url, userAgent } }` | Initialize session |
| `connected` | Server → Client | `{ agent: { id, name } }` | Connection confirmed |
| `message` | Bidirectional | `{ content: string }` | Text message |
| `audio` | Client → Server | `{ audioData: base64 }` | Voice input |
| `transcription` | Server → Client | `{ text: string }` | Speech-to-text result |
| `start_flow` | Server → Client | `{ flowId, flowName, steps[] }` | Trigger guided tour |
| `capture_lead` | Server → Client | `{}` | Show lead form |
| `lead_captured` | Client → Server | `{ leadData: { name, email, phone, notes } }` | Submit lead |
| `lead_captured_success` | Server → Client | `{}` | Lead saved confirmation |
| `step_completed` | Client → Server | `{ stepIndex }` | Tour step finished |
| `error` | Server → Client | `{ message }` | Error occurred |

---

### AI Processing Pipeline

#### 1. System Prompt Construction

When a session starts, the server builds a dynamic system prompt:

```typescript
function buildSystemPrompt(agent, knowledge, flows, context) {
  let prompt = `You are ${agent.name}, an AI assistant.`;
  
  // Add persona
  if (agent.persona) {
    prompt += `\nPersona: ${agent.persona}`;
  }
  
  // Inject knowledge base
  if (knowledge.length > 0) {
    prompt += `\nKnowledge Base:\n`;
    knowledge.forEach(item => {
      prompt += `Q: ${item.question}\nA: ${item.answer}\n`;
    });
  }
  
  // List available flows
  if (flows.length > 0) {
    prompt += `\nAvailable Guided Tours:\n`;
    flows.forEach(flow => {
      prompt += `- ${flow.name}: ${flow.pageUrl}\n`;
    });
  }
  
  // Add context
  if (context?.url) {
    prompt += `\nUser is on: ${context.url}`;
  }
  
  // Define available functions
  prompt += `\nYou have access to:
  - start_flow(flow_name): Start a guided tour
  - capture_lead(): Capture contact information`;
  
  return prompt;
}
```

#### 2. OpenAI Function Calling

The AI can trigger actions via function calls:

```typescript
// Available Functions
const tools = [
  {
    type: "function",
    function: {
      name: "start_flow",
      description: "Start a guided product tour",
      parameters: {
        type: "object",
        properties: {
          flow_name: { type: "string" }
        },
        required: ["flow_name"]
      }
    }
  },
  {
    type: "function", 
    function: {
      name: "capture_lead",
      description: "Capture user contact information",
      parameters: { type: "object", properties: {} }
    }
  }
];
```

#### 3. Tool Execution Loop

```typescript
async function processOpenAIResponse(ws, flows, agent) {
  while (true) {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125",
      messages: ws.conversationHistory,
      tools: tools,
      tool_choice: "auto"
    });
    
    const response = completion.choices[0].message;
    
    if (response.tool_calls) {
      // Execute each function call
      for (const call of response.tool_calls) {
        const result = await executeFunctionCall(ws, call, flows);
        // Add result to conversation
        ws.conversationHistory.push({
          role: "tool",
          tool_call_id: call.id,
          content: JSON.stringify(result)
        });
      }
      continue; // Loop for follow-up response
    } else {
      // Send text response to client
      ws.send(JSON.stringify({ type: "message", content: response.content }));
      break;
    }
  }
}
```

#### 4. Voice Processing

```typescript
async function handleAudioMessage(ws, message) {
  // 1. Decode base64 audio
  const audioBuffer = Buffer.from(message.audioData, "base64");
  
  // 2. Transcribe with Whisper
  const transcription = await openai.audio.transcriptions.create({
    file: await toFile(audioBuffer, "audio.webm"),
    model: "whisper-1"
  });
  
  // 3. Send transcription to client
  ws.send(JSON.stringify({ 
    type: "transcription", 
    text: transcription.text 
  }));
  
  // 4. Process as text message
  await handleChatMessage(ws, { content: transcription.text });
}
```

---

### Guided Flows (Joyride) System

#### Flow Configuration

Flows are configured in the dashboard with:

| Field | Description |
|-------|-------------|
| `name` | Flow identifier (e.g., "Product Tour") |
| `pageUrl` | URL pattern where flow applies |
| `steps[]` | Ordered list of tour steps |

Each step contains:

| Field | Description |
|-------|-------------|
| `selector` | CSS selector for target element |
| `title` | Step heading |
| `tooltipText` | Detailed description |
| `voiceScript` | Text for TTS (future) |
| `order` | Step sequence number |

#### Triggering a Flow

1. **AI Decides**: Based on conversation context, AI calls `start_flow("Product Tour")`
2. **Server Processes**: Fetches flow + steps from database
3. **WebSocket Message**: Sends `start_flow` with complete step data
4. **Widget Receives**: Transforms steps to Joyride format
5. **Tour Starts**: Joyride highlights elements sequentially

```typescript
// Server sends:
{
  type: "start_flow",
  flowId: "flow_123",
  flowName: "Product Tour",
  steps: [
    {
      id: "step_1",
      selector: "#signup-button",
      title: "Sign Up",
      tooltip_text: "Click here to create your account",
      voice_script: "First, let's create your account..."
    },
    // ... more steps
  ]
}

// Widget transforms to Joyride format:
const joyrideSteps = steps.map((step, index) => ({
  target: step.selector,
  content: step.tooltip_text,
  title: step.title,
  placement: "auto",
  disableBeacon: index === 0
}));
```

---

### Event Tracking System

#### Dashboard Configuration

Event tags are configured per agent:

| Field | Description |
|-------|-------------|
| `label` | Human-readable name |
| `selector` | CSS selector or `data-event-tag` value |
| `eventType` | `view`, `click`, `scroll`, `custom` |
| `pagePattern` | URL pattern for matching |

#### Widget Tracking

```typescript
// Visibility tracking with IntersectionObserver
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const tag = entry.target.getAttribute('data-event-tag');
      console.log('[Narada] Element visible:', tag);
      // TODO: Send to backend via WebSocket
    }
  });
}, { threshold: 0.5 });

// Click tracking
document.addEventListener('click', (e) => {
  const tag = e.target.getAttribute('data-event-tag');
  if (tag) {
    console.log('[Narada] Element clicked:', tag);
    // TODO: Send to backend via WebSocket
  }
});
```

#### Adding Event Tags to Your Website

```html
<!-- Track when pricing section is viewed -->
<section id="pricing" data-event-tag="pricing-section">
  ...
</section>

<!-- Track CTA button clicks -->
<button data-event-tag="cta-signup">Sign Up Free</button>
```

---

### Lead Capture Flow

#### Sequence Diagram

```
User                Widget              Server              Database
  │                   │                   │                    │
  │ "I want to talk"  │                   │                    │
  │──────────────────▶│                   │                    │
  │                   │  { message }      │                    │
  │                   │──────────────────▶│                    │
  │                   │                   │ AI: capture_lead() │
  │                   │                   │────────────────────│
  │                   │ { capture_lead }  │                    │
  │                   │◀──────────────────│                    │
  │   Lead Form       │                   │                    │
  │◀──────────────────│                   │                    │
  │                   │                   │                    │
  │  Submit form      │                   │                    │
  │──────────────────▶│                   │                    │
  │                   │ { lead_captured } │                    │
  │                   │──────────────────▶│                    │
  │                   │                   │  INSERT lead       │
  │                   │                   │───────────────────▶│
  │                   │ { success }       │                    │
  │                   │◀──────────────────│                    │
  │  "Thank you!"     │                   │                    │
  │◀──────────────────│                   │                    │
```

---

### Database Schema Details

#### Core Tables

```sql
-- Agents: AI assistant configurations
CREATE TABLE agents (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR NOT NULL,        -- Owner (multi-tenant)
  name VARCHAR NOT NULL,
  persona TEXT,                     -- Personality description
  voice_style VARCHAR,              -- Voice configuration
  created_at TIMESTAMP DEFAULT NOW()
);

-- Knowledge Items: Q&A pairs for context
CREATE TABLE knowledge_items (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Event Tags: Trackable page elements
CREATE TABLE event_tags (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  label VARCHAR NOT NULL,
  selector VARCHAR NOT NULL,
  event_type VARCHAR NOT NULL,      -- view, click, scroll, custom
  page_pattern VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Flows: Guided tour definitions
CREATE TABLE flows (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  name VARCHAR NOT NULL,
  page_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Steps: Individual tour steps
CREATE TABLE steps (
  id SERIAL PRIMARY KEY,
  flow_id INTEGER REFERENCES flows(id),
  selector VARCHAR NOT NULL,
  title VARCHAR NOT NULL,
  tooltip_text TEXT,
  voice_script TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Leads: Captured visitor information
CREATE TABLE leads (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  name VARCHAR NOT NULL,
  email VARCHAR NOT NULL,
  phone VARCHAR,
  notes TEXT,
  source VARCHAR,                   -- Page URL where captured
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversations: Chat transcripts
CREATE TABLE conversations (
  id SERIAL PRIMARY KEY,
  agent_id INTEGER REFERENCES agents(id),
  user_message TEXT,
  agent_response TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

### Agent Configuration Options

#### Persona

The persona field customizes the AI's personality:

```
Example: "You are a friendly sales assistant for a SaaS company. 
Be helpful, concise, and always try to understand the user's 
needs before suggesting solutions. Use casual but professional 
language."
```

#### Voice Style

The voice style field configures text-to-speech:

| Value | Description |
|-------|-------------|
| `alloy` | Neutral, balanced voice |
| `echo` | Warm, conversational |
| `fable` | Expressive, storytelling |
| `onyx` | Deep, authoritative |
| `nova` | Friendly, upbeat |
| `shimmer` | Clear, professional |

---

### Security Considerations

#### Current Implementation

- **Session-based auth**: Dashboard uses Google OAuth + PostgreSQL sessions
- **Multi-tenant isolation**: All queries filter by `userId`
- **WebSocket**: Agent ID provided by client (widget)

#### Production Recommendations

1. **Widget Authentication**
   ```typescript
   // Generate signed tokens for widgets
   const widgetToken = jwt.sign({ agentId }, SECRET, { expiresIn: '24h' });
   ```

2. **Rate Limiting**
   ```typescript
   // Limit messages per connection
   const rateLimiter = new RateLimiter({ max: 100, windowMs: 60000 });
   ```

3. **Input Validation**
   ```typescript
   // Validate all WebSocket messages
   const schema = z.object({
     type: z.enum(['init', 'message', 'audio']),
     content: z.string().max(4000).optional()
   });
   ```

---

## Troubleshooting

### Common Issues

#### Database Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Ensure PostgreSQL is running and DATABASE_URL is correct.

#### Google OAuth Redirect Mismatch
```
Error 400: redirect_uri_mismatch
```
**Solution**: Add the exact callback URL to Google Cloud Console authorized redirect URIs.

#### Session Not Persisting
**Solution**: Ensure SESSION_SECRET is set and cookies are configured correctly for your domain.

#### WebSocket Connection Failed
**Solution**: Ensure your reverse proxy (Nginx) is configured to handle WebSocket upgrades.

### Getting Help

- Check the logs: `pm2 logs narada-ai`
- Database issues: `npm run db:studio`
- Open an issue on GitHub

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

Built with by the Narada AI Team
