import { DiagramAST } from '../diagramParser/ASTTypes';
import { LayoutResult } from './LayoutTypes';
import { estimateNodeWidth, estimateNodeHeight } from '../NodeSizeEstimator';

export function computeGridLayout(ast: DiagramAST, cols = 3, gap = 40): LayoutResult {
    const nodesResult: LayoutResult['nodes'] = {};
    const edgesResult: LayoutResult['edges'] = {};

    const cellSizeX = 140;
    const cellSizeY = 80;

    ast.nodes.forEach((node, i) => {
        const colPosition = i % cols;
        const rowPosition = Math.floor(i / cols);

        const width = estimateNodeWidth(node);
        const height = estimateNodeHeight(node);

        nodesResult[node.id] = {
            id: node.id,
            x: colPosition * (cellSizeX + gap),
            y: rowPosition * (cellSizeY + gap),
            width,
            height,
        };
    });

    // Simple straight linkages for grid nodes
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

    const values = Object.values(nodesResult);
    let w = 800, h = 600;
    if (values.length > 0) {
        w = Math.max(...values.map(n => n.x + n.width)) + 40;
        h = Math.max(...values.map(n => n.y + n.height)) + 40;
    }

    return {
        nodes: nodesResult,
        edges: edgesResult,
        totalWidth: w,
        totalHeight: h,
    };
}
