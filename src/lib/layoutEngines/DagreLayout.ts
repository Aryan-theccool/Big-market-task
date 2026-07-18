import dagre from 'dagre';
import { DiagramAST } from '../diagramParser/ASTTypes';
import { LayoutResult } from './LayoutTypes';
import { estimateNodeWidth, estimateNodeHeight } from '../NodeSizeEstimator';

export function computeDagreLayout(ast: DiagramAST): LayoutResult {
    const g = new dagre.graphlib.Graph({ compound: true });

    g.setGraph({
        rankdir: ast.meta.direction === 'TD' ? 'TB' : ast.meta.direction,
        ranksep: 80,
        nodesep: 40,
        edgesep: 20,
        marginx: 60,
        marginy: 60,
    });

    g.setDefaultEdgeLabel(() => ({}));

    // Add nodes
    ast.nodes.forEach(node => {
        g.setNode(node.id, {
            width: estimateNodeWidth(node),
            height: estimateNodeHeight(node),
        });
    });

    // Nest compound frames (parent nodes)
    ast.frames.forEach(frame => {
        g.setNode(frame.id, { width: 0, height: 0 });
        frame.nodeIds.forEach(nodeId => {
            // Only set parent if the child node exists
            if (g.hasNode(nodeId)) {
                g.setParent(nodeId, frame.id);
            }
        });
    });

    // Add edges
    ast.edges.forEach(edge => {
        g.setEdge(edge.source, edge.target, { id: edge.id });
    });

    // Run layout solver
    dagre.layout(g);

    // Extract layout results
    const nodesResult: LayoutResult['nodes'] = {};
    const edgesResult: LayoutResult['edges'] = {};

    g.nodes().forEach(nodeId => {
        const nodeOpt = g.node(nodeId);
        if (nodeOpt) {
            nodesResult[nodeId] = {
                id: nodeId,
                x: nodeOpt.x - nodeOpt.width / 2, // Centered to top-left mapping
                y: nodeOpt.y - nodeOpt.height / 2,
                width: nodeOpt.width,
                height: nodeOpt.height,
            };
        }
    });

    g.edges().forEach(edge => {
        const edgeOpt = g.edge(edge);
        const edgeId = (edgeOpt as any).id || `edge-${edge.v}-${edge.w}`;
        const points = edgeOpt?.points || [];

        edgesResult[edgeId] = {
            id: edgeId,
            points: points.map(p => ({ x: p.x, y: p.y })),
        };
    });

    // Compute total graph bounds
    const values = Object.values(nodesResult);
    let minX = 0, minY = 0, maxX = 400, maxY = 300;
    if (values.length > 0) {
        minX = Math.min(...values.map(n => n.x));
        minY = Math.min(...values.map(n => n.y));
        maxX = Math.max(...values.map(n => n.x + n.width));
        maxY = Math.max(...values.map(n => n.y + n.height));
    }

    // Offset all values so they start at 0, 0
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
