'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';

const freshId = () => 'tpl_' + Math.random().toString(36).slice(2, 9);

// Template definitions — IDs are placeholders; fresh ones are generated on apply
const TEMPLATES: {
  id: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  elements: Omit<CanvasElement, 'id'>[];
}[] = [
  {
    id: 'blank',
    label: 'Blank',
    description: 'Start with a clean canvas',
    color: '#F2F2F7',
    icon: '⬜',
    elements: [],
  },
  {
    id: 'sprint',
    label: 'Sprint Board',
    description: 'Todo · In Progress · Done',
    color: '#EFF6FF',
    icon: '🏃',
    elements: [
      { type: 'frame', x: 60,  y: 120, w: 240, h: 380, fill: 'rgba(0,122,255,0.06)', stroke: '#007AFF', strokeWidth: 1.5, roughness: 0, z: 0, text: 'To Do' },
      { type: 'frame', x: 320, y: 120, w: 240, h: 380, fill: 'rgba(255,149,0,0.06)', stroke: '#FF9500', strokeWidth: 1.5, roughness: 0, z: 1, text: 'In Progress' },
      { type: 'frame', x: 580, y: 120, w: 240, h: 380, fill: 'rgba(52,199,89,0.06)', stroke: '#34C759', strokeWidth: 1.5, roughness: 0, z: 2, text: 'Done' },
      { type: 'note', x: 80,  y: 160, w: 200, h: 90, color: 'yellow', text: 'Design new onboarding', z: 3 },
      { type: 'note', x: 80,  y: 265, w: 200, h: 90, color: 'blue',   text: 'Fix login bug', z: 4 },
      { type: 'note', x: 340, y: 160, w: 200, h: 90, color: 'orange', text: 'Update API docs', z: 5 },
      { type: 'note', x: 600, y: 160, w: 200, h: 90, color: 'green',  text: 'Deploy v2.1', z: 6 },
    ],
  },
  {
    id: 'brainstorm',
    label: 'Brainstorm',
    description: 'Mind map with central idea',
    color: '#FFF7ED',
    icon: '🧠',
    elements: [
      { type: 'note', x: 340, y: 240, w: 180, h: 80, color: 'purple', text: 'Big Idea', z: 0 },
      { type: 'note', x: 80,  y: 100, w: 160, h: 70, color: 'yellow', text: 'User Research', z: 1 },
      { type: 'note', x: 560, y: 100, w: 160, h: 70, color: 'blue',   text: 'Market Trends', z: 2 },
      { type: 'note', x: 80,  y: 360, w: 160, h: 70, color: 'pink',   text: 'Competitor Gap', z: 3 },
      { type: 'note', x: 560, y: 360, w: 160, h: 70, color: 'green',  text: 'Technical Edge', z: 4 },
      { type: 'arrow', x: 340, y: 280, x2: 240, y2: 170, stroke: '#8B5CF6', strokeWidth: 2, roughness: 0.8, z: 5 },
      { type: 'arrow', x: 520, y: 280, x2: 560, y2: 170, stroke: '#3B82F6', strokeWidth: 2, roughness: 0.8, z: 6 },
      { type: 'arrow', x: 340, y: 300, x2: 240, y2: 395, stroke: '#EC4899', strokeWidth: 2, roughness: 0.8, z: 7 },
      { type: 'arrow', x: 520, y: 300, x2: 560, y2: 395, stroke: '#22C55E', strokeWidth: 2, roughness: 0.8, z: 8 },
    ],
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    description: 'Quarterly planning view',
    color: '#F0FDF4',
    icon: '🗺️',
    elements: [
      { type: 'text', x: 60, y: 60, text: 'Product Roadmap 2025', fontSize: 28, stroke: '#000000', z: 0 },
      { type: 'rect', x: 60,  y: 110, w: 160, h: 36, fill: '#007AFF', stroke: '#007AFF', strokeWidth: 0, roughness: 0, radius: 8, z: 1, text: 'Q1' },
      { type: 'rect', x: 240, y: 110, w: 160, h: 36, fill: '#34C759', stroke: '#34C759', strokeWidth: 0, roughness: 0, radius: 8, z: 2, text: 'Q2' },
      { type: 'rect', x: 420, y: 110, w: 160, h: 36, fill: '#FF9500', stroke: '#FF9500', strokeWidth: 0, roughness: 0, radius: 8, z: 3, text: 'Q3' },
      { type: 'rect', x: 600, y: 110, w: 160, h: 36, fill: '#FF3B30', stroke: '#FF3B30', strokeWidth: 0, roughness: 0, radius: 8, z: 4, text: 'Q4' },
      { type: 'note', x: 60,  y: 165, w: 160, h: 80, color: 'blue',   text: 'Launch beta', z: 5 },
      { type: 'note', x: 240, y: 165, w: 160, h: 80, color: 'green',  text: 'GA release', z: 6 },
      { type: 'note', x: 420, y: 165, w: 160, h: 80, color: 'orange', text: 'Enterprise tier', z: 7 },
      { type: 'note', x: 600, y: 165, w: 160, h: 80, color: 'pink',   text: 'Mobile app', z: 8 },
    ],
  },
];

