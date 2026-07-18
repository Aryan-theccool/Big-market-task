// ─────────────────────────────────────────────────────────────────────────────
// ObstacleHasher.ts — Fast obstacle layout hash for cache invalidation
// ─────────────────────────────────────────────────────────────────────────────

import { CanvasElement } from '../../store/canvasStore';
import { getElementBounds } from './AnchorCalculator';

/** cyrb53 — fast non-crypto string hash */
function cyrb53(str: string, seed = 0): string {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0; i < str.length; i++) {
        const ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36);
}

export function computeObstacleHash(
    elements: CanvasElement[],
    excludeIds: string[],
): string {
    const parts = elements
        .filter(el => !excludeIds.includes(el.id) && el.type !== 'smart-connector')
        .sort((a, b) => a.id.localeCompare(b.id))
        .map(el => {
            const b = getElementBounds(el);
            return `${el.id}:${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.w)},${Math.round(b.h)}`;
        });

    return cyrb53(parts.join('|'));
}
