// ─────────────────────────────────────────────────────────────────────────────
// SnapDetector.ts — Cursor-to-anchor snap detection
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint, SNAP_RADIUS } from './RoutingTypes';
import { CanvasElement } from '../../store/canvasStore';
import { getAnchors } from './AnchorCalculator';

/** Find the nearest anchor point within snap radius. Returns null if none. */
export function findNearestAnchor(
    cursor: { x: number; y: number },
    elements: CanvasElement[],
    excludeIds: string[] = [],
    radius: number = SNAP_RADIUS,
): AnchorPoint | null {
    let best: AnchorPoint | null = null;
    let bestDist = radius;

    for (const el of elements) {
        if (excludeIds.includes(el.id)) continue;
        if (el.type === 'smart-connector' || el.type === 'line' || el.type === 'arrow' || el.type === 'draw') continue;

        const anchors = getAnchors(el).filter(a => a.position !== 'CENTER');
        for (const anchor of anchors) {
            const dist = Math.hypot(cursor.x - anchor.x, cursor.y - anchor.y);
            if (dist < bestDist) {
                bestDist = dist;
                best = anchor;
            }
        }
    }

    return best;
}

/** Find which element (if any) is under the cursor for anchor dot display */
export function findElementUnderCursor(
    cursor: { x: number; y: number },
    elements: CanvasElement[],
    excludeIds: string[] = [],
    hitPadding = 8,
): CanvasElement | null {
    // Iterate in reverse z-order
    const sorted = [...elements].sort((a, b) => (b.z || 0) - (a.z || 0));

    for (const el of sorted) {
        if (excludeIds.includes(el.id)) continue;
        if (el.type === 'smart-connector' || el.type === 'line' || el.type === 'arrow' || el.type === 'draw') continue;

        const x = el.x - hitPadding;
        const y = el.y - hitPadding;
        const w = (el.w || 100) + hitPadding * 2;
        const h = (el.h || 60) + hitPadding * 2;

        if (cursor.x >= x && cursor.x <= x + w && cursor.y >= y && cursor.y <= y + h) {
            return el;
        }
    }

    return null;
}
