// ─────────────────────────────────────────────────────────────────────────────
// PathSimplifier.ts — Remove redundant collinear waypoints
// ─────────────────────────────────────────────────────────────────────────────

import { Point } from './RoutingTypes';

function getDir(a: Point, b: Point): 'H' | 'V' | 'D' {
    if (Math.abs(b.x - a.x) < 0.5) return 'V';
    if (Math.abs(b.y - a.y) < 0.5) return 'H';
    return 'D';
}

/** Remove collinear intermediate points — keep only direction-change waypoints */
export function simplifyPath(points: Point[]): Point[] {
    if (points.length <= 2) return points;

    const result: Point[] = [points[0]];

    for (let i = 1; i < points.length - 1; i++) {
        const prev = result[result.length - 1];
        const curr = points[i];
        const next = points[i + 1];

        const dirAB = getDir(prev, curr);
        const dirBC = getDir(curr, next);

        if (dirAB !== dirBC) {
            result.push(curr);
        }
    }

    result.push(points[points.length - 1]);
    return result;
}
