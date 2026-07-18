// ─────────────────────────────────────────────────────────────────────────────
// CurvedRouter.ts — Single cubic bezier arc connector
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint } from './RoutingTypes';

/**
 * Compute a cubic bezier SVG path from source to target anchor.
 * Control points are projected from anchor normals.
 */
export function computeCurvedRoute(
    source: AnchorPoint,
    target: AnchorPoint,
    tension = 0.5,
): string {
    const dist = Math.hypot(target.x - source.x, target.y - source.y);
    const t = Math.max(60, dist * tension);

    const cp1x = source.x + source.normal.dx * t;
    const cp1y = source.y + source.normal.dy * t;
    const cp2x = target.x - target.normal.dx * t;
    const cp2y = target.y - target.normal.dy * t;

    return `M ${source.x} ${source.y} C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${target.x} ${target.y}`;
}
