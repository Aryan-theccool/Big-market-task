

**Make ALL of the following changes. Implement in order.**

---

## 1. APPLE-DESIGN SYSTEM OVERHAUL

Apply across every page, component, and element. This is the visual foundation everything else inherits.

### Design tokens (update `styles/tokens.css`)
```css
/* Light theme — default */
[data-theme="light"] {
  --bg-canvas:      #F2F2F7;   /* iOS systemGroupedBackground */
  --bg-surface:     #FFFFFF;
  --bg-panel:       rgba(255,255,255,0.82);
  --bg-secondary:   #F2F2F7;
  --bg-hover:       rgba(0,0,0,0.04);
  --border:         rgba(60,60,67,0.13);   /* iOS separator */
  --border-focus:   rgba(0,122,255,0.6);
  --text-primary:   #000000;
  --text-secondary: rgba(60,60,67,0.6);
  --text-muted:     rgba(60,60,67,0.3);
  --accent:         #007AFF;   /* iOS blue */
  --accent-hover:   #0066D6;
  --accent-glow:    rgba(0,122,255,0.18);
  --red:            #FF3B30;
  --green:          #34C759;
  --amber:          #FF9500;
  --shadow-sm:      0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md:      0 4px 16px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05);
  --shadow-lg:      0 8px 32px rgba(0,0,0,0.12), 0 3px 10px rgba(0,0,0,0.07);
  --radius-sm:      8px;
  --radius-md:      12px;
  --radius-lg:      16px;
  --radius-xl:      20px;
  --radius-pill:    100px;
  --blur-panel:     blur(20px) saturate(180%);
}

/* Dark theme */
[data-theme="dark"] {
  --bg-canvas:      #000000;
  --bg-surface:     #1C1C1E;   /* iOS systemBackground dark */
  --bg-panel:       rgba(28,28,30,0.85);
  --bg-secondary:   #2C2C2E;
  --bg-hover:       rgba(255,255,255,0.06);
  --border:         rgba(255,255,255,0.12);
  --border-focus:   rgba(10,132,255,0.7);
  --text-primary:   #FFFFFF;
  --text-secondary: rgba(235,235,245,0.6);
  --text-muted:     rgba(235,235,245,0.3);
  --accent:         #0A84FF;   /* iOS blue dark */
  --accent-hover:   #409CFF;
  --accent-glow:    rgba(10,132,255,0.2);
  --red:            #FF453A;
  --green:          #30D158;
  --amber:          #FF9F0A;
  --shadow-sm:      0 1px 4px rgba(0,0,0,0.4);
  --shadow-md:      0 4px 20px rgba(0,0,0,0.55);
  --shadow-lg:      0 12px 48px rgba(0,0,0,0.75), 0 0 0 0.5px rgba(255,255,255,0.08);
}
```

### Typography (update `layout.tsx`)
```typescript
import { Inter } from 'next/font/google'
// SF Pro is system font on Apple devices — Inter is the best web substitute
const inter = Inter({ subsets: ['latin'], variable: '--font-ui' })
// Caveat stays for handwriting / sticky notes
```

```css
/* globals.css */
* { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
body { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Inter', sans-serif; }
.font-display { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif; }
.font-handwriting { font-family: 'Caveat', cursive; }
```

### Button system (apply universally — replace ALL existing buttons)
```tsx
// variants to use everywhere:

// Primary — iOS filled blue
<button className="flex items-center gap-1.5 rounded-[10px] bg-[var(--accent)] px-4 py-2 text-[15px] font-semibold text-white transition-all active:scale-[0.97] active:opacity-80 hover:bg-[var(--accent-hover)] disabled:opacity-40">

// Secondary — iOS tinted
<button className="flex items-center gap-1.5 rounded-[10px] bg-[var(--accent-glow)] px-4 py-2 text-[15px] font-semibold text-[var(--accent)] transition-all active:scale-[0.97] hover:bg-[var(--accent-glow)]">

// Ghost — iOS borderless
<button className="flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-[15px] font-medium text-[var(--accent)] transition-all active:scale-[0.97] hover:bg-[var(--bg-hover)]">

// Destructive
<button className="... text-[var(--red)] hover:bg-red-50 dark:hover:bg-red-950/20">

// Icon button (toolbar, status bar)
<button className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--text-secondary)] transition-all hover:bg-[var(--bg-hover)] active:scale-95">
```

### Panels & cards
```css
/* Glass panel — toolbar, header, right panel */
.glass-panel {
  background: var(--bg-panel);
  backdrop-filter: var(--blur-panel);
  -webkit-backdrop-filter: var(--blur-panel);
  border: 0.5px solid var(--border);
  border-radius: var(--radius-lg);
}

/* iOS-style card */
.card {
  background: var(--bg-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}
```

