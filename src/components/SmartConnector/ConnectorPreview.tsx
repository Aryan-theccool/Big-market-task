'use client';
// ─────────────────────────────────────────────────────────────────────────────
// ConnectorPreview.tsx — Ghost dashed preview during connector drawing
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { Viewport } from '../../store/canvasStore';

interface ConnectorPreviewProps {
    path: string;
    viewport: Viewport;
}

export const ConnectorPreview: React.FC<ConnectorPreviewProps> = ({ path, viewport }) => {
    if (!path) return null;

    const { zoom, x: vpX, y: vpY } = viewport;

    return (
        <svg
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9050,
                overflow: 'visible',
            }}
        >
            <g transform={`translate(${vpX},${vpY}) scale(${zoom})`}>
                {/* Shadow */}
                <path
                    d={path}
                    stroke="rgba(0,122,255,0.15)"
                    strokeWidth={4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Preview dashed line */}
                <path
                    d={path}
                    stroke="#007AFF"
                    strokeWidth={2}
                    fill="none"
                    strokeDasharray="6 4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    markerEnd="url(#cm-preview-arrow)"
                    style={{ opacity: 0.9 }}
                />
            </g>
        </svg>
    );
};
