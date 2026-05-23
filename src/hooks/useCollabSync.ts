'use client';

import { useEffect, useRef } from 'react';
import { useCanvasStore, CanvasElement } from '../store/canvasStore';
import { useCollabStore } from '../store/collabStore';
import { getYRoom, getOrInitProvider } from '../lib/yjs';

const USER_NAMES = ['Alex', 'Jordan', 'Sam', 'Taylor', 'Morgan'];
const USER_COLORS = ['#007AFF', '#FF2D55', '#34C759', '#FF9500', '#AF52DE'];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function useCollabSync(roomId: string) {
  const canvasStore = useCanvasStore();
  const { setRemoteUsers } = useCollabStore();
  const suppressRef = useRef(false);
  const providerRef = useRef<any>(null);
  const awarenessHandlerRef = useRef<(() => void) | null>(null);
  // Stable local user identity — must not change between renders
  const localUser = useRef({ name: pickRandom(USER_NAMES), color: pickRandom(USER_COLORS) });

  // Wire up Y.Map observer + singleton WebRTC provider
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

    // getOrInitProvider caches the Promise — safe to call multiple times,
    // only one WebrtcProvider is ever created per roomId
    getOrInitProvider(roomId, doc).then((provider) => {
      providerRef.current = provider;

      provider.awareness.setLocalStateField('user', {
        ...localUser.current,
        cursor: null,
      });

      // Replace stale listener before attaching a new one (handles StrictMode remount)
      if (awarenessHandlerRef.current) {
        provider.awareness.off('change', awarenessHandlerRef.current);
      }

      const onAwareness = () => {
        const users: any[] = [];
        provider.awareness.getStates().forEach((state: any, clientId: number) => {
          if (clientId === provider.awareness.clientID) return;
          if (state.user) users.push({ clientId, ...state.user });
        });
        setRemoteUsers(users);
      };
      awarenessHandlerRef.current = onAwareness;
      provider.awareness.on('change', onAwareness);
    });

    return () => {
      yElements.unobserve(observe);
      // Do NOT destroy the provider — it's a module-level singleton.
      // Only remove the awareness listener to avoid memory leaks.
      if (providerRef.current && awarenessHandlerRef.current) {
        providerRef.current.awareness.off('change', awarenessHandlerRef.current);
        awarenessHandlerRef.current = null;
      }
    };
  }, [roomId]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sync canvasStore.elements → Y.Map (local writes only)
  const elements = canvasStore.elements;
  useEffect(() => {
    if (!roomId) return;
    const { doc, yElements } = getYRoom(roomId);
    suppressRef.current = true;
    doc.transact(() => {
      const currentIds = new Set(elements.map((e) => e.id));
      yElements.forEach((_: any, key: string) => {
        if (!currentIds.has(key)) yElements.delete(key);
      });
      elements.forEach((el) => yElements.set(el.id, el));
    });
    suppressRef.current = false;
  }, [elements, roomId]);

  // Broadcast cursor position in canvas coordinates
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
  }, [canvasStore.viewport]); // eslint-disable-line react-hooks/exhaustive-deps
}
