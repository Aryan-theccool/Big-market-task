import { CanvasElement } from '../store/canvasStore';

/**
 * Triggers layout morphing animations by interpolating coordinates in a RAF loop.
 * Operates on the local Zustand store for immediate local rendering response.
 */
export function animateLayoutMorph(
    store: any,
    elementsBefore: Record<string, CanvasElement>,
    elementsAfter: Record<string, CanvasElement>,
    duration = 400
) {
    const startTime = performance.now();
    const elementIds = Object.keys(elementsAfter);

    // Save initial coordinates for layout morphing matches
    const initialCoords: Record<string, { x: number; y: number; w: number; h: number }> = {};
    elementIds.forEach(id => {
        const before = elementsBefore[id];
        const after = elementsAfter[id];
        if (before) {
            initialCoords[id] = { x: before.x, y: before.y, w: before.w || 100, h: before.h || 40 };
        } else {
            // New element - fade in/scale from center
            initialCoords[id] = {
                x: after.x + (after.w || 100) / 2,
                y: after.y + (after.h || 40) / 2,
                w: 0,
                h: 0,
            };
        }
    });

    function step(now: number) {
        const elapsed = now - startTime;
        const progress = Math.min(1, elapsed / duration);
        // Easing: easeInOutCubic
        const ease = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        store.setElements((prevEls: CanvasElement[]) => {
            return prevEls.map(el => {
                const start = initialCoords[el.id];
                const end = elementsAfter[el.id];
                if (start && end) {
                    return {
                        ...el,
                        x: start.x + (end.x - start.x) * ease,
                        y: start.y + (end.y - start.y) * ease,
                        w: start.w + ((end.w || 100) - start.w) * ease,
                        h: start.h + ((end.h || 40) - start.h) * ease,
                    };
                }
                return el;
            });
        });

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            // Hard set final positions to ensure exact completion
            store.setElements((prevEls: CanvasElement[]) => {
                return prevEls.map(el => {
                    const end = elementsAfter[el.id];
                    if (end) {
                        return {
                            ...el,
                            x: end.x,
                            y: end.y,
                            w: end.w,
                            h: end.h,
                        };
                    }
                    return el;
                });
            });
        }
    }

    requestAnimationFrame(step);
}

/**
 * Animates a staggered zoom entrance of new diagram elements on compilation.
 */
export async function animateEntranceAnimation(
    store: any,
    elementIds: string[],
    duration = 300
) {
    // Stagger node displays by multiplying element indexes
    const elements = store.elements as CanvasElement[];
    const diagramElements = elements.filter(el => elementIds.includes(el.id));

    diagramElements.forEach((el, index) => {
        const finalOpacity = el.opacity || 1;
        store.updateElement(el.id, { opacity: 0 });

        setTimeout(() => {
            const startTime = performance.now();
            function fadeStep(now: number) {
                const elapsed = now - startTime;
                const progress = Math.min(1, elapsed / duration);
                store.updateElement(el.id, { opacity: progress * finalOpacity });

                if (progress < 1) {
                    requestAnimationFrame(fadeStep);
                }
            }
            requestAnimationFrame(fadeStep);
        }, index * 40); // 40ms stagger spacing
    });
}
