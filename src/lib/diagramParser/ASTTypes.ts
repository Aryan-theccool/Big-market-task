export type DiagramTheme = 'system' | 'ocean' | 'forest' | 'sunset' | 'mono';

export interface DiagramAST {
    meta: {
        type: 'flowchart' | 'sequence' | 'class' | 'state' | 'er' | 'mindmap' | 'custom';
        direction: 'TD' | 'LR' | 'RL' | 'BT';
        layoutEngine: 'dagre' | 'elk' | 'grid' | 'radial';
        theme: DiagramTheme;
        title?: string;
    };
    nodes: ASTNode[];
    edges: ASTEdge[];
    frames: ASTFrame[];
    subgraphs: ASTSubgraph[];
    styles: ASTStyleOverride[];
}

export interface ParseError {
    line: number;
    column: number;
    message: string;
    severity: 'error' | 'warning' | 'info';
    suggestion?: string;
}

export interface ASTNodeStyle {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    strokeDasharray?: string;
    color?: string;
    fontSize?: number;
    fontWeight?: string;
    width?: number;
    height?: number;
}

export interface ASTNode {
    id: string;
    label: string;
    shape: 'rect' | 'rounded-rect' | 'circle' | 'diamond' | 'hexagon' |
    'parallelogram' | 'cylinder' | 'stadium' | 'actor' | 'note';
    style: Partial<ASTNodeStyle>;
    classes: string[];
    url?: string;            // clickable link
    tooltip?: string;
}

export interface ASTEdge {
    id: string;
    source: string;
    target: string;
    label?: string;
    style: 'solid' | 'dashed' | 'dotted' | 'thick';
    arrowhead: 'arrow' | 'circle' | 'cross' | 'none' | 'diamond';
    arrowtail: 'none' | 'arrow' | 'circle' | 'diamond';
    color?: string;
}

export interface ASTFrame {
    id: string;
    label: string;
    nodeIds: string[];
    style: Partial<ASTNodeStyle>;
}

export interface ASTSubgraph {
    id: string;
    label: string;
    nodeIds: string[];
    direction?: string;
}

export interface ASTStyleOverride {
    targetId: string;
    properties: Record<string, string | number>;
}
