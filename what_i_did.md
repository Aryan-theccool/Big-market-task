# Implementation Plan — new changes.md (15 features)

## Context
The user wants a complete Apple-design-system overhaul of the Inkspace whiteboard app plus 15 new features: iOS design tokens, mobile toolbar, touch gestures, Y.js real-time collab, context menu, template modal, and more. The current codebase uses a custom INKSPACE design system (warm beige palette, indigo accent, Fraunces/DM Sans fonts). This plan migrates to an Apple HIG aesthetic (iOS blue, system font stack, frosted glass panels) while adding all functional features.

**Critical facts from exploration:**
- `framer-motion@^11` is ALREADY installed — use it immediately
- `yjs`, `y-webrtc`, `nanoid` are NOT installed — must `npm install`
- `elements` is currently `CanvasElement[]` — Y.js requires `Map<string, CanvasElement>` (breaking change, touches every component)
- No `src/lib/`, `src/hooks/`, `src/components/collab/` directories exist yet
- No `MobileToolbar.tsx`, `ContextMenu.tsx`, `TemplateModal.tsx` exist yet
- `src/styles/tokens.css` does not exist — tokens live in `globals.css`

---

## Implementation Order

### Phase 1 — Design System (CSS + fonts)
**Files:** `src/styles/globals.css`, `src/app/layout.tsx`, `tailwind.config.js`

1. **globals.css** — Replace current INKSPACE tokens with Apple tokens from the plan:
   - `[data-theme="light"]`: `--bg-canvas:#F2F2F7`, `--accent:#007AFF`, `--border:rgba(60,60,67,0.13)`, etc.
   - `[data-theme="dark"]`: `--bg-canvas:#000000`, `--accent:#0A84FF`, etc.
   - Add `--blur-panel: blur(20px) saturate(180%)`, radius tokens, semantic color tokens
   - Add `* { -webkit-font-smoothing: antialiased }` rule
   - Add `.glass-panel`, `.card`, `.primary-button`, `.secondary-button`, `.ghost-button`, `.icon-button` utility classes
   - Keep all existing animation keyframes; add spring easing functions

2. **layout.tsx** — Add `Inter` from `next/font/google`, set `--font-ui` CSS var. Keep Caveat for handwriting.

3. **tailwind.config.js** — Add `active:scale-[0.97]` shorthand, ensure `font-display` maps to system font stack.

---

### Phase 2 — Shell Components (Header, Toolbar, StatusBar)
**Files:** `src/components/ui/Header.tsx`, `src/components/ui/LeftToolRail.tsx`, `src/components/ui/StatusBar.tsx`  
**New file:** `src/components/ui/MobileToolbar.tsx`

4. **Header.tsx** — Rewrite with Apple design:
   - Height 52px, `glass-panel rounded-none` with `border-bottom: 0.5px`
   - Left: blue `[8px]` rounded icon + inline editable board name input
   - Center (desktop only, `absolute left-1/2`): collab avatars with green presence dot
   - Right: ghost Export button, icon-button theme toggle, mobile hamburger (`md:hidden`)
   - Keep existing `handleExportJSON`, `handleImport` logic

5. **LeftToolRail.tsx** — Rewrite with Apple design:
   - Add `md:flex hidden` (hidden on mobile)
   - Active tool: `bg-[var(--accent)] text-white` (iOS blue instead of indigo)
   - Add separator + delete (trash) button at bottom
   - Keep all 13 existing tools and their shortcuts

6. **MobileToolbar.tsx** — Create new component:
   - `fixed bottom-0 left-0 right-0 z-40 md:hidden`
   - `border-radius: 20px 20px 0 0`, `padding-bottom: env(safe-area-inset-bottom)`
   - 6 tools: Select, Note, Write, Draw, Image, Export
   - Active: `bg-[var(--accent-glow)] text-[var(--accent)]`
   - Import `useCanvasStore` for `activeTool` / `setTool`