### Sticky notes — Apple Freeform aesthetic
```tsx
// Note colors — lighter, more translucent, like real Post-its
const NOTE_COLORS = {
  yellow:  { bg: '#FFF59D', dark: '#F9A825', text: '#4A3800' },
  pink:    { bg: '#FCE4EC', dark: '#E91E63', text: '#4A0020' },
  blue:    { bg: '#E3F2FD', dark: '#1976D2', text: '#003060' },
  green:   { bg: '#E8F5E9', dark: '#388E3C', text: '#003010' },
  purple:  { bg: '#F3E5F5', dark: '#7B1FA2', text: '#2A003A' },
  orange:  { bg: '#FFF3E0', dark: '#F57C00', text: '#3A1800' },
  white:   { bg: '#FAFAFA', dark: '#E0E0E0', text: '#1C1C1E' },
}

// Note component styles
<motion.div
  className="absolute select-none"
  style={{
    width: 200, height: 200,
    background: color.bg,
    borderRadius: 'var(--radius-md)',    // 12px — matches iOS
    boxShadow: isSelected
      ? `0 0 0 2.5px var(--accent), var(--shadow-lg)`
      : `var(--shadow-md), 0 1px 2px rgba(0,0,0,0.08)`,
    transform: `rotate(${rotation}deg)`,
    fontFamily: 'Caveat, cursive',
    fontSize: 15,
    color: color.text,
  }}
>
  {/* Top bar with subtle drag hint */}
  <div className="flex items-center justify-between px-3 pt-2.5 pb-1 opacity-0 group-hover:opacity-100 transition-opacity">
    <div className="flex gap-1">
      {[0,1,2].map(i => <div key={i} className="h-1.5 w-1.5 rounded-full" style={{ background: color.dark, opacity: 0.35 }} />)}
    </div>
    <button onClick={onDelete} className="h-5 w-5 rounded-full flex items-center justify-center opacity-60 hover:opacity-100" style={{ background: 'rgba(0,0,0,0.08)' }}>
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"/></svg>
    </button>
  </div>
  {/* Content */}
  <div contentEditable suppressContentEditableWarning className="px-3 pb-3 outline-none" style={{ fontFamily: 'Caveat, cursive', fontSize: 15, lineHeight: 1.4 }}>
    {content}
  </div>
  {/* Folded corner */}
  <div className="absolute bottom-0 right-0 h-5 w-5" style={{
    background: `linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.09) 50%)`,
    borderTopLeftRadius: 4,
  }} />
</motion.div>
```

---

## 2. APPLE-DESIGN HEADER

```tsx
// Header.tsx — completely replace
<header
  id="header-bar"
  className="fixed top-0 left-0 right-0 z-50 flex h-[52px] items-center justify-between px-4 glass-panel rounded-none"
  style={{ borderBottom: '0.5px solid var(--border)', borderRadius: 0 }}
>
  {/* Left: Logo + board name */}
  <div className="flex items-center gap-2.5 min-w-0">
    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-[var(--accent)]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    </div>
    <input
      value={boardName}
      onChange={e => setBoardName(e.target.value)}
      className="min-w-0 max-w-[180px] truncate bg-transparent text-[15px] font-semibold text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)] hover:bg-[var(--bg-hover)] focus:bg-[var(--bg-hover)] rounded-[8px] px-2 py-0.5 transition-colors"
      placeholder="Untitled board"
    />
  </div>

  {/* Center (desktop): collaborator avatars */}
  <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
    <div className="flex -space-x-2">
      {SIM_USERS.map(u => (
        <div key={u.name} className="relative h-7 w-7 rounded-full border-2 border-[var(--bg-surface)] flex items-center justify-center text-[10px] font-semibold text-white" style={{ background: u.color }} title={u.name}>
          {u.initials}
          <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-[var(--green)] border border-[var(--bg-surface)]" />
        </div>
      ))}
    </div>
    <span className="text-[12px] text-[var(--text-muted)]">3 online</span>
  </div>

  {/* Right: actions */}
  <div className="flex items-center gap-1.5">
    <ShareButton />
    <button onClick={handleExport} className="ghost-button hidden md:flex">
      <svg width="15" height="15" .../>  {/* export icon */}
      <span className="text-[13px]">Export</span>
    </button>
    {/* Theme toggle — SF Symbols style */}
    <button onClick={toggleTheme} className="icon-button">
      {theme === 'light' ? <SunIcon /> : <MoonIcon />}
    </button>
    {/* Mobile: hamburger for collapsed actions */}
    <button className="icon-button md:hidden" onClick={openMobileMenu}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="5" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="19" r="1" fill="currentColor"/>
      </svg>
    </button>
  </div>
</header>
```

---

## 3. APPLE-DESIGN TOOLBAR (desktop + mobile)

### Desktop: vertical left rail
```tsx
// LeftToolRail.tsx
<div className="fixed left-3 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-0.5 p-1.5 glass-panel md:flex hidden"
  style={{ borderRadius: 'var(--radius-lg)' }}>
  {TOOLS.map(tool => (
    <button
      key={tool.id}
      onClick={() => setActiveTool(tool.id)}
      title={`${tool.label}  ${tool.shortcut}`}
      className={`flex h-9 w-9 items-center justify-center rounded-[10px] transition-all active:scale-95 ${
        activeTool === tool.id
          ? 'bg-[var(--accent)] text-white shadow-sm'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
      }`}
    >
      {tool.icon}
    </button>
  ))}
  {/* Separator */}
  <div className="my-1 h-px bg-[var(--border)]" />
  <button onClick={deleteSelected} className="flex h-9 w-9 items-center justify-center rounded-[10px] text-[var(--red)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-all active:scale-95">
    <TrashIcon />
  </button>
</div>
```

