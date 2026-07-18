export interface LayoutResultNode {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface LayoutResultEdgePoint {
    x: number;
    y: number;
}

export interface LayoutResultEdge {
    id: string;
    points: LayoutResultEdgePoint[];
}

export interface LayoutResult {
    nodes: Record<string, LayoutResultNode>;
    edges: Record<string, LayoutResultEdge>;
    totalWidth: number;
    totalHeight: number;
}
