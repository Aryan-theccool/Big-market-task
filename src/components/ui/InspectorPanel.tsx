'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';

const NOTE_COLORS: Record<string, { bg: string; dark: string; text: string }> = {
  yellow: { bg: '#FFF59D', dark: '#F9A825', text: '#4A3800' },
  pink:   { bg: '#FCE4EC', dark: '#E91E63', text: '#4A0020' },
  blue:   { bg: '#E3F2FD', dark: '#1976D2', text: '#003060' },
  green:  { bg: '#E8F5E9', dark: '#388E3C', text: '#003010' },
  purple: { bg: '#F3E5F5', dark: '#7B1FA2', text: '#2A003A' },
  orange: { bg: '#FFF3E0', dark: '#F57C00', text: '#3A1800' },
  white:  { bg: '#FAFAFA', dark: '#E0E0E0', text: '#1C1C1E' },
};

/* ─── Row ─── */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', letterSpacing: '0.08em' }}>
      {children}
    </p>
  );
}

function GroupedList({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden divide-y" style={{ borderRadius: 'var(--radius-md)', background: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
      {children}
    </div>
  );
}

function ListRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
      <span style={{ fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}>{label}</span>
      <div>{children}</div>
    </div>
  );
}

function NumInput({ value, onChange, min, max }: { value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <input
      type="number"
      value={Math.round(value)}
      onChange={(e) => onChange(parseFloat(e.target.value))}
      min={min} max={max}
      className="bg-transparent text-right outline-none tabular-nums"
      style={{ width: 64, fontSize: 15, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)' }}
      onFocus={(e) => (e.currentTarget.parentElement!.style.background = 'var(--accent-glow)')}
      onBlur={(e) => (e.currentTarget.parentElement!.style.background = 'transparent')}
    />
  );
}

function Slider({ value, onChange, min, max, step = 1 }: { value: number; onChange: (v: number) => void; min: number; max: number; step?: number }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-20 h-1 rounded-full appearance-none cursor-pointer"
        style={{ accentColor: 'var(--accent)' }}
      />
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', minWidth: 32, textAlign: 'right' }}>
        {typeof value === 'number' && step < 1 ? value.toFixed(1) : Math.round(value)}
      </span>
    </div>
  );
}

function ColorSwatch({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value?.startsWith('#') ? value : '#007AFF'}
        onChange={(e) => onChange(e.target.value)}
        className="rounded cursor-pointer border-0"
        style={{ width: 24, height: 24, padding: 0 }}
      />
      <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        {value?.startsWith('#') ? value.toUpperCase() : value}
      </span>
    </div>
  );
}

const TYPE_LABELS: Record<string, string> = {
  note: 'Sticky Note', handwriting: 'Handwriting', text: 'Text',
  rect: 'Rectangle', circle: 'Circle', line: 'Line',
  arrow: 'Arrow', draw: 'Freehand', frame: 'Frame', image: 'Image',
};

