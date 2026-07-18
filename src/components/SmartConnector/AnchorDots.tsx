'use client';
// ─────────────────────────────────────────────────────────────────────────────
// AnchorDots.tsx — 8   anchor hover overlay on canvas elements
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';
import { AnchorPoint } from '../../lib/routing/RoutingTypes';
import { getAnchors } from '../../lib/routing/AnchorCalculator';
import { CanvasElement } from '../../store/canvasStore';
import { Viewport } from '../../store/canvasStore';

interface AnchorDotsProps {
    element: CanvasElement;
    viewport: Viewport;
    snapAnchor: AnchorPoint | null;    // currently snapping anchor
    onAnchorClick: (anchor: AnchorPoint) => void;
}

const ANCHOR_SIZE = 8;
const SNAP_SIZE = 10;

export const AnchorDots: React.FC<AnchorDotsProps> = ({
    element, viewport, snapAnchor, onAnchorClick,
}) => {
    const anchors = getAnchors(element).filter(a => a.position !== 'CENTER');
    const { zoom, x: vpX, y: vpY } = viewport;

    const toScreen = (wx: number, wy: number) => ({
        sx: wx * zoom + vpX,
        sy: wy * zoom + vpY,
    });

    return (
        <svg
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 9100,
                overflow: 'visible',
            }}
        >
            {anchors.map((anchor) => {
                const { sx, sy } = toScreen(anchor.x, anchor.y);
                const isSnap = snapAnchor?.position === anchor.position && snapAnchor?.elementId === anchor.elementId;
                const r = isSnap ? SNAP_SIZE / 2 : ANCHOR_SIZE / 2;

                return (
                    <g key={anchor.position} style={{ pointerEvents: 'auto', cursor: 'crosshair' }}>
                        {/* Hit area */}
                        <circle
                            cx={sx} cy={sy}
                            r={16}
                            fill="transparent"
                            onPointerDown={(e) => {
                                e.stopPropagation();
                                onAnchorClick(anchor);
                            }}
                        />
                        {/* Visual dot */}
                        <circle
                            cx={sx} cy={sy}
                            r={r}
                            fill={isSnap ? '#007AFF' : 'transparent'}
                            stroke={isSnap ? 'white' : 'rgba(99,102,241,0.7)'}
                            strokeWidth={isSnap ? 2 : 1.5}
                            style={{
                                transition: 'r 0.1s, fill 0.1s, stroke 0.1s',
                                filter: isSnap ? 'drop-shadow(0 0 4px rgba(0,122,255,0.6))' : undefined,
                            }}
                        />
                        {/* Outer ring hint on snap */}
                        {isSnap && (
                            <circle
                                cx={sx} cy={sy}
                                r={SNAP_SIZE / 2 + 4}
                                fill="none"
                                stroke="rgba(0,122,255,0.3)"
                                strokeWidth={1}
                            />
                        )}
                    </g>
                );
            })}
        </svg>
    );
};
