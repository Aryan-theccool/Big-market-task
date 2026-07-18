// ─────────────────────────────────────────────────────────────────────────────
// routeConnector.ts — High-level router dispatcher
// Picks routing mode and post-processes path
// ─────────────────────────────────────────────────────────────────────────────

import { SmartConnector, RoutingMode, Point } from './RoutingTypes';
import { CanvasElement } from '../../store/canvasStore';
import { getAnchorPoint } from './AnchorCalculator';
import { computeElbowRoute, inferElbowAxis, pathToSVG } from './ElbowRouter';
import { computeCurvedRoute } from './CurvedRouter';
import { computeAStarRoute } from './AStarRouter';
import { simplifyPath } from './PathSimplifier';
import { applyCornerRounding } from './CornerRounder';
import { computeObstacleHash } from './ObstacleHasher';
import { connectorCache } from './ConnectorCache';

function elementsById(elements: CanvasElement[]): Map<string, CanvasElement> {
    const m = new Map<string, CanvasElement>();
    for (const el of elements) m.set(el.id, el);
    return m;
}

/**
 * Compute the final SVG path for a connector given current element positions.
 * Uses cache to avoid redundant A* calls.
 */
export function routeConnector(
    connector: SmartConnector,
    elements: CanvasElement[],
    forceAstar = false,
): string {
    const map = elementsById(elements);
    const srcEl = map.get(connector.sourceElementId);
    const tgtEl = map.get(connector.targetElementId);
    if (!srcEl || !tgtEl) return connector.computedPath || '';

    const src = getAnchorPoint(srcEl, connector.sourceAnchor);
    const tgt = getAnchorPoint(tgtEl, connector.targetAnchor);

    const mode: RoutingMode = connector.routingMode;

    // ── Straight: direct line ────────────────────────────────────────────
    if (mode === 'straight') {
        return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    }

    // ── Curved: bezier ───────────────────────────────────────────────────
    if (mode === 'curved') {
        return computeCurvedRoute(src, tgt);
    }

    // ── Elbow: simple L/Z ───────────────────────────────────────────────
    if (mode === 'elbow') {
        const pts = computeElbowRoute(src, tgt, inferElbowAxis(src, tgt));
        return applyCornerRounding(simplifyPath(pts), connector.cornerRadius);
    }

    // ── Orthogonal / A* ──────────────────────────────────────────────────
    const obstacleHash = computeObstacleHash(elements, [connector.sourceElementId, connector.targetElementId]);
    const cached = connectorCache.get(connector.id, src.x, src.y, tgt.x, tgt.y, obstacleHash);
    if (cached && !forceAstar) return cached;

    const raw = computeAStarRoute(src, tgt, elements);
    const simplified = simplifyPath(raw);
    const svgPath = applyCornerRounding(simplified, connector.cornerRadius);

    connectorCache.set(connector.id, svgPath, src.x, src.y, tgt.x, tgt.y, obstacleHash);
    return svgPath;
}

/**
 * Fast approximate route using elbow only — used during drag for performance.
 */
export function fastRouteConnector(
    connector: SmartConnector,
    elements: CanvasElement[],
): string {
    const map = elementsById(elements);
    const srcEl = map.get(connector.sourceElementId);
    const tgtEl = map.get(connector.targetElementId);
    if (!srcEl || !tgtEl) return connector.computedPath || '';

    const src = getAnchorPoint(srcEl, connector.sourceAnchor);
    const tgt = getAnchorPoint(tgtEl, connector.targetAnchor);

    if (connector.routingMode === 'straight') return `M ${src.x} ${src.y} L ${tgt.x} ${tgt.y}`;
    if (connector.routingMode === 'curved') return computeCurvedRoute(src, tgt);

    const pts = computeElbowRoute(src, tgt, inferElbowAxis(src, tgt));
    return applyCornerRounding(simplifyPath(pts), connector.cornerRadius);
}
