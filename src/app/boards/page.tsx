'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useBoardsStore, BoardMeta } from '../../store/boardsStore';
import { useCanvasStore } from '../../store/canvasStore';
import Link from 'next/link';
import { TEMPLATE_CARDS, TemplateCard } from '../../components/ui/TemplatePreviews';

/* ─── Palette ──────────────────────────────────────────────────────────── */
const CARD_PALETTES = [
  { bg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', accent: '#3B82F6', dot: '#93C5FD', textCol: '#1E40AF' },
  { bg: 'linear-gradient(135deg, #FFF7ED 0%, #FED7AA 100%)', accent: '#F97316', dot: '#FDBA74', textCol: '#C2410C' },
  { bg: 'linear-gradient(135deg, #F0FDF4 0%, #BBF7D0 100%)', accent: '#22C55E', dot: '#86EFAC', textCol: '#15803D' },
  { bg: 'linear-gradient(135deg, #FDF4FF 0%, #E9D5FF 100%)', accent: '#A855F7', dot: '#C4B5FD', textCol: '#7E22CE' },
  { bg: 'linear-gradient(135deg, #FFF1F2 0%, #FECDD3 100%)', accent: '#F43F5E', dot: '#FDA4AF', textCol: '#BE123C' },
  { bg: 'linear-gradient(135deg, #F0F9FF 0%, #BAE6FD 100%)', accent: '#0EA5E9', dot: '#7DD3FC', textCol: '#0369A1' },
  { bg: 'linear-gradient(135deg, #FEFCE8 0%, #FEF08A 100%)', accent: '#EAB308', dot: '#FDE047', textCol: '#A16207' },
  { bg: 'linear-gradient(135deg, #FFF5F5 0%, #FED7D7 100%)', accent: '#EF4444', dot: '#FCA5A5', textCol: '#B91C1C' },
];

const DARK_CARD_PALETTES = [
  { bg: 'linear-gradient(135deg, #0F1A2E 0%, #1A2A45 100%)', accent: '#60A5FA', dot: '#3B82F6', textCol: '#93C5FD' },
  { bg: 'linear-gradient(135deg, #221408 0%, #35200E 100%)', accent: '#FB923C', dot: '#F97316', textCol: '#FDBA74' },
  { bg: 'linear-gradient(135deg, #0A1F12 0%, #142B1E 100%)', accent: '#4ADE80', dot: '#22C55E', textCol: '#86EFAC' },
  { bg: 'linear-gradient(135deg, #17082B 0%, #240E40 100%)', accent: '#C084FC', dot: '#A855F7', textCol: '#E9D5FF' },
  { bg: 'linear-gradient(135deg, #220610 0%, #340B18 100%)', accent: '#FB7185', dot: '#F43F5E', textCol: '#FDA4AF' },
  { bg: 'linear-gradient(135deg, #051520 0%, #0B2235 100%)', accent: '#38BDF8', dot: '#0EA5E9', textCol: '#7DD3FC' },
  { bg: 'linear-gradient(135deg, #1E1A04 0%, #2E2806 100%)', accent: '#FACC15', dot: '#EAB308', textCol: '#FDE047' },
  { bg: 'linear-gradient(135deg, #200808 0%, #2E0F0F 100%)', accent: '#F87171', dot: '#EF4444', textCol: '#FCA5A5' },
];

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/* ─── Board Card ──────────────────────────────────────────────────────── */
function BoardCard({ board, theme, onDelete, onDuplicate, onRename, viewMode }: {
  board: BoardMeta;
  theme: 'light' | 'dark';
  onDelete: () => void;
  onDuplicate: () => void;
  onRename: (name: string) => void;
  viewMode: 'grid' | 'list';
}) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [draftName, setDraftName] = useState(board.name);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pal = (theme === 'dark' ? DARK_CARD_PALETTES : CARD_PALETTES)[board.colorIdx % 8];

  useEffect(() => { if (renaming) inputRef.current?.select(); }, [renaming]);

  useEffect(() => {
    if (!menuOpen) return;
    const h = (e: MouseEvent) => { if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false); };
    document.addEventListener('mousedown', h, { capture: true });
    return () => document.removeEventListener('mousedown', h, { capture: true });
  }, [menuOpen]);

  const commit = () => { onRename(draftName.trim() || board.name); setRenaming(false); };

  if (viewMode === 'list') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -8 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
        className="relative flex items-center gap-4 rounded-[16px] px-4 py-3 cursor-pointer select-none"
        style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)', border: '1px solid ' + (theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)') }}
        whileHover={{ background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }}
        onClick={() => !menuOpen && !renaming && router.push(`/board/${board.id}`)}
      >
        <div style={{ width: 40, height: 40, borderRadius: 10, background: pal.bg, flexShrink: 0, border: `1px solid ${pal.dot}44` }}/>
        <div style={{ flex: 1, minWidth: 0 }}>
          {renaming ? (
            <input ref={inputRef} value={draftName} onChange={(e) => setDraftName(e.target.value)}
              onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraftName(board.name); setRenaming(false); } }}
              onClick={(e) => e.stopPropagation()}
              style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', width: '100%' }}/>
          ) : (
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: 0 }}>{board.name}</p>
          )}
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', margin: '2px 0 0' }}>{timeAgo(board.updatedAt)} &middot; {board.elementCount} elements</p>
        </div>
        <BoardMenu board={board} menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menuRef} onOpen={() => router.push(`/board/${board.id}`)} onRename={() => setRenaming(true)} onDuplicate={onDuplicate} onDelete={onDelete}/>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      whileHover={{ y: -5, boxShadow: '0 20px 48px rgba(0,0,0,0.18)' }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="relative rounded-[22px] overflow-hidden cursor-pointer select-none"
      style={{
        aspectRatio: '4/3',
        boxShadow: theme === 'dark' ? '0 2px 16px rgba(0,0,0,0.5)' : '0 2px 16px rgba(0,0,0,0.09)',
      }}
      onClick={() => !menuOpen && !renaming && router.push(`/board/${board.id}`)}
    >
      {/* Gradient bg */}
      <div style={{ position: 'absolute', inset: 0, background: pal.bg }}/>

      {/* Decorative mini elements */}
      <div style={{ position: 'absolute', inset: 0, padding: 16, pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '15%', left: '10%', width: '38%', height: '24%', background: pal.accent, opacity: 0.13, borderRadius: 10, transform: 'rotate(-4deg)' }}/>
        <div style={{ position: 'absolute', top: '42%', left: '28%', width: '28%', height: '20%', background: pal.accent, opacity: 0.09, borderRadius: 8, transform: 'rotate(3deg)' }}/>
        <div style={{ position: 'absolute', top: '24%', right: '8%', width: '22%', height: '32%', background: pal.accent, opacity: 0.08, borderRadius: 12, transform: 'rotate(-2deg)' }}/>
        <div style={{ position: 'absolute', bottom: '20%', left: '6%', width: '18%', height: '16%', background: pal.accent, opacity: 0.11, borderRadius: 7, transform: 'rotate(5deg)' }}/>
        {/* Line connectors */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.3, overflow: 'visible' }}>
          <line x1="30%" y1="30%" x2="55%" y2="50%" stroke={pal.accent} strokeWidth="1.5" strokeDasharray="4 3"/>
          <line x1="55%" y1="50%" x2="78%" y2="38%" stroke={pal.dot} strokeWidth="1.5" strokeDasharray="4 3"/>
        </svg>
        {board.elementCount > 0 && (
          <div style={{ position: 'absolute', top: 12, left: 12, background: pal.accent + '28', backdropFilter: 'blur(4px)', borderRadius: 100, padding: '2px 8px', display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: pal.accent }}/>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: pal.accent }}>{board.elementCount}</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 14px 14px', background: theme === 'dark' ? 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)' : 'linear-gradient(to top, rgba(255,255,255,0.95) 50%, transparent 100%)' }}>
        {renaming ? (
          <input ref={inputRef} value={draftName} onChange={(e) => setDraftName(e.target.value)}
            onBlur={commit} onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setDraftName(board.name); setRenaming(false); } }}
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', borderBottom: `1.5px solid ${pal.accent}`, width: '100%' }}/>
        ) : (
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 2px' }}>{board.name}</p>
        )}
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{timeAgo(board.updatedAt)}</p>
      </div>

      {/* Three-dot menu */}
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10, zIndex: 10 }}>
        <BoardMenu board={board} menuOpen={menuOpen} setMenuOpen={setMenuOpen} menuRef={menuRef} onOpen={() => router.push(`/board/${board.id}`)} onRename={() => setRenaming(true)} onDuplicate={onDuplicate} onDelete={onDelete}/>
      </div>
    </motion.div>
  );
}

