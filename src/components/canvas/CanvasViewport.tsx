'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';
import { StickyNote, HandwritingText, TextElement, RoughShape, ImageElement, SelectionBox } from '../elements/CanvasElements';
import { compressAndResizeImage } from '../../utils/imageHelper';
import { useImageDrop } from '../../hooks/useImageDrop';

const uid = () => 'el_' + Math.random().toString(36).slice(2, 9);


interface CanvasViewportProps {
  viewportRef: React.RefObject<HTMLDivElement>;
  regionStart: { x: number; y: number } | null;
  setRegionStart: (v: { x: number; y: number } | null) => void;
  regionBox: { x: number; y: number; w: number; h: number } | null;
  setRegionBox: (v: { x: number; y: number; w: number; h: number } | null) => void;
  toast?: (msg: string, color?: string) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  viewportRef, regionStart, setRegionStart, regionBox, setRegionBox, toast,
}) => {
  const store = useCanvasStore();
  const worldRef = useRef<HTMLDivElement>(null);
  const [spacePressed, setSpacePressed] = useState(false);
  const [lassoBox, setLassoBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const { isDragging: isDraggingFile, onDragEnter, onDragOver, onDragLeave, onDrop: handleDrop } = useImageDrop({ viewportRef, toast });
  const lassoStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragRef = useRef<any>(null);
  const drawingRef = useRef<any>(null);


  // Space bar for pan override
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return;
      const el = document.activeElement;
      if (el?.getAttribute('contenteditable') === 'true' || el?.tagName === 'INPUT') return;
      e.preventDefault();
      setSpacePressed(true);
    };
    const up = (e: KeyboardEvent) => { if (e.code === 'Space') setSpacePressed(false); };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, []);


  // Apply CSS transform directly for smooth pan/zoom
  useEffect(() => {
    const w = worldRef.current;
    if (w) w.style.transform = `translate(${store.viewport.x}px,${store.viewport.y}px) scale(${store.viewport.zoom})`;
  }, [store.viewport]);

  // Hydrate on mount
  useEffect(() => { store.hydrate(); }, []);

  // ── Touch events (pinch zoom + two-finger pan) ──────────────
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    let lastDist = 0;
    let lastMidX = 0, lastMidY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        lastDist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        lastMidX = (a.clientX + b.clientX) / 2;
        lastMidY = (a.clientY + b.clientY) / 2;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches.length === 2) {
        const a = e.touches[0], b = e.touches[1];
        const dist = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
        const midX = (a.clientX + b.clientX) / 2;
        const midY = (a.clientY + b.clientY) / 2;
        if (lastDist) {
          const state = useCanvasStore.getState();
          const { x: vx, y: vy, zoom } = state.viewport;
          const r = el.getBoundingClientRect();
          const mx = midX - r.left, my = midY - r.top;
          const bx = (mx - vx) / zoom, by = (my - vy) / zoom;
          const scale = dist / lastDist;
          const nz = Math.max(0.08, Math.min(5, zoom * scale));
          const panDX = midX - lastMidX, panDY = midY - lastMidY;
          state.setViewport({ x: mx - bx * nz + panDX, y: my - by * nz + panDY, zoom: nz });
        }
        lastDist = dist; lastMidX = midX; lastMidY = midY;
      }
    };

    const onTouchEnd = () => { lastDist = 0; };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [viewportRef]);

  const getBoardRect = () => viewportRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };

  const screenToWorld = (cx: number, cy: number) => {
    const r = getBoardRect();
    return { x: (cx - r.left - store.viewport.x) / store.viewport.zoom, y: (cy - r.top - store.viewport.y) / store.viewport.zoom };
  };

  const normRect = (a: { x: number; y: number }, b: { x: number; y: number }) => ({
    x: Math.min(a.x, b.x), y: Math.min(a.y, b.y),
    w: Math.abs(a.x - b.x), h: Math.abs(a.y - b.y),
  });

  const elementBounds = (el: CanvasElement) => {
    if (el.type === 'line' || el.type === 'arrow') {
      const x = Math.min(el.x, el.x2 ?? el.x), y = Math.min(el.y, el.y2 ?? el.y);
      return { x, y, w: Math.max(1, Math.abs((el.x2 ?? el.x) - el.x)), h: Math.max(1, Math.abs((el.y2 ?? el.y) - el.y)) };
    }
    if (el.type === 'draw' && el.points?.length) {
      const xs = el.points.map((p) => p.x), ys = el.points.map((p) => p.y);
      return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(1, Math.max(...xs) - Math.min(...xs)), h: Math.max(1, Math.max(...ys) - Math.min(...ys)) };
    }
    return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
  };

  const intersects = (r1: any, r2: any) =>
    !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y);

  // ── Wheel Zoom ──────────────────────────────────────────────
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const r = getBoardRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    const bx = (mx - store.viewport.x) / store.viewport.zoom;
    const by = (my - store.viewport.y) / store.viewport.zoom;
    const factor = Math.exp(-e.deltaY * 0.0012);
    const nz = Math.max(0.08, Math.min(5, store.viewport.zoom * factor));
    store.setViewport({ x: mx - bx * nz, y: my - by * nz, zoom: nz });
  };

  // ── Pointer Down ─────────────────────────────────────────────
  const handlePointerDown = (e: React.MouseEvent) => {
    if (e.button === 1 || store.activeTool === 'hand' || spacePressed) {
      dragRef.current = { kind: 'pan', sx: e.clientX, sy: e.clientY, vx: store.viewport.x, vy: store.viewport.y };
      return;
    }

    const pt = screenToWorld(e.clientX, e.clientY);
    if (store.snap) { pt.x = Math.round(pt.x / 24) * 24; pt.y = Math.round(pt.y / 24) * 24; }

    if (store.activeTool === 'note') {
      store.addElement({
        id: uid(), type: 'note',
        x: pt.x - 100, y: pt.y - 100, w: 200, h: 200,
        rot: (Math.random() * 6 - 3), color: 'yellow', text: '',
        z: Date.now() % 100000,
      });
      store.setTool('select');
      return;
    }

    if (store.activeTool === 'handwriting') {
      const id = uid();
      const defs = store.textDefaults;
      store.addElement({
        id, type: 'handwriting',
        x: pt.x, y: pt.y, w: 200, h: 50,
        text: '',
        fontSize: defs.fontSize,
        fontFamily: defs.fontFamily || 'Caveat, cursive',
        stroke: defs.stroke,
        bold: defs.bold,
        italic: defs.italic,
        align: defs.align,
        z: Date.now() % 100000,
      });
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${id}"] [contenteditable]`) as HTMLElement;
        if (el) el.focus();
      }, 60);
      store.setTool('select');
      return;
    }

    if (store.activeTool === 'text') {
      const id = uid();
      const defs = store.textDefaults;
      store.addElement({
        id, type: 'text',
        x: pt.x, y: pt.y - 20, w: 260, h: 60,
        text: '',
        fontSize: defs.fontSize,
        fontFamily: defs.fontFamily || 'var(--font-display)',
        stroke: defs.stroke,
        bold: defs.bold,
        italic: defs.italic,
        align: defs.align,
        z: Date.now() % 100000,
      });
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${id}"] [contenteditable]`) as HTMLElement;
        if (el) el.focus();
      }, 60);
      store.setTool('select');
      return;
    }

    if (store.activeTool === 'image') {
      const input = document.createElement('input');
      input.type = 'file'; input.accept = 'image/*';
      input.onchange = (ev) => {
        const file = (ev.target as HTMLInputElement).files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (e2) => {
          const b64 = e2.target?.result as string;
          const img = await compressAndResizeImage(b64);
          store.addElement({ id: uid(), type: 'image', x: pt.x - img.w / 2, y: pt.y - img.h / 2, w: img.w, h: img.h, src: img.src, z: Date.now() % 100000 });
          toast?.('Image added!', '#22C55E');
        };
        reader.readAsDataURL(file);
      };
      input.click();
      store.setTool('select');
      return;
    }

    if (['rect','circle','line','arrow','frame','draw'].includes(store.activeTool)) {
      store.pushHistory();
      const elId = uid();
      const isLineType = store.activeTool === 'line' || store.activeTool === 'arrow';
      const newEl: CanvasElement = {
        id: elId, type: store.activeTool as any,
        x: pt.x, y: pt.y, z: Date.now() % 100000,
        ...(isLineType
          ? { x2: pt.x + 1, y2: pt.y + 1, stroke: 'var(--rough-stroke)', strokeWidth: 2 }
          : store.activeTool === 'draw'
          ? { points: [pt], stroke: 'var(--rough-stroke)', strokeWidth: 3 }
          : { w: 10, h: 10, fill: 'var(--rough-fill)', stroke: 'var(--rough-stroke)', strokeWidth: 2 }),
      };
      store.setElements((prev) => [...prev, newEl]);
      store.setSelected([elId]);
      drawingRef.current = { id: elId, start: pt };
      return;
    }

    if (store.activeTool === 'lasso' || store.activeTool === 'select') {
      const r = getBoardRect();
      const rel = { x: e.clientX - r.left, y: e.clientY - r.top };
      lassoStartRef.current = rel;
      setLassoBox({ ...rel, w: 0, h: 0 });
      return;
    }

    if (store.activeTool === 'export') {
      const r = getBoardRect();
      const rel = { x: e.clientX - r.left, y: e.clientY - r.top };
      setRegionStart(rel);
      setRegionBox({ ...rel, w: 0, h: 0 });
      return;
    }

    store.setSelected([]);
  };

  // ── Pointer Move ─────────────────────────────────────────────
  const handlePointerMove = (e: React.MouseEvent) => {
    if (dragRef.current) {
      const d = dragRef.current;
      if (d.kind === 'pan') {
        store.setViewport({ x: d.vx + (e.clientX - d.sx), y: d.vy + (e.clientY - d.sy) });
        return;
      }
      const pt = screenToWorld(e.clientX, e.clientY);
      const dx = pt.x - d.start.x, dy = pt.y - d.start.y;

      if (d.kind === 'move') {
        store.setElements((prev) => prev.map((el) => {
          const orig = d.originals.find((o: any) => o.id === el.id);
          if (!orig) return el;
          const next = { ...el };
          if (el.type === 'line' || el.type === 'arrow') {
            next.x = orig.x + dx; next.y = orig.y + dy;
            if (orig.x2 !== undefined) next.x2 = orig.x2 + dx;
            if (orig.y2 !== undefined) next.y2 = orig.y2 + dy;
          } else {
            next.x = store.snap ? Math.round((orig.x + dx) / 24) * 24 : orig.x + dx;
            next.y = store.snap ? Math.round((orig.y + dy) / 24) * 24 : orig.y + dy;
          }
          return next;
        }));
        return;
      }

      if (d.kind === 'resize') {
        const pb = d.parentBox;
        if (!pb || pb.w <= 0 || pb.h <= 0) return;

        let nx = pb.x, ny = pb.y, nw = pb.w, nh = pb.h;
        const h = d.originals[0].handle;

        if (h.includes('e')) nw = pb.w + dx;
        if (h.includes('s')) nh = pb.h + dy;
        if (h.includes('w')) { nx = pb.x + dx; nw = pb.w - dx; }
        if (h.includes('n')) { ny = pb.y + dy; nh = pb.h - dy; }

        if (nw < 10) { if (h.includes('w')) nx += nw - 10; nw = 10; }
        if (nh < 10) { if (h.includes('n')) ny += nh - 10; nh = 10; }

        const scaleX = nw / pb.w;
        const scaleY = nh / pb.h;

        store.setElements((prev) => prev.map((el) => {
          const orig = d.originals.find((o: any) => o.id === el.id);
          if (!orig) return el;

          const next = { ...el };

          if (!['line', 'arrow', 'draw'].includes(el.type)) {
            const relX = orig.b.x - pb.x;
            const relY = orig.b.y - pb.y;

            next.x = nx + relX * scaleX;
            next.y = ny + relY * scaleY;
            next.w = orig.b.w * scaleX;
            next.h = orig.b.h * scaleY;

            if (orig.b.h > 0 && (el.type === 'text' || el.type === 'handwriting') && orig.fontSize) {
              next.fontSize = Math.max(8, Math.round(orig.fontSize * (scaleY + scaleX) / 2));
            }
          }
          else if (el.type === 'line' || el.type === 'arrow') {
            const relX = orig.x - pb.x;
            const relY = orig.y - pb.y;
            next.x = nx + relX * scaleX;
            next.y = ny + relY * scaleY;

            if (orig.x2 !== undefined && orig.y2 !== undefined) {
              const relX2 = orig.x2 - pb.x;
              const relY2 = orig.y2 - pb.y;
              next.x2 = nx + relX2 * scaleX;
              next.y2 = ny + relY2 * scaleY;
            }
          }
          else if (el.type === 'draw' && orig.points) {
            next.points = orig.points.map((p: { x: number; y: number }) => {
              const relX = p.x - pb.x;
              const relY = p.y - pb.y;
              return {
                x: nx + relX * scaleX,
                y: ny + relY * scaleY,
              };
            });
          }

          return next;
        }));
        return;
      }

      if (d.kind === 'rotate') {
        store.setElements((prev) => prev.map((el) => {
          const orig = d.originals.find((o: any) => o.id === el.id);
          if (!orig || ['line','arrow','draw'].includes(el.type)) return el;
          const ang = Math.atan2(pt.y - (orig.b.y + orig.b.h / 2), pt.x - (orig.b.x + orig.b.w / 2));
          let deg = orig.rot + (ang - orig.angle) * (180 / Math.PI);
          if (e.shiftKey) deg = Math.round(deg / 15) * 15;
          return { ...el, rot: deg };
        }));
        return;
      }
    }

    if (drawingRef.current) {
      const dr = drawingRef.current;
      const pt = screenToWorld(e.clientX, e.clientY);
      store.setElements((prev) => prev.map((el) => {
        if (el.id !== dr.id) return el;
        if (['rect','circle','frame'].includes(el.type)) {
          const norm = normRect(dr.start, pt);
          return { ...el, x: norm.x, y: norm.y, w: norm.w, h: norm.h };
        }
        if (el.type === 'line' || el.type === 'arrow') {
          let x2 = pt.x, y2 = pt.y;
          if (e.shiftKey) {
            const dx = x2 - el.x, dy2 = y2 - el.y;
            const ang = Math.round(Math.atan2(dy2, dx) / (Math.PI / 12)) * (Math.PI / 12);
            const len = Math.hypot(dx, dy2);
            x2 = el.x + Math.cos(ang) * len;
            y2 = el.y + Math.sin(ang) * len;
          }
          return { ...el, x2, y2 };
        }
        if (el.type === 'draw') return { ...el, points: [...(el.points || []), pt] };
        return el;
      }));
      return;
    }

    if ((store.activeTool === 'lasso' || store.activeTool === 'select') && lassoStartRef.current) {
      const r = getBoardRect();
      const cur = { x: e.clientX - r.left, y: e.clientY - r.top };
      setLassoBox(normRect(lassoStartRef.current, cur));
      return;
    }

    if (store.activeTool === 'export' && regionStart) {
      const r = getBoardRect();
      const cur = { x: e.clientX - r.left, y: e.clientY - r.top };
      setRegionBox(normRect(regionStart, cur));
    }
  };

  // ── Pointer Up ───────────────────────────────────────────────
  const handlePointerUp = () => {
    dragRef.current = null;

    if (drawingRef.current) {
      const dr = drawingRef.current;
      const el = store.elements.find((x) => x.id === dr.id);
      if (el) {
        const b = elementBounds(el);
        if (b.w < 5 && b.h < 5 && el.type !== 'draw') {
          store.setElements((prev) => prev.filter((x) => x.id !== el.id));
          store.setSelected([]);
        }
      }
      drawingRef.current = null;
      if (store.activeTool !== 'draw') store.setTool('select');
    }

    if ((store.activeTool === 'lasso' || store.activeTool === 'select') && lassoBox) {
      const b = lassoBox;
      setLassoBox(null);
      lassoStartRef.current = null;
      if (b.w > 6 && b.h > 6) {
        const worldBox = {
          x: (b.x - store.viewport.x) / store.viewport.zoom,
          y: (b.y - store.viewport.y) / store.viewport.zoom,
          w: b.w / store.viewport.zoom, h: b.h / store.viewport.zoom,
        };
        const ids = store.elements.filter((el) => intersects(elementBounds(el), worldBox)).map((el) => el.id);
        store.setSelected(ids);
        if (store.activeTool === 'lasso') store.setTool('select');
      } else {
        // Clear selection if they just click empty canvas space
        store.setSelected([]);
      }
    }

    if (store.activeTool === 'export' && regionBox) {
      setRegionStart(null);
      if (regionBox.w < 20 || regionBox.h < 20) { setRegionBox(null); store.setTool('select'); }
    }
  };

  // ── Element pointer down (move/select) ──────────────────────
  const handleElementPointerDown = (el: CanvasElement, e: React.PointerEvent) => {
    e.stopPropagation();
    if (store.activeTool === 'hand' || spacePressed) return;

    if (e.shiftKey) {
      store.setSelected(
        store.selected.includes(el.id)
          ? store.selected.filter((id) => id !== el.id)
          : [...store.selected, el.id]
      );
    } else if (!store.selected.includes(el.id)) {
      store.setSelected([el.id]);
    }

    store.pushHistory();
    const pt = screenToWorld(e.clientX, e.clientY);
    const selEls = store.selected.map((id) => store.elements.find((x) => x.id === id)).filter(Boolean) as CanvasElement[];
    dragRef.current = {
      kind: 'move', start: pt,
      originals: selEls.map((x) => ({ id: x.id, x: x.x, y: x.y, x2: x.x2, y2: x.y2 })),
    };
  };

  const handleResizeStart = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    store.pushHistory();
    const pt = screenToWorld(e.clientX, e.clientY);
    const selEls = store.selected.map((id) => store.elements.find((x) => x.id === id)).filter(Boolean) as CanvasElement[];
    
    // Compute combined bounding box bounds
    const bounds = selEls.map((x) => elementBounds(x));
    const minX = Math.min(...bounds.map((b) => b.x));
    const minY = Math.min(...bounds.map((b) => b.y));
    const maxX = Math.max(...bounds.map((b) => b.x + b.w));
    const maxY = Math.max(...bounds.map((b) => b.y + b.h));
    
    const parentBox = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };

    dragRef.current = {
      kind: 'resize', start: pt,
      parentBox,
      originals: selEls.map((x) => ({
        id: x.id,
        handle,
        b: elementBounds(x),
        x: x.x,
        y: x.y,
        x2: x.x2,
        y2: x.y2,
        fontSize: x.fontSize,
        points: x.points ? x.points.map((p) => ({ ...p })) : undefined,
      })),
    };
  };

  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    store.pushHistory();
    const pt = screenToWorld(e.clientX, e.clientY);
    const selEls = store.selected.map((id) => store.elements.find((x) => x.id === id)).filter(Boolean) as CanvasElement[];
    dragRef.current = {
      kind: 'rotate', start: pt,
      originals: selEls.map((x) => {
        const b = elementBounds(x);
        return { id: x.id, b, rot: x.rot || 0, angle: Math.atan2(pt.y - (b.y + b.h / 2), pt.x - (b.x + b.w / 2)) };
      }),
    };
  };


  const selectedElements = store.selected
    .map((id) => store.elements.find((x) => x.id === id))
    .filter(Boolean) as CanvasElement[];

  const dotSize = 24 * store.viewport.zoom;
  const isDrawingTool = ['rect','circle','line','arrow','frame','draw','lasso','export','handwriting','image'].includes(store.activeTool);

  return (
    <div
      ref={viewportRef}
      id="canvasViewport"
      className="absolute inset-0 select-none overflow-hidden touch-none"
      style={{
        cursor: store.activeTool === 'hand' || spacePressed
          ? 'grab'
          : store.activeTool === 'handwriting'
          ? 'text'
          : isDrawingTool ? 'crosshair' : 'default',
        backgroundColor: 'var(--bg-canvas)',
      }}
      onPointerDown={handlePointerDown as any}
      onPointerMove={handlePointerMove as any}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
    >
      {/* File drop overlay */}
      {isDraggingFile && (
        <div className="absolute inset-4 z-[100000] rounded-3xl border-2 border-dashed border-accent pointer-events-none flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.04)' }}>
          <div className="glass rounded-2xl px-8 py-6 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ background: 'var(--accent-glow)' }}>🖼</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text-primary)' }}>Drop image here</div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-muted)' }}>It'll land right on the canvas</div>
          </div>
        </div>
      )}

      {/* Dot grid */}
      {store.showGrid && (
        <div
          id="canvasBg"
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot-grid) 1.2px, transparent 1.2px)',
            backgroundSize: `${dotSize}px ${dotSize}px`,
            backgroundPosition: `${store.viewport.x % dotSize}px ${store.viewport.y % dotSize}px`,
          }}
        />
      )}

      {/* Canvas world */}
      <div
        ref={worldRef}
        id="canvasWorld"
        className="absolute left-0 top-0 w-px h-px origin-top-left will-change-transform pointer-events-none"
      >
        {[...store.elements].sort((a, b) => (a.z || 0) - (b.z || 0)).map((el) => {
          const isSel = store.selected.includes(el.id);
          const onPD = (e: React.PointerEvent) => handleElementPointerDown(el, e);

          if (el.type === 'note')        return <StickyNote       key={el.id} element={el} isSelected={isSel} onPointerDown={onPD} />;
          if (el.type === 'handwriting') return <HandwritingText  key={el.id} element={el} isSelected={isSel} onPointerDown={onPD} />;
          if (el.type === 'text')        return <TextElement       key={el.id} element={el} isSelected={isSel} onPointerDown={onPD} />;
          if (el.type === 'image')       return <ImageElement      key={el.id} element={el} isSelected={isSel} onPointerDown={onPD} />;
          return                                <RoughShape        key={el.id} element={el} isSelected={isSel} onPointerDown={onPD} />;
        })}

        {store.selected.length > 0 && (
          <SelectionBox
            elements={selectedElements}
            viewport={store.viewport}
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
          />
        )}

      </div>

      {/* Lasso overlay */}
      {lassoBox && (
        <div
          className="absolute pointer-events-none z-50 rounded-sm"
          style={{
            left: lassoBox.x, top: lassoBox.y, width: lassoBox.w, height: lassoBox.h,
            border: '1.5px dashed rgba(14,165,233,0.7)',
            background: 'rgba(14,165,233,0.05)',
          }}
        />
      )}

      {/* Region export overlay */}
      {regionBox && regionBox.w > 0 && (
        <div
          id="region-export-overlay"
          className="absolute pointer-events-none z-[9999]"
          style={{
            left: regionBox.x, top: regionBox.y, width: regionBox.w, height: regionBox.h,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.25)',
          }}
        >
          <svg
            className="absolute inset-0 overflow-visible"
            style={{ width: '100%', height: '100%' }}
          >
            <rect
              x="0" y="0" width="100%" height="100%"
              fill="rgba(99,102,241,0.04)"
              stroke="rgba(99,102,241,0.9)"
              strokeWidth="1.5"
              strokeDasharray="8 4"
              className="marching-ants"
            />
            {/* Corner accents */}
            {[['0,0','8,0 0,0 0,8'], ['100%,0','-8,0 0,0 0,8'], ['100%,100%','-8,0 0,0 0,-8'], ['0,100%','8,0 0,0 0,-8']].map(([_, pts], i) => (
              <polyline key={i} points={pts} fill="none" stroke="rgba(99,102,241,1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            ))}
          </svg>

          {/* Dimension pill */}
          <div
            className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
            style={{
              background: 'var(--bg-panel)', border: '1px solid var(--border)',
              boxShadow: 'var(--shadow-sm)', backdropFilter: 'blur(12px)',
              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-secondary)',
            }}
          >
            {Math.round(regionBox.w)} × {Math.round(regionBox.h)} px
          </div>
        </div>
      )}
    </div>
  );
};
