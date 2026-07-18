// ─────────────────────────────────────────────────────────────────────────────
// CornerRounder.ts — Apply rounded corners using quadratic bezier curves
// ─────────────────────────────────────────────────────────────────────────────

import { Point } from './RoutingTypes';

/**
 * Convert an orthogonal waypoint array to an SVG path string with rounded corners.
 * Each 90° turn is replaced by a Q (quadratic bezier) segment.
 *
 * @param points  Simplified waypoint list (direction changes only)
 * @param radius  Corner radius in viewport pixels (default 8)
 */
export function applyCornerRounding(points: Point[], radius = 8): string {
    if (points.length < 2) return '';
    if (points.length === 2) {
        return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`;
    }

    let path = `M ${round(points[0].x)} ${round(points[0].y)}`;

    for (let i = 1; i < points.length - 1; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        const next = points[i + 1];

        const entryLen = Math.hypot(curr.x - prev.x, curr.y - prev.y);
        const exitLen = Math.hypot(next.x - curr.x, next.y - curr.y);
        const r = Math.min(radius, entryLen / 2, exitLen / 2);

        if (r < 1) {
            path += ` L ${round(curr.x)} ${round(curr.y)}`;
            continue;
        }

        // Entry point (r units before corner)
        const ex = curr.x - r * (curr.x - prev.x) / entryLen;
        const ey = curr.y - r * (curr.y - prev.y) / entryLen;
        // Exit point (r units after corner)
        const fx = curr.x + r * (next.x - curr.x) / exitLen;
        const fy = curr.y + r * (next.y - curr.y) / exitLen;

        path += ` L ${round(ex)} ${round(ey)}`;
        path += ` Q ${round(curr.x)} ${round(curr.y)} ${round(fx)} ${round(fy)}`;
    }

    const last = points[points.length - 1];
    path += ` L ${round(last.x)} ${round(last.y)}`;
    return path;
}

function round(n: number) { return Math.round(n * 10) / 10; }
