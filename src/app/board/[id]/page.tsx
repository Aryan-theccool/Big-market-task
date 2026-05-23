'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useCanvasStore } from '../../../store/canvasStore';
import { useBoardsStore } from '../../../store/boardsStore';
import { Header } from '../../../components/ui/Header';
import { LeftToolRail } from '../../../components/ui/LeftToolRail';
import { MobileToolbar } from '../../../components/ui/MobileToolbar';
import { CanvasViewport } from '../../../components/canvas/CanvasViewport';
import { InspectorPanel } from '../../../components/ui/InspectorPanel';
import { StatusBar } from '../../../components/ui/StatusBar';
import { CanvasMiniMap } from '../../../components/canvas/CanvasMiniMap';
import { CommandPalette } from '../../../components/ui/CommandPalette';
import { RemoteCursors } from '../../../components/collab/RemoteCursors';
import { TemplateModal, useTemplateModal } from '../../../components/ui/TemplateModal';
import { useCollabSync } from '../../../hooks/useCollabSync';

interface Toast { id: string; message: string; type: 'info' | 'success' | 'error' | 'warning'; }

const TOAST_COLORS = {
  info:    { bg: 'rgba(0,122,255,0.15)',  icon: '#007AFF' },
  success: { bg: 'rgba(52,199,89,0.15)', icon: '#34C759' },
  error:   { bg: 'rgba(255,59,48,0.15)', icon: '#FF3B30' },
  warning: { bg: 'rgba(255,149,0,0.15)', icon: '#FF9500' },
};

