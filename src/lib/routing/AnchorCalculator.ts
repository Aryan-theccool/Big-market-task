// ─────────────────────────────────────────────────────────────────────────────
// AnchorCalculator.ts — Compute 8 cardinal anchor points for any canvas element
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint, AnchorPosition, Point, Rect } from './RoutingTypes';
import { CanvasElement } from '../../store/canvasStore';

/** Get the bounding rect of any CanvasElement type */
export function getElementBounds(el: CanvasElement): Rect {
    if ((el.type === 'line' || el.type === 'arrow' || el.type === 'smart-connector') && el.x2 !== undefined && el.y2 !== undefined) {
        const minX = Math.min(el.x, el.x2);
        const minY = Math.min(el.y, el.y2);
        return {
            x: minX, y: minY,
            w: Math.max(1, Math.abs(el.x2 - el.x)),
            h: Math.max(1, Math.abs(el.y2 - el.y)),
        };
    }
    return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
}

/** Returns all 8 cardinal anchor points for an element */
export function getAnchors(el: CanvasElement): AnchorPoint[] {
    const { x, y, w, h } = getElementBounds(el);
    const cx = x + w / 2;
    const cy = y + h / 2;

    return [
        { position: 'N', x: cx, y: y, normal: { dx: 0, dy: -1 }, elementId: el.id },
        { position: 'NE', x: x + w, y: y, normal: { dx: 1, dy: -1 }, elementId: el.id },
        { position: 'E', x: x + w, y: cy, normal: { dx: 1, dy: 0 }, elementId: el.id },
        { position: 'SE', x: x + w, y: y + h, normal: { dx: 1, dy: 1 }, elementId: el.id },
        { position: 'S', x: cx, y: y + h, normal: { dx: 0, dy: 1 }, elementId: el.id },
        { position: 'SW', x: x, y: y + h, normal: { dx: -1, dy: 1 }, elementId: el.id },
        { position: 'W', x: x, y: cy, normal: { dx: -1, dy: 0 }, elementId: el.id },
        { position: 'NW', x: x, y: y, normal: { dx: -1, dy: -1 }, elementId: el.id },
        { position: 'CENTER', x: cx, y: cy, normal: { dx: 0, dy: 0 }, elementId: el.id },
    ];
}

/** Get a single named anchor point from an element */
export function getAnchorPoint(el: CanvasElement, position: AnchorPosition): AnchorPoint {
    const anchors = getAnchors(el);
    return anchors.find(a => a.position === position) ?? anchors[0];
}

/** Check whether two points are approximately equal (within tolerance) */
export function pointsEqual(a: Point, b: Point, tol = 0.5): boolean {
    return Math.abs(a.x - b.x) < tol && Math.abs(a.y - b.y) < tol;
}
