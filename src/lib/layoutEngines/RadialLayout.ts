import { DiagramAST } from '../diagramParser/ASTTypes';
import { LayoutResult } from './LayoutTypes';
import { estimateNodeWidth, estimateNodeHeight } from '../NodeSizeEstimator';

// Custom Radial/Tree Layout Engine for Mindmaps
export function computeRadialLayout(ast: DiagramAST, radiusStep = 180): LayoutResult {
    const nodesResult: LayoutResult['nodes'] = {};
    const edgesResult: LayoutResult['edges'] = {};

    if (ast.nodes.length === 0) {
        return { nodes: {}, edges: {}, totalWidth: 0, totalHeight: 0 };
    }

    // Define center node (default first node as root)
    const rootNode = ast.nodes[0];
    const rootW = estimateNodeWidth(rootNode);
    const rootH = estimateNodeHeight(rootNode);

    nodesResult[rootNode.id] = {
        id: rootNode.id,
        x: 0,
        y: 0,
        width: rootW,
        height: rootH,
    };

    const leafNodes = ast.nodes.slice(1);
    const count = leafNodes.length;

    leafNodes.forEach((node, i) => {
        const angle = (i * 2 * Math.PI) / count;
        const width = estimateNodeWidth(node);
        const height = estimateNodeHeight(node);

        nodesResult[node.id] = {
            id: node.id,
            x: radiusStep * Math.cos(angle) - width / 2,
            y: radiusStep * Math.sin(angle) - height / 2,
            width,
            height,
        };
    });

    // Calculate straight connection lines from nodes center points
    ast.edges.forEach(edge => {
        const sourceNode = nodesResult[edge.source];
        const targetNode = nodesResult[edge.target];

        if (sourceNode && targetNode) {
            edgesResult[edge.id] = {
                id: edge.id,
                points: [
                    { x: sourceNode.x + sourceNode.width / 2, y: sourceNode.y + sourceNode.height / 2 },
                    { x: targetNode.x + targetNode.width / 2, y: targetNode.y + targetNode.height / 2 },
                ],
            };
        }
    });

    // Normalize mapping structure (all coordinates offset to non-negative quadrants)
    const values = Object.values(nodesResult);
    let minX = -radiusStep - 100, minY = -radiusStep - 100;
    let maxX = radiusStep + 100, maxY = radiusStep + 100;

    if (values.length > 0) {
        minX = Math.min(...values.map(n => n.x));
        minY = Math.min(...values.map(n => n.y));
        maxX = Math.max(...values.map(n => n.x + n.width));
        maxY = Math.max(...values.map(n => n.y + n.height));
    }

    values.forEach(n => {
        n.x -= minX;
        n.y -= minY;
    });

    Object.values(edgesResult).forEach(e => {
        e.points.forEach(p => {
            p.x -= minX;
            p.y -= minY;
        });
    });

    return {
        nodes: nodesResult,
        edges: edgesResult,
        totalWidth: maxX - minX,
        totalHeight: maxY - minY,
    };
}