### Mobile: bottom tool strip (replaces left rail)
```tsx
// MobileToolbar.tsx — fixed bottom, full width
<div className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass-panel"
  style={{ borderRadius: '20px 20px 0 0', paddingBottom: 'env(safe-area-inset-bottom)' }}>
  <div className="flex items-center justify-around px-2 py-2">
    {MOBILE_TOOLS.map(tool => (
      <button
        key={tool.id}
        onClick={() => setActiveTool(tool.id)}
        className={`flex flex-col items-center gap-0.5 rounded-[12px] px-3 py-2 transition-all active:scale-95 ${
          activeTool === tool.id
            ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
            : 'text-[var(--text-secondary)]'
        }`}
      >
        <span className="text-[20px]">{tool.icon}</span>
        <span className="text-[10px] font-medium">{tool.label}</span>
      </button>
    ))}
  </div>
</div>
```

### Mobile tool list (condensed)
```typescript
const MOBILE_TOOLS = [
  { id: 'select',      label: 'Select',  icon: '↖', shortcut: 'V' },
  { id: 'note',        label: 'Note',    icon: '📝', shortcut: 'N' },
  { id: 'handwriting', label: 'Write',   icon: '✍', shortcut: 'W' },
  { id: 'draw',        label: 'Draw',    icon: '✏️', shortcut: 'D' },
  { id: 'image',       label: 'Image',   icon: '🖼', shortcut: 'I' },
  { id: 'export',      label: 'Export',  icon: '⬚',  shortcut: 'E' },
]
```

---

## 4. APPLE-DESIGN RIGHT INSPECTOR PANEL

```tsx
// RightPanel.tsx
<motion.div
  className="fixed right-0 top-[52px] bottom-[32px] z-40 w-[280px] glass-panel hidden md:flex flex-col"
  style={{ borderRadius: 0, borderLeft: '0.5px solid var(--border)' }}
  initial={{ x: 280 }} animate={{ x: isOpen ? 0 : 280 }}
  transition={{ type: 'spring', stiffness: 350, damping: 35 }}
>
  {/* Section headers use iOS grouped list style */}
  <div className="px-4 py-3 border-b border-[var(--border)]">
    <p className="text-[13px] font-semibold text-[var(--text-primary)] uppercase tracking-wide">{elementType}</p>
  </div>

  {/* Properties in iOS grouped sections */}
  <div className="flex-1 overflow-y-auto p-4 space-y-4">
    
    {/* Appearance section */}
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Appearance</p>
      <div className="rounded-[12px] bg-[var(--bg-secondary)] overflow-hidden divide-y divide-[var(--border)]">
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] text-[var(--text-primary)]">Fill</span>
          <ColorSwatch value={fill} onChange={setFill} />
        </div>
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-[15px] text-[var(--text-primary)]">Opacity</span>
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={100} value={opacity} onChange={...} className="w-20" />
            <span className="text-[13px] tabular-nums text-[var(--text-secondary)] w-8 text-right">{opacity}%</span>
          </div>
        </div>
      </div>
    </div>

    {/* Position section */}
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Position</p>
      <div className="rounded-[12px] bg-[var(--bg-secondary)] overflow-hidden divide-y divide-[var(--border)]">
        <div className="flex items-center px-4 py-2.5 gap-3">
          <span className="w-4 text-[13px] text-[var(--text-muted)]">X</span>
          <input type="number" value={Math.round(x)} className="flex-1 bg-transparent text-right text-[15px] tabular-nums text-[var(--text-primary)] outline-none" />
          <span className="w-4 text-[13px] text-[var(--text-muted)] ml-4">Y</span>
          <input type="number" value={Math.round(y)} className="flex-1 bg-transparent text-right text-[15px] tabular-nums text-[var(--text-primary)] outline-none" />
        </div>
        <div className="flex items-center px-4 py-2.5 gap-3">
          <span className="w-4 text-[13px] text-[var(--text-muted)]">W</span>
          <input type="number" value={Math.round(width)} className="flex-1 bg-transparent text-right text-[15px] tabular-nums text-[var(--text-primary)] outline-none" />
          <span className="w-4 text-[13px] text-[var(--text-muted)] ml-4">H</span>
          <input type="number" value={Math.round(height)} className="flex-1 bg-transparent text-right text-[15px] tabular-nums text-[var(--text-primary)] outline-none" />
        </div>
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-[13px] text-[var(--text-muted)]">Rotation</span>
          <span className="text-[15px] tabular-nums text-[var(--text-primary)]">{rotation}°</span>
        </div>
      </div>
    </div>

    {/* Arrange */}
    <div>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Arrange</p>
      <div className="grid grid-cols-2 gap-2">
        <button className="secondary-button justify-center text-[13px]" onClick={bringForward}>Bring Forward</button>
        <button className="secondary-button justify-center text-[13px]" onClick={sendBackward}>Send Backward</button>
      </div>
    </div>

    {/* Danger zone */}
    <button onClick={deleteSelected} className="w-full text-center rounded-[12px] bg-[var(--bg-secondary)] py-3 text-[15px] font-medium text-[var(--red)] hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
      Delete
    </button>
  </div>
</motion.div>
```

