'use client';
// ─────────────────────────────────────────────────────────────────────────────
// SmartConnectorElement.tsx — SVG path renderer for a single SmartConnector
// ─────────────────────────────────────────────────────────────────────────────

import React, { useRef, useState } from 'react';
import { SmartConnector, STROKE_DASH_VALUES } from '../../lib/routing/RoutingTypes';
import { getMarkerUrl } from './ConnectorArrowMarkers';
import { Viewport } from '../../store/canvasStore';

interface SmartConnectorElementProps {
    connector: SmartConnector;
    viewport: Viewport;
    isSelected: boolean;
    isHovered: boolean;
    onPointerDown?: (e: React.PointerEvent, connectorId: string) => void;
    onContextMenu?: (e: React.MouseEvent, connectorId: string) => void;
    onDoubleClick?: (connectorId: string) => void;
}

export const SmartConnectorElement: React.FC<SmartConnectorElementProps> = ({
    connector, viewport, isSelected, isHovered,
    onPointerDown, onContextMenu, onDoubleClick,
}) => {
    const { zoom, x: vpX, y: vpY } = viewport;
    const { computedPath } = connector;
    if (!computedPath) return null;

    const isStale = connector.meta.isStale;
    const strokeColor = isSelected
        ? '#007AFF'
        : isStale
            ? '#FF9500'
            : connector.strokeColor;

    const strokeWidth = isHovered ? connector.strokeWidth + 1 : connector.strokeWidth;
    const dashArray = STROKE_DASH_VALUES[connector.strokeDash] || '';
    const opacity = isStale ? 0.6 : (connector.opacity ?? 1);

    const color = isSelected ? '#007AFF' : isStale ? '#FF9500' : 'currentColor';

    return (
        <g
            transform={`translate(${vpX},${vpY}) scale(${zoom})`}
            style={{ cursor: isHovered ? 'pointer' : 'default' }}
        >
            {/* Wide invisible hit area for easier selection */}
            <path
                d={computedPath}
                stroke="transparent"
                strokeWidth={Math.max(12, strokeWidth + 8)}
                fill="none"
                style={{ cursor: 'pointer', pointerEvents: 'stroke' }}
                onPointerDown={(e) => onPointerDown?.(e, connector.id)}
                onContextMenu={(e) => onContextMenu?.(e, connector.id)}
                onDoubleClick={() => onDoubleClick?.(connector.id)}
            />

            {/* Drop shadow on hover/select */}
            {(isHovered || isSelected) && (
                <path
                    d={computedPath}
                    stroke={isSelected ? 'rgba(0,122,255,0.2)' : 'rgba(0,0,0,0.1)'}
                    strokeWidth={strokeWidth + 4}
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ pointerEvents: 'none' }}
                />
            )}

            {/* Main path */}
            <path
                d={computedPath}
                stroke={strokeColor}
                strokeWidth={strokeWidth / zoom > 0.5 ? strokeWidth : 1}
                strokeDasharray={dashArray}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={opacity}
                markerStart={getMarkerUrl(connector.startMarker)}
                markerEnd={getMarkerUrl(connector.endMarker)}
                style={{ color, pointerEvents: 'none' }}
            />

            {/* Selection waypoint handles */}
            {isSelected && connector.waypoints.map((pt, i) => (
                <circle
                    key={i}
                    cx={pt.x} cy={pt.y}
                    r={5 / zoom}
                    fill="#007AFF"
                    stroke="white"
                    strokeWidth={1.5 / zoom}
                    style={{ pointerEvents: 'auto', cursor: 'move' }}
                />
            ))}

            {/* Stale indicator badge */}
            {isStale && !isSelected && (
                <text
                    x={0} y={0}
                    fontSize={14 / zoom}
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                    ⚠️
                </text>
            )}

            {/* Labels */}
            {connector.labels.map((label) => (
                <text
                    key={label.id}
                    fontSize={11 / zoom}
                    fill="var(--text-primary)"
                    fontFamily="var(--font-ui)"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                    {label.text}
                </text>
            ))}
        </g>
    );
};
