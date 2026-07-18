// ─────────────────────────────────────────────────────────────────────────────
// RoutingTypes.ts — Shared type definitions for the Smart Connector system
// ─────────────────────────────────────────────────────────────────────────────

export interface Point {
    x: number;
    y: number;
}

export interface Rect {
    x: number;
    y: number;
    w: number;
    h: number;
}

export type AnchorPosition =
    | 'N' | 'NE' | 'E' | 'SE'
    | 'S' | 'SW' | 'W' | 'NW'
    | 'CENTER';

export interface AnchorPoint {
    position: AnchorPosition;
    x: number;
    y: number;
    normal: { dx: number; dy: number };
    elementId: string;
    portId?: string;
}

export type ArrowMarker =
    | 'none'
    | 'arrow'
    | 'open-arrow'
    | 'circle'
    | 'circle-open'
    | 'diamond'
    | 'diamond-open'
    | 'cross'
    | 'bar';

export type RoutingMode = 'orthogonal' | 'elbow' | 'curved' | 'straight';
export type RoutingEngine = 'astar' | 'manhattan' | 'direct';
export type StrokeDash = 'solid' | 'dashed' | 'dotted' | 'long-dash';

export interface ConnectorLabel {
    id: string;
    text: string;
    position: 'start' | 'middle' | 'end';
    offset: Point;
}

export interface SmartConnector {
    id: string;
    type: 'smart-connector';
    z: number;

    // Endpoint binding
    sourceElementId: string;
    sourceAnchor: AnchorPosition;
    sourcePortId?: string;

    targetElementId: string;
    targetAnchor: AnchorPosition;
    targetPortId?: string;

    // Routing
    routingMode: RoutingMode;
    routingEngine: RoutingEngine;
    waypoints: Point[];
    computedPath: string;
    cornerRadius: number;
    pathVersion: number;

    // Appearance
    labels: ConnectorLabel[];
    strokeWidth: number;
    strokeColor: string;
    strokeDash: StrokeDash;
    opacity: number;

    // Arrowheads
    startMarker: ArrowMarker;
    endMarker: ArrowMarker;

    // Metadata
    meta: {
        diagramId?: string;
        routeGeneratedAt: number;
        isStale: boolean;
        obstacleHash: string;
    };
}

export const STROKE_DASH_VALUES: Record<StrokeDash, string> = {
    solid: '',
    dashed: '8 4',
    dotted: '2 4',
    'long-dash': '16 6',
};

export const GRID_CELL_SIZE = 20;
export const OBSTACLE_MARGIN = 12;
export const TURN_PENALTY_COST = 30;
export const CLEARANCE_WEIGHT = 0.5;
export const MAX_CLEARANCE_BONUS = 15;
export const SNAP_RADIUS = 16;
export const CORNER_RADIUS_DEFAULT = 8;
