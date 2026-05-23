'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

interface Command {
  id: string;
  label: string;
  shortcut?: string;
  section: string;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  toast: (msg: string, color?: string) => void;
  viewportWidth: number;
  viewportHeight: number;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  open, onClose, toast, viewportWidth, viewportHeight,
}) => {
  const store = useCanvasStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: Command[] = [
    { id: 'fit',     label: 'Fit to screen',        shortcut: '⌘0', section: 'Canvas',   action: () => { store.fitToScreen(viewportWidth, viewportHeight); onClose(); } },
    { id: 'zoom1',   label: 'Zoom to 100%',          shortcut: '',   section: 'Canvas',   action: () => { store.setViewport({ zoom: 1 }); onClose(); } },
    { id: 'grid',    label: 'Toggle grid',            shortcut: 'G',  section: 'Canvas',   action: () => { store.toggleGrid(); onClose(); } },
    { id: 'snap',    label: 'Toggle snap',            shortcut: '',   section: 'Canvas',   action: () => { store.toggleSnap(); onClose(); } },
    { id: 'theme',   label: 'Toggle dark mode',       shortcut: '',   section: 'Canvas',   action: () => { store.toggleTheme(); onClose(); } },
    { id: 'mini',    label: 'Toggle minimap',         shortcut: 'M',  section: 'Canvas',   action: () => { store.toggleMini(); onClose(); } },
    { id: 'note',    label: 'Add sticky note',        shortcut: 'N',  section: 'Elements', action: () => { store.setTool('note'); onClose(); } },
    { id: 'hw',      label: 'Add handwriting',        shortcut: 'W',  section: 'Elements', action: () => { store.setTool('handwriting'); onClose(); } },
    { id: 'text',    label: 'Add text',               shortcut: 'T',  section: 'Elements', action: () => { store.setTool('text'); onClose(); } },
    { id: 'rect',    label: 'Draw rectangle',         shortcut: 'R',  section: 'Elements', action: () => { store.setTool('rect'); onClose(); } },
    { id: 'circle',  label: 'Draw circle',            shortcut: 'C',  section: 'Elements', action: () => { store.setTool('circle'); onClose(); } },
    { id: 'image',   label: 'Add image',              shortcut: 'I',  section: 'Elements', action: () => { store.setTool('image'); onClose(); } },
    { id: 'del',     label: 'Delete selected',        shortcut: 'Del',section: 'Elements', action: () => { store.deleteSelected(); onClose(); } },
    { id: 'dup',     label: 'Duplicate selected',     shortcut: '⌘D', section: 'Elements', action: () => { store.duplicateSelected(); onClose(); } },
    { id: 'sall',    label: 'Select all',             shortcut: '⌘A', section: 'Elements', action: () => { store.setSelected(store.elements.map(e => e.id)); onClose(); } },
    { id: 'export',  label: 'Export region',          shortcut: 'E',  section: 'Export',   action: () => { store.setTool('export'); onClose(); } },
    { id: 'undo',    label: 'Undo',                   shortcut: '⌘Z', section: 'History',  action: () => { store.undo(); onClose(); } },
    { id: 'redo',    label: 'Redo',                   shortcut: '⌘⇧Z',section: 'History', action: () => { store.redo(); onClose(); } },
  ];

  const filtered = query.trim()
    ? commands.filter((c) => c.label.toLowerCase().includes(query.toLowerCase()))
    : commands;

  const grouped: Record<string, Command[]> = {};
  filtered.forEach((c) => { (grouped[c.section] = grouped[c.section] || []).push(c); });

  const [active, setActive] = useState(0);
  const allFiltered = filtered;

  useEffect(() => { if (open) { setQuery(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 60); } }, [open]);

  useEffect(() => { setActive(0); }, [query]);

  const execute = (cmd: Command) => { cmd.action(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, allFiltered.length - 1)); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    if (e.key === 'Enter')     { e.preventDefault(); if (allFiltered[active]) execute(allFiltered[active]); }
    if (e.key === 'Escape')    { onClose(); }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-start justify-center pt-[18vh]"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="animate-scale-in w-full max-w-[520px] rounded-2xl overflow-hidden"
        style={{
          background: 'var(--bg-surface)', backdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.25), 0 4px 16px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
          <svg viewBox="0 0 16 16" className="w-4 h-4 shrink-0" fill="none" stroke="var(--text-muted)" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="7" cy="7" r="4.5" /><path d="M11 11l3 3" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search commands…"
            className="flex-1 outline-none bg-transparent"
            style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-primary)', border: 'none' }}
          />
          <kbd
            className="px-1.5 py-0.5 rounded text-[10px]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
          >
            ⌘K
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[360px] overflow-y-auto py-2">
          {Object.entries(grouped).map(([section, cmds]) => (
            <div key={section}>
              <div
                className="px-4 py-1.5"
                style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}
              >
                {section}
              </div>
              {cmds.map((cmd) => {
                const globalIdx = allFiltered.indexOf(cmd);
                const isActive = globalIdx === active;
                return (
                  <button
                    key={cmd.id}
                    className="w-full flex items-center gap-3 px-4 py-2 text-left transition-colors duration-75"
                    style={{
                      background: isActive ? 'var(--accent-glow)' : 'transparent',
                      border: 'none', cursor: 'pointer',
                    }}
                    onClick={() => execute(cmd)}
                    onMouseEnter={() => setActive(globalIdx)}
                  >
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-primary)', flex: 1, fontWeight: isActive ? 500 : 400 }}>
                      {cmd.label}
                    </span>
                    {cmd.shortcut && (
                      <kbd
                        className="px-1.5 py-0.5 rounded text-[10px]"
                        style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--bg-hover)', border: '1px solid var(--border)' }}
                      >
                        {cmd.shortcut}
                      </kbd>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center" style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>
              No commands found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
