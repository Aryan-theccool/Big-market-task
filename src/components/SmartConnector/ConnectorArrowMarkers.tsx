'use client';
// ─────────────────────────────────────────────────────────────────────────────
// ConnectorArrowMarkers.tsx — SVG <defs> for all 8 arrowhead marker types
// ─────────────────────────────────────────────────────────────────────────────

import React from 'react';

interface MarkerProps {
    id: string;
    color?: string;
}

/** Render all SVG marker defs — mount once in a hidden SVG at the canvas root */
export const ConnectorArrowMarkers: React.FC<{ color?: string }> = ({ color = 'var(--text-primary)' }) => (
    <svg
        style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }}
        aria-hidden="true"
    >
        <defs>
            {/* arrow — filled triangle */}
            <marker id="cm-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <polygon points="0 0, 10 3.5, 0 7" fill="currentColor" />
            </marker>

            {/* open-arrow — open triangle */}
            <marker id="cm-open-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <polyline points="0 0, 10 3.5, 0 7" fill="none" stroke="currentColor" strokeWidth="1.2" />
            </marker>

            {/* circle — filled dot */}
            <marker id="cm-circle" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
                <circle cx="4" cy="4" r="3" fill="currentColor" />
            </marker>

            {/* circle-open — hollow dot */}
            <marker id="cm-circle-open" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
                <circle cx="4" cy="4" r="3" fill="white" stroke="currentColor" strokeWidth="1.2" />
            </marker>

            {/* diamond — filled diamond */}
            <marker id="cm-diamond" markerWidth="10" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <polygon points="5 0, 10 3.5, 5 7, 0 3.5" fill="currentColor" />
            </marker>

            {/* diamond-open — hollow diamond */}
            <marker id="cm-diamond-open" markerWidth="10" markerHeight="7" refX="5" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <polygon points="5 0, 10 3.5, 5 7, 0 3.5" fill="white" stroke="currentColor" strokeWidth="1.2" />
            </marker>

            {/* cross — × mark */}
            <marker id="cm-cross" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto" markerUnits="strokeWidth">
                <line x1="0" y1="0" x2="8" y2="8" stroke="currentColor" strokeWidth="1.5" />
                <line x1="8" y1="0" x2="0" y2="8" stroke="currentColor" strokeWidth="1.5" />
            </marker>

            {/* bar — perpendicular bar */}
            <marker id="cm-bar" markerWidth="6" markerHeight="8" refX="3" refY="4" orient="auto" markerUnits="strokeWidth">
                <line x1="3" y1="0" x2="3" y2="8" stroke="currentColor" strokeWidth="1.5" />
            </marker>

            {/* Preview arrow (blue, dashed lines) */}
            <marker id="cm-preview-arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                <polygon points="0 0, 10 3.5, 0 7" fill="#007AFF" />
            </marker>
        </defs>
    </svg>
);

export function getMarkerUrl(marker: string | undefined): string | undefined {
    if (!marker || marker === 'none') return undefined;
    return `url(#cm-${marker})`;
}
