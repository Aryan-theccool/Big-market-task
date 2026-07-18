import { DiagramThemes } from './DiagramThemes';
import { ASTNode, ASTEdge, ASTFrame, DiagramTheme } from './diagramParser/ASTTypes';

export function buildNodeStyle(node: ASTNode, themeName: DiagramTheme) {
    const theme = DiagramThemes[themeName] || DiagramThemes.system;

    let fill = node.style.fill || theme.nodeFill;
    let stroke = node.style.stroke || theme.nodeStroke;
    let strokeWidth = node.style.strokeWidth || 1.5;
    let strokeDasharray = node.shape === 'rounded-rect' ? 'none' : undefined;

    if (node.shape === 'note') {
        fill = 'var(--yellow)';
        stroke = 'var(--yellow-border)';
    }

    return {
        fill,
        stroke,
        strokeWidth,
        strokeDasharray,
        color: node.style.color || theme.nodeText,
        fontSize: node.style.fontSize || 13,
        fontFamily: 'var(--font-ui)',
        fontWeight: node.style.fontWeight || 'normal',
    };
}

export function buildEdgeStyle(edge: ASTEdge, themeName: DiagramTheme) {
    const theme = DiagramThemes[themeName] || DiagramThemes.system;

    let color = edge.color || theme.edgeColor;
    let strokeDasharray = undefined;
    let strokeWidth = 1.5;

    if (edge.style === 'dashed') {
        strokeDasharray = '5 5';
    } else if (edge.style === 'dotted') {
        strokeDasharray = '2 3';
    } else if (edge.style === 'thick') {
        strokeWidth = 3;
    }

    return {
        stroke: color,
        strokeWidth,
        strokeDasharray,
    };
}

export function buildFrameStyle(frame: ASTFrame, themeName: DiagramTheme) {
    const theme = DiagramThemes[themeName] || DiagramThemes.system;
    return {
        fill: frame.style.fill || theme.frameFill,
        stroke: frame.style.stroke || theme.nodeStroke,
        strokeWidth: 1,
        strokeDasharray: '3 3',
    };
}
