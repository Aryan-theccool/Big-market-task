'use client';
// ─────────────────────────────────────────────────────────────────────────────
// useConnectorRerouter.ts — Watches element moves and re-routes connectors
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useCallback } from 'react';
import { useCanvasStore, CanvasElement } from '../store/canvasStore';
import { getElementBounds } from '../lib/routing/AnchorCalculator';

function rectKey(el: CanvasElement): string {
    const b = getElementBounds(el);
    return `${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.w)},${Math.round(b.h)}`;
}

/** Debounced timer stored per connector ID */
const rerouteTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function useConnectorRerouter() {
    const prevKeys = useRef<Map<string, string>>(new Map());

    useEffect(() => {
        const unsub = useCanvasStore.subscribe((state) => {
            const elements = state.elements;
            const connectors = state.connectors;

            if (!connectors || Object.keys(connectors).length === 0) return;

            const movedIds = new Set<string>();

            elements.forEach((el) => {
                const key = rectKey(el);
                if (prevKeys.current.get(el.id) !== key) {
                    movedIds.add(el.id);
                    prevKeys.current.set(el.id, key);
                }
            });

            if (movedIds.size === 0) return;

            // Find connectors attached to moved elements
            const affectedIds = Object.values(connectors)
                .filter(c => movedIds.has(c.sourceElementId) || movedIds.has(c.targetElementId))
                .map(c => c.id);

            if (affectedIds.length === 0) return;

            // Fast approximate re-route immediately (during drag)
            affectedIds.forEach(id => {
                const currentState = useCanvasStore.getState();
                currentState.rerouteConnected(
                    Array.from(movedIds)[0],
                    currentState.elements,
                    true  // fast mode
                );
            });

            // Full A* re-route debounced 250ms (after drag settles)
            affectedIds.forEach(id => {
                if (rerouteTimers.has(id)) clearTimeout(rerouteTimers.get(id)!);
                const timer = setTimeout(() => {
                    const currentState = useCanvasStore.getState();
                    currentState.rerouteConnector(id, currentState.elements, true);
                    rerouteTimers.delete(id);
                }, 250);
                rerouteTimers.set(id, timer);
            });
        });

        return () => {
            unsub();
            rerouteTimers.forEach(clearTimeout);
            rerouteTimers.clear();
        };
    }, []);
}
