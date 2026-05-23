'use client';

import React from 'react';
import { useCollabStore } from '../../store/collabStore';
import { useCanvasStore } from '../../store/canvasStore';

export const RemoteCursors: React.FC = () => {
  const { remoteUsers } = useCollabStore();
  const { viewport } = useCanvasStore();
  const { x: vx, y: vy, zoom } = viewport;

  return (
    <>
      {remoteUsers.map((user) => {
        if (!user.cursor) return null;
        const sx = user.cursor.x * zoom + vx;
        const sy = user.cursor.y * zoom + vy;
        return (
          <div
            key={user.clientId}
            className="fixed pointer-events-none z-[9990]"
            style={{ left: sx, top: sy, transform: 'translate(-2px, -2px)' }}
          >
            {/* Cursor arrow */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M2 2l14 6-7 2-2 7z"
                fill={user.color}
                stroke="white"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            {/* Name tag */}
            <div
              className="absolute left-4 top-4 whitespace-nowrap rounded-[8px] px-2 py-0.5"
              style={{
                background: user.color,
                color: 'white',
                fontSize: 11,
                fontWeight: 600,
                fontFamily: 'var(--font-ui)',
                lineHeight: '18px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.25)',
              }}
            >
              {user.name}
            </div>
          </div>
        );
      })}
    </>
  );
};
