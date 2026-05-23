'use client';

import { useEffect, useState, RefObject } from 'react';
import { useCanvasStore } from '../store/canvasStore';
import { compressAndResizeImage } from '../utils/imageHelper';

const uid = () => 'img_' + Math.random().toString(36).slice(2, 10);

interface UseImageDropOptions {
  viewportRef: RefObject<HTMLDivElement>;
  toast?: (msg: string, color?: string) => void;
}

export function useImageDrop({ viewportRef, toast }: UseImageDropOptions) {
  const [isDragging, setIsDragging] = useState(false);
  const store = useCanvasStore();

  const addImageAtWorld = async (b64: string, worldX: number, worldY: number) => {
    const img = await compressAndResizeImage(b64);
    store.addElement({
      id: uid(), type: 'image',
      x: worldX - img.w / 2, y: worldY - img.h / 2,
      w: img.w, h: img.h,
      src: img.src,
      z: Date.now() % 100000,
    });
  };

  const screenToWorld = (clientX: number, clientY: number) => {
    const r = viewportRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const { x: vx, y: vy, zoom } = useCanvasStore.getState().viewport;
    return { x: (clientX - r.left - vx) / zoom, y: (clientY - r.top - vy) / zoom };
  };

  const canvasCenter = () => {
    const vp = viewportRef.current;
    const { x: vx, y: vy, zoom } = useCanvasStore.getState().viewport;
    const vw = vp?.clientWidth ?? window.innerWidth;
    const vh = vp?.clientHeight ?? window.innerHeight;
    return { x: (vw / 2 - vx) / zoom, y: (vh / 2 - vy) / zoom };
  };

  // Clipboard paste
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const el = document.activeElement;
      if (el?.getAttribute('contenteditable') === 'true' || el?.tagName === 'INPUT') return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          e.preventDefault();
          const file = items[i].getAsFile();
          if (!file) continue;
          const reader = new FileReader();
          reader.onload = async (ev) => {
            const { x, y } = canvasCenter();
            await addImageAtWorld(ev.target?.result as string, x, y);
            toast?.('Image pasted!', '#22C55E');
          };
          reader.readAsDataURL(file);
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Drag-and-drop onto viewport
  const onDragEnter = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const onDragOver  = (e: React.DragEvent) => { e.preventDefault(); };
  const onDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file?.type.startsWith('image/')) return;
    const { x, y } = screenToWorld(e.clientX, e.clientY);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      await addImageAtWorld(ev.target?.result as string, x, y);
      toast?.('Image dropped!', '#22C55E');
    };
    reader.readAsDataURL(file);
  };

  return { isDragging, onDragEnter, onDragOver, onDragLeave, onDrop };
}
