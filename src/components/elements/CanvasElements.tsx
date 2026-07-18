'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { CanvasElement, useCanvasStore } from '../../store/canvasStore';
import { X } from 'lucide-react';
import { getStroke } from 'perfect-freehand';

// ─── Freehand path helper ─────────────────────────────────────
function getFreehandPath(points: { x: number; y: number }[], stroke: number, color: string): string {
  if (!points || points.length < 2) return '';
  const strokePoints = getStroke(
    points.map((p) => [p.x, p.y]),
    { size: stroke * 2, smoothing: 0.5, thinning: 0.5, streamline: 0.5 }
  );
  if (!strokePoints.length) return '';
  const d = strokePoints.reduce<string[]>((acc, [x0, y0], i, arr) => {
    const [x1, y1] = arr[(i + 1) % arr.length];
    acc.push(`${x0},${y0}`, `${(x0 + x1) / 2},${(y0 + y1) / 2}`);
    return acc;
  }, ['M', `${strokePoints[0][0]},${strokePoints[0][1]}`, 'Q']);
  d.push('Z');
  return d.join(' ');
}

// ─── Note colours ─────────────────────────────────────────────
const NOTE_COLORS: Record<string, string> = {
  yellow: '#FEF3B0', pink: '#FECDD3', blue: '#BFDBFE',
  green: '#BBF7D0', purple: '#DDD6FE', orange: '#FED7AA', white: '#FAFAF9',
};
const NOTE_COLOR_KEYS = Object.keys(NOTE_COLORS);

// ─── Props ────────────────────────────────────────────────────
interface ElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