---

## 5. APPLE-DESIGN STATUS BAR

```tsx
// StatusBar.tsx
<div
  id="status-bar"
  className="fixed bottom-0 left-0 right-0 z-40 hidden md:flex h-8 items-center justify-between px-4 glass-panel"
  style={{ borderRadius: 0, borderTop: '0.5px solid var(--border)' }}
>
  {/* Zoom */}
  <div className="flex items-center gap-1">
    <button onClick={zoomOut} className="h-6 w-6 icon-button text-[12px]">−</button>
    <button onClick={resetZoom} className="min-w-[44px] text-center rounded-[6px] px-1.5 py-0.5 text-[12px] tabular-nums text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors">
      {Math.round(zoom * 100)}%
    </button>
    <button onClick={zoomIn} className="h-6 w-6 icon-button text-[12px]">+</button>
  </div>

  {/* Center toggles */}
  <div className="flex items-center gap-1">
    <button onClick={toggleGrid} className={`rounded-[6px] px-2 py-0.5 text-[12px] transition-colors ${showGrid ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}>Grid</button>
    <button onClick={toggleSnap} className={`rounded-[6px] px-2 py-0.5 text-[12px] transition-colors ${snapToGrid ? 'bg-[var(--accent-glow)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'}`}>Snap</button>
  </div>

  {/* Right: undo/redo + count */}
  <div className="flex items-center gap-2">
    <span className="text-[12px] text-[var(--text-muted)]">{elementCount} objects</span>
    <div className="flex items-center gap-0.5">
      <button onClick={undo} disabled={!canUndo} className="icon-button h-6 w-6 disabled:opacity-30">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 14L4 9l5-5"/><path d="M4 9h11a6 6 0 010 12h-1"/></svg>
      </button>
      <button onClick={redo} disabled={!canRedo} className="icon-button h-6 w-6 disabled:opacity-30">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 14l5-5-5-5"/><path d="M20 9H9a6 6 0 000 12h1"/></svg>
      </button>
    </div>
  </div>
</div>
```

---

## 6. MOBILE-SPECIFIC CANVAS BEHAVIOR

```typescript
// In CanvasViewport.tsx — add touch handling
useEffect(() => {
  const el = canvasRef.current
  if (!el) return

  let lastDist = 0
  let lastMidX = 0, lastMidY = 0

  const onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const [a, b] = e.touches
      lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      lastMidX = (a.clientX + b.clientX) / 2
      lastMidY = (a.clientY + b.clientY) / 2
    }
  }

  const onTouchMove = (e: TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2) {
      const [a, b] = e.touches
      const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
      const midX = (a.clientX + b.clientX) / 2
      const midY = (a.clientY + b.clientY) / 2
      // Pinch zoom
      if (lastDist) zoomAtPoint((dist / lastDist - 1) * 0.5, midX, midY)
      // Two-finger pan
      panBy(midX - lastMidX, midY - lastMidY)
      lastDist = dist; lastMidX = midX; lastMidY = midY
    }
  }

  const onTouchEnd = () => { lastDist = 0 }

  el.addEventListener('touchstart', onTouchStart, { passive: false })
  el.addEventListener('touchmove', onTouchMove, { passive: false })
  el.addEventListener('touchend', onTouchEnd)
  return () => {
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchmove', onTouchMove)
    el.removeEventListener('touchend', onTouchEnd)
  }
}, [])
```

### Mobile right panel → bottom sheet
```tsx
// On mobile, inspector panel becomes a bottom sheet
// Trigger: tap selected element → sheet slides up

<motion.div
  className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass-panel"
  style={{
    borderRadius: '20px 20px 0 0',
    paddingBottom: 'env(safe-area-inset-bottom)',
    maxHeight: '60vh',
    overflowY: 'auto',
  }}
  initial={{ y: '100%' }}
  animate={{ y: isOpen ? 0 : '100%' }}
  transition={{ type: 'spring', stiffness: 350, damping: 35 }}
  drag="y"
  dragConstraints={{ top: 0 }}
  onDragEnd={(_, info) => { if (info.offset.y > 80) closePanel() }}
>
  {/* Drag handle */}
  <div className="flex justify-center pt-3 pb-2">
    <div className="h-1 w-10 rounded-full bg-[var(--border)]" />
  </div>
  {/* Same inspector content as desktop */}
  <InspectorContent />
