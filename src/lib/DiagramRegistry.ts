import * as Y from 'yjs';
import { DiagramRegistryEntry } from '../store/canvasStore';

export function registerDiagramInYjs(
    ydoc: Y.Doc,
    entry: DiagramRegistryEntry
) {
    const yRegistry = ydoc.getMap<any>('diagramRegistry');
    yRegistry.set(entry.diagramId, entry);
}

export function updateDiagramInYjs(
    ydoc: Y.Doc,
    diagramId: string,
    updates: Partial<DiagramRegistryEntry>
) {
    const yRegistry = ydoc.getMap<any>('diagramRegistry');
    const entry = yRegistry.get(diagramId);
    if (entry) {
        yRegistry.set(diagramId, { ...entry, ...updates });
    }
}

export function removeDiagramFromYjs(
    ydoc: Y.Doc,
    diagramId: string
): string[] {
    const yRegistry = ydoc.getMap<any>('diagramRegistry');
    const entry: DiagramRegistryEntry = yRegistry.get(diagramId);
    if (entry) {
        yRegistry.delete(diagramId);
        return entry.canvasElementIds || [];
    }
    return [];
}
