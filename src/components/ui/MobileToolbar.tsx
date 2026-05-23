'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';

const MOBILE_TOOLS = [
  { id: 'select',      label: 'Select',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M5 3l14 9-7 2-4 7z"/></svg> },
  { id: 'note',        label: 'Note',    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
  { id: 'handwriting', label: 'Write',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 3a2.828 2.828 0 114 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg> },
  { id: 'draw',        label: 'Draw',    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 17c3-3 6 3 9 0s6-3 9 0"/><path d="M3 12c3-3 6 3 9 0s6-3 9 0"/></svg> },
  { id: 'image',       label: 'Image',   icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg> },
  { id: 'export',      label: 'Export',  icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
];

export const MobileToolbar: React.FC = () => {
  const store = useCanvasStore();
  const activeTool = store.activeTool;

  return (
    <div
      id="mobile-toolbar"
      className="fixed bottom-0 left-0 right-0 z-[9000] md:hidden glass-panel"
      style={{
        borderRadius: '20px 20px 0 0',
        borderTop: '0.5px solid var(--border)',
        borderLeft: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {MOBILE_TOOLS.map((tool) => {
          const isActive = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => store.setTool(tool.id)}
              className="flex flex-col items-center gap-0.5 rounded-[12px] px-3 py-2 transition-all active:scale-95"
              style={{
                background: isActive ? 'var(--accent-glow)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                minWidth: 52,
              }}
            >
              {tool.icon}
              <span style={{ fontSize: 10, fontWeight: 500, fontFamily: 'var(--font-ui)', marginTop: 2 }}>
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