export const InspectorPanel: React.FC = () => {
  const store = useCanvasStore();
  const { selected, elements, updateElement } = store;

  const isOpen = selected.length === 1;
  const el = elements.find((e) => e.id === selected[0]);

  const upd = (patch: Partial<CanvasElement>) => {
    if (!el) return;
    store.pushHistory();
    updateElement(el.id, patch);
  };

  return (
    <AnimatePresence>
      {isOpen && el && (
        <motion.div
          id="inkspace-inspector"
          className="absolute top-[52px] right-0 bottom-[32px] z-[9000] flex-col overflow-y-auto hidden md:flex"
          style={{
            width: 280,
            background: 'var(--bg-panel)',
            backdropFilter: 'var(--blur-panel)',
            WebkitBackdropFilter: 'var(--blur-panel)',
            borderLeft: '0.5px solid var(--border)',
          }}
          initial={{ x: 280 }}
          animate={{ x: 0 }}
          exit={{ x: 280 }}
          transition={{ type: 'spring', stiffness: 350, damping: 35 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {TYPE_LABELS[el.type] || el.type}
            </p>
            <button
              onClick={() => store.setSelected([])}
              className="icon-button"
              style={{ width: 24, height: 24, borderRadius: 6 }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
          </div>

          <div className="flex-1 p-4 space-y-5 overflow-y-auto">

            {/* Note colors */}
            {el.type === 'note' && (
              <div>
                <SectionTitle>Color</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(NOTE_COLORS).map(([key, c]) => (
                    <button
                      key={key}
                      onClick={() => upd({ color: key })}
                      title={key}
                      className="rounded-full border transition-transform hover:scale-110 active:scale-95"
                      style={{
                        width: 24, height: 24,
                        background: c.bg,
                        borderColor: el.color === key ? 'var(--accent)' : 'rgba(0,0,0,0.08)',
                        boxShadow: el.color === key ? '0 0 0 2px var(--accent)' : 'none',
                        transform: el.color === key ? 'scale(1.15)' : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Appearance — shapes */}
            {['rect', 'circle', 'frame'].includes(el.type) && (
              <div>
                <SectionTitle>Appearance</SectionTitle>
                <GroupedList>
                  <ListRow label="Fill"><ColorSwatch value={el.fill || '#007AFF'} onChange={(v) => upd({ fill: v })} /></ListRow>
                  <ListRow label="Stroke"><ColorSwatch value={el.stroke || '#1C1C1E'} onChange={(v) => upd({ stroke: v })} /></ListRow>
                  <ListRow label="Stroke Width"><Slider value={el.strokeWidth ?? 2} onChange={(v) => upd({ strokeWidth: v })} min={0.5} max={8} step={0.5} /></ListRow>
                  <ListRow label="Roughness"><Slider value={el.roughness ?? 1.2} onChange={(v) => upd({ roughness: v })} min={0} max={3} step={0.1} /></ListRow>
                  {el.type === 'rect' && (
                    <ListRow label="Radius"><Slider value={el.radius || 0} onChange={(v) => upd({ radius: v })} min={0} max={40} /></ListRow>
                  )}
                </GroupedList>
              </div>
            )}

            {/* Line / Arrow */}
            {['line', 'arrow'].includes(el.type) && (
              <div>
                <SectionTitle>Line</SectionTitle>
                <GroupedList>
                  <ListRow label="Color"><ColorSwatch value={el.stroke || '#1C1C1E'} onChange={(v) => upd({ stroke: v })} /></ListRow>
                  <ListRow label="Width"><Slider value={el.strokeWidth ?? 2} onChange={(v) => upd({ strokeWidth: v })} min={0.5} max={8} step={0.5} /></ListRow>
                </GroupedList>
              </div>
            )}

            {/* Text / Handwriting */}
            {['handwriting', 'text'].includes(el.type) && (
              <div>
                <SectionTitle>Typography</SectionTitle>
                <GroupedList>
                  <ListRow label="Font">
                    <select
                      value={el.fontFamily || ''}
                      onChange={(e) => upd({ fontFamily: e.target.value })}
                      className="bg-transparent text-right outline-none cursor-pointer"
                      style={{ fontSize: 14, color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', maxWidth: 160 }}
                    >
                      <option value="" style={{ background: 'var(--bg-surface)' }}>Default</option>
                      <option value="Caveat, cursive" style={{ background: 'var(--bg-surface)' }}>Handwriting (Caveat)</option>
                      <option value="Kalam, cursive" style={{ background: 'var(--bg-surface)' }}>Sketch (Kalam)</option>
                      <option value="var(--font-display)" style={{ background: 'var(--bg-surface)' }}>Display (Outfit/Sans)</option>
                      <option value="var(--font-mono)" style={{ background: 'var(--bg-surface)' }}>Monospace (Fira)</option>
                      <option value="Playfair Display, serif" style={{ background: 'var(--bg-surface)' }}>Elegant (Serif)</option>
                    </select>
                  </ListRow>
                  <ListRow label="Size"><Slider value={el.fontSize || 24} onChange={(v) => upd({ fontSize: v })} min={10} max={72} /></ListRow>
                  <ListRow label="Color"><ColorSwatch value={el.stroke || '#000000'} onChange={(v) => upd({ stroke: v })} /></ListRow>
                  <ListRow label="Style">
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => upd({ bold: !el.bold })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold border transition-colors ${el.bold ? 'bg-[var(--accent)] border-transparent text-white' : 'bg-transparent border-[var(--border)] text-[var(--text-primary)]'}`}
                        style={{ fontSize: 14 }}
                        title="Bold"
                      >
                        B
                      </button>
                      <button
                        onClick={() => upd({ italic: !el.italic })}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center italic border transition-colors ${el.italic ? 'bg-[var(--accent)] border-transparent text-white' : 'bg-transparent border-[var(--border)] text-[var(--text-primary)]'}`}
                        style={{ fontSize: 14 }}
                        title="Italic"
                      >
                        I
                      </button>
                    </div>
                  </ListRow>
                  <ListRow label="Align">
                    <div className="flex gap-1">
                      {['left', 'center', 'right'].map((align) => (
                        <button
                          key={align}
                          onClick={() => upd({ align: align as any })}
                          className={`px-2.5 h-8 rounded-lg flex items-center justify-center border text-xs capitalize transition-colors ${el.align === align || (!el.align && align === 'left') ? 'bg-[var(--accent)] border-transparent text-white' : 'bg-transparent border-[var(--border)] text-[var(--text-primary)]'}`}
                        >
                          {align}
                        </button>
                      ))}
                    </div>
                  </ListRow>
                </GroupedList>
              </div>
            )}

            {/* Image */}
            {el.type === 'image' && (
              <div>
                <SectionTitle>Image</SectionTitle>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '↔ Flip H', action: () => upd({ flipH: !el.flipH }) },
                    { label: '↕ Flip V', action: () => upd({ flipV: !el.flipV }) },
                  ].map(({ label, action }) => (
                    <button key={label} onClick={action} className="secondary-button justify-center" style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }}>{label}</button>
                  ))}
                </div>
              </div>
            )}

            {/* Opacity */}
            <div>
              <SectionTitle>Appearance</SectionTitle>
              <GroupedList>
                <ListRow label="Opacity">
                  <Slider value={(el.opacity ?? 1) * 100} onChange={(v) => upd({ opacity: v / 100 })} min={0} max={100} />
                </ListRow>
                {!['line', 'arrow', 'draw'].includes(el.type) && (
                  <ListRow label="Rotation">
                    <Slider value={el.rot || 0} onChange={(v) => upd({ rot: v })} min={-180} max={180} />
                  </ListRow>
                )}
              </GroupedList>
            </div>

            {/* Position */}
            <div>
              <SectionTitle>Position</SectionTitle>
              <GroupedList>
                <div className="flex items-center px-4 py-2.5 gap-3" style={{ borderBottom: '0.5px solid var(--border)' }}>
                  <span style={{ width: 16, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>X</span>
                  <NumInput value={el.x} onChange={(v) => upd({ x: v })} />
                  <span style={{ width: 16, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 12 }}>Y</span>
                  <NumInput value={el.y} onChange={(v) => upd({ y: v })} />
                </div>
                {el.w !== undefined && el.h !== undefined && (
                  <div className="flex items-center px-4 py-2.5 gap-3">
                    <span style={{ width: 16, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>W</span>
                    <NumInput value={el.w} onChange={(v) => upd({ w: Math.max(20, v) })} min={20} />
                    <span style={{ width: 16, fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginLeft: 12 }}>H</span>
                    <NumInput value={el.h} onChange={(v) => upd({ h: Math.max(20, v) })} min={20} />
                  </div>
                )}
              </GroupedList>
            </div>

            {/* Arrange */}
            <div>
              <SectionTitle>Arrange</SectionTitle>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '↑ Forward',  action: () => store.bringForward(el.id) },
                  { label: '↓ Backward', action: () => store.sendBackward(el.id) },
                  { label: '⇈ Bring Front', action: () => store.bringToFront(el.id) },
                  { label: '⇊ Send Back',   action: () => store.sendToBack(el.id) },
                ].map(({ label, action }) => (
                  <button
                    key={label} onClick={action}
                    className="secondary-button justify-center"
                    style={{ fontSize: 12, padding: '6px 8px', borderRadius: 8 }}
                  >{label}</button>
                ))}
              </div>
            </div>

            {/* Delete */}
            <button
              onClick={store.deleteSelected}
              className="w-full rounded-[12px] py-3 transition-colors"
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                cursor: 'pointer',
                fontSize: 15,
                fontWeight: 500,
                color: 'var(--red)',
                fontFamily: 'var(--font-ui)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,59,48,0.08)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--bg-secondary)')}
            >
              Delete
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