// ═════════════════════════════════════════════════════════════
//  STICKY NOTE
// ═════════════════════════════════════════════════════════════
export const StickyNote: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const bg = NOTE_COLORS[element.color || 'yellow'] || NOTE_COLORS.yellow;
  const rot = element.rot || 0;

  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerText !== (element.text || '')) {
      bodyRef.current.innerText = element.text || '';
    }
  }, [element.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (bodyRef.current) updateElement(element.id, { text: bodyRef.current.innerText });
  }, [element.id, updateElement]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) { e.stopPropagation(); return; }
    onPointerDown(e);
  };

  return (
    <div
      data-id={element.id}
      className="absolute select-none pointer-events-auto group note-texture"
      style={{
        left: element.x, top: element.y,
        width: element.w || 200, height: element.h || 200,
        transform: `rotate(${rot}deg)`,
        backgroundColor: bg,
        borderRadius: 12,
        boxShadow: isSelected
          ? '0 14px 40px rgba(28,25,23,0.22), 0 4px 12px rgba(28,25,23,0.12)'
          : '0 3px 10px rgba(28,25,23,0.12), 0 1px 3px rgba(28,25,23,0.08)',
        border: isSelected ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(28,25,23,0.05)',
        zIndex: element.z || 0,
        transition: 'box-shadow 0.15s, transform 0.15s',
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Drag handle row */}
      <div className="h-7 flex items-center gap-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 border-b border-dashed border-black/8 cursor-grab active:cursor-grabbing">
        <svg viewBox="0 0 16 6" className="w-4 h-3 text-black/30" fill="currentColor">
          <rect width="16" height="1.5" rx="1" /><rect y="4.5" width="16" height="1.5" rx="1" />
        </svg>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10 }} className="text-black/35 tracking-widest uppercase">Note</span>
        <button
          className="ml-auto w-4.5 h-4.5 rounded-md flex items-center justify-center text-black/40 hover:bg-black/10 transition-colors"
          onClick={(e) => { e.stopPropagation(); deleteSelected(); }}
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Content */}
      <div
        ref={bodyRef}
        contentEditable={activeTool === 'select'}
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        className="flex-1 px-3 py-2 focus:outline-none overflow-hidden select-text break-words"
        style={{
          fontFamily: 'Caveat, cursive',
          fontSize: element.fontSize || 18,
          lineHeight: 1.4,
          color: 'rgba(28,25,23,0.85)',
          minHeight: 'calc(100% - 28px)',
          cursor: isEditing ? 'text' : 'inherit',
        }}
      />

      {/* Folded corner */}
      <div
        className="absolute bottom-0 right-0 w-6 h-6 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.08) 50%)',
          borderBottomRightRadius: 12,
        }}
      />

      {/* Colour picker on select */}
      {isSelected && !isEditing && (
        <div
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-2 py-1.5 rounded-full animate-fade-slide-up z-[9999]"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-md)', backdropFilter: 'blur(14px)' }}
          onPointerDown={(e) => e.stopPropagation()}
        >
          {NOTE_COLOR_KEYS.map((key) => (
            <button
              key={key}
              className="w-5 h-5 rounded-full border border-black/10 transition-transform duration-100 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: NOTE_COLORS[key],
                boxShadow: element.color === key ? '0 0 0 2px var(--accent)' : undefined,
                transform: element.color === key ? 'scale(1.15)' : undefined,
              }}
              onClick={(e) => {
                e.stopPropagation();
                useCanvasStore.getState().pushHistory();
                updateElement(element.id, { color: key });
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
//  HANDWRITING TEXT
// ═════════════════════════════════════════════════════════════
export const HandwritingText: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const textRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (textRef.current && textRef.current.innerText !== (element.text || '')) {
      textRef.current.innerText = element.text || '';
    }
  }, [element.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (textRef.current) updateElement(element.id, { text: textRef.current.innerText });
  }, [element.id, updateElement]);

  const rot = element.rot || 0;
  const fontSize = element.fontSize || 24;
  const color = element.stroke || 'var(--text-primary)';

  return (
    <div
      data-id={element.id}
      className="absolute select-none pointer-events-auto"
      style={{
        left: element.x, top: element.y,
        transform: `rotate(${rot}deg)`,
        opacity: element.opacity !== undefined ? element.opacity : 1,
        zIndex: element.z || 0,
        border: isEditing
          ? '1px dashed rgba(99,102,241,0.5)'
          : isSelected
            ? '1px dashed rgba(99,102,241,0.3)'
            : '1px solid transparent',
        borderRadius: 6,
        padding: '4px 8px',
        cursor: isEditing ? 'text' : 'move',
        minWidth: 80,
      }}
      onPointerDown={(e) => { if (isEditing) { e.stopPropagation(); return; } onPointerDown(e); }}
    >
      <div
        ref={textRef}
        contentEditable={activeTool === 'select'}
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        className="outline-none select-text break-words whitespace-pre-wrap"
        style={{
          fontFamily: 'Caveat, cursive',
          fontSize,
          lineHeight: 1.3,
          color,
          textAlign: element.align || 'left',
          minWidth: 60,
          cursor: isEditing ? 'text' : 'inherit',
        }}
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
//  TEXT ELEMENT
// ═════════════════════════════════════════════════════════════
export const TextElement: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const activeTool = useCanvasStore((s) => s.activeTool);
  const textRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (textRef.current && textRef.current.innerText !== (element.text || '')) {
      textRef.current.innerText = element.text || '';
    }
  }, [element.text]);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
    if (textRef.current) updateElement(element.id, { text: textRef.current.innerText });
  }, [element.id, updateElement]);

  const color = element.stroke || 'var(--text-primary)';

  return (
    <div
      data-id={element.id}
      className="absolute select-none pointer-events-auto"
      style={{
        left: element.x, top: element.y,
        width: element.w || 'auto',
        minWidth: 100, minHeight: 40,
        transform: `rotate(${element.rot || 0}deg)`,
        padding: '6px 10px',
        borderRadius: 8,
        border: isEditing ? '1px dashed rgba(99,102,241,0.5)' : isSelected ? '1px dashed rgba(99,102,241,0.35)' : '1px solid transparent',
        backgroundColor: element.fill && element.fill !== 'transparent' ? element.fill : 'transparent',
        zIndex: element.z || 0,
        opacity: element.opacity !== undefined ? element.opacity : 1,
      }}
      onPointerDown={(e) => { if (isEditing) { e.stopPropagation(); return; } onPointerDown(e); }}
    >
      <div
        ref={textRef}
        contentEditable={activeTool === 'select'}
        suppressContentEditableWarning
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
        className="outline-none select-text break-words leading-tight"
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: element.fontSize || 28,
          color,
          textAlign: element.align || 'left',
        }}
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
//  ROUGH SHAPE (rect, circle, line, arrow, frame)
// ═════════════════════════════════════════════════════════════
interface RoughShapeProps extends ElementProps {
  onDoubleClick?: (e: React.MouseEvent) => void;
  isDiagramFrame?: boolean;
  isLinkedSelected?: boolean;
}

