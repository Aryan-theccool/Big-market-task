# CANVEX Implementation Checklist

This maps the supplied product plan to the runnable files in this workspace.

## Files

- `index.html` — main app: landing page + board app in one self-contained file.
- `board.html` — direct board entry that opens `index.html#board`.
- `server.js` — local static server with `/` and `/board` routes.
- `package.json` — `npm start` and `npm test` scripts.
- `test-canvex.js` — smoke test checking required UI tokens and JavaScript syntax.
- `README.md` — usage and shortcuts.

## Landing page

- [x] Fixed glass navbar
- [x] CANVEX brand/logomark
- [x] Features / Pricing / Changelog links
- [x] Light/dark theme toggle
- [x] Launch app CTA
- [x] Full viewport hero
- [x] Animated live canvas background
- [x] Floating sticky notes
- [x] Typing cursor
- [x] Self-drawing SVG shape
- [x] Ghost collaborator cursors
- [x] Shimmer headline treatment
- [x] Watch demo modal
- [x] Social proof bar
- [x] Feature narrative sections
- [x] Interactive demo teaser with draggable notes
- [x] Feature grid
- [x] Pricing section
- [x] Changelog section
- [x] Testimonials
- [x] Final CTA
- [x] Footer

## Board app

- [x] `/board` route via `server.js`
- [x] `board.html` direct entry
- [x] Cinematic page wipe transition
- [x] Header bar
- [x] Editable board name
- [x] Collaborator avatar stack
- [x] Export dropdown
- [x] Full board export modal
- [x] JSON import/export
- [x] Theme toggle
- [x] Infinite canvas world
- [x] Dot grid
- [x] Cursor-anchored wheel zoom
- [x] Hand/space panning
- [x] Snap/grid/minimap toggles
- [x] Left tool rail
- [x] Tooltips and active states
- [x] Right inspector panel
- [x] Status bar
- [x] Context menu
- [x] Command palette
- [x] Toast system
- [x] Minimap with draggable viewport navigation
- [x] Simulated collaborator cursors
- [x] Activity toasts
- [x] Collaborator hover glow
- [x] Collaborator typewriter note edits
- [x] localStorage persistence

## Tools and elements

- [x] Select / move
- [x] Hand / pan
- [x] Sticky notes
- [x] Rectangle
- [x] Circle / ellipse
- [x] Line
- [x] Arrow
- [x] Freehand drawing
- [x] Text
- [x] Frame / section
- [x] Lasso multi-select
- [x] Region export selection

## Sticky notes

- [x] Handwritten note font stack
- [x] 6 pastel colors
- [x] Contenteditable note body
- [x] Dragging
- [x] Resizing
- [x] Rotation handle
- [x] Folded corner
- [x] Hover controls
- [x] Color picker
- [x] Delete animation/interaction

## Shapes

- [x] Click-drag drawing flow
- [x] Shift-constrained line/arrow angles
- [x] Shift-constrained circle drawing
- [x] Selected state
- [x] 8 resize handles for DOM elements
- [x] Rotation handle for DOM elements
- [x] Inspector controls for fill/stroke/size/position
- [x] Layer forward/back controls

## Region export

- [x] Keyboard shortcut `E`
- [x] Draw region overlay
- [x] Outside dim / inside spotlight effect
- [x] Pixel dimensions label
- [x] Floating export panel
- [x] PNG export
- [x] JPEG export
- [x] SVG export
- [x] Scale control
- [x] Background control
- [x] Peel animation
- [x] Success toast

## Keyboard shortcuts

- [x] V, H, N, R, C, L, A, D, T, F, S, E
- [x] M, G, Esc, Del/Backspace
- [x] Ctrl/Cmd+K
- [x] Ctrl/Cmd+Z / Ctrl/Cmd+Shift+Z
- [x] Ctrl/Cmd+D
- [x] Ctrl/Cmd+A
- [x] Ctrl/Cmd+C / Ctrl/Cmd+V
- [x] Ctrl/Cmd+E
- [x] Ctrl/Cmd+0
- [x] Ctrl/Cmd +/-
- [x] Space + drag pan

## Verification

Run:

```bash
npm test
npm start
```

Then open:

- `http://localhost:3000/`
- `http://localhost:3000/board`