/* ─── Board context menu ─────────────────────────────────────────────────── */
function BoardMenu({ board, menuOpen, setMenuOpen, menuRef, onOpen, onRename, onDuplicate, onDelete }: {
  board: BoardMeta; menuOpen: boolean; setMenuOpen: (v: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement>; onOpen: () => void; onRename: () => void;
  onDuplicate: () => void; onDelete: () => void;
}) {
  const items = [
    { label: 'Open', icon: '↗', action: () => { setMenuOpen(false); onOpen(); } },
    { label: 'Rename', icon: '✏', action: () => { setMenuOpen(false); onRename(); } },
    { label: 'Duplicate', icon: '⎘', action: () => { setMenuOpen(false); onDuplicate(); } },
    { label: 'Copy Link', icon: '🔗', action: () => { navigator.clipboard.writeText(`${window.location.origin}/board/${board.id}`); setMenuOpen(false); } },
    { label: 'Delete', icon: '🗑', destructive: true, action: () => { setMenuOpen(false); onDelete(); } },
  ];
  return (
    <div style={{ position: 'relative' }}>
      <button
        className="flex items-center justify-center rounded-full"
        style={{ width: 28, height: 28, background: 'rgba(128,128,128,0.18)', backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer' }}
        onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'var(--text-primary)' }}>
          <circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/>
        </svg>
      </button>
      <AnimatePresence>
        {menuOpen && (
          <motion.div ref={menuRef} className="glass-panel absolute right-0 py-1 z-50"
            style={{ top: 34, minWidth: 164, borderRadius: 14, boxShadow: 'var(--shadow-lg)' }}
            initial={{ opacity: 0, scale: 0.92, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.12 }}
            onClick={(e) => e.stopPropagation()}
          >
            {items.map((item) => (
              <button key={item.label} onClick={item.action} className="flex w-full items-center gap-2.5 px-3.5 py-2 transition-colors"
                style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: item.destructive ? 'var(--red)' : 'var(--text-primary)', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = item.destructive ? 'rgba(255,59,48,0.08)' : 'var(--bg-hover)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: 13, width: 18 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Empty State ────────────────────────────────────────────────────────── */
function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center text-center"
      style={{ minHeight: 'calc(100vh - 130px)' }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, type: 'spring', stiffness: 280, damping: 26 }}
    >
      {/* Visual canvas mockup */}
      <div style={{ width: 260, height: 180, borderRadius: 20, position: 'relative', marginBottom: 32, overflow: 'hidden', background: 'var(--bg-canvas)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, var(--dot-grid) 1px, transparent 1px)', backgroundSize: '20px 20px' }}/>
        {/* Mini sticky notes */}
        {[
          { left: 18, top: 24, rot: -4, bg: '#FFF9C4', w: 72 },
          { left: 106, top: 16, rot: 2, bg: '#DBEAFE', w: 80 },
          { left: 174, top: 30, rot: -2, bg: '#EDE9FE', w: 68 },
          { left: 28, top: 105, rot: 3, bg: '#DCFCE7', w: 74 },
        ].map((n, i) => (
          <div key={i} style={{ position: 'absolute', left: n.left, top: n.top, width: n.w, height: 52, background: n.bg, borderRadius: 8, transform: `rotate(${n.rot}deg)`, boxShadow: '0 2px 8px rgba(0,0,0,0.09)' }}/>
        ))}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.4, overflow: 'visible' }}>
          <path d="M92 52 Q140 100 170 52" stroke="#4F7EFF" strokeWidth="1.5" fill="none" strokeDasharray="4 3"/>
        </svg>
      </div>

      <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 10 }}>
        Your workspace is empty
      </h2>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)', maxWidth: 340, lineHeight: 1.65, marginBottom: 32 }}>
        Create your first board to start brainstorming, planning, or designing. Share the link with anyone to collaborate in real time.
      </p>
      <button onClick={onCreate} className="primary-button" style={{ padding: '11px 28px', fontSize: 15, fontWeight: 700, borderRadius: 14, gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        New Board
      </button>
      <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', marginTop: 14 }}>
        Or press <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 5, padding: '1px 6px' }}>N</kbd> to create a new board
      </p>
    </motion.div>
  );
}

