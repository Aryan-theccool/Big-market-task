'use client';

import { useEffect, useRef } from 'react';
import { useCollabStore } from '../store/collabStore';

const SIM_USERS = [
  { clientId: -1, name: 'Priya', color: '#FF2D55' },
  { clientId: -2, name: 'James', color: '#34C759' },
  { clientId: -3, name: 'Lena',  color: '#FF9500' },
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

export function useCollabSimulation() {
  const { remoteUsers, setRemoteUsers } = useCollabStore();
  const simRef = useRef<SimState[]>(
    SIM_USERS.map(() => { const p = randPos(); return { ...p, tx: p.x, ty: p.y }; })
  );
  const rafRef = useRef<number>(0);
  const activeRef = useRef(false);

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
