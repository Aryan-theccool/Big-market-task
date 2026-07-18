// ─────────────────────────────────────────────────────────────────────────────
// ElbowRouter.ts — Simple L/Z orthogonal connector routing
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint, Point } from './RoutingTypes';

export type ElbowAxis = 'horizontal-first' | 'vertical-first';

/** Compute a 4-point L or Z shaped orthogonal path */
export function computeElbowRoute(
    source: AnchorPoint,
    target: AnchorPoint,
    axis: ElbowAxis = 'horizontal-first',
): Point[] {
    if (axis === 'horizontal-first') {
        const midX = (source.x + target.x) / 2;
        return [
            { x: source.x, y: source.y },
            { x: midX, y: source.y },
            { x: midX, y: target.y },
            { x: target.x, y: target.y },
        ];
    } else {
        const midY = (source.y + target.y) / 2;
        return [
            { x: source.x, y: source.y },
            { x: source.x, y: midY },
            { x: target.x, y: midY },
            { x: target.x, y: target.y },
        ];
    }
}

/** Determine best elbow axis from anchor normals */
export function inferElbowAxis(source: AnchorPoint, target: AnchorPoint): ElbowAxis {
    // If source exits horizontally, prefer horizontal-first
    if (Math.abs(source.normal.dx) > Math.abs(source.normal.dy)) {
        return 'horizontal-first';
    }
    return 'vertical-first';
}

/** Convert a point array to an SVG polyline path string */
export function pathToSVG(points: Point[]): string {
    if (points.length === 0) return '';
    const [first, ...rest] = points;
    return `M ${first.x} ${first.y} ` + rest.map(p => `L ${p.x} ${p.y}`).join(' ');
}
