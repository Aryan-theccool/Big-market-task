import { DiagramAST, ASTNode, ASTEdge, DiagramTheme } from './ASTTypes';
import { cleanLabel } from './ParserUtils';

export function parseMermaid(source: string): { ast: DiagramAST; errors: any[] } {
    const ast: DiagramAST = {
        meta: {
            type: 'flowchart',
            direction: 'TD',
            layoutEngine: 'dagre',
            theme: 'system',
        },
        nodes: [],
        edges: [],
        frames: [],
        subgraphs: [],
        styles: [],
    };

    const errors: any[] = [];
    const lines = source.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const lineNum = i + 1;
        let line = rawLine.trim();

        if (!line || line.startsWith('%%')) continue; // Skip comments and empty lines

        // Parse header: e.g. flowchart TD or graph LR
        if (line.startsWith('flowchart ') || line.startsWith('graph ')) {
            const parts = line.split(/\s+/);
            const dir = parts[1]?.toUpperCase();
            if (dir === 'TD' || dir === 'LR' || dir === 'RL' || dir === 'BT') {
                ast.meta.direction = dir;
            }
            ast.meta.type = 'flowchart';
            continue;
        }

        if (line.startsWith('sequenceDiagram')) {
            ast.meta.type = 'sequence';
            ast.meta.layoutEngine = 'elk';
            continue;
        }

        if (line.startsWith('mindmap')) {
            ast.meta.type = 'mindmap';
            ast.meta.layoutEngine = 'radial';
            continue;
        }

        try {
            // Parse Node/Participant/Actor declarations in Flowchart or Sequence Diagrams
            if (ast.meta.type === 'sequence') {
                // e.g. participant Alice or actor Bob
                const pMatch = line.match(/^(participant|actor)\s+(\w+)(?:\s+as\s+(.+))?$/i);
                if (pMatch) {
                    const type = pMatch[1].toLowerCase();
                    const id = pMatch[2];
                    const name = pMatch[3] ? cleanLabel(pMatch[3]) : id;
                    ast.nodes.push({
                        id,
                        label: name,
                        shape: type === 'actor' ? 'actor' : 'rect',
                        style: {},
                        classes: [type],
                    });
                    continue;
                }

                // Messages in sequence diagrams: e.g. Alice->>Bob: Hello
                const mMatch = line.match(/^(\w+)\s*(->>|->|-->|-->>)\s*(\w+)\s*:\s*(.+)$/);
                if (mMatch) {
                    const from = mMatch[1];
                    const type = mMatch[2];
                    const to = mMatch[3];
                    const label = mMatch[4].trim();

                    const style = (type === '-->' || type === '-->>') ? 'dashed' : 'solid';
                    const arrowhead = (type === '->>' || type === '-->>') ? 'arrow' : 'none';

                    ast.edges.push({
                        id: `edge-${from}-${to}-${ast.edges.length}`,
                        source: from,
                        target: to,
                        label,
                        style,
                        arrowhead,
                        arrowtail: 'none',
                    });

                    // Ensure nodes are implicitly built if not present
                    if (!ast.nodes.some(n => n.id === from)) {
                        ast.nodes.push({ id: from, label: from, shape: 'rect', style: {}, classes: [] });
                    }
                    if (!ast.nodes.some(n => n.id === to)) {
                        ast.nodes.push({ id: to, label: to, shape: 'rect', style: {}, classes: [] });
                    }
                    continue;
                }
                continue;
            }

            // Check flowchart connections with labels, e.g.:
            // A -->|yes| B  or  A -.->|no| B  or  A ==>|maybe| B
            // Or simple connections: A --> B, A -.-> B, A === B
            const connMatch = line.match(/^(\w+)(?:\[(.*?)\]|\((.*?)\)|\{\{(.*?)\}\}|\{\((.*?)\)\}|\(\((.*?)\)\))?\s*(-->|-\.-\->|==>|---|-->\|(.+?)\|)\s*(\w+)(?:\[(.*?)\]|\((.*?)\)|\{\{(.*?)\}\}|\{\((.*?)\)\}|\(\((.*?)\)\))?$/);

            if (connMatch) {
                const sourceId = connMatch[1];
                const sLabel = connMatch[2] || connMatch[3] || connMatch[4] || connMatch[5] || connMatch[6];
                const connector = connMatch[7];
                const inlineEdgeLabel = connMatch[8];
                const targetId = connMatch[9];
                const tLabel = connMatch[10] || connMatch[11] || connMatch[12] || connMatch[13] || connMatch[14];

                // Normalise connectors styles
                let linkStyle: 'solid' | 'dashed' | 'dotted' | 'thick' = 'solid';
                if (connector.includes('.-')) linkStyle = 'dashed';
                if (connector.includes('==')) linkStyle = 'thick';

                ast.edges.push({
                    id: `edge-${sourceId}-${targetId}-${ast.edges.length}`,
                    source: sourceId,
                    target: targetId,
                    label: inlineEdgeLabel ? cleanLabel(inlineEdgeLabel) : undefined,
                    style: linkStyle,
                    arrowhead: connector.includes('---') ? 'none' : 'arrow',
                    arrowtail: 'none',
                });

                // Add implicit nodes if they don't exist
                if (!ast.nodes.some(n => n.id === sourceId)) {
                    let sShape: any = 'rect';
                    if (connMatch[3]) sShape = 'rounded-rect';
                    if (connMatch[4]) sShape = 'hexagon';
                    if (connMatch[6]) sShape = 'circle';
                    ast.nodes.push({
                        id: sourceId,
                        label: sLabel ? cleanLabel(sLabel) : sourceId,
                        shape: sShape,
                        style: {},
                        classes: [],
                    });
                }
                if (!ast.nodes.some(n => n.id === targetId)) {
                    let tShape: any = 'rect';
                    if (connMatch[11]) tShape = 'rounded-rect';
                    if (connMatch[12]) tShape = 'hexagon';
                    if (connMatch[14]) tShape = 'circle';
                    ast.nodes.push({
                        id: targetId,
                        label: tLabel ? cleanLabel(tLabel) : targetId,
                        shape: tShape,
                        style: {},
                        classes: [],
                    });
                }
                continue;
            }

            // Check simple node declaration: A[Label] or A((Label)) or A{Label}
            const nodeMatch = line.match(/^(\w+)(?:\[(.*?)\]|\((.*?)\)|\{\{(.*?)\}\}|\{\((.*?)\)\}|\(\((.*?)\)\)|\{(.*?)\})$/);
            if (nodeMatch) {
                const id = nodeMatch[1];
                const rectLbl = nodeMatch[2];
                const rrectLbl = nodeMatch[3];
                const hexLbl = nodeMatch[4];
                const stadiumLbl = nodeMatch[5];
                const circLbl = nodeMatch[6];
                const diaLbl = nodeMatch[7];

                let shape: any = 'rect';
                let label = id;
                if (rectLbl !== undefined) {
                    shape = 'rect';
                    label = rectLbl;
                } else if (rrectLbl !== undefined) {
                    shape = 'rounded-rect';
                    label = rrectLbl;
                } else if (hexLbl !== undefined) {
                    shape = 'hexagon';
                    label = hexLbl;
                } else if (stadiumLbl !== undefined) {
                    shape = 'stadium';
                    label = stadiumLbl;
                } else if (circLbl !== undefined) {
                    shape = 'circle';
                    label = circLbl;
                } else if (diaLbl !== undefined) {
                    shape = 'diamond';
                    label = diaLbl;
                }

                const existing = ast.nodes.find(n => n.id === id);
                if (existing) {
                    existing.label = cleanLabel(label);
                    existing.shape = shape;
                } else {
                    ast.nodes.push({
                        id,
                        label: cleanLabel(label),
                        shape,
                        style: {},
                        classes: [],
                    });
                }
                continue;
            }

        } catch (e: any) {
            errors.push({
                line: lineNum,
                column: 1,
                message: e.message || 'Error processing line',
                severity: 'error',
            });
        }
    }

    return { ast, errors };
}