7. **StatusBar.tsx** — Rewrite with Apple design:
   - `hidden md:flex h-8` (hide on mobile — mobile toolbar replaces it)
   - `border-radius: 0, border-top: 0.5px`
   - Zoom: minus / `{pct}%` (click to reset) / plus
   - Center: Grid / Snap toggles with `rounded-[6px]`
   - Right: object count + undo/redo SVG icon buttons

---

### Phase 3 — Inspector Panel (with framer-motion)
**File:** `src/components/ui/InspectorPanel.tsx`

8. **InspectorPanel.tsx** — Rewrite with iOS grouped list style:
   - Use `motion.div` with `initial={{ x: 280 }} animate={{ x: isOpen ? 0 : 280 }}`
   - `spring: { stiffness: 350, damping: 35 }`
   - iOS grouped sections: `rounded-[12px] bg-[var(--bg-secondary)] divide-y divide-[var(--border)]`
   - Each row: `flex items-center justify-between px-4 py-3`
   - Sections: Appearance (fill/stroke/opacity), Position (X/Y/W/H grid), Arrange (4 layer buttons), Delete
   - Keep all existing element-type-specific controls (note colors, roughness, etc.)
   - Desktop: right side rail. Mobile: bottom sheet (see Phase 4)

---

### Phase 4 — Mobile Canvas (touch + bottom sheet)
**File:** `src/components/canvas/CanvasViewport.tsx`

9. **Touch events** — Add to CanvasViewport:
   - `onTouchStart`: track 2-finger distance + midpoint
   - `onTouchMove` (passive: false): pinch-zoom via `zoomAtPoint()`, two-finger pan via `panBy()`
   - `onTouchEnd`: reset tracking
   - Attach with `{ passive: false }` on the canvas div ref

10. **Mobile bottom sheet** — In `board/page.tsx`:
    - When `selected.length > 0` AND on mobile: render `<InspectorPanel>` as bottom sheet
    - `motion.div fixed bottom-0 left-0 right-0 z-50 md:hidden`
    - `initial={{ y: '100%' }} animate={{ y: 0 }}`
    - Drag handle + `onDragEnd` to dismiss
    - Desktop `<InspectorPanel>` still renders as side rail (`hidden md:flex`)

---

### Phase 5 — Landing Page
**File:** `src/app/page.tsx`

11. **page.tsx** — Update to Apple aesthetic:
    - `Navbar`: `glass-panel rounded-none border-bottom: 0.5px`, system font, blue `primary-button` CTA
    - `Hero`: no Fraunces italic; use system font bold; `text-[var(--accent)]` for "unfiltered."
    - Feature cards: `.card` class, `rounded-[12px]` icon chip with color background
    - Keep `MiniCanvas` animated preview; update colors to Apple tokens
    - All buttons switch to `primary-button` / `secondary-button` / `ghost-button` classes

---

### Phase 6 — Context Menu + Toast
**New file:** `src/components/ui/ContextMenu.tsx`  
**File:** `src/app/board/page.tsx`

12. **ContextMenu.tsx** — Create new component:
    - Props: `{ x, y, items, onClose }`
    - `motion.div fixed z-[9995] min-w-[200px]`
    - `initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}`
    - `transition: { duration: 0.1, ease: [0.16, 1, 0.3, 1] }`
    - Row: label + shortcut + optional icon; separator lines; destructive red items
    - Hover: `bg-[var(--accent)] text-white`
    - Wire into `CanvasViewport.tsx` `onContextMenu` handler
    - Items: Cut, Copy, Paste, Duplicate, —, Bring Forward, Send Backward, Bring to Front, Send to Back, —, Delete

13. **Toast redesign** — In `board/page.tsx`:
    - Replace left-border style with Apple banner: `rounded-[16px]`, icon chip, title + message
    - Use `motion.div` with `initial={{ opacity: 0, y: -16, scale: 0.95 }}`
    - `spring: { stiffness: 400, damping: 30 }`
    - Stack at top-center (not top-right)

---

