// ─────────────────────────────────────────────────────────────────────────────
// AnchorSelector.ts — Select optimal source/target anchor pair
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint } from './RoutingTypes';
import { CanvasElement } from '../../store/canvasStore';
import { getAnchors, getElementBounds } from './AnchorCalculator';

const CARDINAL_ANCHORS: Array<'N' | 'E' | 'S' | 'W'> = ['N', 'E', 'S', 'W'];

/** Score a source+target anchor pair based on directional alignment */
function scoreAnchorPair(
    src: AnchorPoint,
    tgt: AnchorPoint,
    dx: number,
    dy: number,
): number {
    // Prefer source anchor normal aligned with center-to-center direction
    const srcAlign = src.normal.dx * Math.sign(dx) + src.normal.dy * Math.sign(dy);
    // Prefer target anchor normal pointing TOWARD source (opposite direction)
    const tgtAlign = tgt.normal.dx * -Math.sign(dx) + tgt.normal.dy * -Math.sign(dy);
    // Penalize long routes (distance between anchor points)
    const dist = Math.hypot(tgt.x - src.x, tgt.y - src.y);

    return srcAlign + tgtAlign - dist * 0.001;
}

/**
 * Given source and target elements, return the best cardinal anchor pair
 * for drawing a connector between them.
 */
export function selectOptimalAnchors(
    source: CanvasElement,
    target: CanvasElement,
): { sourceAnchor: AnchorPoint; targetAnchor: AnchorPoint } {
    const sb = getElementBounds(source);
    const tb = getElementBounds(target);

    const dx = (tb.x + tb.w / 2) - (sb.x + sb.w / 2);
    const dy = (tb.y + tb.h / 2) - (sb.y + sb.h / 2);

    const srcAnchors = getAnchors(source).filter(a => CARDINAL_ANCHORS.includes(a.position as any));
    const tgtAnchors = getAnchors(target).filter(a => CARDINAL_ANCHORS.includes(a.position as any));

    let best = { sourceAnchor: srcAnchors[0], targetAnchor: tgtAnchors[0], score: -Infinity };

    for (const src of srcAnchors) {
        for (const tgt of tgtAnchors) {
            const score = scoreAnchorPair(src, tgt, dx, dy);
            if (score > best.score) {
                best = { sourceAnchor: src, targetAnchor: tgt, score };
            }
        }
    }

    return { sourceAnchor: best.sourceAnchor, targetAnchor: best.targetAnchor };
}
