'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';

interface StatusBarProps { viewportWidth: number; viewportHeight: number; }

export const StatusBar: React.FC<StatusBarProps> = ({ viewportWidth, viewportHeight }) => {
  const store = useCanvasStore();
  const zoom = store.viewport.zoom;
  const pct = Math.round(zoom * 100);

  const zoomTo = (z: number) => {
    const vw = viewportWidth || window.innerWidth;
    const vh = viewportHeight || window.innerHeight;
    store.setViewport({
      x: vw / 2 - (vw / 2 - store.viewport.x) * (z / zoom),
      y: vh / 2 - (vh / 2 - store.viewport.y) * (z / zoom),
      zoom: z,
    });
  };

  const elemsCount = store.elements.length;

  return (
    <div
      id="status-bar"
      className="absolute bottom-0 left-0 right-0 z-[9000] hidden md:flex items-center justify-between px-4 glass-panel"
      style={{
        height: 32,
        borderRadius: 0,
        borderTop: '0.5px solid var(--border)',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
      }}
    >
      {/* Zoom controls */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => zoomTo(Math.max(0.08, zoom - 0.1))}
          className="icon-button"
          style={{ width: 24, height: 24, fontSize: 16, borderRadius: 6 }}
        >−</button>
        <button
          onClick={() => zoomTo(1)}
          title="Click to reset zoom"
          className="transition-colors"
          style={{
            minWidth: 48, textAlign: 'center',
            background: 'var(--bg-hover)',
            border: '0.5px solid var(--border)',
            borderRadius: 6,
            padding: '1px 6px',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
        >{pct}%</button>
        <button
          onClick={() => zoomTo(Math.min(5, zoom + 0.1))}
          className="icon-button"
          style={{ width: 24, height: 24, fontSize: 16, borderRadius: 6 }}
        >+</button>
        <button
          onClick={() => store.fitToScreen(viewportWidth, viewportHeight)}
          className="transition-colors rounded-[6px] px-2 py-0.5"
          style={{ fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)' }}
          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
        >Fit</button>
      </div>

      {/* Center: toggles */}
      <div className="flex items-center gap-1">
        {[
          { label: 'Grid', active: store.showGrid, onClick: store.toggleGrid },
          { label: 'Snap', active: store.snap,     onClick: store.toggleSnap },
          { label: 'Map',  active: store.showMini, onClick: store.toggleMini },
        ].map(({ label, active, onClick }) => (
          <button
            key={label}
            onClick={onClick}
            className="rounded-[6px] px-2 py-0.5 transition-colors"
            style={{
              fontSize: 12, border: 'none', cursor: 'pointer', fontFamily: 'var(--font-ui)',
              background: active ? 'var(--accent-glow)' : 'none',
              color: active ? 'var(--accent)' : 'var(--text-muted)',
              fontWeight: active ? 500 : 400,
            }}
          >{label}</button>
        ))}
      </div>

      {/* Right: object count + undo/redo */}
      <div className="flex items-center gap-3">
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
          {elemsCount} object{elemsCount !== 1 ? 's' : ''}
          {store.selected.length > 0 && (
            <> · <span style={{ color: 'var(--accent)' }}>{store.selected.length} selected</span></>
          )}
        </span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={store.undo}
            disabled={!store.history.past.length}
            title="Undo (⌘Z)"
            className="icon-button disabled:opacity-30"
            style={{ width: 24, height: 24, borderRadius: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M9 14L4 9l5-5"/><path d="M4 9h11a6 6 0 010 12h-1"/>
            </svg>
          </button>
          <button
            onClick={store.redo}
            disabled={!store.history.future.length}
            title="Redo (⌘⇧Z)"
            className="icon-button disabled:opacity-30"
            style={{ width: 24, height: 24, borderRadius: 6 }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M15 14l5-5-5-5"/><path d="M20 9H9a6 6 0 000 12h1"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