### Phase 7 — Y.js Real-Time Collaboration
**Install:** `npm install yjs y-webrtc nanoid`  
**New files:** `src/lib/yjs.ts`, `src/store/collabStore.ts`, `src/hooks/useCollabSync.ts`, `src/components/collab/RemoteCursors.tsx`  
**New route:** `src/app/board/[id]/page.tsx`  
**Modified:** `src/app/board/page.tsx`, `src/store/canvasStore.ts`, all element-consuming components

14. **canvasStore.ts** — Change `elements: CanvasElement[]` → `elements: Map<string, CanvasElement>`:
    - Update `setElements`, `addElement`, `updateElement`, `deleteSelected`, `duplicateSelected`, `copySelected`, `pasteSelected`, `importBoard`, `undo`, `redo`, `hydrate`, `saveToStorage`
    - Update all array methods (`.find` → `.get`, `.filter` → loop, `.map` on values)
    - `hydrate` parses stored JSON array and re-builds Map
    - `saveToStorage` serializes `[...elements.values()]`

15. **Update all components consuming `elements`:**
    - `CanvasViewport.tsx`: `store.elements.forEach(...)` instead of `.map(...)`
    - `CanvasElements.tsx`: receives individual element, no change needed there
    - `InspectorPanel.tsx`: `store.elements.get(id)` instead of `.find()`
    - `CanvasMiniMap.tsx`: iterate `store.elements.values()`
    - `StatusBar.tsx`: `store.elements.size` instead of `.length`
    - `board/page.tsx`: `store.elements.size`, `[...store.elements.values()].map(e => e.id)` for select all

16. **src/lib/yjs.ts** — As per plan:
    - `Y.Doc`, `yElements = ydoc.getMap<any>('elements')`
    - `initRoom(roomId, user)` creates `WebrtcProvider`
    - `updateCursor(x, y)` sets awareness cursor

17. **src/store/collabStore.ts** — New Zustand store:
    - `remoteUsers: { clientId: number; name: string; color: string; cursor: {x,y} | null }[]`
    - `setRemoteUsers(users)` action

18. **src/hooks/useCollabSync.ts** — As per plan: observe yElements → setElements, awareness → setRemoteUsers, mousemove → updateCursor

19. **src/components/collab/RemoteCursors.tsx** — Renders remote users' cursors in canvas coordinates

20. **src/app/board/[id]/page.tsx** — Copy board/page.tsx, add `useCollabSync()` + `<RemoteCursors />`

21. **src/app/board/page.tsx** — Replace with redirect: `router.replace('/board/' + nanoid(10))`

---

### Phase 8 — Simulated Collaboration
**New files:** `src/hooks/useCollabSimulation.ts`, `src/components/collab/SimulatedCursors.tsx`

