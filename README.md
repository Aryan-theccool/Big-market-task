# Inkspace — Infinite Canvas Whiteboard

A production-ready Next.js 14 whiteboard app with a polished Apple-inspired design system, real-time collaboration via Y.js, and a premium SaaS landing page.

## Stack

- **Framework**: Next.js 14 App Router (`'use client'` components)
- **State**: Zustand (`canvasStore`, `boardsStore`)
- **Real-time**: Y.js + WebSocket (singleton provider per board ID)
- **Rendering**: Rough.js (hand-drawn shapes), Perfect-freehand (pen strokes)
- **Fonts**: Caveat (handwriting), Outfit (UI), Fira Code (mono)
- **Animations**: Framer Motion + CSS keyframes

---

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/boards` | Board dashboard + templates gallery |
| `/board/[id]` | Canvas editor |

---

## What's Built

### Landing Page (`/`)

**Navbar**
- Always-on frosted glass: `rgba(255,255,255,0.82)` + `backdrop-blur-xl`
- 56px height, violet-700 CTA with shadow, slate-100 nav link hover, scroll elevation

**Hero**
- Left-aligned headline + subtext (desktop), violet + blue blob backgrounds with `blur(120px)`
- Badge: white bg + `border-violet-200` with pulsing dot
- 72px headline `tracking:-0.03em`, "infinite space." in violet-600
- Start Creating: `shadow-lg` violet floating shadow; See features: white bg + border
- Canvas preview in macOS browser chrome (traffic lights `#FC615D #FDBC40 #34C749`)
- Stats row: 12k+ boards, 80ms sync, 4.9/5 rating

**Features Section** (animated, asymmetric layout — not a uniform card grid)
- Left-aligned heading: "Built for how you actually think."
- **Hero canvas card** (full-width 2-col): 5 floating sticky notes with individual rotation-preserving keyframes + 2 animated live cursors (Priya, James) drifting around
- **Dark sticky notes card**: `#18181B` background, 7 fanned note thumbnails at organic angles
- **Drawing card**: 3 SVG freehand paths that draw themselves on load via `stroke-dashoffset` animation
- **Row 3** (3 equal cards): Export (1×/2×/3× scale pills), Keyboard-first (kbd badge UI), Light & Dark (toggle)

**Canvas Showcase**
- Violet 6px dot bullets replacing checkmark icons
- 16px/600 titles, `#64748B` descriptions

**Templates Gallery**
- 10 template cards with unique SVG miniature whiteboard previews
- Hover: gradient overlay + "Use Template" pill CTA
- Cards: Startup Planning, System Design, DSA Flowchart, User Journey, Product Roadmap, Brainstorming, AI Workflow, Mobile Wireframe, Team Retrospective, Research Hub

**Final CTA**
- Font fixed to `font-weight:700 tracking:-0.03em`
- White button `text-violet-700` with `shadow-lg` lift on hover

---

### Board Editor (`/board/[id]`)

**Canvas**
- Infinite pan/zoom at 60fps, dot-grid background
- Multi-select with rubber-band selection box
- Snap-to-grid and snap-to-objects

**Elements**
- **Sticky notes**: 7 colors, Caveat font, folded corner, drag, resize, delete
- **Color picker**: Floats *above* selected note (not below), spring animation (`scale(0.9→1)` in 150ms), active swatch ring `box-shadow: 0 0 0 2px white, 0 0 0 4px #7C3AED`, hover `scale(1.25)`
- **Handwriting text**: Auto-expanding width via `white-space:pre` + `scrollWidth` measurement — no premature wrapping
- **Shapes**: Rough.js rect, circle, line, arrow with roughness control
- **Frame**: Rough.js dashed container (`roughness:0.6`, `strokeLineDash:[6,4]`), fill at 4% opacity, Caveat label at −28px above top-left corner
- **Freehand pen**: Perfect-freehand with pressure simulation
- **Image**: Drag-and-drop upload, flip H/V
- **Text**: Plain inline text element

**Left Tool Rail**: Select, Hand, Note, Text, Handwriting, Rect, Circle, Line, Arrow, Draw, Image, Frame, Export, Templates

**Header**: Editable board name, presence avatars, share, undo/redo, theme toggle

**Status Bar**
- Zoom: –, %, +, Fit
- Pill toggles (Grid / Snap / Map): all consistent — `bg-violet-100 text-violet-700 font-medium` when active
- Object count + selection count, undo/redo

**Minimap**: Scrollable viewport indicator

**Template Modal**: Blank + 10 templates with SVG previews, spring entrance, Shift+T shortcut

---

### Boards Dashboard (`/boards`)

- Sidebar: Boards (count) + Templates (10) tab navigation
- Board cards with name, element count, last-modified timestamp
- Empty state with "New Board" CTA
- **Templates tab**: 10 SVG-preview cards → clicking creates a pre-populated board (elements pre-seeded to localStorage before navigation)

---

## Global CSS

- `text-rendering: optimizeLegibility` on `*`
- `::selection { background: rgba(124,58,237,0.15) }` — violet text selection tint
- `button, a { transition: all 0.15s ease }` — universal smooth interactions
- Scrollbar: 6px, transparent track, `rgba(0,0,0,0.15)` thumb with dark-theme variant
- `@keyframes picker-spring` — color picker spring-in animation
- All primary buttons: `active:scale-[0.97]` — Apple press feel

---

## Keyboard Shortcuts

| Key | Action |
|---|---|
| `V` | Select |
| `H` | Hand / pan |
| `N` | Sticky note |
| `T` | Text |
| `W` | Handwriting |
| `R` | Rectangle |
| `C` | Circle |
| `L` | Line |
| `A` | Arrow |
| `D` | Draw (freehand) |
| `I` | Image |
| `F` | Frame |
| `G` | Toggle grid |
| `M` | Toggle minimap |
| `Shift+T` | Templates |
| `Esc` | Deselect |
| `Del / Backspace` | Delete selected |
| `⌘/Ctrl + K` | Command palette |
| `⌘/Ctrl + Z` | Undo |
| `⌘/Ctrl + Shift + Z` | Redo |
| `⌘/Ctrl + D` | Duplicate |
| `⌘/Ctrl + A` | Select all |
| `⌘/Ctrl + C/V` | Copy / paste |
| `⌘/Ctrl + 0` | Fit to screen |
| `Space + drag` | Pan |