interface TemplateModalProps {
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ onClose }) => {
  const store = useCanvasStore();
  const [selected, setSelected] = useState<string | null>(null);

  const applyTemplate = (tpl: typeof TEMPLATES[0]) => {
    setSelected(tpl.id);
    setTimeout(() => {
      // Generate fresh IDs on every apply — prevents ID collisions if template
      // is applied to the same board more than once
      const elements: CanvasElement[] = tpl.elements.map((el) => ({
        ...el,
        id: freshId(),
      } as CanvasElement));
      store.importBoard(elements, tpl.id === 'blank' ? 'Untitled Board' : tpl.label);
      onClose();
    }, 180);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => applyTemplate(TEMPLATES[0])}
    >
      <motion.div
        className="glass-panel overflow-hidden w-full sm:max-w-[480px]"
        style={{
          borderRadius: '20px 20px 0 0',
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="rounded-full" style={{ width: 36, height: 4, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Start with a template
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            Pick a starting point for your board
          </p>
        </div>

        {/* Template grid */}
        <div className="grid grid-cols-2 gap-3 p-5">
          {TEMPLATES.map((tpl, idx) => (
            <motion.button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className="flex flex-col items-start gap-2 p-4 rounded-[16px] text-left transition-colors"
              style={{
                background: selected === tpl.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                border: `1px solid ${selected === tpl.id ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, type: 'spring', stiffness: 400, damping: 28 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div
                className="w-full rounded-[10px] flex items-center justify-center"
                style={{ height: 72, background: tpl.color, fontSize: 28 }}
              >
                {tpl.icon}
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {tpl.label}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {tpl.description}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Hook: show on first visit to each board ──────────────────────────────────

export function useTemplateModal(boardId: string) {
  const [open, setOpen] = useState(false);
  // Auto-dismiss if the board already has elements (e.g. loaded from storage or Y.js)
  const elementCount = useCanvasStore((s) => s.elements.length);

  useEffect(() => {
    if (typeof window === 'undefined' || !boardId) return;
    // Per-board flag — each new board gets the template picker once
    const key = `inkspace-tpl-${boardId}`;
    if (!localStorage.getItem(key)) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, [boardId]);

  // If board already has content (restored from storage), hide immediately
  useEffect(() => {
    if (elementCount > 0) setOpen(false);
  }, [elementCount]);

  return {
    open,
    openModal: () => setOpen(true),
    close: () => {
      setOpen(false);
      if (typeof window !== 'undefined' && boardId) {
        localStorage.setItem(`inkspace-tpl-${boardId}`, '1');
      }
    },
  };
}