export const RoughShape: React.FC<RoughShapeProps> = ({ element, isSelected, onPointerDown, onDoubleClick, isDiagramFrame, isLinkedSelected }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  const strokeColor = element.stroke || 'var(--rough-stroke)';
  const fillColor = element.fill || (element.type === 'frame' ? 'rgba(99,102,241,0.03)' : 'rgba(99,102,241,0.06)');
  const strokeW = element.strokeWidth ?? 2;
  const roughness = element.roughness ?? 1.2;

  // Compute bounding box
  const isLine = element.type === 'line' || element.type === 'arrow';
  const isDraw = element.type === 'draw';

  let bx: number, by: number, bw: number, bh: number;
  let lx1 = 0, ly1 = 0, lx2 = 0, ly2 = 0;

  if (isLine && !element.points?.length) {
    const minX = Math.min(element.x, element.x2 ?? element.x);
    const minY = Math.min(element.y, element.y2 ?? element.y);
    bx = minX; by = minY;
    bw = Math.max(1, Math.abs((element.x2 ?? element.x) - element.x));
    bh = Math.max(1, Math.abs((element.y2 ?? element.y) - element.y));
    lx1 = element.x - minX; ly1 = element.y - minY;
    lx2 = (element.x2 ?? element.x) - minX; ly2 = (element.y2 ?? element.y) - minY;
  } else if ((isDraw || isLine) && element.points?.length) {
    const pts = element.points || [];
    if (pts.length === 0) return null;
    const xs = pts.map((p) => p.x), ys = pts.map((p) => p.y);
    bx = Math.min(...xs); by = Math.min(...ys);
    bw = Math.max(1, Math.max(...xs) - bx);
    bh = Math.max(1, Math.max(...ys) - by);
  } else {
    bx = element.x; by = element.y;
    bw = Math.max(10, element.w || 100);
    bh = Math.max(10, element.h || 60);
  }

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    let rough: any;
    try {
      rough = require('roughjs');
      // handle both default export shapes
      if (rough.default) rough = rough.default;
    } catch { return; }

    // Clear previous children
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const opts = {
      roughness,
      bowing: 0.8,
      stroke: strokeColor,
      strokeWidth: strokeW,
      fill: fillColor,
      fillStyle: 'hachure' as const,
      fillWeight: 0.8,
      hachureAngle: -41,
      hachureGap: 5,
    };

    const pad = 6;

    let node: SVGElement | null = null;
    switch (element.type) {
      case 'rect':
        node = rc.rectangle(pad, pad, bw - pad * 2, bh - pad * 2, { ...opts, cornerRadius: element.radius || 0 });
        break;
      case 'circle':
        node = rc.ellipse(bw / 2, bh / 2, bw - pad * 2, bh - pad * 2, { ...opts });
        break;
      case 'frame':
        node = rc.rectangle(pad, pad, bw - pad * 2, bh - pad * 2, { ...opts, fillStyle: 'solid' as const, strokeLineDash: [8, 5] });
        break;
      case 'line':
        node = rc.line(lx1, ly1, lx2, ly2, { ...opts, fill: 'none' });
        break;
      case 'arrow': {
        const pts = element.points || [];
        if (pts.length > 1) {
          const localPts = pts.map((p) => [p.x - bx, p.y - by] as [number, number]);
          const lineNode = rc.linearPath(localPts, { ...opts, fill: 'none' });
          svg.appendChild(lineNode);

          const last = pts[pts.length - 1];
          const prev = pts[pts.length - 2];
          const angle = Math.atan2(last.y - prev.y, last.x - prev.x);
          const arrowLen = Math.min(18, Math.hypot(last.x - prev.x, last.y - prev.y) * 0.4);
          const a1 = angle + 2.8, a2 = angle - 2.8;
          const ah1x = (last.x - bx) + Math.cos(a1) * arrowLen;
          const ah1y = (last.y - by) + Math.sin(a1) * arrowLen;
          const ah2x = (last.x - bx) + Math.cos(a2) * arrowLen;
          const ah2y = (last.y - by) + Math.sin(a2) * arrowLen;

          const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          arrowHead.setAttribute('d', `M${ah1x},${ah1y} L${last.x - bx},${last.y - by} L${ah2x},${ah2y}`);
          arrowHead.setAttribute('stroke', strokeColor);
          arrowHead.setAttribute('stroke-width', String(strokeW));
          arrowHead.setAttribute('stroke-linecap', 'round');
          arrowHead.setAttribute('fill', 'none');
          svg.appendChild(arrowHead);
        } else {
          const lineNode = rc.line(lx1, ly1, lx2, ly2, { ...opts, fill: 'none' });
          svg.appendChild(lineNode);
          // Manual arrowhead
          const angle = Math.atan2(ly2 - ly1, lx2 - lx1);
          const arrowLen = Math.min(18, Math.hypot(lx2 - lx1, ly2 - ly1) * 0.4);
          const a1 = angle + 2.8, a2 = angle - 2.8;
          const ah1x = lx2 + Math.cos(a1) * arrowLen;
          const ah1y = ly2 + Math.sin(a1) * arrowLen;
          const ah2x = lx2 + Math.cos(a2) * arrowLen;
          const ah2y = ly2 + Math.sin(a2) * arrowLen;
          const arrowHead = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          arrowHead.setAttribute('d', `M${ah1x},${ah1y} L${lx2},${ly2} L${ah2x},${ah2y}`);
          arrowHead.setAttribute('stroke', strokeColor);
          arrowHead.setAttribute('stroke-width', String(strokeW));
          arrowHead.setAttribute('stroke-linecap', 'round');
          arrowHead.setAttribute('fill', 'none');
          svg.appendChild(arrowHead);
        }
        return;
      }
      default:
        return;
    }
    if (node) svg.appendChild(node);
  }, [element.type, bw, bh, lx1, ly1, lx2, ly2, strokeColor, fillColor, strokeW, roughness, element.radius]);

  // Freehand draw uses perfect-freehand
  const drawPathMemo = React.useMemo(() => {
    if (!isDraw) return '';
    const rawPath = getFreehandPath(element.points || [], strokeW, strokeColor);
    if (!rawPath) return '';

    // Shift path coordinates to be local to the envelope box
    return rawPath.split(' ').map((v) => {
      if (v.includes(',')) {
        const [x, y] = v.split(',');
        return `${parseFloat(x) - bx},${parseFloat(y) - by}`;
      }
      return v;
    }).join(' ');
  }, [isDraw, element.points, strokeW, strokeColor, bx, by]);

  if (isDraw) {
    const rot = element.rot || 0;
    return (
      <svg
        data-id={element.id}
        className="absolute pointer-events-auto overflow-visible"
        style={{ left: bx, top: by, width: bw, height: bh, overflow: 'visible', zIndex: element.z || 0, transform: `rotate(${rot}deg)`, transformOrigin: 'center' }}
        onPointerDown={onPointerDown}
      >
        {drawPathMemo && (
          <path
            d={drawPathMemo}
            fill={strokeColor}
            stroke="none"
            opacity={element.opacity ?? 1}
          />
        )}
      </svg>
    );
  }

  const rot = !isLine ? (element.rot || 0) : 0;
  const svgW = bw + 12, svgH = bh + 12;

  return (
    <svg
      ref={svgRef}
      data-id={element.id}
      className="absolute pointer-events-auto overflow-visible rough-shape"
      style={{
        left: bx - 6, top: by - 6,
        width: svgW, height: svgH,
        overflow: 'visible',
        zIndex: element.z || 0,
        transform: rot ? `rotate(${rot}deg)` : undefined,
        transformOrigin: 'center',
        opacity: element.opacity ?? 1,
        filter: isSelected ? 'drop-shadow(0 2px 8px rgba(99,102,241,0.18))' : undefined,
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
    >
      {element.type === 'frame' && (
        <foreignObject x={8} y={-22} width={200} height={28} className="overflow-visible">
          <div
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              borderRadius: 999, padding: '2px 10px',
              fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
              color: isDiagramFrame ? 'var(--accent)' : 'var(--accent)',
              backdropFilter: 'blur(12px)',
              boxShadow: 'var(--shadow-sm)',
            }}
          >
            {isDiagramFrame ? '📐' : '⬡'} {element.text || 'Frame'}
            {isDiagramFrame && (
              <span style={{ fontSize: 9, opacity: 0.6, marginLeft: 4 }}>double-click to edit</span>
            )}
          </div>
        </foreignObject>
      )}

      {/* Pulsing linked-selection glow ring for diagram frames */}
      {isLinkedSelected && isDiagramFrame && (
        <rect
          x={-2} y={-2}
          width={svgW + 4} height={svgH + 4}
          fill="none"
          stroke="rgba(99,102,241,0.75)"
          strokeWidth={2.5}
          strokeDasharray="8 4"
          rx={6}
          className="marching-ants"
        />
      )}
    </svg>
  );
};

