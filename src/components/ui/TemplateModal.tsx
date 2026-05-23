'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';
import { TEMPLATE_CARDS, TemplateCard } from './TemplatePreviews';

const freshId = () => 'tpl_' + Math.random().toString(36).slice(2, 9);

interface TemplateModalProps {
  onClose: () => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({ onClose }) => {
  const store = useCanvasStore();
  const [selected, setSelected] = useState<string | null>(null);

  const applyTemplate = (tpl: TemplateCard) => {
    setSelected(tpl.id);
    setTimeout(() => {
      const elements: CanvasElement[] = tpl.elements.map((el) => {
        const isNote = el.type === 'note';
        const naturalRot = isNote ? Math.round((Math.random() * 6 - 3) * 10) / 10 : 0;
        return {
          ...el,
          id: freshId(),
          rot: el.rot !== undefined ? el.rot : naturalRot,
        } as CanvasElement;
      });
      store.importBoard(elements, tpl.title);
      onClose();
    }, 180);
  };

  const applyBlank = () => {
    setSelected('blank');
    setTimeout(() => {
      store.importBoard([], 'Untitled Board');
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
      onClick={onClose}
    >
      <motion.div
        className="glass-panel w-full sm:max-w-[640px]"
        style={{
          borderRadius: '20px 20px 0 0',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="rounded-full" style={{ width: 36, height: 4, background: 'var(--border)' }} />
        </div>

        {/* Header */}
        <div className="px-5 pt-2 pb-4 flex-shrink-0" style={{ borderBottom: '0.5px solid var(--border)' }}>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
            Choose a template
          </h2>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {TEMPLATE_CARDS.length + 1} templates · Pick a starting point for your board
          </p>
        </div>

        {/* Scrollable template grid */}
        <div className="grid grid-cols-2 gap-3 p-5 overflow-y-auto" style={{ flex: 1 }}>
          {/* Blank */}
          <motion.button
            onClick={applyBlank}
            className="flex flex-col items-start gap-2 p-3 rounded-[16px] text-left"
            style={{
              background: selected === 'blank' ? 'var(--accent-glow)' : 'var(--bg-secondary)',
              border: `1px solid ${selected === 'blank' ? 'var(--accent)' : 'var(--border)'}`,
              cursor: 'pointer',
            }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, type: 'spring', stiffness: 400, damping: 28 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <div className="w-full rounded-[10px] flex items-center justify-center" style={{ height: 68, background: 'var(--bg-canvas)', border: '1px solid var(--border)', fontSize: 24 }}>
              ⬜
            </div>
            <div>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>Blank</p>
              <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Empty canvas</p>
            </div>
          </motion.button>

          {/* 10 templates from shared gallery */}
          {TEMPLATE_CARDS.map((tpl, idx) => (
            <motion.button
              key={tpl.id}
              onClick={() => applyTemplate(tpl)}
              className="flex flex-col items-start gap-2 p-3 rounded-[16px] text-left"
              style={{
                background: selected === tpl.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                border: `1px solid ${selected === tpl.id ? 'var(--accent)' : 'var(--border)'}`,
                cursor: 'pointer',
              }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (idx + 1) * 0.04, type: 'spring', stiffness: 400, damping: 28 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <div className="w-full rounded-[10px] overflow-hidden" style={{ height: 68 }}>
                <tpl.Preview />
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {tpl.title}
                </p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>
                  {tpl.tag}
                </p>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
// Auto-show is disabled — the modal only opens when explicitly triggered
// (LeftToolRail Templates button or Shift+T shortcut).
export function useTemplateModal(boardId: string) {
  const [open, setOpen] = useState(false);
  const elementCount = useCanvasStore((s) => s.elements.length);

  // Collapse if the board gets populated (e.g. Y.js sync arrives)
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
