# CANVEX — Next.js Collaborative Whiteboard

A performant, interactive, collaborative whiteboard application built with **Next.js**, **Zustand**, and **Y.js** featuring a premium **Apple Design System (HIG)** aesthetic.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
Runs the Next.js development server on [http://localhost:3000](http://localhost:3000).
```bash
npm run dev
```

### 3. Start the WebRTC Signaling Server (Optional for Multiplayer)
To connect multiple local browser tabs/users in real-time, spin up the local y-webrtc signaling server:
```bash
npm run signaling
```

---

## 🎨 Key Features & Overhauls

### 1. Apple Design System Overhaul
Migrated the entire design framework to a sleek Apple HIG (Human Interface Guidelines) aesthetic:
* **UI Themes**: Full Light and Dark modes using premium Apple system colors (iOS Blue `#007AFF` / `#0A84FF`, system background canvas curves, border scales).
* **Typography**: Integrated Google Inter font stack with hardware font smoothing (`-webkit-font-smoothing: antialiased`).
* **Frosted Glass Panels**: Sleek glassmorphism (`glass-panel` utilities with dynamic spring easings, blur coefficients, and borders).
* **iOS-style Grouped Lists**: Replaced the inspector panel with Apple UI styled segmented cards and smooth spring slide-outs.

### 2. Real-Time Collaboration (Y.js Multiplayer)
Integrated WebRTC networking using Y.js document structures:
* **URL Rooms**: Opening `/board` automatically drops the administrator into a randomized, shareable multiplayer room (e.g., `/board/[room-id]`).
* **Active Cursor Presence**: Real-time cursor coordinates and user identities are synced dynamically using WebRTC awareness.
* **Synchronized State Map**: Whiteboard elements are managed within a Y.js shared Map structure ensuring zero-latency updates and consistency.

### 3. Ghost Collaborator Simulator
Simulates a collaborative multiplayer environment when testing solo:
* **Trigger**: Activated automatically if no real peers connect to the room.
* **Simulated Cursors**: Priya, James, and Lena move dynamically across the board, perform element creations, and make mock typewriter sticky note changes.

### 4. Interactive Context Menu & Redesigned Toasts
* **Context Menu**: Right-click canvas triggers a spring-animated menu enabling swift actions (Cut, Copy, Paste, Duplicate, Layering, and Deletes).
* **Toast System**: Modern center-aligned notifications displaying state additions, template actions, or connection updates.

### 5. Multi-Device Layouts & Touch Support
* **Mobile Toolbar**: Swaps out the desktop side tool rails for a neat bottom iOS layout on viewport shrink (< 768px).
* **Inspector Sheet**: Selected elements on mobile display within a drag-dismissible iOS bottom-sheet panel.
* **Touch Gestures**: Seamlessly pan and pinch-zoom with two-finger touch handlers on tablet/mobile screens.

### 6. Dynamic Templates Modal
* **First-Visit Templates**: Present template pickers loading configurations: Blank Canvas, Sprint Planning, Brainstorming grids, or Product Roadmap outlines.

### 7. Region Export Redesign
* **Marching Ants Spotlight**: Select custom rect boundaries (via keypress `E`) dimming elements outside the scope.
* **Export Action Menu**: Download high-resolution exports with 1x/2x/3x scale settings in `.png`, `.jpg`, or `.svg` layouts.

---

## 🎹 Keyboard Shortcuts

* `V` — Select Tool
* `H` — Hand / Pan Tool
* `N` — Sticky Note Tool
* `R` — Rectangle Shape
* `C` — Circle Shape
* `L` — Line Shape
* `A` — Arrow Shape
* `D` — Freehand Pen
* `T` — Text Entry
* `F` — Frame Container
* `S` — Lasso Select
* `E` — Region Export Box
* `M` — Show/Hide Minimap
* `G` — Toggle Grid lines
* `Esc` — Deselect / Cancel
* `Del` / `Backspace` — Delete selected elements
* `Ctrl/Cmd + K` — Command Palette
* `Ctrl/Cmd + Z` / `Shift + Z` — Undo / Redo
* `Ctrl/Cmd + D` — Duplicate Selection
* `Ctrl/Cmd + A` — Select All
* `Ctrl/Cmd + C` / `V` — Copy & Paste
* `Ctrl/Cmd + 0` — Fit to Screen offset
* `Ctrl/Cmd + +/-` — Zoom scale adjustments
* `Space + Drag` — Shift canvas panning

---

## 🛠️ Verification Tests
Run the local smoketest verifying UI assets and server structure:
```bash
npm test
```