// ═════════════════════════════════════════════════════════════
//  IMAGE ELEMENT
// ═════════════════════════════════════════════════════════════
export const ImageElement: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const rot = element.rot || 0;

  return (
    <div
      data-id={element.id}
      className="absolute select-none pointer-events-auto group"
      style={{
        left: element.x, top: element.y,
        width: element.w || 300, height: element.h || 200,
        transform: `rotate(${rot}deg)`,
        transformOrigin: 'center',
        borderRadius: 8,
        boxShadow: isSelected
          ? '0 14px 40px rgba(28,25,23,0.22), 0 0 0 2px rgba(99,102,241,0.4)'
          : '0 4px 16px rgba(28,25,23,0.12), 0 1px 4px rgba(28,25,23,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        overflow: 'hidden',
        zIndex: element.z || 0,
        opacity: element.opacity ?? 1,
        transition: 'box-shadow 0.15s',
      }}
      onPointerDown={onPointerDown}
    >
      <button
        className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-150 z-50 hover:scale-110 active:scale-95"
        onClick={(e) => { e.stopPropagation(); deleteSelected(); }}
        style={{ border: '1px solid rgba(28,25,23,0.12)' }}
      >
        <X className="w-3.5 h-3.5 text-rose-500" />
      </button>

      <img
        src={element.src || ''}
        alt="Canvas element"
        className="w-full h-full object-contain pointer-events-none select-none"
        style={{
          transform: `scaleX(${element.flipH ? -1 : 1}) scaleY(${element.flipV ? -1 : 1})`,
        }}
      />
    </div>
  );
};

