import { ASTNode } from './diagramParser/ASTTypes';

export function estimateNodeWidth(node: ASTNode): number {
    if (node.style.width) return node.style.width;
    const labelLen = node.label ? node.label.length : 0;

    if (node.shape === 'circle') {
        return Math.max(70, labelLen * 8 + 30);
    }
    if (node.shape === 'diamond') {
        return Math.max(90, labelLen * 8 + 50);
    }
    return Math.max(100, labelLen * 8 + 24);
}

export function estimateNodeHeight(node: ASTNode): number {
    if (node.style.height) return node.style.height;

    if (node.shape === 'circle') {
        const w = estimateNodeWidth(node);
        return w; // Keep circular
    }
    if (node.shape === 'diamond') {
        const w = estimateNodeWidth(node);
        return w; // Keep square for diamond layout
    }
    return 42;
}
