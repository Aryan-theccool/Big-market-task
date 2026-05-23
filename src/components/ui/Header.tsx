'use client';

import React, { useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { useCollabStore } from '../../store/collabStore';
import { compressAndResizeImage } from '../../utils/imageHelper';

interface HeaderProps {
  toast: (msg: string, color?: string) => void;
  onOpenHelp: () => void;
  onExport: () => void;
  onShare?: () => void;
  viewportRef: React.RefObject<HTMLDivElement>;
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5" />
      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

function LogoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8M16 6l-4-4-4 4M12 2v13" />
    </svg>
  );
}

function initials(name: string) {
  return name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({ toast, onOpenHelp, onExport, onShare, viewportRef }) => {
  const store = useCanvasStore();
  const { remoteUsers } = useCollabStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    const data = JSON.stringify({ boardName: store.boardName, viewport: store.viewport, elements: store.elements }, null, 2);
    const link = document.createElement('a');
    link.download = `${store.boardName.replace(/\s+/g, '-')}.inkspace.json`;
    link.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(data);
    link.click();
    toast('Board exported as JSON');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const b64 = ev.target?.result as string;
        const vp = store.viewport;
        const vw = window.innerWidth, vh = window.innerHeight;
        const cx = (vw / 2 - vp.x) / vp.zoom;
        const cy = (vh / 2 - vp.y) / vp.zoom;
        const img = await compressAndResizeImage(b64);
        store.addElement({ id: 'el_' + Math.random().toString(36).slice(2, 9), type: 'image', x: cx - img.w / 2, y: cy - img.h / 2, w: img.w, h: img.h, src: img.src, z: Date.now() % 100000 });
        toast('Image added to canvas!');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse((reader.result as string).replace(/^﻿/, ''));
        const els = Array.isArray(data) ? data : data.elements;
        if (els) { store.importBoard(els, data.boardName, data.viewport); toast('Board imported!'); }
        else toast('Invalid board file');
      } catch { toast('Failed to parse file'); }
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const onlineCount = remoteUsers.length;

  return (
    <header
      id="header-bar"
      className="fixed top-0 left-0 right-0 z-[9500] flex items-center justify-between px-4 glass-panel"
      style={{ height: 52, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid var(--border)' }}
    >
      {/* Left: Logo + board name */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div
          className="flex items-center justify-center rounded-[8px] shrink-0"
          style={{ width: 28, height: 28, background: 'var(--accent)' }}
        >
          <LogoIcon />
        </div>
        <input
          value={store.boardName}
          onChange={(e) => store.setBoardName(e.target.value || 'Untitled')}
          onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
          className="min-w-0 max-w-[180px] truncate bg-transparent outline-none rounded-[8px] px-2 py-0.5 transition-colors"
          style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}
          onFocus={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
          onBlur={(e) => (e.currentTarget.style.background = 'transparent')}
        />
      </div>

      {/* Center: real collab avatars (desktop only) */}
      <div className="absolute left-1/2 -translate-x-1/2 hidden md:flex items-center gap-2">
        {onlineCount > 0 ? (
          <>
            <div className="flex">
              {remoteUsers.slice(0, 4).map((u, i) => (
                <div
                  key={u.clientId}
                  title={`${u.name} — online`}
                  className="relative flex items-center justify-center rounded-full text-white select-none"
                  style={{
                    width: 28, height: 28,
                    background: u.color,
                    border: '2px solid var(--bg-surface)',
                    marginLeft: i > 0 ? -8 : 0,
                    fontSize: 10, fontWeight: 700,
                    fontFamily: 'var(--font-ui)',
                    zIndex: 4 - i,
                  }}
                >
                  {initials(u.name)}
                  <span className="absolute rounded-full"
                    style={{ width: 7, height: 7, background: 'var(--green)', border: '1.5px solid var(--bg-surface)', bottom: -1, right: -1 }} />
                </div>
              ))}
            </div>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
              {onlineCount} online
            </span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-ui)' }}>
            Only you — share to collaborate
          </span>
        )}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Share link */}
        <button
          onClick={onShare}
          className="primary-button hidden md:flex items-center gap-1.5"
          style={{ padding: '5px 12px', fontSize: 13 }}
        >
          <ShareIcon />
          Share
        </button>

        <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px' }} />

        {/* Import */}
        <label title="Import board or image" className="icon-button cursor-pointer">
          <input ref={fileInputRef} type="file" accept=".json,image/*" onChange={handleImport} className="hidden" />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
        </label>

        {/* Export image */}
        <button onClick={onExport} className="ghost-button hidden md:flex" style={{ padding: '5px 12px', fontSize: 13 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
          </svg>
          Export
        </button>

        {/* Theme toggle */}
        <button onClick={store.toggleTheme} title="Toggle theme" className="icon-button">
          {store.theme === 'light' ? <MoonIcon /> : <SunIcon />}
        </button>
      </div>
    </header>
  );
};