// ═════════════════════════════════════════════════════════════
//  SELECTION BOX WITH HANDLES
// ═════════════════════════════════════════════════════════════
interface SelectionBoxProps {
  elements: CanvasElement[];
  viewport: { x: number; y: number; zoom: number };
  onResizeStart: (handle: string, e: React.PointerEvent) => void;
  onRotateStart: (e: React.PointerEvent) => void;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({ elements, onResizeStart, onRotateStart }) => {
  if (!elements.length) return null;

  const getBounds = (el: CanvasElement) => {
    if ((el.type === 'line' || el.type === 'arrow') && !el.points?.length) {
      const x = Math.min(el.x, el.x2 ?? el.x), y = Math.min(el.y, el.y2 ?? el.y);
      return { x, y, w: Math.max(1, Math.abs((el.x2 ?? el.x) - el.x)), h: Math.max(1, Math.abs((el.y2 ?? el.y) - el.y)) };
    }
    if ((el.type === 'draw' || el.type === 'line' || el.type === 'arrow') && el.points?.length) {
      const xs = el.points.map((p) => p.x), ys = el.points.map((p) => p.y);
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(1, Math.max(...xs) - Math.min(...xs)), h: Math.max(1, Math.max(...ys) - Math.min(...ys)) };
    }
    return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
  };

