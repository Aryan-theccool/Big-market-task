import * as Y from 'yjs';
import { DiagramAST, ASTFrame } from './diagramParser/ASTTypes';
import { LayoutResult } from './layoutEngines/LayoutTypes';
import { mapASTShapeToCanvex } from './ShapeMapper';
import { buildNodeStyle, buildEdgeStyle, buildFrameStyle } from './StyleBuilder';
import { DiagramRegistryEntry, CanvasElement } from '../store/canvasStore';
import { registerDiagramInYjs } from './DiagramRegistry';

interface CompileOptions {
    targetPosition: { x: number; y: number };
    generateGroup: boolean;
    preserveExisting: boolean;
    diagramId: string;
    codeBlockId: string;
    layoutEngine: 'dagre' | 'elk' | 'grid' | 'radial';
    theme: string;
    sourceHash: string;
    syncMode: 'manual' | 'live';
}

export function compileDiagramToCanvas(
    ydoc: Y.Doc,
    ast: DiagramAST,
    layoutResult: LayoutResult,
    options: CompileOptions
): { success: boolean; elementIds: string[] } {
    const yElements = ydoc.getMap<any>('elements');
    const elementIds: string[] = [];

    const offsetX = options.targetPosition.x;
    const offsetY = options.targetPosition.y;

    const FRAME_PADDING = 30;
    const frameId = `diagram-frame-${options.diagramId}`;

    // Helper to generate coordinates of container enclosing list of nodes
    function computeFrameBounds(nodeIds: string[]) {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        nodeIds.forEach(id => {
            const layout = layoutResult.nodes[id];
            if (layout) {
                minX = Math.min(minX, layout.x);
                minY = Math.min(minY, layout.y);
                maxX = Math.max(maxX, layout.x + layout.width);
                maxY = Math.max(maxY, layout.y + layout.height);
            }
        });

        if (minX === Infinity) {
            return { x: offsetX, y: offsetY, w: 200, h: 100 };
        }

        return {
            x: offsetX + minX - 15,
            y: offsetY + minY - 15,
            w: (maxX - minX) + 30,
            h: (maxY - minY) + 30,
        };
    }

    // Handle deletions of previous diagram elements if not preserving or if we morph
    const yRegistry = ydoc.getMap<any>('diagramRegistry');
    const prevEntry: DiagramRegistryEntry = yRegistry.get(options.diagramId);
    const elementsToRemove = new Set<string>();

    if (prevEntry) {
        prevEntry.canvasElementIds.forEach(id => elementsToRemove.add(id));
    }

    // 1. Frame enclosing container
    if (options.generateGroup) {
        const frameWidth = layoutResult.totalWidth + FRAME_PADDING * 2;
        const frameHeight = layoutResult.totalHeight + FRAME_PADDING * 2;

        const frameElement: CanvasElement = {
            id: frameId,
            type: 'frame',
            x: offsetX - FRAME_PADDING,
            y: offsetY - FRAME_PADDING,
            w: frameWidth,
            h: frameHeight,
            text: ast.meta.title || `Diagram - ${options.layoutEngine}`,
            stroke: 'var(--border)',
            fill: 'rgba(120,120,120,0.03)',
            z: 1,
        };

        yElements.set(frameId, frameElement);
        elementIds.push(frameId);
        elementsToRemove.delete(frameId);
    }

    // 2. Create shapes for nodes
    ast.nodes.forEach(node => {
        const layout = layoutResult.nodes[node.id];
        if (!layout) return;

        const nodeElId = `diagram-node-${options.diagramId}-${node.id}`;
        const mappedType = mapASTShapeToCanvex(node.shape);
        const nodeStyle = buildNodeStyle(node, ast.meta.theme);

        const rotation = node.shape === 'diamond' ? 45 : undefined;

        const shapeElement: CanvasElement = {
            id: nodeElId,
            type: mappedType,
            x: offsetX + layout.x,
            y: offsetY + layout.y,
            w: layout.width,
            h: layout.height,
            rot: rotation,
            text: node.label,
            stroke: nodeStyle.stroke,
            fill: nodeStyle.fill,
            strokeWidth: nodeStyle.strokeWidth,
            z: 5,
        };

        yElements.set(nodeElId, shapeElement);
        elementIds.push(nodeElId);
        elementsToRemove.delete(nodeElId);
    });

    // 3. Create sub-frames for grouping
    ast.frames.forEach((frame, idx) => {
        const subFrameId = `diagram-subframe-${options.diagramId}-${frame.id || idx}`;
        const bounds = computeFrameBounds(frame.nodeIds);
        const frameStyle = buildFrameStyle(frame, ast.meta.theme);

        const subFrameElement: CanvasElement = {
            id: subFrameId,
            type: 'frame',
            x: bounds.x,
            y: bounds.y,
            w: bounds.w,
            h: bounds.h,
            text: frame.label,
            stroke: frameStyle.stroke,
            fill: frameStyle.fill,
            z: 2,
        };

        yElements.set(subFrameId, subFrameElement);
        elementIds.push(subFrameId);
        elementsToRemove.delete(subFrameId);
    });

    // 4. Create arrows for edges
    ast.edges.forEach((edge, idx) => {
        const edgeElId = `diagram-edge-${options.diagramId}-${edge.id || idx}`;
        const edgeStyle = buildEdgeStyle(edge, ast.meta.theme);

        // Map points coordinates absolutely
        const absolutePoints = (layoutResult.edges[edge.id]?.points || []).map((p: any) => ({ x: offsetX + p.x, y: offsetY + p.y }));

        // Fallback: If edge points is empty, calculate straight line from source center to target center
        // (SmartConnector will automatically figure out routing, so we can ignore absolutePoints
        // and just let it compute the route, but we need to map to our SmartConnector schema)

        let startMarker: any = 'none';
        let endMarker: any = edge.arrowhead === 'none' ? 'none' : edge.arrowhead;

        if (edge.arrowhead === 'diamond') {
            endMarker = 'diamond';
            startMarker = edge.arrowtail === 'diamond' ? 'diamond' : 'none';
        }

        // Use smart connector schema instead of primitive arrow
        const arrowElement: CanvasElement = {
            id: edgeElId,
            type: 'smart-connector' as any,
            x: 0,
            y: 0,
            z: 3,
            sourceElementId: `diagram-${options.diagramId}-${edge.source}`,
            sourceAnchor: 'CENTER',
            targetElementId: `diagram-${options.diagramId}-${edge.target}`,
            targetAnchor: 'CENTER',
            routingMode: 'orthogonal',
            routingEngine: 'astar',
            waypoints: [],
            computedPath: '',
            cornerRadius: 8,
            pathVersion: 0,
            labels: edge.label ? [{ id: 'lab1', text: edge.label, position: 0.5, offset: { x: 0, y: -10 } }] : [],
            strokeWidth: edgeStyle.strokeWidth,
            strokeColor: edgeStyle.stroke,
            strokeDash: edge.style === 'dashed' || edge.style === 'dotted' ? 'dashed' : 'solid',
            opacity: 1,
            startMarker,
            endMarker,
            meta: { routeGeneratedAt: Date.now(), isStale: true, obstacleHash: '' },
        };

        yElements.set(edgeElId, arrowElement);
        elementIds.push(edgeElId);
        elementsToRemove.delete(edgeElId);
    });

    // Deletes any components not present on compiling
    elementsToRemove.forEach(id => {
        yElements.delete(id);
    });

    // Register in Yjs registry
    const registryEntry: DiagramRegistryEntry = {
        diagramId: options.diagramId,
        codeBlockId: options.codeBlockId,
        canvasElementIds: elementIds,
        frameElementId: frameId,
        layoutEngine: options.layoutEngine,
        theme: options.theme,
        lastCompiledAt: Date.now(),
        sourceHash: options.sourceHash,
        syncMode: options.syncMode,
    };

    registerDiagramInYjs(ydoc, registryEntry);

    return { success: true, elementIds };
}
