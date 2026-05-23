# CANVEX — Interactive Collaborative Whiteboard

A self-contained, dependency-free browser build of the supplied CANVEX product/design spec.

## Open

Open `index.html` in a browser or use the Arena file preview.

## What is built

### Landing page

- Fixed glass navbar with CANVEX brand, theme toggle, and launch CTA.
- Animated hero with live mini-canvas atmosphere: floating sticky notes, typing cursor, self-drawing SVG shape, ghost collaborator cursors, and shimmer typography.
- Social proof bar.
- Sticky narrative feature sections for infinite canvas, collaboration, and region export.
- Interactive mini-board teaser with draggable notes and add-note action.
- Feature grid, pricing section, changelog section, testimonials, final CTA, and footer.

### Whiteboard app

- Cinematic page-wipe entry into the board.
- Header with editable board name, collaborator avatars, help, JSON import, export menu, and light/dark theme toggle.
- Infinite canvas with dot grid, direct transform pan/zoom, cursor-anchored wheel zoom, snap/grid toggles, and fit-to-screen.
- Left tool rail with active states and tooltips.
- Tools: Select, Hand, Sticky Note, Rectangle, Circle, Line, Arrow, Freehand Draw, Text, Frame, Lasso, and Region Export.
- Sticky notes: handwritten styling, folded corner, contenteditable text, drag, resize, delete, color picker, shadows, and selected state.
- Shapes: rectangle, circle, line, arrow, freehand polyline, text, and frame elements.
- Multi-select: shift-click, select all, and lasso drag selection.
- Right inspector panel for selected elements, including position/size, color/stroke controls, layer actions, delete, and multi-select state.
- Region export flow: press `E`, draw a region, spotlight/marching-ants treatment, dimensions, export panel, PNG/JPEG/SVG download, scale/background controls, and peel animation.
- Board export/import: JSON export and import via file picker or drag/drop.
- Visible-area PNG/SVG export.
- Command palette via `Ctrl/Cmd + K`.
- Polished context menu on right-click.
- Minimap with element previews and viewport indicator.
- Toast system with progress bars.
- Simulated collaboration: three colored cursors, activity toasts, element hover glow, and Priya typewriter edits.
- Undo/redo snapshots.
- Auto-save to localStorage and restore on refresh.
- Responsive behavior for smaller screens.

## Keyboard shortcuts

- `V` Select
- `H` Hand / pan
- `N` New sticky note
- `R` Rectangle
- `C` Circle
- `L` Line
- `A` Arrow
- `D` Freehand draw
- `T` Text
- `F` Frame
- `S` Lasso select
- `E` Region export
- `M` Toggle minimap
- `G` Toggle grid
- `Esc` Cancel / deselect
- `Del / Backspace` Delete selected
- `Ctrl/Cmd + K` Command palette
- `Ctrl/Cmd + Z` Undo
- `Ctrl/Cmd + Shift + Z` Redo
- `Ctrl/Cmd + D` Duplicate
- `Ctrl/Cmd + A` Select all
- `Ctrl/Cmd + C/V` Copy/paste selected elements
- `Ctrl/Cmd + 0` Fit to screen
- `Ctrl/Cmd + +/-` Zoom
- `Space + drag` Pan

## Implementation note

This build is intentionally contained in `index.html` so it runs inside the Arena preview sandbox without npm installs, network access, external fonts, or CDN assets. The CSS still names the CANVEX typography system, with local fallbacks if those fonts are unavailable.

# Big-market-task
