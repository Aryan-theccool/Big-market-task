// ─────────────────────────────────────────────────────────────────────────────
// smartConnectorSlice.ts — Zustand state slice for the Smart Connector system
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint, SmartConnector, RoutingMode, ArrowMarker, AnchorPosition } from '../lib/routing/RoutingTypes';
import { CanvasElement } from './canvasStore';
import { routeConnector, fastRouteConnector } from '../lib/routing/routeConnector';
import { getAnchorPoint } from '../lib/routing/AnchorCalculator';
import { selectOptimalAnchors } from '../lib/routing/AnchorSelector';
import { connectorCache } from '../lib/routing/ConnectorCache';

const uid = () => 'conn_' + Math.random().toString(36).slice(2, 9);

// ── Drawing FSM state ─────────────────────────────────────────────────────────
export interface DrawingConnectorState {
    isActive: boolean;
    sourceElementId: string | null;
    sourceAnchor: AnchorPoint | null;
    cursorX: number;
    cursorY: number;
    snapTarget: AnchorPoint | null;
    previewPath: string;
}

// ── Slice state interface ─────────────────────────────────────────────────────
export interface SmartConnectorSliceState {
    connectors: Record<string, SmartConnector>;
    routingQueue: string[];
    isRouting: boolean;
    drawingConnector: DrawingConnectorState;
    hoveredConnectorId: string | null;
    hoveredSegmentIndex: number | null;
    selectedConnectorIds: string[];
    defaultRoutingMode: RoutingMode;
    defaultCornerRadius: number;
    defaultStrokeWidth: number;
    defaultEndMarker: ArrowMarker;
    showAnchorDotsOnHover: boolean;
    hoveredElementId: string | null;   // Element showing anchor dots
}

export interface SmartConnectorSliceActions {
    addConnector: (connector: SmartConnector) => void;
    updateConnector: (id: string, updates: Partial<SmartConnector>) => void;
    deleteConnector: (id: string) => void;
    rerouteConnector: (id: string, elements: CanvasElement[], forceAstar?: boolean) => void;
    rerouteAllStale: (elements: CanvasElement[]) => void;
    rerouteConnected: (elementId: string, elements: CanvasElement[], fast?: boolean) => void;
    startDrawingConnector: (sourceElementId: string, anchor: AnchorPoint) => void;
    updateDrawingPreview: (cursorX: number, cursorY: number, snapTarget: AnchorPoint | null, elements: CanvasElement[]) => void;
    finishDrawingConnector: (targetElementId: string, targetAnchor: AnchorPoint, elements: CanvasElement[]) => SmartConnector | null;
    cancelDrawingConnector: () => void;
    setHoveredConnector: (id: string | null, segmentIndex: number | null) => void;
    setHoveredElement: (elementId: string | null) => void;
    selectConnector: (id: string | null) => void;
    flipConnectorRoute: (id: string, elements: CanvasElement[]) => void;
    reverseConnector: (id: string, elements: CanvasElement[]) => void;
    addManualWaypoint: (id: string, point: { x: number; y: number }) => void;
    clearManualWaypoints: (id: string, elements: CanvasElement[]) => void;
}

export type SmartConnectorSlice = SmartConnectorSliceState & SmartConnectorSliceActions;

// ── Default drawing state ─────────────────────────────────────────────────────
const DRAWING_IDLE: DrawingConnectorState = {
    isActive: false,
    sourceElementId: null,
    sourceAnchor: null,
    cursorX: 0, cursorY: 0,
    snapTarget: null,
    previewPath: '',
};