22. **useCollabSimulation.ts** — As per plan:
    - Only active when `remoteUsers.length === 0`
    - RAF loop: each sim user drifts toward random target, updates DOM directly via ref
    - SIM_USERS: Priya (iOS red #FF2D55), James (iOS green #34C759), Lena (iOS amber #FF9500)

23. **SimulatedCursors.tsx** — Renders 3 ghost cursors with collab labels

---

### Phase 9 — Region Export Redesign
**File:** `src/app/board/page.tsx`, new `src/components/ui/ExportActionBar.tsx`

24. **ExportActionBar.tsx** — Create new component:
    - `motion.div fixed z-[9991]` positioned below selection rect
    - `spring: { stiffness: 400, damping: 30 }`
    - Format selector: PNG / JPG / SVG pills
    - Scale selector: 1x / 2x / 3x pills
    - Dimension display in monospace
    - Download button: `primary-button`
    - Close button: `icon-button`

25. **board/page.tsx** — Replace inline export action bar markup with `<ExportActionBar>`, update `doExport` to use `html2canvas` `ignoreElements` with IDs matching new Apple component IDs

---

### Phase 10 — Image Drop Hook
**New file:** `src/hooks/useImageDrop.ts`

26. **useImageDrop.ts** — Extract image drop/paste logic from CanvasViewport into a hook:
    - `drop` event on canvas ref
    - `paste` event on window
    - Places image at cursor position in world coordinates
    - Uses `nanoid()` for element IDs
    - Max width 400px with proportional scale
    - Integrates with updated Map-based store

---

### Phase 11 — Board Templates Modal
**New file:** `src/components/ui/TemplateModal.tsx`

27. **TemplateModal.tsx** — Create new component:
    - Shows on first visit (check `localStorage.getItem('inkspace-visited')`)
    - iOS sheet: `fixed inset-0 z-[10000]`, backdrop `bg-black/30 backdrop-blur-sm`
    - `motion.div` spring entry: `initial={{ y: 60, opacity: 0 }}`
    - 4 templates: Blank, Sprint, Brainstorm, Roadmap
    - Each as a button card with thumbnail placeholder
    - On pick: call `store.importBoard(template.elements)` + 80ms stagger via framer-motion
    - On blank: just close modal + set `inkspace-visited`
    - Wire into `board/[id]/page.tsx`

---

## Files Created / Modified Summary

| File | Action |
|---|---|
| `src/styles/globals.css` | Modify — replace tokens, add utility classes |
| `src/app/layout.tsx` | Modify — add Inter font |
| `tailwind.config.js` | Modify — minor additions |
| `src/components/ui/Header.tsx` | Rewrite |
| `src/components/ui/LeftToolRail.tsx` | Rewrite |
| `src/components/ui/StatusBar.tsx` | Rewrite |
| `src/components/ui/InspectorPanel.tsx` | Rewrite |
| `src/components/ui/MobileToolbar.tsx` | **Create** |
| `src/components/ui/ContextMenu.tsx` | **Create** |
| `src/components/ui/ExportActionBar.tsx` | **Create** |
| `src/components/ui/TemplateModal.tsx` | **Create** |
| `src/components/canvas/CanvasViewport.tsx` | Modify — touch events + context menu |
| `src/store/canvasStore.ts` | Modify — `elements` Map migration |
| `src/store/collabStore.ts` | **Create** |
| `src/lib/yjs.ts` | **Create** |
| `src/hooks/useCollabSync.ts` | **Create** |
| `src/hooks/useCollabSimulation.ts` | **Create** |
| `src/components/collab/RemoteCursors.tsx` | **Create** |
| `src/components/collab/SimulatedCursors.tsx` | **Create** |
| `src/app/board/page.tsx` | Rewrite as redirect |
| `src/app/board/[id]/page.tsx` | **Create** — main board with collab |
| `src/app/page.tsx` | Modify — Apple aesthetic |

---

## Key Risks & Mitigations

| Risk | Mitigation |
|---|---|
| `elements` Map migration breaks rendering | Migrate store first, then fix each consumer file in order; keep array type alias during transition |
| Y.js WebRTC signaling server down | Simulated cursors are the visible fallback; real collab is additive |
| framer-motion SSR issues | All motion components are in `'use client'` files — safe |
| `passive: false` touch events blocked | Attach to the canvas DOM ref directly (not React synthetic events) |

---

## Verification Steps

1. `npm install` — no errors
2. `npm run dev` — server starts on `localhost:3000`
3. Landing page (`/`) — Apple design tokens, Inter font, system-style CTAs, no Fraunces
4. Navigate to `/board` — redirects to `/board/[id]` (nanoid URL)
5. Open same URL in 2nd tab — remote cursor appears on both tabs
6. Close 2nd tab — simulated cursors (Priya, James, Lena) appear
7. Mobile viewport (DevTools 390px) — left toolbar hidden, bottom toolbar visible, inspector is bottom sheet, pinch-zoom works
8. Place a sticky note — Apple note colors, folded corner, Caveat font
9. Right-click element — context menu appears with spring animation
10. Press `E`, drag region — export action bar slides up; download PNG at 2x works
11. First visit (`board/[id]` fresh) — template modal appears; pick Sprint loads pre-made elements
12. Press `Cmd+K` — command palette opens (unchanged)
13. Undo/redo — works correctly with Map-based store
