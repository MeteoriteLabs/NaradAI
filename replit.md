# Narada AI - Voice-Guided Website Experience Platform

## Overview
Narada AI is a platform offering a voice-based website guide that enhances user experience by understanding behavior, processing speech, analyzing page context, and providing guidance through contextual AI, UI highlights, and voice narration. It's embeddable with a single script, aiming to transform digital journeys for website visitors.

## User Preferences
No specific user preferences were provided in the original `replit.md` file.

## System Architecture

### Two-Part System
The platform consists of a **Control Plane (Dashboard)**, a React TypeScript web application for businesses to configure AI voice agents, manage knowledge bases, define event tags, create guided journeys, and view analytics. The second part is a **Runtime Widget (Embeddable Snippet)**, a lightweight script that can be embedded on any website to provide the voice-guided experience.

### Widget Architecture
The widget uses `embed.js` as a lightweight loader for the main `widget.js` React bundle, which includes all design and voice features. It tracks user events (view, click, scroll, custom), handles voice input/output via OpenAI TTS/Whisper API, communicates with the backend via WebSocket for real-time interaction, and runs guided tours using React Joyride. It supports three widget designs: VoiceBar, FloatingBubble, and CornerCard, and includes lead capture forms and dynamic design based on agent configuration.

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, Tailwind CSS + Shadcn UI for styling, React Hook Form with Zod for forms, TanStack Query for data fetching, React Joyride for guided tours, and Vite for building.
- **Backend**: Node.js with Express.js for REST API and WebSocket, PostgreSQL with Drizzle ORM, OpenAI Realtime API for voice AI (speech-to-text, text-to-speech, function calling), `ws` library for WebSocket, Zod schemas for validation, and Google OAuth 2.0 for authentication.

### Database Schema
Key entities include `users`, `sessions`, `agents` (AI voice agent configurations), `knowledge_items` (Q&A), `event_tags` (tracking), `flows` (guided journeys), `steps` (flow steps), `leads` (captured info), and `conversations` (transcripts, analytics).

### UI/UX Decisions
- **Dual Design Strategy**: The Dashboard follows a Material Design-inspired aesthetic for productivity, while the Widget is inspired by Intercom/Linear for approachability.
- **Typography**: Inter for primary text, JetBrains Mono for code/data.
- **Colors**: Deep blue primary, light blue-gray accent, neutral grays for backgrounds.
- **Responsive Design**: UI elements like agent cards and tab sections are designed to adapt to various screen sizes.

### Feature Specifications
- **MVP Features**: Agent creation/management, knowledge base Q&A, event tagging, journey builder, embeddable widget, real-time WebSocket communication, OpenAI voice pipeline, context-aware AI, floating voice avatar with chat UI, lead capture forms, analytics dashboard, and Shadow DOM widget isolation.
- **Core API Routes**: REST endpoints for managing agents, knowledge, tags, flows, leads, and analytics, along with public widget endpoints for `embed.js`, `widget.js`, and public agent configuration. A WebSocket endpoint (`/ws`) handles real-time voice interaction.

## External Dependencies
- **OpenAI Realtime API**: Used for speech-to-text, text-to-speech, and function calling for voice AI capabilities.
- **PostgreSQL**: The primary database for storing all application data.
- **Google OAuth 2.0**: Utilized for user authentication and authorization.
- **React Joyride**: Integrated for building and displaying guided tours within the widget.
- **Tailwind CSS & Shadcn UI**: Frontend styling and UI component library.