/* ─── Templates View ────────────────────────────────────────────────────── */
function TemplatesView({ onUseTemplate }: { onUseTemplate: (tpl: TemplateCard) => void }) {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Template Gallery
        </h2>
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
          {TEMPLATE_CARDS.length} templates · Click any to start a new board
        </p>
      </div>
      <div style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {TEMPLATE_CARDS.map((tpl, idx) => (
          <motion.div
            key={tpl.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, type: 'spring', stiffness: 360, damping: 28 }}
            style={{
              borderRadius: 20, overflow: 'hidden', position: 'relative', cursor: 'pointer',
              boxShadow: hovered === tpl.id ? `0 8px 32px ${tpl.glow}, var(--shadow-md)` : 'var(--shadow-sm)',
              border: hovered === tpl.id ? `1.5px solid ${tpl.tagColor}55` : '1px solid var(--border)',
              background: 'var(--bg-surface)',
              transform: hovered === tpl.id ? 'translateY(-4px)' : 'translateY(0)',
              transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.2s',
            }}
            onMouseEnter={() => setHovered(tpl.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => onUseTemplate(tpl)}
          >
            {/* SVG Preview */}
            <div style={{ width: '100%', height: 158, background: 'var(--bg-secondary)', position: 'relative', overflow: 'hidden' }}>
              <tpl.Preview />
              <AnimatePresence>
                {hovered === tpl.id && (
                  <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.38)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'white', padding: '8px 22px', background: 'var(--accent)', borderRadius: 100, boxShadow: '0 4px 16px rgba(0,122,255,0.4)' }}>
                      Use Template →
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Info */}
            <div style={{ padding: '14px 16px 16px' }}>
              <div style={{ marginBottom: 8 }}>
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 10, fontWeight: 700, color: tpl.tagColor, background: tpl.tagBg, padding: '2px 8px', borderRadius: 100, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                  {tpl.tag}
                </span>
              </div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 5px', lineHeight: 1.3 }}>{tpl.title}</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.55 }}>{tpl.desc}</p>

              {/* Avatars + element count */}
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 12 }}>
                {tpl.avatars.map((color, i) => (
                  <div key={i} style={{ width: 20, height: 20, borderRadius: '50%', background: color, border: '2px solid var(--bg-surface)', marginLeft: i > 0 ? -7 : 0, zIndex: tpl.avatars.length - i }} />
                ))}
                <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', marginLeft: 10 }}>{tpl.elements.length} elements</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function BoardsPage() {
  const router = useRouter();
  const { boards, createBoard, deleteBoard, duplicateBoard, renameBoard, hydrate } = useBoardsStore();
  const { theme, toggleTheme } = useCanvasStore();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<'boards' | 'templates'>('boards');

  const freshId = () => 'el_' + Math.random().toString(36).slice(2, 9);

  const useTemplate = (tpl: TemplateCard) => {
    const id = createBoard(tpl.title);
    const elements = tpl.elements.map((el) => {
      const isNote = el.type === 'note';
      const naturalRot = isNote ? Math.round((Math.random() * 6 - 3) * 10) / 10 : 0;
      return {
        ...el,
        id: freshId(),
        rot: el.rot !== undefined ? el.rot : naturalRot,
      };
    });
    localStorage.setItem(`inkspace-board-${id}`, JSON.stringify({
      boardName: tpl.title,
      viewport: { x: 260, y: 140, zoom: 1 },
      elements,
    }));
    useBoardsStore.getState().updateMeta(id, { elementCount: elements.length });
    localStorage.setItem(`inkspace-tpl-${id}`, '1');
    router.push(`/board/${id}`);
  };

  useEffect(() => {
    hydrate();
    const t = localStorage.getItem('inkspace-theme') as 'light' | 'dark';
    if (t) useCanvasStore.getState().setTheme(t);

    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement;
      if (el?.tagName === 'INPUT') return;
      if (e.key === 'n' || e.key === 'N') handleCreate();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCreate = () => {
    const id = createBoard();
    router.push(`/board/${id}`);
  };

  const filtered = boards.filter((b) => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg-canvas)' }}>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-panel" style={{ height: 56, borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: '0.5px solid var(--border)' }}>
        <div style={{ maxWidth: '100%', height: '100%', display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12 }}>
          {/* Logo + back to landing */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', flexShrink: 0 }}>
            <div style={{ width: 30, height: 30, borderRadius: 9, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)' }}>Inkspace</span>
          </Link>

          <div style={{ width: 1, height: 20, background: 'var(--border)', margin: '0 4px', flexShrink: 0 }}/>

          {/* Sidebar toggle (desktop) */}
          <button className="icon-button hidden md:flex" style={{ width: 30, height: 30, borderRadius: 8 }} onClick={() => setSidebarOpen((v) => !v)} title="Toggle sidebar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/>
            </svg>
          </button>

          {/* Search */}
          <div style={{ flex: 1, maxWidth: 360, display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-secondary)', border: '0.5px solid var(--border)', borderRadius: 10, height: 34, padding: '0 10px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search boards..."
              style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-primary)', background: 'transparent', border: 'none', outline: 'none', flex: 1 }}/>
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', lineHeight: 1, padding: 2, display: 'flex' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            )}
          </div>

          <div style={{ flex: 1 }}/>

          {/* View toggle */}
          <div className="hidden sm:flex" style={{ background: 'var(--bg-secondary)', borderRadius: 9, padding: 3, border: '0.5px solid var(--border)', gap: 2 }}>
            {(['grid', 'list'] as const).map((v) => (
              <button key={v} onClick={() => setViewMode(v)} style={{ width: 28, height: 28, borderRadius: 6, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', background: viewMode === v ? 'var(--bg-surface)' : 'transparent', color: viewMode === v ? 'var(--text-primary)' : 'var(--text-muted)', boxShadow: viewMode === v ? 'var(--shadow-sm)' : 'none', transition: 'all 0.15s' }}>
                {v === 'grid'
                  ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                  : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                }
              </button>
            ))}
          </div>

          {/* Theme */}
          <button onClick={toggleTheme} className="icon-button" title="Toggle theme" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0 }}>
            {theme === 'light'
              ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            }
          </button>

          {/* New Board */}
          <button onClick={handleCreate} className="primary-button" style={{ padding: '7px 16px', fontSize: 13, fontWeight: 700, borderRadius: 10, gap: 6, flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
            New Board
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar */}
        <AnimatePresence initial={false}>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 220, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 38 }}
              className="hidden md:flex flex-col flex-shrink-0 overflow-hidden"
              style={{ borderRight: '0.5px solid var(--border)', background: 'var(--bg-panel)', backdropFilter: 'var(--blur-panel)' }}
            >
              <div style={{ padding: '20px 14px 14px', flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0 6px', marginBottom: 8 }}>
                  Workspace
                </div>
                {[
                  { icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
                  ), label: 'My Boards', count: boards.length, active: activeView === 'boards', onClick: () => setActiveView('boards') },
                  { icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                  ), label: 'Templates', count: TEMPLATE_CARDS.length, active: activeView === 'templates', onClick: () => setActiveView('templates') },
                  { icon: (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                  ), label: 'Shared with me', count: null, active: false, onClick: () => {} },
                ].map((item) => (
                  <button key={item.label} onClick={item.onClick}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px', borderRadius: 10, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 2, background: item.active ? 'var(--accent-glow)' : 'transparent', color: item.active ? 'var(--accent)' : 'var(--text-secondary)', transition: 'background 0.15s, color 0.15s' }}
                    onMouseEnter={(e) => { if (!item.active) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}}
                    onMouseLeave={(e) => { if (!item.active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}}
                  >
                    {item.icon}
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: item.active ? 600 : 500, flex: 1 }}>{item.label}</span>
                    {item.count !== null && (
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, background: item.active ? 'var(--accent)' : 'var(--bg-secondary)', color: item.active ? 'white' : 'var(--text-muted)', padding: '1px 7px', borderRadius: 100 }}>
                        {item.count}
                      </span>
                    )}
                  </button>
                ))}

                <div style={{ height: 1, background: 'var(--border)', margin: '16px 6px' }}/>

                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.09em', textTransform: 'uppercase', padding: '0 6px', marginBottom: 8 }}>
                  Recent
                </div>
                {boards.slice(0, 4).map((b) => {
                  const pal = (theme === 'dark' ? DARK_CARD_PALETTES : CARD_PALETTES)[b.colorIdx % 8];
                  return (
                    <button key={b.id} onClick={() => router.push(`/board/${b.id}`)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 9, padding: '6px 10px', borderRadius: 8, border: 'none', cursor: 'pointer', textAlign: 'left', marginBottom: 1, background: 'transparent', transition: 'background 0.12s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ width: 20, height: 20, borderRadius: 5, background: pal.bg, flexShrink: 0, border: `1px solid ${pal.dot}44` }}/>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.name}</span>
                    </button>
                  );
                })}

                {/* New board button in sidebar */}
                <button onClick={handleCreate} style={{ width: '100%', marginTop: 12, display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 10, border: '1.5px dashed var(--border)', cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', transition: 'all 0.15s' }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-glow)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600 }}>New Board</span>
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {activeView === 'templates' ? (
            <TemplatesView onUseTemplate={useTemplate} />
          ) : boards.length === 0 ? (
            <EmptyState onCreate={handleCreate} />
          ) : (
            <>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                    {search ? `Results for "${search}"` : 'My Boards'}
                  </h2>
                  <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)', margin: '3px 0 0' }}>
                    {filtered.length} board{filtered.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', paddingTop: 80 }}>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 15, color: 'var(--text-muted)' }}>
                    No boards match &ldquo;{search}&rdquo;
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                <motion.div layout style={{ display: 'grid', gap: 14, gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                  {/* New board tile */}
                  <motion.button layout onClick={handleCreate}
                    className="rounded-[22px] flex flex-col items-center justify-center gap-3 cursor-pointer border-2 border-dashed transition-all"
                    style={{ aspectRatio: '4/3', borderColor: 'var(--border)', background: 'transparent', outline: 'none' }}
                    whileHover={{ borderColor: 'var(--accent)', background: 'var(--accent-glow)', scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </div>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)' }}>New Board</span>
                  </motion.button>

                  <AnimatePresence mode="popLayout">
                    {filtered.map((board) => (
                      <BoardCard key={board.id} board={board} theme={theme} viewMode="grid"
                        onDelete={() => setConfirmDelete(board.id)}
                        onDuplicate={() => { const id = duplicateBoard(board.id); router.push(`/board/${id}`); }}
                        onRename={(name) => renameBoard(board.id, name)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <AnimatePresence mode="popLayout">
                    {filtered.map((board) => (
                      <BoardCard key={board.id} board={board} theme={theme} viewMode="list"
                        onDelete={() => setConfirmDelete(board.id)}
                        onDuplicate={() => { const id = duplicateBoard(board.id); router.push(`/board/${id}`); }}
                        onRename={(name) => renameBoard(board.id, name)}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Delete confirm dialog ─────────────────────────────────────── */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div className="fixed inset-0 z-[10000] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(6px)' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div className="glass-panel overflow-hidden"
              style={{ width: 328, borderRadius: 22, boxShadow: 'var(--shadow-lg)' }}
              initial={{ scale: 0.92, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: '28px 24px', textAlign: 'center' }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(255,59,48,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                </div>
                <h3 style={{ fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Delete Board?</h3>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.55, marginBottom: 22 }}>
                  &ldquo;{boards.find((b) => b.id === confirmDelete)?.name}&rdquo; will be permanently deleted.
                </p>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setConfirmDelete(null)} className="secondary-button flex-1" style={{ justifyContent: 'center', padding: '10px 0', borderRadius: 12 }}>Cancel</button>
                  <button onClick={() => { if (confirmDelete) deleteBoard(confirmDelete); setConfirmDelete(null); }}
                    style={{ flex: 1, padding: '10px 0', borderRadius: 12, fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, background: 'var(--red)', color: 'white', border: 'none', cursor: 'pointer' }}>
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
