'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useCanvasStore, CanvasElement, Viewport } from '../../store/canvasStore';
import { StickyNote, SvgShape, TextElement, ImageElement, SelectionBox } from '../elements/CanvasElements';

import { compressAndResizeImage } from '../../utils/imageHelper';

interface CanvasViewportProps {
  viewportRef: React.RefObject<HTMLDivElement>;
  regionStart: { x: number; y: number } | null;
  setRegionStart: React.Dispatch<React.SetStateAction<{ x: number; y: number } | null>>;
  regionBox: { x: number; y: number; w: number; h: number } | null;
  setRegionBox: React.Dispatch<React.SetStateAction<{ x: number; y: number; w: number; h: number } | null>>;
  toast?: (msg: string, color?: string) => void;
}

export const CanvasViewport: React.FC<CanvasViewportProps> = ({
  viewportRef,
  regionStart,
  setRegionStart,
  regionBox,
  setRegionBox,
  toast,
}) => {
  const store = useCanvasStore();
  const worldRef = useRef<HTMLDivElement>(null);
  
  // Track space pressed state locally to enable lag-free panning override
  const [spacePressed, setSpacePressed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const activeEl = document.activeElement;
        const isEditable = activeEl?.getAttribute('contenteditable') === 'true' || 
                           activeEl?.tagName === 'INPUT' || 
                           activeEl?.tagName === 'TEXTAREA';
        if (!isEditable) {
          e.preventDefault();
          setSpacePressed(true);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacePressed(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Global paste handler to support screenshot copy/pastes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handlePaste = async (e: ClipboardEvent) => {
      const activeEl = document.activeElement;
      const isEditable = activeEl?.getAttribute('contenteditable') === 'true' || 
                         activeEl?.tagName === 'INPUT' || 
                         activeEl?.tagName === 'TEXTAREA';
      if (isEditable) return;

      const items = e.clipboardData?.items;
      let hasImage = false;
      if (items) {
        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          if (item.type.startsWith('image/')) {
            hasImage = true;
            e.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            if (toast) toast('Processing pasted screenshot...', '#6366F1');

            const reader = new FileReader();
            reader.onload = async (event) => {
              const base64Str = event.target?.result as string;
              const state = useCanvasStore.getState();
              const viewportW = viewportRef.current?.clientWidth || window.innerWidth;
              const viewportH = viewportRef.current?.clientHeight || window.innerHeight;
              
              const r = viewportRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
              const centerX = (viewportW / 2 - r.left - state.viewport.x) / state.viewport.zoom;
              const centerY = (viewportH / 2 - r.top - state.viewport.y) / state.viewport.zoom;

              const compressed = await compressAndResizeImage(base64Str);

              store.addElement({
                id: 'el_' + Math.random().toString(36).slice(2, 9),
                type: 'image',
                x: centerX - compressed.w / 2,
                y: centerY - compressed.h / 2,
                w: compressed.w,
                h: compressed.h,
                src: compressed.src,
                z: Date.now() % 100000,
              });
              if (toast) toast('Screenshot pasted successfully!', '#10B981');
            };
            reader.readAsDataURL(file);
            break;
          }
        }
      }

      if (!hasImage) {
        const state = useCanvasStore.getState();
        if (state.clipboard && state.clipboard.length > 0) {
          e.preventDefault();
          store.pasteSelected();
          if (toast) toast('Pasted clipboard content', '#6366F1');
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => {
      document.removeEventListener('paste', handlePaste);
    };
  }, [toast]);
  
  // Dragging / Drawing state
  const dragRef = useRef<any>(null);
  const drawingRef = useRef<any>(null);

  // File Drag & Drop State
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Str = event.target?.result as string;
        const pt = screenToWorld(e.clientX, e.clientY);
        
        if (toast) toast('Processing dropped image...', '#6366F1');
        const compressed = await compressAndResizeImage(base64Str);
        
        store.addElement({
          id: 'el_' + Math.random().toString(36).slice(2, 9),
          type: 'image',
          x: pt.x - compressed.w / 2,
          y: pt.y - compressed.h / 2,
          w: compressed.w,
          h: compressed.h,
          src: compressed.src,
          z: Date.now() % 100000,
        });
        if (toast) toast('Image added to board!', '#10B981');
      };
      reader.readAsDataURL(file);
      return;
    }

    if (!file.name.toLowerCase().endsWith('.json')) {
      if (toast) toast('Please drop a valid board .json or image file', '#F43F5E');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const cleanText = text.replace(/^\ufeff/, '');
        const data = JSON.parse(cleanText);
        
        let elements = null;
        let boardName = store.boardName;
        let viewport = store.viewport;

        if (Array.isArray(data)) {
          elements = data;
        } else if (data && typeof data === 'object') {
          elements = Array.isArray(data.elements) ? data.elements : null;
          if (data.boardName) boardName = data.boardName;
          if (data.viewport) viewport = data.viewport;
        }

        if (elements) {
          store.importBoard(elements, boardName, viewport);
          if (toast) toast('Board imported successfully via drag & drop!', '#10B981');
        } else {
          if (toast) toast('Invalid board file structure: "elements" array not found', '#F43F5E');
        }
      } catch (err) {
        if (toast) toast('Failed to parse board file: invalid JSON format', '#F43F5E');
      }
    };
    reader.readAsText(file);
  };
  
  // Lasso State
  const [lassoBox, setLassoBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const lassoStartRef = useRef<{ x: number; y: number } | null>(null);

  // Collaborators simulation coordinates
  const [collabCoords, setCollabCoords] = useState<Record<string, { x: number; y: number }>>({
    priya: { x: 180, y: 220 },
    james: { x: 520, y: 340 },
    lena: { x: 800, y: 150 },
  });

  // Hydrate store from localStorage
  useEffect(() => {
    store.hydrate();
  }, []);

  // Collaborators drift simulation loop
  useEffect(() => {
    if (store.activeTool === 'export' || typeof window === 'undefined') return;
    
    let lastTime = 0;
    let animationFrameId: number;

    const animateCollabs = (time: number) => {
      if (!lastTime) lastTime = time;
      
      const px = 180 + Math.sin(time / 1300 * 0.75 + 1) * 320;
      const py = 220 + Math.cos(time / 1500 * 0.75 + 2) * 180;
      
      const jx = 520 + Math.sin(time / 1400 * 0.55 + 3) * 280;
      const jy = 340 + Math.cos(time / 1200 * 0.55 + 1) * 200;
      
      const lx = 800 + Math.sin(time / 1600 * 0.35 + 2) * 240;
      const ly = 150 + Math.cos(time / 1700 * 0.35 + 4) * 150;

      setCollabCoords({
        priya: { x: px, y: py },
        james: { x: jx, y: jy },
        lena: { x: lx, y: ly },
      });

      animationFrameId = requestAnimationFrame(animateCollabs);
    };

    animationFrameId = requestAnimationFrame(animateCollabs);
    return () => cancelAnimationFrame(animationFrameId);
  }, [store.activeTool]);

  // Handle direct DOM style transform settings for smooth 60fps pan/zoom
  useEffect(() => {
    const w = worldRef.current;
    if (!w) return;
    w.style.transform = `translate(${store.viewport.x}px, ${store.viewport.y}px) scale(${store.viewport.zoom})`;
  }, [store.viewport]);

  // Coordinate Conversion Helpers
  const getBoardRect = () => {
    return viewportRef.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
  };

  const screenToWorld = (cx: number, cy: number) => {
    const r = getBoardRect();
    return {
      x: (cx - r.left - store.viewport.x) / store.viewport.zoom,
      y: (cy - r.top - store.viewport.y) / store.viewport.zoom,
    };
  };

  const worldToScreen = (xVal: number, yVal: number) => {
    const r = getBoardRect();
    return {
      x: r.left + store.viewport.x + xVal * store.viewport.zoom,
      y: r.top + store.viewport.y + yVal * store.viewport.zoom,
    };
  };

  // Zooming
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const r = getBoardRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;

    const before = {
      x: (mx - store.viewport.x) / store.viewport.zoom,
      y: (my - store.viewport.y) / store.viewport.zoom,
    };

    const factor = Math.exp(-e.deltaY * 0.0012);
    const nz = Math.max(0.1, Math.min(4.0, store.viewport.zoom * factor));

    store.setViewport({
      x: mx - before.x * nz,
      y: my - before.y * nz,
      zoom: nz,
    });
  };

  // Selection Intersection Helpers
  const bounds = (el: CanvasElement) => {
    if (el.type === 'line' || el.type === 'arrow') {
      return {
        x: Math.min(el.x, el.x2 || el.x),
        y: Math.min(el.y, el.y2 || el.y),
        w: Math.abs((el.x2 || el.x) - el.x) || 1,
        h: Math.abs((el.y2 || el.y) - el.y) || 1,
      };
    }
    if (el.type === 'draw') {
      if (el.points && el.points.length > 0) {
        const xs = el.points.map((p) => p.x);
        const ys = el.points.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        return {
          x: minX,
          y: minY,
          w: Math.max(1, maxX - minX),
          h: Math.max(1, maxY - minY),
        };
      }
      return { x: el.x, y: el.y, w: 1, h: 1 };
    }
    return {
      x: el.x,
      y: el.y,
      w: el.w || 100,
      h: el.h || 60,
    };
  };

  const intersects = (r1: any, r2: any) => {
    return !(
      r2.x > r1.x + r1.w ||
      r2.x + r2.w < r1.x ||
      r2.y > r1.y + r1.h ||
      r2.y + r2.h < r1.y
    );
  };

  const normRect = (a: { x: number; y: number }, b: { x: number; y: number }) => {
    return {
      x: Math.min(a.x, b.x),
      y: Math.min(a.y, b.y),
      w: Math.abs(a.x - b.x),
      h: Math.abs(a.y - b.y),
    };
  };

  // CanvasPointerDown: starts dragging, drawing, lasso selecting, or region exporting
  const handlePointerDown = (e: React.MouseEvent) => {
    if (e.button === 1 || store.activeTool === 'hand' || spacePressed) {
      dragRef.current = {
        kind: 'pan',
        sx: e.clientX,
        sy: e.clientY,
        vx: store.viewport.x,
        vy: store.viewport.y,
      };
      return;
    }

    const pt = screenToWorld(e.clientX, e.clientY);
    if (store.snap) {
      pt.x = Math.round(pt.x / 24) * 24;
      pt.y = Math.round(pt.y / 24) * 24;
    }

    // Direct placing tools
    if (store.activeTool === 'note') {
      store.addElement({
        id: 'el_' + Math.random().toString(36).slice(2, 9),
        type: 'note',
        x: pt.x - 110,
        y: pt.y - 110,
        w: 220,
        h: 220,
        rot: Math.floor(Math.random() * 6 - 3),
        color: 'sun',
        text: 'Sticky idea...',
        z: Date.now() % 100000,
      });
      store.setTool('select');
      return;
    }

    if (store.activeTool === 'text') {
      store.addElement({
        id: 'el_' + Math.random().toString(36).slice(2, 9),
        type: 'text',
        x: pt.x,
        y: pt.y - 20,
        w: 240,
        h: 60,
        text: 'Double-click to type...',
        z: Date.now() % 100000,
      });
      store.setTool('select');
      return;
    }

    // Resizing/Dragging shapes
    if (['rect', 'circle', 'line', 'arrow', 'frame', 'draw'].includes(store.activeTool)) {
      store.pushHistory();
      const elId = 'el_' + Math.random().toString(36).slice(2, 9);
      const newEl: CanvasElement = {
        id: elId,
        type: store.activeTool as any,
        x: pt.x,
        y: pt.y,
        z: Date.now() % 100000,
        ...(store.activeTool === 'line' || store.activeTool === 'arrow'
          ? { x2: pt.x + 1, y2: pt.y + 1, stroke: '#6366F1', strokeWidth: 3 }
          : store.activeTool === 'draw'
          ? { points: [pt], stroke: '#6366F1', strokeWidth: 4 }
          : { w: 10, h: 10, fill: 'rgba(99, 102, 241, 0.08)', stroke: '#6366F1', strokeWidth: 2 }),
      };
      
      store.setElements((prev) => [...prev, newEl]);
      store.setSelected([elId]);
      drawingRef.current = { id: elId, start: pt };
      return;
    }

    // Lasso Selection
    if (store.activeTool === 'lasso') {
      const r = getBoardRect();
      const relativeStart = { x: e.clientX - r.left, y: e.clientY - r.top };
      lassoStartRef.current = relativeStart;
      setLassoBox({ ...relativeStart, w: 0, h: 0 });
      return;
    }

    // Region Export Select Box
    if (store.activeTool === 'export') {
      const r = getBoardRect();
      const relativeStart = { x: e.clientX - r.left, y: e.clientY - r.top };
      setRegionStart(relativeStart);
      setRegionBox({ ...relativeStart, w: 0, h: 0 });
      return;
    }

    // Deselect if clicking empty space
    store.setSelected([]);
  };

  // Pointer Move: Handles Panning, Dragging, Resizing, Rotating, and Drawing
  const handlePointerMove = (e: React.MouseEvent) => {
    if (dragRef.current) {
      const d = dragRef.current;
      if (d.kind === 'pan') {
        store.setViewport({
          x: d.vx + (e.clientX - d.sx),
          y: d.vy + (e.clientY - d.sy),
        });
        return;
      }

      const pt = screenToWorld(e.clientX, e.clientY);
      const dx = pt.x - d.start.x;
      const dy = pt.y - d.start.y;

      if (d.kind === 'move') {
        store.setElements((prev) =>
          prev.map((el) => {
            const original = d.originals.find((o: any) => o.id === el.id);
            if (!original) return el;
            
            const nextEl = { ...el };
            if (['line', 'arrow'].includes(el.type)) {
              nextEl.x = original.x + dx;
              nextEl.y = original.y + dy;
              if (original.x2 !== undefined) nextEl.x2 = original.x2 + dx;
              if (original.y2 !== undefined) nextEl.y2 = original.y2 + dy;
              
              if (store.snap) {
                const sx = Math.round(nextEl.x / 24) * 24 - nextEl.x;
                const sy = Math.round(nextEl.y / 24) * 24 - nextEl.y;
                nextEl.x += sx;
                nextEl.y += sy;
                if (nextEl.x2 !== undefined) nextEl.x2 += sx;
                if (nextEl.y2 !== undefined) nextEl.y2 += sy;
              }
            } else {
              nextEl.x = original.x + dx;
              nextEl.y = original.y + dy;
              if (store.snap) {
                nextEl.x = Math.round(nextEl.x / 24) * 24;
                nextEl.y = Math.round(nextEl.y / 24) * 24;
              }
            }
            return nextEl;
          })
        );
        return;
      }

      if (d.kind === 'resize') {
        store.setElements((prev) =>
          prev.map((el) => {
            const original = d.originals.find((o: any) => o.id === el.id);
            if (!original || ['line', 'arrow', 'draw'].includes(el.type)) return el;

            const nextEl = { ...el };
            let nx = original.b.x;
            let ny = original.b.y;
            let nw = original.b.w;
            let nh = original.b.h;
            const h = original.handle;

            if (h.includes('e')) nw = original.b.w + dx;
            if (h.includes('s')) nh = original.b.h + dy;
            if (h.includes('w')) {
              nx = original.b.x + dx;
              nw = original.b.w - dx;
            }
            if (h.includes('n')) {
              ny = original.b.y + dy;
              nh = original.b.h - dy;
            }

            if (e.shiftKey) {
              const ratio = original.b.w / Math.max(1, original.b.h);
              if (Math.abs(nw - original.b.w) > Math.abs(nh - original.b.h)) {
                nh = nw / ratio;
              } else {
                nw = nh * ratio;
              }
            }

            if (nw < 24) {
              if (h.includes('w')) nx += nw - 24;
              nw = 24;
            }
            if (nh < 24) {
              if (h.includes('n')) ny += nh - 24;
              nh = 24;
            }

            nextEl.x = nx;
            nextEl.y = ny;
            nextEl.w = nw;
            nextEl.h = nh;
            return nextEl;
          })
        );
        return;
      }

      if (d.kind === 'rotate') {
        store.setElements((prev) =>
          prev.map((el) => {
            const original = d.originals.find((o: any) => o.id === el.id);
            if (!original || ['line', 'arrow', 'draw'].includes(el.type)) return el;

            const ang = Math.atan2(pt.y - (original.b.y + original.b.h / 2), pt.x - (original.b.x + original.b.w / 2));
            let deg = original.rot + (ang - original.angle) * 180 / Math.PI;
            if (e.shiftKey) {
              deg = Math.round(deg / 15) * 15;
            }
            return { ...el, rot: deg };
          })
        );
        return;
      }
    }

    // Dynamic drawing resize
    if (drawingRef.current) {
      const dr = drawingRef.current;
      const pt = screenToWorld(e.clientX, e.clientY);
      
      store.setElements((prev) =>
        prev.map((el) => {
          if (el.id !== dr.id) return el;
          
          const nextEl = { ...el };
          if (['rect', 'circle', 'frame'].includes(el.type)) {
            let norm = normRect(dr.start, pt);
            if (e.shiftKey && el.type === 'circle') {
              const sz = Math.max(norm.w, norm.h);
              norm.w = sz;
              norm.h = sz;
            }
            nextEl.x = norm.x;
            nextEl.y = norm.y;
            nextEl.w = norm.w;
            nextEl.h = norm.h;
          } else if (['line', 'arrow'].includes(el.type)) {
            nextEl.x2 = pt.x;
            nextEl.y2 = pt.y;
            if (e.shiftKey) {
              const dx = (nextEl.x2 || 0) - nextEl.x;
              const dy = (nextEl.y2 || 0) - nextEl.y;
              const ang = Math.round(Math.atan2(dy, dx) / (Math.PI / 12)) * (Math.PI / 12);
              const len = Math.hypot(dx, dy);
              nextEl.x2 = nextEl.x + Math.cos(ang) * len;
              nextEl.y2 = nextEl.y + Math.sin(ang) * len;
            }
          } else if (el.type === 'draw') {
            nextEl.points = [...(el.points || []), pt];
          }
          return nextEl;
        })
      );
      return;
    }

    // Lasso select update
    if (store.activeTool === 'lasso' && lassoStartRef.current && lassoBox) {
      const r = getBoardRect();
      const cur = { x: e.clientX - r.left, y: e.clientY - r.top };
      setLassoBox(normRect(lassoStartRef.current, cur));
      return;
    }

    // Region Crop update
    if (store.activeTool === 'export' && regionStart && regionBox) {
      const r = getBoardRect();
      const cur = { x: e.clientX - r.left, y: e.clientY - r.top };
      setRegionBox(normRect(regionStart, cur));
    }
  };

  // Pointer Up: Commits items to stores
  const handlePointerUp = () => {
    if (dragRef.current) {
      dragRef.current = null;
    }

    if (drawingRef.current) {
      const dr = drawingRef.current;
      const el = store.elements.find((x) => x.id === dr.id);
      
      // Remove tiny accidental single-click drawings
      if (el) {
        const b = bounds(el);
        if (b.w < 5 && b.h < 5 && el.type !== 'draw') {
          store.setElements((prev) => prev.filter((x) => x.id !== el.id));
          store.setSelected([]);
        }
      }
      drawingRef.current = null;
      
      // PEN TOOL PERSISTENCE - Pen draws keep active, shapes reset to select
      if (store.activeTool !== 'draw') {
        store.setTool('select');
      }
    }

    // Complete Lasso selection
    if (store.activeTool === 'lasso' && lassoBox) {
      const b = lassoBox;
      setLassoBox(null);
      lassoStartRef.current = null;

      if (b.w > 6 && b.h > 6) {
        const worldBox = {
          x: (b.x - store.viewport.x) / store.viewport.zoom,
          y: (b.y - store.viewport.y) / store.viewport.zoom,
          w: b.w / store.viewport.zoom,
          h: b.h / store.viewport.zoom,
        };

        const intersectIds = store.elements
          .filter((el) => intersects(bounds(el), worldBox))
          .map((el) => el.id);

        store.setSelected(intersectIds);
        store.setTool('select');
      }
    }

    // Complete Region select (starts export menu trigger)
    if (store.activeTool === 'export' && regionBox) {
      setRegionStart(null);
      if (regionBox.w < 20 || regionBox.h < 20) {
        setRegionBox(null);
        store.setTool('select');
      }
    }
  };

  // Handles starting moves on selected items
  const handleElementPointerDown = (el: CanvasElement, e: React.PointerEvent) => {
    e.stopPropagation();
    
    // Allow space+pan to override moves
    if (store.activeTool === 'hand' || spacePressed) return;

    if (e.shiftKey) {
      const nextSel = store.selected.includes(el.id)
        ? store.selected.filter((id) => id !== el.id)
        : [...store.selected, el.id];
      store.setSelected(nextSel);
    } else if (!store.selected.includes(el.id)) {
      store.setSelected([el.id]);
    }

    // Start Drag move coordinates
    store.pushHistory();
    const pt = screenToWorld(e.clientX, e.clientY);
    const selectedEls = store.selected
      .map((id) => store.elements.find((x) => x.id === id))
      .filter((x): x is CanvasElement => !!x);

    dragRef.current = {
      kind: 'move',
      start: pt,
      originals: selectedEls.map((x) => ({
        id: x.id,
        x: x.x,
        y: x.y,
        x2: x.x2,
        y2: x.y2,
      })),
    };
  };

  // Handles starting resizes on handles
  const handleResizeStart = (handle: string, e: React.PointerEvent) => {
    e.stopPropagation();
    store.pushHistory();
    const pt = screenToWorld(e.clientX, e.clientY);
    const selectedEls = store.selected
      .map((id) => store.elements.find((x) => x.id === id))
      .filter((x): x is CanvasElement => !!x);

    dragRef.current = {
      kind: 'resize',
      start: pt,
      originals: selectedEls.map((x) => ({
        id: x.id,
        handle,
        b: bounds(x),
      })),
    };
  };

  // Handles starting rotation on handles
  const handleRotateStart = (e: React.PointerEvent) => {
    e.stopPropagation();
    store.pushHistory();
    const pt = screenToWorld(e.clientX, e.clientY);
    const selectedEls = store.selected
      .map((id) => store.elements.find((x) => x.id === id))
      .filter((x): x is CanvasElement => !!x);

    dragRef.current = {
      kind: 'rotate',
      start: pt,
      originals: selectedEls.map((x) => {
        const b = bounds(x);
        return {
          id: x.id,
          b,
          rot: x.rot || 0,
          angle: Math.atan2(pt.y - (b.y + b.h / 2), pt.x - (b.x + b.w / 2)),
        };
      }),
    };
  };

  const selectedElements = store.selected
    .map((id) => store.elements.find((x) => x.id === id))
    .filter((x): x is CanvasElement => !!x);

  const dotGridSize = 24 * store.viewport.zoom;

  return (
    <div
      ref={viewportRef}
      id="canvasViewport"
      className="absolute inset-0 select-none overflow-hidden touch-none"
      style={{
        cursor:
          store.activeTool === 'hand' || spacePressed
            ? 'grab'
            : ['rect', 'circle', 'line', 'arrow', 'draw', 'frame', 'lasso', 'export'].includes(
                store.activeTool
              )
            ? 'crosshair'
            : 'default',
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* File Drop Cinematic Overlay */}
      {isDraggingFile && (
        <div className="absolute inset-0 bg-black/10 dark:bg-black/30 backdrop-blur-md z-[100000] flex flex-col justify-center items-center pointer-events-none animate-fade-in border-4 border-dashed border-indigo-500/80 m-4 rounded-3xl">
          <div className="glass p-8 rounded-3xl shadow-2xl flex flex-col items-center gap-4 text-center max-w-sm animate-scale-in">
            <svg 
              className="w-16 h-16 text-indigo-500 animate-bounce" 
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" />
              <path d="M16 10 V22" className="text-indigo-400" />
              <path d="M11 15 L16 10 L21 15" className="text-indigo-400" />
            </svg>
            <h3 className="font-display text-2xl font-bold tracking-tight text-primaryText">
              Drop Board JSON Here
            </h3>
            <p className="font-body text-xs text-mutedText leading-relaxed">
              Release to instantly import elements, snapshots, and collaborators state to this space
            </p>
          </div>
        </div>
      )}
      {/* Background Dot grid */}
      {store.showGrid && (
        <div
          id="canvasBg"
          className="absolute inset-0 pointer-events-none transition-colors duration-300"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot-grid) 1.2px, transparent 1.2px)',
            backgroundSize: `${dotGridSize}px ${dotGridSize}px`,
            backgroundPosition: `${store.viewport.x % dotGridSize}px ${
              store.viewport.y % dotGridSize
            }px`,
          }}
        />
      )}

      {/* Transformable Canvas Elements Layer */}
      <div
        ref={worldRef}
        id="canvasWorld"
        className="absolute left-0 top-0 w-[1px] h-[1px] origin-top-left will-change-transform pointer-events-none"
      >
        {/* Render elements */}
        {[...store.elements].sort((a, b) => (a.z || 0) - (b.z || 0)).map((el) => {
          const isSelected = store.selected.includes(el.id);
          const pointerDownHandler = (e: React.PointerEvent) => handleElementPointerDown(el, e);

          if (el.type === 'image') {
            return (
              <ImageElement
                key={el.id}
                element={el}
                isSelected={isSelected}
                onPointerDown={pointerDownHandler}
              />
            );
          }
          if (el.type === 'note') {
            return (
              <StickyNote
                key={el.id}
                element={el}
                isSelected={isSelected}
                onPointerDown={pointerDownHandler}
              />
            );
          }
          if (el.type === 'text') {
            return (
              <TextElement
                key={el.id}
                element={el}
                isSelected={isSelected}
                onPointerDown={pointerDownHandler}
              />
            );
          }
          return (
            <SvgShape
              key={el.id}
              element={el}
              isSelected={isSelected}
              onPointerDown={pointerDownHandler}
            />
          );
        })}

        {/* Selection bounding box wraps */}
        {store.selected.length > 0 && (
          <SelectionBox
            elements={selectedElements}
            viewport={store.viewport}
            onResizeStart={handleResizeStart}
            onRotateStart={handleRotateStart}
          />
        )}

        {/* Real-time Ghost collaborator cursors */}
        {Object.entries(collabCoords).map(([collabKey, coord]) => {
          const isPriyaTyping = collabKey === 'priya' && store.elements.some(e => e.type === 'note' && e._typing);
          const colors: Record<string, string> = { priya: '#F43F5E', james: '#10B981', lena: '#F59E0B' };
          const names: Record<string, string> = { priya: 'Priya S.', james: 'James K.', lena: 'Lena V.' };
          
          return (
            <div
              key={collabKey}
              className="absolute pointer-events-none z-[10000] flex items-center gap-1.5 transition-transform duration-100 will-change-transform"
              style={{
                transform: `translate(${coord.x}px, ${coord.y}px)`,
              }}
            >
              <svg viewBox="0 0 24 24" className="w-5.5 h-5.5 drop-shadow-md">
                <path fill={colors[collabKey]} d="M4 2l15 10-7 1.5L8 21 4 2z" />
              </svg>
              <span
                className="text-white text-[10px] font-ui px-2 py-0.5 rounded-full select-none shadow-sm flex items-center gap-1"
                style={{ backgroundColor: colors[collabKey] }}
              >
                {names[collabKey]}
                {isPriyaTyping && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Lasso Multi-Select Selection Overlay */}
      {lassoBox && (
        <div
          className="absolute border border-sky-400 bg-sky-400/8 rounded-sm pointer-events-none z-50 shadow-[0_0_0_9999px_rgba(14,165,233,0.03)]"
          style={{
            left: lassoBox.x,
            top: lassoBox.y,
            width: lassoBox.w,
            height: lassoBox.h,
            zIndex: 999999,
          }}
        />
      )}

      {/* Region Screenshot Spotlight Vignette Layer */}
      {regionBox && (
        <>
          {/* Spotlight Vignettes */}
          <div
            className="absolute border-2 border-dashed border-indigo-500/80 bg-indigo-500/3 pointer-events-none z-[88] animate-marching-ants"
            style={{
              left: regionBox.x,
              top: regionBox.y,
              width: regionBox.w,
              height: regionBox.h,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.28)',
              zIndex: 999999,
            }}
          >
            {/* Dimensions Badge */}
            <div className="absolute right-3 -bottom-8 px-2.5 py-1 rounded-full font-ui text-[11px] font-extrabold text-primaryText bg-panel border border-borderLine shadow-sm">
              {Math.round(regionBox.w)} × {Math.round(regionBox.h)} px
            </div>
          </div>
        </>
      )}
    </div>
  );
};