</motion.div>
```

---

## 7. LANDING PAGE — APPLE AESTHETIC

### Navbar
```tsx
<nav className="fixed top-0 left-0 right-0 z-50 glass-panel" style={{ borderRadius: 0, borderBottom: '0.5px solid var(--border)' }}>
  <div className="mx-auto flex h-[52px] max-w-5xl items-center justify-between px-5">
    <div className="flex items-center gap-2">
      <div className="h-7 w-7 rounded-[8px] bg-[var(--accent)] flex items-center justify-center">
        <InkspaceLogoIcon />
      </div>
      <span className="text-[17px] font-semibold tracking-tight text-[var(--text-primary)]">Inkspace</span>
    </div>
    <div className="hidden md:flex items-center gap-1">
      <a href="#features" className="ghost-button text-[15px]">Features</a>
      <a href="#collab"   className="ghost-button text-[15px]">Collaborate</a>
    </div>
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <Link href="/board" className="primary-button text-[15px]">
        Open canvas
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </Link>
    </div>
  </div>
</nav>
```

### Hero
```tsx
<section className="flex min-h-screen flex-col items-center justify-center px-5 pt-[52px] text-center">
  {/* Pill badge — iOS style */}
  <div className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--bg-secondary)] px-3 py-1">
    <span className="h-1.5 w-1.5 rounded-full bg-[var(--green)] animate-pulse" />
    <span className="text-[13px] text-[var(--text-secondary)]">Now with real-time collaboration</span>
  </div>

  <h1 className="font-display mb-4 max-w-2xl text-[52px] font-bold leading-[1.05] tracking-tight text-[var(--text-primary)] md:text-[72px]">
    Your thoughts,{' '}
    <span className="text-[var(--accent)]">unfiltered.</span>
  </h1>

  <p className="mb-8 max-w-md text-[19px] leading-relaxed text-[var(--text-secondary)]">
    The infinite canvas that gets out of your way. Draw, write, collaborate.
  </p>

  <div className="flex flex-col items-center gap-3 sm:flex-row">
    <Link href="/board" className="primary-button h-[50px] px-6 text-[17px] font-semibold rounded-[14px]">
      Open canvas — it's free
    </Link>
    <button className="secondary-button h-[50px] px-6 text-[17px] rounded-[14px]">
      Watch demo ▶
    </button>
  </div>
</section>
```

### Feature cards (bento grid)
```tsx
// Each card — iOS-style frosted glass card
<div className="card overflow-hidden p-6 hover:shadow-lg transition-shadow">
  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[12px]" style={{ background: color }}>
    {icon}
  </div>
  <h3 className="mb-1 text-[17px] font-semibold text-[var(--text-primary)]">{title}</h3>
  <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">{description}</p>
</div>
```

---

## 8. CONTEXT MENU — APPLE POPOVER STYLE

```tsx
// Exactly like macOS context menus
<motion.div
  className="fixed z-[9995] min-w-[200px] overflow-hidden glass-panel py-1"
  style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}
  initial={{ opacity: 0, scale: 0.92 }}
  animate={{ opacity: 1, scale: 1 }}
  exit={{ opacity: 0, scale: 0.94 }}
  transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
>
  {items.map((item, i) =>
    item.separator ? (
      <div key={i} className="my-1 h-px mx-1 bg-[var(--border)]" />
    ) : (
      <button
        key={i}
        onClick={item.action}
        className={`flex w-full items-center justify-between px-3.5 py-2 text-[14px] transition-colors hover:bg-[var(--accent)] hover:text-white ${item.destructive ? 'text-[var(--red)]' : 'text-[var(--text-primary)]'}`}
      >
        <div className="flex items-center gap-2.5">
          {item.icon}
          <span>{item.label}</span>
        </div>
        {item.shortcut && (
          <span className="ml-6 text-[12px] opacity-50">{item.shortcut}</span>
        )}
      </button>
    )
  )}
