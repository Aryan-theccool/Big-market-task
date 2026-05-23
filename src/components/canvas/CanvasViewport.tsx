'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';
import { StickyNote, HandwritingText, TextElement, RoughShape, ImageElement, SelectionBox } from '../elements/CanvasElements';
import { compressAndResizeImage } from '../../utils/imageHelper';
import { useImageDrop } from '../../hooks/useImageDrop';
import { activeStylesByTool } from '../../utils/activeStyles';

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
  const activePointsRef = useRef<{ x: number; y: number }[]>([]);
  const draftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastDrawnIndexRef = useRef<number>(0);

  const drawFrame = () => {
    rafRef.current = null;
    if (!drawingRef.current || drawingRef.current.id !== 'temp_draw') return;

    const canvas = draftCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = activePointsRef.current;
    let i = lastDrawnIndexRef.current;

    if (points.length < 2) return;

    // Get styling values from active registry
    const activeStyles = activeStylesByTool['draw'] || {};
    const strokeW = activeStyles.strokeWidth ?? 3;
    let strokeColor = activeStyles.stroke || 'var(--rough-stroke)';
    
    // Resolve CSS variable if needed
    if (strokeColor.startsWith('var(')) {
      strokeColor = getComputedStyle(document.documentElement).getPropertyValue(
        strokeColor.replace(/^var\(/, '').replace(/\)$/, '')
      ).trim() || '#1c1c1e';
    }

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeW;

    ctx.beginPath();
    
    // Helper to translate world coordinates to current viewport canvas coordinates
    const getScreenPoint = (p: { x: number; y: number }) => ({
      x: p.x * store.viewport.zoom + store.viewport.x,
      y: p.y * store.viewport.zoom + store.viewport.y,
    });

    const start = getScreenPoint(points[Math.max(0, i - 1)]);
    ctx.moveTo(start.x, start.y);

    for (; i < points.length - 1; i++) {
      const p0 = getScreenPoint(points[i]);
      const p1 = getScreenPoint(points[i + 1]);

      const mx = (p0.x + p1.x) / 2;
      const my = (p0.y + p1.y) / 2;

      ctx.quadraticCurveTo(p0.x, p0.y, mx, my);
    }

    ctx.stroke();
    lastDrawnIndexRef.current = i;

    // If more points arrived while painting this frame, schedule next loop
    if (points.length > lastDrawnIndexRef.current + 1) {
      rafRef.current = requestAnimationFrame(drawFrame);
    }
  };


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
  const handlePointerDown = (e: React.PointerEvent) => {
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
      store.addElement({
        id, type: 'handwriting',
        x: pt.x, y: pt.y, w: 200, h: 50,
        text: '', fontSize: 28,
        stroke: 'var(--text-primary)',
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
      store.addElement({
        id, type: 'text',
        x: pt.x, y: pt.y - 20, w: 260, h: 60,
        text: '', fontSize: 28,
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

    if (store.activeTool === 'draw') {
      store.pushHistory();
      
      // Initialize draft canvas buffer dimensions scaled by devicePixelRatio for razor-sharp Retina sketching!
      const canvas = draftCanvasRef.current;
      if (canvas && viewportRef.current) {
        const rect = viewportRef.current.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
          ctx.clearRect(0, 0, rect.width, rect.height);
        }
      }

      // Lock mouse / touch updates to the drawing target
      try {
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
      } catch (err) {
        console.warn('setPointerCapture failed:', err);
      }

      activePointsRef.current = [pt];
      lastDrawnIndexRef.current = 0;
      drawingRef.current = { id: 'temp_draw', start: pt };
      
      // Add the active drawing visual optimization styling overrides class to body
      document.body.classList.add('is-drawing');
      return;
    }

    if (['rect','circle','line','arrow','frame'].includes(store.activeTool)) {
      store.pushHistory();
      const elId = uid();
      const isLineType = store.activeTool === 'line' || store.activeTool === 'arrow';
      const activeStyles = activeStylesByTool[store.activeTool] || {};
      const newEl: CanvasElement = {
        id: elId, type: store.activeTool as any,
        x: pt.x, y: pt.y, z: Date.now() % 100000,
        ...(isLineType
          ? { x2: pt.x + 1, y2: pt.y + 1, stroke: activeStyles.stroke || 'var(--rough-stroke)', strokeWidth: activeStyles.strokeWidth ?? 2 }
          : {
              w: 10, h: 10,
              fill: activeStyles.fill || 'var(--rough-fill)',
              stroke: activeStyles.stroke || 'var(--rough-stroke)',
              strokeWidth: activeStyles.strokeWidth ?? 2,
              roughness: activeStyles.roughness ?? 1.2,
            }),
      };
      store.setElements((prev) => [...prev, newEl]);
      store.setSelected([elId]);
      drawingRef.current = { id: elId, start: pt };
      return;
    }

    if (store.activeTool === 'lasso') {
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
        store.setElements((prev) => prev.map((el) => {
          const orig = d.originals.find((o: any) => o.id === el.id);
          if (!orig || ['line','arrow','draw'].includes(el.type)) return el;
          let nx = orig.b.x, ny = orig.b.y, nw = orig.b.w, nh = orig.b.h;
          const h = orig.handle;
          if (h.includes('e')) nw = orig.b.w + dx;
          if (h.includes('s')) nh = orig.b.h + dy;
          if (h.includes('w')) { nx = orig.b.x + dx; nw = orig.b.w - dx; }
          if (h.includes('n')) { ny = orig.b.y + dy; nh = orig.b.h - dy; }
          if (e.shiftKey) {
            const ratio = orig.b.w / Math.max(1, orig.b.h);
            if (Math.abs(nw - orig.b.w) > Math.abs(nh - orig.b.h)) nh = nw / ratio;
            else nw = nh * ratio;
          }
          if (nw < 20) { if (h.includes('w')) nx += nw - 20; nw = 20; }
          if (nh < 20) { if (h.includes('n')) ny += nh - 20; nh = 20; }
          return { ...el, x: nx, y: ny, w: nw, h: nh };
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

      if (store.activeTool === 'draw' && dr.id === 'temp_draw') {
        // Collect points using getCoalescedEvents for maximum precision and stylus/pointer smoothness!
        const events = (e.nativeEvent as any).getCoalescedEvents
          ? (e.nativeEvent as any).getCoalescedEvents()
          : [e];

        for (const ev of events) {
          const ptEv = screenToWorld(ev.clientX, ev.clientY);
          activePointsRef.current.push(ptEv);
        }

        // Schedule high-performance drawing batch loop under requestAnimationFrame
        if (!rafRef.current) {
          rafRef.current = requestAnimationFrame(drawFrame);
        }
        return;
      }

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
        return el;
      }));
      return;
    }

    if (store.activeTool === 'lasso' && lassoStartRef.current) {
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
  const handlePointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;

    if (drawingRef.current) {
      const dr = drawingRef.current;
      if (dr.id === 'temp_draw') {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }

        // Release pointer capture to restore normal window focus!
        try {
          (e.target as HTMLElement).releasePointerCapture(e.pointerId);
        } catch (err) {
          // Ignore
        }

        const rawPts = activePointsRef.current;
        const pts = simplifyPoints(rawPts, 1.2);
        
        if (pts.length >= 2) {
          const elId = uid();
          const activeStyles = activeStylesByTool['draw'] || {};
          const newEl: CanvasElement = {
            id: elId,
            type: 'draw',
            x: 0, y: 0,
            points: pts,
            stroke: activeStyles.stroke || 'var(--rough-stroke)',
            strokeWidth: activeStyles.strokeWidth ?? 3,
            z: Date.now() % 100000,
          };
          store.setElements((prev) => [...prev, newEl]);
        }

        // Clear draft canvas context
        const canvas = draftCanvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
        
        activePointsRef.current = [];
        lastDrawnIndexRef.current = 0;
        
        // Remove active drawing styling optimization class from body
        document.body.classList.remove('is-drawing');
      } else {
        const el = store.elements.find((x) => x.id === dr.id);
        if (el) {
          const b = elementBounds(el);
          if (b.w < 5 && b.h < 5 && el.type !== 'draw') {
            store.setElements((prev) => prev.filter((x) => x.id !== el.id));
            store.setSelected([]);
          }
        }
      }
      drawingRef.current = null;
      if (store.activeTool !== 'draw') store.setTool('select');
    }

    if (store.activeTool === 'lasso' && lassoBox) {
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
        store.setTool('select');
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
    dragRef.current = {
      kind: 'resize', start: pt,
      originals: selEls.map((x) => ({ id: x.id, handle, b: elementBounds(x) })),
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

        {store.selected.length > 0 && store.activeTool === 'select' && (
          <SelectionBox
            elements={selectedElements}
            viewport={store.viewport}
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
          />
        )}

      </div>

      {/* Draft Canvas Layer for 120fps hardware-accelerated drawing preview */}
      <canvas
        ref={draftCanvasRef}
        className="absolute inset-0 pointer-events-none z-[8000]"
        style={{ width: '100%', height: '100%' }}
      />

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

// ─── Freehand path helper for active drawing overlay ───────────
import { getStroke } from 'perfect-freehand';

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

const ActiveDrawingOverlay: React.FC<{
  points: { x: number; y: number }[];
  strokeWidth: number;
  strokeColor: string;
}> = ({ points, strokeWidth, strokeColor }) => {
  const d = getFreehandPath(points, strokeWidth, strokeColor);
  if (!d) return null;
  return (
    <svg
      className="absolute inset-0 overflow-visible pointer-events-none"
      style={{ width: 1, height: 1 }}
    >
      <path
        d={d}
        fill={strokeColor}
        stroke="none"
      />
    </svg>
  );
};

function simplifyPoints(points: { x: number; y: number }[], minDistance = 1.2): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  const result = [points[0]];
  let last = points[0];

  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    const dx = p.x - last.x;
    const dy = p.y - last.y;

    if (dx * dx + dy * dy >= minDistance * minDistance) {
      result.push(p);
      last = p;
    }
  }

  // Ensure last point is preserved
  if (result[result.length - 1] !== points[points.length - 1]) {
    result.push(points[points.length - 1]);
  }

  return result;
}
