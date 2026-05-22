'use client';

import React, { useRef, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';

interface CanvasMiniMapProps {
  viewportWidth: number;
  viewportHeight: number;
}

export const CanvasMiniMap: React.FC<CanvasMiniMapProps> = ({
  viewportWidth,
  viewportHeight,
}) => {
  const store = useCanvasStore();
  const mapRef = useRef<HTMLDivElement>(null);

  if (!store.showMini) return null;

  // Determine global bounding box of elements
  const getElementsBounds = () => {
    if (!store.elements.length) {
      return { minX: -500, minY: -500, maxX: 1500, maxY: 1000, w: 2000, h: 1500 };
    }

    const boundsList = store.elements.map((el) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const x = Math.min(el.x, el.x2 || el.x);
        const y = Math.min(el.y, el.y2 || el.y);
        const w = Math.abs((el.x2 || el.x) - el.x) || 1;
        const h = Math.abs((el.y2 || el.y) - el.y) || 1;
        return { x, y, w, h };
      }
      return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
    });

    const minX = Math.min(...boundsList.map((b) => b.x)) - 300;
    const minY = Math.min(...boundsList.map((b) => b.y)) - 300;
    const maxX = Math.max(...boundsList.map((b) => b.x + b.w)) + 300;
    const maxY = Math.max(...boundsList.map((b) => b.y + b.h)) + 300;

    return {
      minX,
      minY,
      maxX,
      maxY,
      w: Math.max(1000, maxX - minX),
      h: Math.max(800, maxY - minY),
    };
  };

  const bounds = getElementsBounds();

  // Scale map coordinates to fit 160 x 100 minimap viewport
  const mapW = 160;
  const mapH = 100;

  const scaleX = (x: number) => ((x - bounds.minX) / bounds.w) * mapW;
  const scaleY = (y: number) => ((y - bounds.minY) / bounds.h) * mapH;
  const scaleW = (w: number) => (w / bounds.w) * mapW;
  const scaleH = (h: number) => (h / bounds.h) * mapH;

  // Viewport bounds in world coordinates
  const viewLeft = -store.viewport.x / store.viewport.zoom;
  const viewTop = -store.viewport.y / store.viewport.zoom;
  const viewW = viewportWidth / store.viewport.zoom;
  const viewH = viewportHeight / store.viewport.zoom;

  const handlePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (!mapRef.current) return;

    const dragPan = (ev: PointerEvent) => {
      const rect = mapRef.current!.getBoundingClientRect();
      const clickX = ((ev.clientX - rect.left) / mapW) * bounds.w + bounds.minX;
      const clickY = ((ev.clientY - rect.top) / mapH) * bounds.h + bounds.minY;
      
      // Center viewport around click position
      store.setViewport({
        x: -clickX * store.viewport.zoom + viewportWidth / 2,
        y: -clickY * store.viewport.zoom + viewportHeight / 2,
      });
    };

    const cleanup = () => {
      window.removeEventListener('pointermove', dragPan);
      window.removeEventListener('pointerup', cleanup);
    };

    window.addEventListener('pointermove', dragPan);
    window.addEventListener('pointerup', cleanup);

    // Initial click coordinates shift
    const rect = mapRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / mapW) * bounds.w + bounds.minX;
    const clickY = ((e.clientY - rect.top) / mapH) * bounds.h + bounds.minY;
    store.setViewport({
      x: -clickX * store.viewport.zoom + viewportWidth / 2,
      y: -clickY * store.viewport.zoom + viewportHeight / 2,
    });
  };

  return (
    <div
      ref={mapRef}
      id="minimap"
      className="absolute right-4 bottom-12 w-40 h-25 rounded-2xl glass overflow-hidden z-20 pointer-events-auto shadow-md border border-borderLine cursor-crosshair select-none hidden md:block"
      onPointerDown={handlePointerDown}
    >
      {/* Miniature Shapes */}
      {[...store.elements].sort((a, b) => (a.z || 0) - (b.z || 0)).map((el) => {
        let x = el.x;
        let y = el.y;
        let w = el.w || 100;
        let h = el.h || 60;

        if (el.type === 'line' || el.type === 'arrow') {
          x = Math.min(el.x, el.x2 || el.x);
          y = Math.min(el.y, el.y2 || el.y);
          w = Math.abs((el.x2 || el.x) - el.x) || 1;
          h = Math.abs((el.y2 || el.y) - el.y) || 1;
        }

        const isSelected = store.selected.includes(el.id);
        const color = isSelected 
          ? '#6366F1' 
          : el.type === 'note' 
          ? '#FBBF24' 
          : el.type === 'frame'
          ? 'rgba(99,102,241,0.2)'
          : '#A8A4B5';

        return (
          <div
            key={el.id}
            className="absolute rounded-[1px] opacity-70"
            style={{
              left: Math.max(0, Math.min(mapW - 1, scaleX(x))),
              top: Math.max(0, Math.min(mapH - 1, scaleY(y))),
              width: Math.max(2, Math.min(mapW, scaleW(w))),
              height: Math.max(2, Math.min(mapH, scaleH(h))),
              backgroundColor: color,
              border: el.type === 'frame' ? '1px dashed #6366F1' : 'none',
            }}
          />
        );
      })}

      {/* Main Screen Viewport Rectangle */}
      <div
        className="absolute border border-indigo-500 bg-indigo-500/10 rounded-md transition-all duration-75 ease-out"
        style={{
          left: Math.max(-20, Math.min(mapW, scaleX(viewLeft))),
          top: Math.max(-20, Math.min(mapH, scaleY(viewTop))),
          width: Math.max(8, Math.min(mapW + 40, scaleW(viewW))),
          height: Math.max(8, Math.min(mapH + 40, scaleH(viewH))),
        }}
      />
    </div>
  );
};