</motion.div>
```

---

## 9. TOAST NOTIFICATIONS — APPLE STYLE

```tsx
// iOS-style notification banner
<motion.div
  className="flex items-center gap-3 rounded-[16px] px-4 py-3 shadow-lg"
  style={{
    background: 'var(--bg-panel)',
    backdropFilter: 'var(--blur-panel)',
    border: '0.5px solid var(--border)',
    minWidth: 280,
    maxWidth: 380,
  }}
  initial={{ opacity: 0, y: -16, scale: 0.95 }}
  animate={{ opacity: 1, y: 0, scale: 1 }}
  exit={{ opacity: 0, y: -8, scale: 0.97 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
>
  {/* Icon */}
  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px]" style={{ background: iconBg }}>
    {icon}
  </div>
  {/* Text */}
  <div className="min-w-0 flex-1">
    <p className="text-[14px] font-semibold text-[var(--text-primary)]">{title}</p>
    <p className="text-[13px] text-[var(--text-secondary)] truncate">{message}</p>
  </div>
  {/* Thumbnail (export) */}
  {thumbnail && <img src={thumbnail} className="h-9 w-14 flex-shrink-0 rounded-[8px] object-cover" />}
</motion.div>
```

---

## 10. Y.JS REAL-TIME COLLABORATION

```bash
npm install yjs y-webrtc
```

**Redirect `/board` → `/board/[id]`:**
```tsx
// app/board/page.tsx
'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { nanoid } from 'nanoid'
export default function BoardRedirect() {
  const router = useRouter()
  useEffect(() => { router.replace(`/board/${nanoid(10)}`) }, [])
  return null
}
```

**`lib/yjs.ts`:**
```typescript
import * as Y from 'yjs'
import { WebrtcProvider } from 'y-webrtc'

export const ydoc = new Y.Doc()
export const yElements = ydoc.getMap<any>('elements')
let provider: WebrtcProvider | null = null

export function initRoom(roomId: string, user: { name: string; color: string }) {
  provider?.destroy()
  provider = new WebrtcProvider(roomId, ydoc, {
    signaling: ['wss://y-webrtc.fly.dev'],
  })
  provider.awareness.setLocalStateField('user', { ...user, cursor: null })
  return provider
}
export const getProvider = () => provider
export function updateCursor(x: number, y: number) {
  const state = provider?.awareness.getLocalState()
  if (state) provider?.awareness.setLocalStateField('user', { ...state.user, cursor: { x, y } })
}
```

**Wrap mutations in `canvasStore.ts`:**
```typescript
// Add to addElement, updateElement, deleteElements:
import { yElements, ydoc } from '@/lib/yjs'

addElement: (el) => {
  set(s => { const m = new Map(s.elements); m.set(el.id, el); return { elements: m } })
  yElements.set(el.id, el)
},
updateElement: (id, patch) => {
  set(s => {
    const m = new Map(s.elements)
    const el = m.get(id); if (!el) return s
    m.set(id, { ...el, ...patch }); return { elements: m }
  })
  const updated = useCanvasStore.getState().elements.get(id)
  if (updated) yElements.set(id, updated)
},
deleteElements: (ids) => {
  set(s => { const m = new Map(s.elements); ids.forEach(id => m.delete(id)); return { elements: m } })
  ydoc.transact(() => ids.forEach(id => yElements.delete(id)))
},
```

**`hooks/useCollabSync.ts`:**
```typescript
'use client'
import { useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ydoc, yElements, initRoom, updateCursor } from '@/lib/yjs'
import { useCanvasStore } from '@/store/canvasStore'
import { useCollabStore } from '@/store/collabStore'

export function useCollabSync() {
  const { setElements } = useCanvasStore()
  const { setRemoteUsers } = useCollabStore()
  const params = useParams()
  const roomId = (params?.id as string) ?? 'default'

  useEffect(() => {
    const provider = initRoom(roomId, { name: 'You', color: '#007AFF' })

    // Y.Map → Zustand
    const observer = () => {
      const m = new Map(); yElements.forEach((v, k) => m.set(k, v)); setElements(m)
    }
    yElements.observe(observer)

    // Awareness → remote cursors
    provider.awareness.on('change', () => {
      const users: any[] = []
      provider.awareness.getStates().forEach((s, id) => {
        if (id !== provider.awareness.clientID && s.user) users.push({ clientId: id, ...s.user })
      })
      setRemoteUsers(users)
    })

    // Broadcast mouse position
    const onMouseMove = (e: MouseEvent) => {
      const { x: px, y: py, zoom } = useCanvasStore.getState().viewport
      updateCursor((e.clientX - px) / zoom, (e.clientY - py) / zoom)
    }
    window.addEventListener('mousemove', onMouseMove)

    return () => {
      yElements.unobserve(observer); window.removeEventListener('mousemove', onMouseMove)
    }
  }, [roomId])
}
```

**Remote cursors component `components/collab/RemoteCursors.tsx`:**
```tsx
'use client'
import { useCollabStore } from '@/store/collabStore'
import { useCanvasStore } from '@/store/canvasStore'

export function RemoteCursors() {
  const { remoteUsers } = useCollabStore()
  const { viewport } = useCanvasStore()
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      {remoteUsers.map(u => {
        if (!u.cursor) return null
        const sx = u.cursor.x * viewport.zoom + viewport.x
        const sy = u.cursor.y * viewport.zoom + viewport.y
        return (
          <div key={u.clientId} className="absolute" style={{ transform: `translate(${sx}px,${sy}px)`, transition: 'transform 80ms linear' }}>
            <svg width="18" height="18" viewBox="0 0 20 20" fill={u.color} stroke="white" strokeWidth="1.2">
              <path d="M4 2L16 10L10 11.5L7.5 17L4 2Z"/>
            </svg>
            <div className="absolute left-4 top-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: u.color }}>
              {u.name}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

Add `<RemoteCursors />` and call `useCollabSync()` in `/board/[id]/page.tsx`.

---

## 11. SIMULATED COLLABORATION

```typescript
// hooks/useCollabSimulation.ts
// Runs only when remoteUsers.length === 0

const SIM_USERS = [
  { id: 'sim-p', name: 'Priya S.',  color: '#FF2D55' },  // iOS red
  { id: 'sim-j', name: 'James K.', color: '#34C759' },  // iOS green
  { id: 'sim-l', name: 'Lena V.',  color: '#FF9500' },  // iOS amber
]

export function useCollabSimulation() {
  const { remoteUsers } = useCollabStore()
  const cursorRefs = useRef<Map<string, HTMLElement>>(new Map())
  const posRef = useRef<Map<string, { x: number; y: number; tx: number; ty: number }>>(
    new Map(SIM_USERS.map(u => [u.id, { x: 400, y: 300, tx: 400, ty: 300 }]))
  )

  useEffect(() => {
    if (remoteUsers.length > 0) return  // Real users present — don't simulate

    let raf: number
    const tick = () => {
      posRef.current.forEach((pos, id) => {
        // Drift toward target
        pos.x += (pos.tx - pos.x) * 0.04
        pos.y += (pos.ty - pos.y) * 0.04
        if (Math.hypot(pos.tx - pos.x, pos.ty - pos.y) < 5) {
          pos.tx = Math.random() * 900 - 50; pos.ty = Math.random() * 600 - 50
        }
        const el = cursorRefs.current.get(id)
        if (el) {
          const { x: px, y: py, zoom } = useCanvasStore.getState().viewport
          el.style.transform = `translate(${pos.x * zoom + px}px, ${pos.y * zoom + py}px)`
        }
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [remoteUsers.length])

  return { cursorRefs, simUsers: SIM_USERS, active: remoteUsers.length === 0 }
}
```

```tsx
// SimulatedCursors.tsx
export function SimulatedCursors() {
  const { cursorRefs, simUsers, active } = useCollabSimulation()
  if (!active) return null
  return (
    <div className="pointer-events-none fixed inset-0 z-[9998]">
      {simUsers.map(u => (
        <div key={u.id} ref={el => { if (el) cursorRefs.current.set(u.id, el) }}
          className="absolute will-change-transform" style={{ transform: 'translate(-9999px,-9999px)' }}>
          <svg width="18" height="18" viewBox="0 0 20 20" fill={u.color} stroke="white" strokeWidth="1.2">
            <path d="M4 2L16 10L10 11.5L7.5 17L4 2Z"/>
          </svg>
          <div className="absolute left-4 top-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold text-white" style={{ background: u.color }}>
            {u.name}
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 12. REGION EXPORT

```bash
npm install html2canvas
```

Export mode: `E` key → `exportStore.setMode('selecting')` → custom crosshair cursor on canvas → mouse drag creates selection rect → `ExportActionBar` slides up.

```tsx
// ExportActionBar.tsx (condensed)
import html2canvas from 'html2canvas'

async function doExport(region, format, scale) {
  const canvas = await html2canvas(document.body, {
    x: region.x, y: region.y, width: region.width, height: region.height,
    scale, useCORS: true,
    backgroundColor: format === 'JPG' ? '#F2F2F7' : null,
    ignoreElements: el => ['header-bar','left-toolbar','status-bar','export-overlay'].includes(el.id),
  })
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob!)
    Object.assign(document.createElement('a'), { href: url, download: `inkspace-${Date.now()}.${format.toLowerCase()}` }).click()
    URL.revokeObjectURL(url)
  }, format === 'JPG' ? 'image/jpeg' : 'image/png')
}

// Render:
<motion.div className="fixed z-[9991] flex items-center gap-2 glass-panel px-3 py-2 rounded-[14px]"
  style={{ left: region.x, top: region.y + region.height + 12 }}
  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}>
  <span className="font-mono text-[11px] text-[var(--text-muted)]">{Math.round(region.width)} × {Math.round(region.height)}</span>
  <div className="h-4 w-px bg-[var(--border)]" />
  {['PNG','JPG','SVG'].map(f => (
    <button key={f} onClick={() => setFormat(f)}
      className={`rounded-[8px] px-2.5 py-1 text-[12px] font-semibold transition-all ${format === f ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>{f}</button>
  ))}
  <div className="h-4 w-px bg-[var(--border)]" />
  {[1,2,3].map(s => (
    <button key={s} onClick={() => setScale(s)}
      className={`rounded-[8px] px-2 py-1 text-[12px] font-semibold transition-all ${scale === s ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>{s}x</button>
  ))}
  <div className="h-4 w-px bg-[var(--border)]" />
  <button onClick={() => doExport(region, format, scale)} className="primary-button text-[13px] rounded-[10px] py-1.5">Download</button>
  <button onClick={closeExport} className="icon-button h-7 w-7"><CloseIcon /></button>
</motion.div>
```

---

## 13. HANDWRITING TOOL

`W` key → custom pen cursor → click on canvas → bare contenteditable div in Caveat font, no background, no border. Behaves like the existing TextElement but always uses Caveat and floats nakedly on canvas.

```tsx
// HandwritingText.tsx
<div contentEditable suppressContentEditableWarning
  style={{
    position: 'absolute', left: el.x, top: el.y,
    fontFamily: 'Caveat, cursive',
    fontSize: el.fontSize ?? 28,
    color: el.color ?? 'var(--text-primary)',
    transform: `rotate(${el.rotation}deg)`,
    outline: 'none', background: 'none', border: 'none',
    minWidth: 40, lineHeight: 1.2,
    // Only visible border: dashed on hover/select
    boxShadow: isSelected ? '0 0 0 1.5px var(--accent)' : 'none',
  }}
  onBlur={e => updateElement(el.id, { content: e.target.textContent ?? '' })}
/>
```

---

## 14. IMAGE EMBEDDING

```typescript
// hooks/useImageDrop.ts
export function useImageDrop(canvasRef) {
  const { addElement, viewport } = useCanvasStore()

  const place = async (file: File, cx: number, cy: number) => {
    if (!file.type.startsWith('image/')) return
    const src = await new Promise<string>(res => {
      const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(file)
    })
    const img = new Image(); img.src = src
    await new Promise(res => { img.onload = res })
    const maxW = 400, scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
    const w = img.naturalWidth * scale, h = img.naturalHeight * scale
    const { x: px, y: py, zoom } = viewport
    addElement({
      id: nanoid(), type: 'image', src,
      x: (cx - px) / zoom - w / 2, y: (cy - py) / zoom - h / 2,
      width: w, height: h, rotation: 0, opacity: 1, locked: false,
      zIndex: getMaxZIndex() + 1, flipH: false, flipV: false,
      naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight,
    })
  }

  useEffect(() => {
    const el = canvasRef.current; if (!el) return
    const onDrop = (e: DragEvent) => { e.preventDefault(); const f = e.dataTransfer?.files[0]; if (f) place(f, e.clientX, e.clientY) }
    const onDragOver = (e: DragEvent) => { e.preventDefault() }
    const onPaste = (e: ClipboardEvent) => {
      for (const item of e.clipboardData?.items ?? [])
        if (item.type.startsWith('image/')) { const f = item.getAsFile(); if (f) place(f, innerWidth/2, innerHeight/2) }
    }
    el.addEventListener('drop', onDrop); el.addEventListener('dragover', onDragOver)
    window.addEventListener('paste', onPaste)
    return () => { el.removeEventListener('drop', onDrop); el.removeEventListener('dragover', onDragOver); window.removeEventListener('paste', onPaste) }
  }, [canvasRef, viewport])
}
```

Image element renders as `<img>` with `border-radius: 4px`, `box-shadow: var(--shadow-md)`, resize/rotate handles on select.

---

## 15. BOARD TEMPLATES MODAL

Show on first visit. Four templates: Blank, Sprint, Brainstorm, Roadmap (each is a JSON array of pre-made elements). Selecting one staggers elements in with 80ms delay each via Framer Motion. Store `inkspace-visited` in localStorage to skip on return.

```tsx
// TemplateModal.tsx — iOS sheet style
<motion.div className="fixed inset-0 z-[10000] flex items-end md:items-center justify-center"
  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
  <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => pick('blank')} />
  <motion.div className="relative z-10 w-full max-w-[560px] glass-panel p-6 mx-4"
    style={{ borderRadius: 'var(--radius-xl)' }}
    initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
    transition={{ type: 'spring', stiffness: 350, damping: 32 }}>
    <h2 className="font-display mb-1 text-[22px] font-bold tracking-tight text-[var(--text-primary)]">Start with a template</h2>
    <p className="mb-5 text-[15px] text-[var(--text-secondary)]">Or start blank and build your own.</p>
    <div className="grid grid-cols-2 gap-3">
      {TEMPLATES.map(t => (
        <button key={t.id} onClick={() => pick(t.id)}
          className="group rounded-[16px] border border-[var(--border)] bg-[var(--bg-secondary)] p-4 text-left transition-all hover:border-[var(--accent)] hover:bg-[var(--accent-glow)] active:scale-[0.98]">
          <div className="mb-3 h-[72px] w-full rounded-[10px] bg-[var(--bg-panel)]" /> {/* thumbnail */}
          <p className="text-[15px] font-semibold text-[var(--text-primary)]">{t.name}</p>
          <p className="text-[13px] text-[var(--text-secondary)]">{t.description}</p>
        </button>
      ))}
    </div>
  </motion.div>
</motion.div>
```

---

## FINAL CHECKLIST

- [ ] All CSS vars updated to Apple design tokens
- [ ] `-webkit-font-smoothing: antialiased` on `*`
- [ ] Buttons use `active:scale-[0.97]` — Apple press feedback
- [ ] Panels use `backdrop-filter: blur(20px) saturate(180%)`
- [ ] Border radius: `8px` small, `12px` medium, `16px` large, `20px` extra large, `100px` pill
- [ ] Left toolbar hidden on mobile (`md:flex hidden`)
- [ ] Bottom toolbar shown on mobile (`md:hidden`)
- [ ] Right panel: side rail on desktop, bottom sheet on mobile (drag-to-dismiss)
- [ ] Touch: pinch-zoom + two-finger pan working
- [ ] `safe-area-inset-bottom` applied to bottom toolbar and bottom sheet
- [ ] Y.js installed, `/board` redirects to `/board/[id]`, sync works between two tabs
- [ ] Simulated cursors only show when no real remote users
- [ ] `E` → region select → marching ants → export bar → downloads file
- [ ] `W` → bare Caveat text on canvas, no background
- [ ] Image drop / paste / `I` key → places image with spring animation
- [ ] Template modal on first visit, 80ms stagger on element load
- [ ] Toast notifications match Apple banner style
- [ ] Context menu matches macOS popover style