// ─── Share Modal ──────────────────────────────────────────────────────────────
function ShareModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';

  const copy = async () => {
    try { await navigator.clipboard.writeText(url); } catch { /* fallback */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass-panel overflow-hidden"
        style={{ width: 400, borderRadius: 24, boxShadow: 'var(--shadow-lg)' }}
        initial={{ y: 24, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 12, opacity: 0, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center rounded-[10px]" style={{ width: 34, height: 34, background: 'var(--accent-glow)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
                <path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/>
              </svg>
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>Share Board</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)' }}>Anyone with the link can collaborate</p>
            </div>
          </div>
          <button onClick={onClose} className="icon-button" style={{ width: 30, height: 30, borderRadius: 8 }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* URL box */}
        <div className="px-5 py-5 flex flex-col gap-4">
          <div>
            <p className="mb-2" style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Board Link</p>
            <div className="flex items-center gap-2 rounded-[12px] px-3 py-2.5" style={{ background: 'var(--bg-secondary)', border: '0.5px solid var(--border)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
              </svg>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-secondary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {url}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={copy}
              className="flex items-center justify-center gap-2 py-3 rounded-[14px] font-semibold transition-all"
              style={{
                fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, border: 'none', cursor: 'pointer',
                background: copied ? 'rgba(52,199,89,0.15)' : 'var(--accent)',
                color: copied ? '#34C759' : 'white',
              }}
            >
              {copied ? (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!</>
              ) : (
                <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Copy Link</>
              )}
            </button>
            <button
              onClick={() => window.open(url, '_blank')}
              className="flex items-center justify-center gap-2 py-3 rounded-[14px] font-semibold secondary-button"
              style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, justifyContent: 'center' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Open in Tab
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>How it works</span>
            <div style={{ flex: 1, height: '0.5px', background: 'var(--border)' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, textAlign: 'center' }}>
            Share this link with anyone. They can open it in their browser and collaborate on this board in real time — no account needed.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BoardIdPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = typeof params.id === 'string' ? params.id : '';

  const store = useCanvasStore();
  const boardsStore = useBoardsStore();
  const viewportRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const [vpSize, setVpSize] = useState({ w: 1200, h: 800 });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [cmdOpen, setCmdOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const [regionStart, setRegionStart] = useState<{ x: number; y: number } | null>(null);
  const [regionBox, setRegionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [exportScale, setExportScale] = useState(2);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // Real-time collab
  useCollabSync(roomId);

  // Template modal — shows once per board (per-board localStorage flag)
  const tplModal = useTemplateModal(roomId);

  const addToast = useCallback((message: string, color?: string) => {
    const type: Toast['type'] = color === '#34C759' || color === '#22C55E' || color === 'success'
      ? 'success' : color === '#FF3B30' || color === '#F43F5E' || color === 'error'
      ? 'error' : color === '#FF9500' || color === '#F59E0B' || color === 'warning'
      ? 'warning' : 'info';
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev.slice(-2), { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  }, []);

  // Boot: hydrate boardsStore + load this board's data
  useEffect(() => {
    if (!roomId) return;
    boardsStore.hydrate();
    // Register board in store if not already known
    const known = boardsStore.boards.find((b) => b.id === roomId);
    if (!known) boardsStore.updateMeta(roomId, { id: roomId, name: 'Untitled Board', createdAt: Date.now(), updatedAt: Date.now(), elementCount: 0, colorIdx: 0 });
    // Load board data
    store.setBoardId(roomId);
    store.hydrate(roomId);

    const t = localStorage.getItem('inkspace-theme') as 'light' | 'dark';
    if (t) store.setTheme(t);
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync element count to boardsStore on change
  useEffect(() => {
    if (!roomId) return;
    boardsStore.updateMeta(roomId, { elementCount: store.elements.length, name: store.boardName });
  }, [store.elements.length, store.boardName, roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) setVpSize({ w: boardRef.current.clientWidth, h: boardRef.current.clientHeight });
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = document.activeElement;
      const isEditing = el?.getAttribute('contenteditable') === 'true' || el?.tagName === 'INPUT' || el?.tagName === 'TEXTAREA';
      if (isEditing) {
        if (e.key === 'Escape') { (el as HTMLElement).blur(); store.setTool('select'); }
        return;
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setCmdOpen((p) => !p); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) { e.preventDefault(); store.undo(); return; }
      if ((e.metaKey || e.ctrlKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) { e.preventDefault(); store.redo(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') { e.preventDefault(); store.duplicateSelected(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'a') { e.preventDefault(); store.setSelected(store.elements.map((el2) => el2.id)); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') { store.copySelected(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'v') { store.pasteSelected(); return; }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') { e.preventDefault(); store.fitToScreen(vpSize.w, vpSize.h); return; }
      const keyMap: Record<string, string> = { v: 'select', h: 'hand', n: 'note', t: 'text', w: 'handwriting', r: 'rect', c: 'circle', l: 'line', a: 'arrow', d: 'draw', i: 'image', f: 'frame', e: 'export' };
      if (keyMap[e.key.toLowerCase()] && !e.metaKey && !e.ctrlKey) { store.setTool(keyMap[e.key.toLowerCase()]); return; }
      if (e.shiftKey && e.key.toLowerCase() === 't') { e.preventDefault(); tplModal.openModal(); return; }
      if (e.key === 'Escape') { store.setSelected([]); store.setTool('select'); setRegionBox(null); setCmdOpen(false); setExportModalOpen(false); setShareOpen(false); return; }
      if (e.key === 'Delete' || e.key === 'Backspace') { store.deleteSelected(); return; }
      if (e.key === 'g') { store.toggleGrid(); return; }
      if (e.key === 'm') { store.toggleMini(); return; }
      if (e.key === '[') { store.selected.forEach((id) => store.sendBackward(id)); return; }
      if (e.key === ']') { store.selected.forEach((id) => store.bringForward(id)); return; }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store, vpSize]);

  const doExport = async (fmt: 'png' | 'jpeg', scale: number) => {
    if (!regionBox || regionBox.w < 10 || regionBox.h < 10) { addToast('Draw a region first using the E tool', 'warning'); return; }
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const vpEl = viewportRef.current; if (!vpEl) return;
      const ids = ['region-export-overlay', 'left-toolbar', 'inkspace-minimap', 'header-bar', 'status-bar'];
      const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      els.forEach((el) => { el.style.visibility = 'hidden'; });
      const canvas = await html2canvas(vpEl, { x: regionBox.x, y: regionBox.y, width: regionBox.w, height: regionBox.h, scale, useCORS: true, logging: false, backgroundColor: fmt === 'jpeg' ? (store.theme === 'dark' ? '#000000' : '#F2F2F7') : null });
      els.forEach((el) => { el.style.visibility = ''; });
      const link = document.createElement('a');
      link.download = `inkspace-${Date.now()}.${fmt}`;
      link.href = canvas.toDataURL(`image/${fmt}`);
      link.click();
      addToast(`Exported ${fmt.toUpperCase()} · ${Math.round(regionBox.w * scale)} × ${Math.round(regionBox.h * scale)} px`, 'success');
      setRegionBox(null);
    } catch { addToast('Export failed', 'error'); }
    finally { setIsExporting(false); }
  };

  const doFullExport = async (fmt: 'png' | 'jpeg', scale: number) => {
    setIsExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const vpEl = viewportRef.current; if (!vpEl) return;
      const ids = ['left-toolbar', 'inkspace-minimap', 'header-bar', 'status-bar', 'inkspace-inspector', 'mobile-toolbar'];
      const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
      els.forEach((el) => (el.style.visibility = 'hidden'));
      const canvas = await html2canvas(vpEl, { scale, useCORS: true, logging: false, backgroundColor: fmt === 'jpeg' ? (store.theme === 'dark' ? '#000000' : '#F2F2F7') : null });
      els.forEach((el) => (el.style.visibility = ''));
      const link = document.createElement('a');
      link.download = `inkspace-board-${Date.now()}.${fmt}`;
      link.href = canvas.toDataURL(`image/${fmt}`);
      link.click();
      addToast(`Board exported as ${fmt.toUpperCase()}`, 'success');
      setExportModalOpen(false);
    } catch { addToast('Export failed', 'error'); }
    finally { setIsExporting(false); }
  };

  const hasRegion = regionBox && regionBox.w > 20 && regionBox.h > 20;

  return (
    <div ref={boardRef} className="fixed inset-0 overflow-hidden" style={{ background: 'var(--bg-canvas)' }}>
      {/* Header */}
      <Header
        toast={addToast}
        onOpenHelp={() => {}}
        onExport={() => setExportModalOpen(true)}
        onShare={() => setShareOpen(true)}
        viewportRef={viewportRef}
      />

      {/* Back to boards button */}
      <button
        onClick={() => router.push('/boards')}
        className="fixed z-[9501] flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 transition-colors"
        style={{
          top: 60, left: 16,
          fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500,
          color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        All Boards
      </button>

      {/* Canvas */}
      <div className="absolute inset-0 top-[52px]" style={{ bottom: 0 }}>
        <CanvasViewport viewportRef={viewportRef} regionStart={regionStart} setRegionStart={setRegionStart} regionBox={regionBox} setRegionBox={setRegionBox} toast={addToast} />
      </div>

      {/* Left tool rail */}
      <div className="absolute inset-0 top-[52px] pointer-events-none">
        <div className="pointer-events-auto"><LeftToolRail onOpenTemplates={tplModal.openModal} /></div>
      </div>

      {/* Mobile toolbar */}
      <MobileToolbar />

      {/* Inspector */}
      <div className="absolute top-[52px] right-0 bottom-[32px]" style={{ pointerEvents: 'none' }}>
        <div style={{ pointerEvents: 'auto' }}><InspectorPanel /></div>
      </div>

      {/* Status bar */}
      <StatusBar viewportWidth={vpSize.w} viewportHeight={vpSize.h} />

      {/* Minimap */}
      {store.showMini && (
        <div className="absolute bottom-[40px] right-4 z-[9000] hidden md:block">
          <CanvasMiniMap viewportWidth={vpSize.w} viewportHeight={vpSize.h} />
        </div>
      )}

      {/* Remote collab cursors */}
      <RemoteCursors />

      {/* Command palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} toast={addToast} viewportWidth={vpSize.w} viewportHeight={vpSize.h} />

      {/* Template modal */}
      <AnimatePresence>
        {tplModal.open && <TemplateModal onClose={tplModal.close} />}
      </AnimatePresence>

      {/* Share modal */}
      <AnimatePresence>
        {shareOpen && <ShareModal onClose={() => setShareOpen(false)} />}
      </AnimatePresence>

      {/* Region export action bar */}
      <AnimatePresence>
        {hasRegion && (
          <motion.div className="absolute z-[9800]" style={{ left: regionBox.x, top: Math.max(60, regionBox.y + regionBox.h + 12) }}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="flex items-center gap-2 px-3 py-2 glass-panel" style={{ borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>{Math.round(regionBox.w)} × {Math.round(regionBox.h)}</span>
              <div style={{ width: '0.5px', height: 16, background: 'var(--border)' }} />
              {(['png', 'jpeg'] as const).map((fmt) => (
                <button key={fmt} onClick={() => setExportFormat(fmt)} className="rounded-[8px] px-2.5 py-1 transition-all"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: exportFormat === fmt ? 'var(--accent)' : 'transparent', color: exportFormat === fmt ? 'white' : 'var(--text-secondary)' }}
                >{fmt.toUpperCase()}</button>
              ))}
              <div style={{ width: '0.5px', height: 16, background: 'var(--border)' }} />
              {[1, 2, 3].map((s) => (
                <button key={s} onClick={() => setExportScale(s)} className="rounded-[8px] px-2 py-1 transition-all"
                  style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer', background: exportScale === s ? 'var(--accent)' : 'transparent', color: exportScale === s ? 'white' : 'var(--text-secondary)' }}
                >{s}×</button>
              ))}
              <div style={{ width: '0.5px', height: 16, background: 'var(--border)' }} />
              <button onClick={() => doExport(exportFormat, exportScale)} disabled={isExporting} className="primary-button" style={{ fontSize: 13, padding: '5px 12px', borderRadius: 8 }}>
                {isExporting ? '…' : 'Download'}
              </button>
              <button onClick={() => { setRegionBox(null); store.setTool('select'); }} className="icon-button" style={{ width: 28, height: 28, borderRadius: 7 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full export modal */}
      <AnimatePresence>
        {exportModalOpen && (
          <motion.div className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setExportModalOpen(false)}
          >
            <motion.div className="glass-panel overflow-hidden" style={{ width: 360, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-lg)' }}
              initial={{ y: 20, opacity: 0, scale: 0.96 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 10, opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }} onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>Export Board</span>
                <button onClick={() => setExportModalOpen(false)} className="icon-button" style={{ width: 28, height: 28, borderRadius: 7 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="px-5 py-5 flex flex-col gap-5">
                <div>
                  <p className="mb-3" style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Scale</p>
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <button key={s} onClick={() => setExportScale(s)} className="flex-1 py-2 rounded-[10px] font-semibold transition-all"
                        style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: exportScale === s ? 'white' : 'var(--text-secondary)', background: exportScale === s ? 'var(--accent)' : 'var(--bg-secondary)', border: 'none', cursor: 'pointer' }}
                      >{s}×</button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {(['png', 'jpeg'] as const).map((fmt) => (
                    <button key={fmt} onClick={() => doFullExport(fmt, exportScale)} disabled={isExporting}
                      className="flex flex-col items-center gap-2 py-4 rounded-[12px] transition-colors"
                      style={{ background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', cursor: isExporting ? 'wait' : 'pointer', opacity: isExporting ? 0.6 : 1 }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>{fmt}</span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)' }}>{fmt === 'png' ? 'Transparent bg' : 'White/Black bg'}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Region export helper banner */}
      <AnimatePresence>
        {store.activeTool === 'export' && !hasRegion && (
          <motion.div
            className="fixed z-[9800] left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2.5 glass-panel"
            style={{
              top: 72,
              borderRadius: '9999px',
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border)',
            }}
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
          >
            <span
              className="flex h-2 w-2 rounded-full bg-indigo-500 animate-pulse flex-shrink-0"
              style={{ background: 'var(--accent)' }}
            />
            <span
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              Export Region: Drag a box over the canvas to crop
            </span>
            <div style={{ width: '0.5px', height: 16, background: 'var(--border)' }} />
            <button
              onClick={() => {
                store.setTool('select');
                setRegionBox(null);
                setRegionStart(null);
              }}
              className="rounded-full px-3 py-1 transition-all"
              style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast stack */}
      <div className="fixed top-[60px] left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 items-center" style={{ pointerEvents: 'none' }}>
        <AnimatePresence>
          {toasts.map((t) => {
            const colors = TOAST_COLORS[t.type];
            return (
              <motion.div key={t.id} className="flex items-center gap-3 rounded-[16px]"
                style={{ background: 'var(--bg-panel)', backdropFilter: 'var(--blur-panel)', WebkitBackdropFilter: 'var(--blur-panel)', border: '0.5px solid var(--border)', boxShadow: 'var(--shadow-lg)', padding: '10px 16px 10px 12px', minWidth: 240, maxWidth: 360, pointerEvents: 'auto' }}
                initial={{ opacity: 0, y: -16, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <div className="flex items-center justify-center rounded-[10px] flex-shrink-0" style={{ width: 34, height: 34, background: colors.bg }}>
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.icon }} />
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', flex: 1 }}>{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
