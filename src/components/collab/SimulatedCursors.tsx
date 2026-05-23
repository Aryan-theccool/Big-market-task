'use client';

import React from 'react';
import { useCollabStore } from '../../store/collabStore';
import { useCanvasStore } from '../../store/canvasStore';

// Renders simulated (ghost) cursors — clientId < 0
export const SimulatedCursors: React.FC = () => {
  const { remoteUsers } = useCollabStore();
  const { viewport } = useCanvasStore();
  const { x: vx, y: vy, zoom } = viewport;

  const simUsers = remoteUsers.filter((u) => u.clientId < 0);

  return (
    <>
      {simUsers.map((user) => {
        if (!user.cursor) return null;
        const sx = user.cursor.x * zoom + vx;
        const sy = user.cursor.y * zoom + vy;
        return (
          <div
            key={user.clientId}
            className="fixed pointer-events-none z-[9989]"
            style={{ left: sx, top: sy, transform: 'translate(-2px, -2px)' }}
          >
            {/* Ghost cursor with pulsing ring */}
            <div
              className="absolute"
              style={{
                width: 20, height: 20,
                borderRadius: '50%',
                border: `2px solid ${user.color}`,
                opacity: 0.4,
                animation: 'pulse-ring 2s ease-out infinite',
                top: -6, left: -6,
              }}
            />
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ opacity: 0.75 }}>
              <path
                d="M2 2l14 6-7 2-2 7z"
                fill={user.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute left-4 top-4 whitespace-nowrap rounded-[8px] px-2 py-0.5"
              style={{
                background: user.color,
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-ui)',
                lineHeight: '18px',
                opacity: 0.85,
                boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
              }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.5; }
          80% { transform: scale(2); opacity: 0; }
          100% { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </>
  );
};
