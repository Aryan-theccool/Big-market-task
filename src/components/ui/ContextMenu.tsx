'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ContextMenuItem {
  label?: string;
  shortcut?: string;
  icon?: React.ReactNode;
  destructive?: boolean;
  separator?: boolean;
  action?: () => void;
}

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, items, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDown, { capture: true });
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown, { capture: true });
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  /* Clamp to viewport */
  const menuW = 210;
  const safeX = Math.min(x, window.innerWidth - menuW - 8);
  const safeY = Math.min(y, window.innerHeight - items.length * 34 - 24);

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        className="fixed z-[9995] overflow-hidden glass-panel py-1"
        style={{
          left: safeX,
          top: safeY,
          minWidth: menuW,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
        }}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.94 }}
        transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        {items.map((item, i) =>
          item.separator ? (
            <div key={i} className="my-1 mx-1" style={{ height: '0.5px', background: 'var(--border)' }} />
          ) : (
            <button
              key={i}
              onClick={() => { item.action?.(); onClose(); }}
              className="flex w-full items-center justify-between px-3.5 py-2 transition-colors group"
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 14,
                fontFamily: 'var(--font-ui)',
                color: item.destructive ? 'var(--red)' : 'var(--text-primary)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = item.destructive ? 'var(--red)' : 'var(--accent)';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = item.destructive ? 'var(--red)' : 'var(--text-primary)';
              }}
            >
              <div className="flex items-center gap-2.5">
                {item.icon && <span style={{ opacity: 0.7 }}>{item.icon}</span>}
                <span>{item.label}</span>
              </div>
              {item.shortcut && (
                <span style={{ fontSize: 12, opacity: 0.5, fontFamily: 'var(--font-mono)', marginLeft: 24 }}>
                  {item.shortcut}
                </span>
              )}
            </button>
          )
        )}
      </motion.div>
    </AnimatePresence>
  );
};