  const bounds = elements.map(getBounds);
  const minX = Math.min(...bounds.map((b) => b.x));
  const minY = Math.min(...bounds.map((b) => b.y));
  const maxX = Math.max(...bounds.map((b) => b.x + b.w));
  const maxY = Math.max(...bounds.map((b) => b.y + b.h));

  let w = maxX - minX;
  let h = maxY - minY;
  let offsetX = 0;
  let offsetY = 0;

  if (w < 8) {
    offsetX = (8 - w) / 2;
    w = 8;
  }
  if (h < 8) {
    offsetY = (8 - h) / 2;
    h = 8;
  }

  const single = elements[0];
  const isLineType = elements.length === 1 && ['line', 'arrow', 'draw'].includes(single.type);
  const rot = elements.length === 1 && !isLineType ? (single.rot || 0) : 0;

  const handles = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
  const handlePos: Record<string, { left: string; top: string; cursor: string }> = {
    nw: { left: '0', top: '0', cursor: 'nwse-resize' },
    n: { left: '50%', top: '0', cursor: 'ns-resize' },
    ne: { left: '100%', top: '0', cursor: 'nesw-resize' },
    e: { left: '100%', top: '50%', cursor: 'ew-resize' },
    se: { left: '100%', top: '100%', cursor: 'nwse-resize' },
    s: { left: '50%', top: '100%', cursor: 'ns-resize' },
    sw: { left: '0', top: '100%', cursor: 'nesw-resize' },
    w: { left: '0', top: '50%', cursor: 'ew-resize' },
  };

  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: minX - offsetX, top: minY - offsetY, width: w, height: h,
        transform: rot ? `rotate(${rot}deg)` : undefined,
        transformOrigin: 'center',
        zIndex: 999990,
      }}
    >
      {/* Dashed border */}
      {!isLineType && (
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <rect
            x="0" y="0" width="100%" height="100%"
            fill="none"
            stroke="rgba(99,102,241,0.7)"
            strokeWidth="1.5"
            strokeDasharray="7 4"
            className="marching-ants"
            rx="2"
          />
        </svg>
      )}

      {/* Endpoints for single selected line or arrow */}
      {elements.length === 1 && (single.type === 'line' || single.type === 'arrow') && (
        <svg
          className="absolute inset-0 overflow-visible pointer-events-none"
          style={{ width: '100%', height: '100%' }}
        >
          <circle
            cx={single.x - (minX - offsetX)}
            cy={single.y - (minY - offsetY)}
            r="4.5"
            fill="white"
            stroke="var(--accent)"
            strokeWidth="2.5"
          />
          <circle
            cx={(single.x2 ?? single.x) - (minX - offsetX)}
            cy={(single.y2 ?? single.y) - (minY - offsetY)}
            r="4.5"
            fill="white"
            stroke="var(--accent)"
            strokeWidth="2.5"
          />
        </svg>
      )}

      {!isLineType && (
        <>
          {handles.map((h) => (
            <div
              key={h}
              className="selection-handle"
              style={{ left: handlePos[h].left, top: handlePos[h].top, cursor: handlePos[h].cursor }}
              onPointerDown={(e) => onResizeStart(h, e)}
            />
          ))}

          {/* Rotation line */}
          <div
            className="absolute left-1/2 pointer-events-none"
            style={{ top: -32, width: 1, height: 28, background: 'rgba(99,102,241,0.5)', transform: 'translateX(-50%)' }}
          />

          {/* Rotation handle */}
          <div
            className="absolute left-1/2 pointer-events-all flex items-center justify-center rounded-full cursor-grab active:cursor-grabbing"
            style={{
              top: -44, transform: 'translateX(-50%)',
              width: 24, height: 24,
              background: 'white',
              border: '2px solid rgba(99,102,241,0.8)',
              boxShadow: '0 2px 8px rgba(99,102,241,0.2)',
              zIndex: 999999,
            }}
            onPointerDown={onRotateStart}
          >
            <svg viewBox="0 0 16 16" className="w-3.5 h-3.5 text-accent-DEFAULT" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 8A5 5 0 1 1 8 3" strokeLinecap="round" />
              <path d="M8 1l3 3-3 3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </>
      )}
    </div>
  );
};
