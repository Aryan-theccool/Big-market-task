'use client';

/**
 * useDiagramBiLink
 *
 * Bidirectional highlight bridge between canvas diagram frames and
 * the source code blocks in the markdown editor.
 *
 * Canvas → Editor:
 *   When the user clicks a diagram frame element on the canvas,
 *   this hook emits a "diagram:focus-editor" custom event carrying
 *   the diagramId. The CodeMirrorBlock that owns that diagramId
 *   listens for this event and scrolls itself into view + flashes a ring.
 *
 * Editor → Canvas:
 *   When the user clicks inside a CodeMirrorBlock it dispatches
 *   "diagram:focus-canvas" with its diagramId. This hook (mounted on
 *   the canvas side) pans + zooms to centre the matching frame element.
 */

import { useEffect, useCallback } from 'react';
import { useCanvasStore, CanvasElement } from '../store/canvasStore';

// ── Event type helpers ──────────────────────────────────────────
export const DIAGRAM_FOCUS_EDITOR = 'diagram:focus-editor';
export const DIAGRAM_FOCUS_CANVAS = 'diagram:focus-canvas';

export function emitFocusEditor(diagramId: string) {
    window.dispatchEvent(new CustomEvent(DIAGRAM_FOCUS_EDITOR, { detail: { diagramId } }));
}

export function emitFocusCanvas(diagramId: string) {
    window.dispatchEvent(new CustomEvent(DIAGRAM_FOCUS_CANVAS, { detail: { diagramId } }));
}

// ── Canvas-side hook ────────────────────────────────────────────
export function useDiagramBiLink() {
    const store = useCanvasStore();

    // Resolve which diagramId owns a given element id
    const resolveDiagramId = useCallback((elementId: string): string | null => {
        const diagrams = useCanvasStore.getState().diagrams;
        for (const [diagramId, entry] of Object.entries(diagrams)) {
            if (entry.canvasElementIds.includes(elementId)) {
                return diagramId;
            }
        }
        return null;
    }, []);

    // Canvas → Editor: listen for element selection changes and auto-fire focus-editor
    useEffect(() => {
        const state = useCanvasStore.getState();
        const unsubscribe = useCanvasStore.subscribe((next) => {
            if (next.selected.length !== 1) return;
            const elId = next.selected[0];
            const el = next.elements.find(e => e.id === elId);
            // Only trigger for frame elements and only if it's a diagram frame
            if (!el || el.type !== 'frame') return;
            const diagramId = resolveDiagramId(elId) ||
                // Also check frame element id convention: diagram-frame-<diagramId>
                (elId.startsWith('diagram-frame-') ? elId.replace('diagram-frame-', '') : null);
            if (!diagramId) return;
            // Select in store and fire event
            next.selectDiagram(diagramId);
            emitFocusEditor(diagramId);
        });
        return unsubscribe;
    }, [resolveDiagramId]);

    // Editor → Canvas: pan + zoom to centre on matching frame element
    useEffect(() => {
        const handler = (e: Event) => {
            const diagramId = (e as CustomEvent).detail?.diagramId as string;
            if (!diagramId) return;

            const state = useCanvasStore.getState();
            state.selectDiagram(diagramId);

            const frameId = `diagram-frame-${diagramId}`;
            const frame = state.elements.find(el => el.id === frameId);
            if (!frame) return;

            // Pan viewport so the frame is centred
            const vpEl = document.getElementById('canvasViewport');
            if (!vpEl) return;
            const vw = vpEl.clientWidth;
            const vh = vpEl.clientHeight;

            const zoom = state.viewport.zoom;
            const cx = frame.x + (frame.w || 400) / 2;
            const cy = frame.y + (frame.h || 300) / 2;

            state.setViewport({
                x: vw / 2 - cx * zoom,
                y: vh / 2 - cy * zoom,
            });
        };

        window.addEventListener(DIAGRAM_FOCUS_CANVAS, handler);
        return () => window.removeEventListener(DIAGRAM_FOCUS_CANVAS, handler);
    }, []);
}