// ── Slice factory ─────────────────────────────────────────────────────────────
export function createSmartConnectorSlice(
    set: (fn: (state: any) => any) => void,
    get: () => any,
): SmartConnectorSlice {
    return {
        // State
        connectors: {},
        routingQueue: [],
        isRouting: false,
        drawingConnector: DRAWING_IDLE,
        hoveredConnectorId: null,
        hoveredSegmentIndex: null,
        selectedConnectorIds: [],
        defaultRoutingMode: 'orthogonal',
        defaultCornerRadius: 8,
        defaultStrokeWidth: 2,
        defaultEndMarker: 'arrow',
        showAnchorDotsOnHover: true,
        hoveredElementId: null,

        // ── Actions ─────────────────────────────────────────────────────────────

        addConnector: (connector) => set((state: any) => ({
            connectors: { ...state.connectors, [connector.id]: connector },
        })),

        updateConnector: (id, updates) => set((state: any) => {
            const existing = state.connectors[id];
            if (!existing) return {};
            return { connectors: { ...state.connectors, [id]: { ...existing, ...updates } } };
        }),

        deleteConnector: (id) => {
            connectorCache.invalidate(id);
            set((state: any) => {
                const next = { ...state.connectors };
                delete next[id];
                return { connectors: next };
            });
        },

        rerouteConnector: (id, elements, forceAstar = false) => {
            const state = get();
            const connector = state.connectors[id];
            if (!connector) return;

            const path = routeConnector(connector, elements, forceAstar);

            set((s: any) => ({
                connectors: {
                    ...s.connectors,
                    [id]: {
                        ...connector,
                        computedPath: path,
                        meta: { ...connector.meta, isStale: false, routeGeneratedAt: Date.now() },
                    },
                },
            }));
        },

        rerouteAllStale: (elements) => {
            const state = get();
            const stale = Object.values(state.connectors as Record<string, SmartConnector>)
                .filter(c => c.meta.isStale);

            stale.forEach(c => (get() as SmartConnectorSlice).rerouteConnector(c.id, elements, true));
        },

        rerouteConnected: (elementId, elements, fast = false) => {
            const state = get();
            const connected = Object.values(state.connectors as Record<string, SmartConnector>)
                .filter(c => c.sourceElementId === elementId || c.targetElementId === elementId);

            if (connected.length === 0) return;

            if (fast) {
                // Fast approximate re-route during drag
                const updates: Record<string, SmartConnector> = { ...state.connectors };
                connected.forEach(c => {
                    const path = fastRouteConnector(c, elements);
                    updates[c.id] = { ...c, computedPath: path, meta: { ...c.meta, isStale: true } };
                });
                set(() => ({ connectors: updates }));
            } else {
                // Full A* re-route on drag end
                connected.forEach(c => (get() as SmartConnectorSlice).rerouteConnector(c.id, elements, true));
            }
        },

        startDrawingConnector: (sourceElementId, anchor) => {
            set(() => ({
                drawingConnector: {
                    isActive: true,
                    sourceElementId,
                    sourceAnchor: anchor,
                    cursorX: anchor.x,
                    cursorY: anchor.y,
                    snapTarget: null,
                    previewPath: '',
                },
            }));
        },

        updateDrawingPreview: (cursorX, cursorY, snapTarget, elements) => {
            const state = get();
            const dc = state.drawingConnector as DrawingConnectorState;
            if (!dc.isActive || !dc.sourceAnchor) return;

            const targetPt = snapTarget ?? { x: cursorX, y: cursorY, position: 'CENTER' as AnchorPosition, elementId: '', normal: { dx: 0, dy: 0 } };
            const { computeElbowRoute } = require('../lib/routing/ElbowRouter');
            const { inferElbowAxis } = require('../lib/routing/ElbowRouter');
            const { applyCornerRounding } = require('../lib/routing/CornerRounder');
            const { simplifyPath } = require('../lib/routing/PathSimplifier');

            const pts = computeElbowRoute(dc.sourceAnchor, targetPt, inferElbowAxis(dc.sourceAnchor, targetPt));
            const path = applyCornerRounding(simplifyPath(pts), state.defaultCornerRadius);

            set(() => ({
                drawingConnector: { ...dc, cursorX, cursorY, snapTarget, previewPath: path },
            }));
        },

        finishDrawingConnector: (targetElementId, targetAnchor, elements) => {
            const state = get();
            const dc = state.drawingConnector as DrawingConnectorState;
            if (!dc.isActive || !dc.sourceAnchor || !dc.sourceElementId) {
                set(() => ({ drawingConnector: DRAWING_IDLE }));
                return null;
            }

            const connector: SmartConnector = {
                id: uid(),
                type: 'smart-connector',
                z: 0,
                sourceElementId: dc.sourceElementId,
                sourceAnchor: dc.sourceAnchor.position,
                targetElementId,
                targetAnchor: targetAnchor.position,
                routingMode: state.defaultRoutingMode,
                routingEngine: 'astar',
                waypoints: [],
                computedPath: '',
                cornerRadius: state.defaultCornerRadius,
                pathVersion: 0,
                labels: [],
                strokeWidth: state.defaultStrokeWidth,
                strokeColor: 'var(--text-primary)',
                strokeDash: 'solid',
                opacity: 1,
                startMarker: 'none',
                endMarker: state.defaultEndMarker,
                meta: { routeGeneratedAt: Date.now(), isStale: false, obstacleHash: '' },
            };

            // Compute initial path
            const path = routeConnector(connector, elements, true);
            connector.computedPath = path;

            set((s: any) => ({
                connectors: { ...s.connectors, [connector.id]: connector },
                drawingConnector: DRAWING_IDLE,
            }));

            return connector;
        },

        cancelDrawingConnector: () => set(() => ({ drawingConnector: DRAWING_IDLE })),

        setHoveredConnector: (id, segmentIndex) => set(() => ({ hoveredConnectorId: id, hoveredSegmentIndex: segmentIndex })),

        setHoveredElement: (elementId) => set(() => ({ hoveredElementId: elementId })),

        selectConnector: (id) => set((s: any) => ({
            selectedConnectorIds: id ? [id] : [],
            // Also clear regular element selection
            selected: id ? [] : s.selected,
        })),

        flipConnectorRoute: (id, elements) => {
            const state = get();
            const c = (state.connectors as Record<string, SmartConnector>)[id];
            if (!c) return;
            connectorCache.invalidate(id);
            const flipped = {
                ...c,
                routingMode: c.routingMode === 'orthogonal'
                    ? 'elbow' as RoutingMode
                    : 'orthogonal' as RoutingMode,
                meta: { ...c.meta, isStale: true },
            };
            set((s: any) => ({ connectors: { ...s.connectors, [id]: flipped } }));
            (get() as SmartConnectorSlice).rerouteConnector(id, elements, true);
        },

        reverseConnector: (id, elements) => {
            const state = get();
            const c = (state.connectors as Record<string, SmartConnector>)[id];
            if (!c) return;
            connectorCache.invalidate(id);
            const reversed: SmartConnector = {
                ...c,
                sourceElementId: c.targetElementId,
                sourceAnchor: c.targetAnchor,
                targetElementId: c.sourceElementId,
                targetAnchor: c.sourceAnchor,
                startMarker: c.endMarker,
                endMarker: c.startMarker,
                meta: { ...c.meta, isStale: true },
            };
            set((s: any) => ({ connectors: { ...s.connectors, [id]: reversed } }));
            (get() as SmartConnectorSlice).rerouteConnector(id, elements, true);
        },

        addManualWaypoint: (id, point) => set((s: any) => {
            const c = s.connectors[id];
            if (!c) return {};
            return { connectors: { ...s.connectors, [id]: { ...c, waypoints: [...c.waypoints, point] } } };
        }),

        clearManualWaypoints: (id, elements) => {
            set((s: any) => {
                const c = s.connectors[id];
                if (!c) return {};
                return { connectors: { ...s.connectors, [id]: { ...c, waypoints: [], meta: { ...c.meta, isStale: true } } } };
            });
            (get() as SmartConnectorSlice).rerouteConnector(id, elements, true);
        },
    };
}
