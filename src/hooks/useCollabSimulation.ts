'use client';

import { useEffect, useRef } from 'react';
import { useCollabStore } from '../store/collabStore';
import { useCanvasStore } from '../store/canvasStore';

const SIM_USERS = [
  { clientId: -1, name: 'Priya', color: '#FF2D55' },
  { clientId: -2, name: 'James', color: '#34C759' },
  { clientId: -3, name: 'Lena', color: '#FF9500' },
];

// Cursors drift in world space (canvas coordinates)
const WORLD_RANGE = { w: 1800, h: 1200 };
const SPEED = 0.018;

type SimState = { x: number; y: number; tx: number; ty: number };

function randPos() {
  return {
    x: 100 + Math.random() * (WORLD_RANGE.w - 200),
    y: 100 + Math.random() * (WORLD_RANGE.h - 200),
  };
}

// ── Diagram event scripted sequence ───────────────────────────────────
type DiagramEvent = {
  delayMs: number;
  description: string;
  action: (store: ReturnType<typeof useCanvasStore.getState>) => void;
};

const DIAGRAM_SIM_SEQUENCE: DiagramEvent[] = [
  {
    delayMs: 3000,
    description: 'James renders a flowchart via emitter',
    action: (store) => {
      store.selectDiagram(null);
      const win = window as any;
      if (typeof win.__diagramReRenderEmitter === 'function') {
        const firstDiagram = Object.keys(store.diagrams)[0];
        if (firstDiagram) win.__diagramReRenderEmitter(firstDiagram);
      }
    },
  },
  {
    delayMs: 9000,
    description: 'Priya switches layout engine to ELK',
    action: (store) => {
      store.setDefaultLayoutEngine('elk');
    },
  },
  {
    delayMs: 16000,
    description: 'Lena switches back to Dagre layout',
    action: (store) => {
      store.setDefaultLayoutEngine('dagre');
    },
  },
  {
    delayMs: 20000,
    description: 'Priya changes theme to Ocean',
    action: (store) => {
      store.setDefaultTheme('ocean');
    },
  },
];

export function useCollabSimulation() {
  const { remoteUsers, setRemoteUsers } = useCollabStore();
  const simRef = useRef<SimState[]>(
    SIM_USERS.map(() => { const p = randPos(); return { ...p, tx: p.x, ty: p.y }; })
  );
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

  // Diagram event timeline — fires once on mount
  useEffect(() => {
    const timers = DIAGRAM_SIM_SEQUENCE.map((event) =>
      setTimeout(() => {
        const store = useCanvasStore.getState();
        try { event.action(store); } catch (e) {
          console.warn('[SimDiagram]', event.description, e);
        }
      }, event.delayMs)
    );
    return () => { timers.forEach(clearTimeout); };
  }, []);

  useEffect(() => {
    const shouldRun = remoteUsers.length === 0;
    if (!shouldRun) {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
      return;
    }

    activeRef.current = true;

    const tick = () => {
      if (!activeRef.current) return;
      const states = simRef.current;

      states.forEach((s) => {
        s.x += (s.tx - s.x) * SPEED;
        s.y += (s.ty - s.y) * SPEED;
        if (Math.abs(s.tx - s.x) < 3 && Math.abs(s.ty - s.y) < 3) {
          const p = randPos();
          s.tx = p.x; s.ty = p.y;
        }
      });

      setRemoteUsers(
        SIM_USERS.map((u, i) => ({
          ...u,
          cursor: { x: states[i].x, y: states[i].y },
        }))
      );

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      activeRef.current = false;
      cancelAnimationFrame(rafRef.current);
    };
  }, [remoteUsers.length, setRemoteUsers]);
}
