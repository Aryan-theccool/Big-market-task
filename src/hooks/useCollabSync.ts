'use client';

import { useEffect, useRef } from 'react';
import { useCanvasStore, CanvasElement } from '../store/canvasStore';
import { useCollabStore } from '../store/collabStore';
import { getYRoom, initWebRTC, destroyWebRTC } from '../lib/yjs';

const USER_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan'];
const USER_COLORS = ['#007AFF', '#FF2D55', '#34C759', '#FF9500', '#AF52DE'];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useCollabSync(roomId: string) {
  const canvasStore = useCanvasStore();
  const { setRemoteUsers } = useCollabStore();
  const providerRef = useRef<any>(null);
  const suppressRef = useRef(false);
  const localUser = useRef({ name: pick(USER_NAMES), color: pick(USER_COLORS) });

  // Observe Y.Map → push to canvasStore (remote changes only)
  useEffect(() => {
    if (!roomId) return;
    const { doc, yElements } = getYRoom(roomId);

    const observe = () => {
      if (suppressRef.current) return;
      const els: CanvasElement[] = [];
      yElements.forEach((val: CanvasElement) => els.push(val));
      els.sort((a, b) => (a.z || 0) - (b.z || 0));
      canvasStore.setElements(els);
    };
    yElements.observe(observe);

    // Init WebRTC (browser-only, async)
    let cancelled = false;
    initWebRTC(roomId, doc).then((provider) => {
      if (cancelled) { provider.destroy(); return; }
      providerRef.current = provider;

      provider.awareness.setLocalStateField('user', {
        ...localUser.current,
        cursor: null,
      });

      const onAwareness = () => {
        const users: any[] = [];
        provider.awareness.getStates().forEach((state: any, clientId: number) => {
          if (clientId === provider.awareness.clientID) return;
          if (state.user) users.push({ clientId, ...state.user });
        });
        setRemoteUsers(users);
      };
      provider.awareness.on('change', onAwareness);
    });

    return () => {
      cancelled = true;
      yElements.unobserve(observe);
      destroyWebRTC(roomId);
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync canvasStore.elements → Y.Map (local changes only)
  const elements = canvasStore.elements;
  useEffect(() => {
    if (!roomId) return;
    const { doc, yElements } = getYRoom(roomId);
    suppressRef.current = true;
    doc.transact(() => {
      const currentIds = new Set(elements.map((e) => e.id));
      
      // Delete removed elements
      yElements.forEach((_: any, key: string) => {
        if (!currentIds.has(key)) yElements.delete(key);
      });
      
      // Only set elements that are new or have actually changed
      elements.forEach((el) => {
        const existing = yElements.get(el.id);
        if (!existing || JSON.stringify(existing) !== JSON.stringify(el)) {
          yElements.set(el.id, el);
        }
      });
    });
    suppressRef.current = false;
  }, [elements, roomId]);

  // Broadcast cursor in world coordinates
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!providerRef.current) return;
      const { x: vx, y: vy, zoom } = canvasStore.viewport;
      providerRef.current.awareness.setLocalStateField('user', {
        ...localUser.current,
        cursor: { x: (e.clientX - vx) / zoom, y: (e.clientY - vy) / zoom },
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, [canvasStore.viewport]);
}
