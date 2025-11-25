# Narada AI Design Guidelines

## Design Approach

**Dual Design Strategy:**
- **Dashboard (Control Plane)**: Material Design-inspired system for productivity and data density
- **Widget (Runtime)**: Custom, welcoming design inspired by Intercom + Linear's clarity

**Core Principle**: Dashboard prioritizes efficiency; Widget prioritizes approachability and trust.

---

## Typography System

**Dashboard:**
- Headings: Inter 600/700 (24px, 20px, 16px)
- Body: Inter 400 (14px, 13px)
- Data/Code: JetBrains Mono 400 (13px)

**Widget:**
- Avatar name: Inter 600 (12px)
- Speech bubble: Inter 400 (15px)
- Tooltips: Inter 500 (14px)

---

## Layout & Spacing

**Tailwind Unit System**: 2, 4, 6, 8, 12, 16, 24
- Tight spacing: p-2, gap-2 (8px)
- Standard: p-4, gap-4 (16px), p-6 (24px)
- Generous: p-8, gap-8 (32px), p-12 (48px)
- Section: py-16, py-24 (64px, 96px)

**Dashboard Grid**: 12-column responsive grid (grid-cols-12)
**Widget**: Fixed positioning with z-index layering

---

## Component Library

### Dashboard Components

**Navigation:**
- Side navigation (w-64, fixed left)
- Top bar with agent selector + user menu (h-16)
- Breadcrumb trail below top bar (h-12)

**Data Tables:**
- Striped rows with hover states
- Sortable headers
- Inline actions (kebab menu)
- Pagination footer

**Forms:**
- Grouped sections with cards (p-6, rounded-lg)
- Label above input pattern (gap-2)
- Helper text below inputs (text-sm)
- Required field indicators
- Multi-column layouts for related fields (grid-cols-2 gap-4)

**Cards:**
- Analytics cards: 3-column grid (grid-cols-1 md:grid-cols-3 gap-6)
- Metric display: Large number (text-3xl font-bold) + label (text-sm) + trend indicator
- Event tag cards: Icon + label + selector preview + edit button
- Flow cards: Thumbnail preview + title + step count + status badge

**Preview Sandbox:**
- Split view: Configuration left (w-1/3) + Live preview right (w-2/3)
- Preview container mimics embedded context with mock website chrome

### Widget Components

**Floating Avatar:**
- Fixed bottom-right: bottom-6 right-6
- Circular container: w-14 h-14 rounded-full
- Pulse animation on idle (ring-2 ring-offset-2)
- Microphone icon or AI persona image inside

**Chat Interface:**
- Expands above avatar when activated
- Container: w-96 max-h-96 rounded-2xl shadow-2xl
- Speech bubbles: rounded-2xl p-4 mb-3
- User bubbles: max-w-[80%] ml-auto
- AI bubbles: max-w-[85%] mr-auto
- Typing indicator: 3 animated dots
- Voice waveform during speaking (animated bars)

**Joyride Highlights:**
- Overlay: backdrop with blur (backdrop-blur-sm)
- Highlighted element: ring-4 rounded-lg with elevated z-index
- Tooltip card: rounded-xl shadow-xl p-4 with arrow pointer
- Navigation: Previous/Next buttons (px-4 py-2 rounded-lg) + Step counter (e.g., "2 of 5")

**Lead Form:**
- Slides in from bottom: transform transition
- Container: p-6 rounded-t-2xl
- Input fields: Single column stack (space-y-4)
- Submit button: Full width (w-full py-3 rounded-lg)

---

## Dashboard Page Layouts

**Agent Settings Page:**
- Page header: Agent name (text-2xl font-bold) + Status badge + Action buttons (gap-3)
- Content: 2-column grid (lg:grid-cols-3 gap-6)
  - Left: Agent config form (col-span-2)
  - Right: Preview card + Embed code snippet (col-span-1)

**Knowledge Base:**
- Search bar at top (w-full max-w-2xl)
- Q&A pairs in accordion list (space-y-2)
- Add button: Floating bottom-right (bottom-8 right-8)
- Empty state: Centered illustration + CTA

**Event Tags:**
- Filter bar: Event type dropdown + Search (flex gap-4)
- Grid display: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4
- Each card shows: Tag icon + Label + Selector + Event type badge + Edit/Delete

**Flows & Steps:**
- Left sidebar: Flow list (w-72)
- Main area: Step builder canvas
- Step cards: Draggable, numbered, connected with lines
- Each step shows: Order badge + Title + Selector + Voice script preview

**Analytics:**
- Hero metrics: 4-column grid (grid-cols-4 gap-6)
- Charts row: 2-column (grid-cols-2 gap-6)
- Recent conversations table: Full width below
- Export button: Top-right corner

---

## Images

**Dashboard:**
- Empty states: Centered illustrations (w-64 h-64) for Knowledge/Flows/Tags when empty
- Agent persona: Avatar upload with circular crop (w-24 h-24)
- No hero images needed

**Widget:**
- AI Avatar image: Circular, professional AI/assistant visual (48x48px)
- Optional: Background pattern in chat interface header (subtle, non-distracting)

---

## Accessibility

- All interactive elements: min-h-11 (44px touch target)
- Focus indicators: ring-2 ring-offset-2 on all focusable elements
- Form labels: Explicit for/id associations
- ARIA labels on icon-only buttons
- Keyboard navigation: Tab order logical, Escape to close modals/widget
- Screen reader announcements for AI responses and flow transitions

---

## Animations (Minimal)

**Dashboard:**
- Page transitions: None (instant)
- Modal entry: Fade + scale (duration-200)
- Toast notifications: Slide from top (duration-300)

**Widget:**
- Avatar pulse: Continuous subtle (duration-1000)
- Chat expand/collapse: Transform + opacity (duration-300)
- Speech bubble entry: Slide up + fade (duration-200)
- Typing indicator: Dots bounce (stagger 100ms)
- Voice waveform: Bars oscillate based on audio amplitude