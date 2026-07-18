import { DiagramAST, ASTNode, ASTEdge } from './ASTTypes';
import { cleanLabel, parsePropsString } from './ParserUtils';

export function parseDOT(source: string): { ast: DiagramAST; errors: any[] } {
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

        // Strip comments
        if (line.startsWith('//') || line.startsWith('#') || line.startsWith('/*') || !line) continue;

        try {
            // Check for rankdir=LR;
            if (line.includes('rankdir')) {
                const match = line.match(/rankdir\s*=\s*(\w+)/);
                if (match) {
                    const dir = match[1].toUpperCase();
                    if (dir === 'LR' || dir === 'TD' || dir === 'RL' || dir === 'BT' || dir === 'TB') {
                        ast.meta.direction = dir === 'TB' ? 'TD' : dir as any;
                    }
                }
                continue;
            }

            // Check node attributes: e.g. A [label="Start" shape=circle];
            const nodeAttrMatch = line.match(/^(\w+)\s*\[(.*?)\];?$/);
            if (nodeAttrMatch) {
                const id = nodeAttrMatch[1];
                const attrsStr = nodeAttrMatch[2];
                const props = parsePropsString(attrsStr.replace(/,/g, ' '));

                let shape: any = 'rect';
                if (props.shape === 'circle') shape = 'circle';
                if (props.shape === 'diamond') shape = 'diamond';
                if (props.shape === 'box') shape = 'rect';

                const existing = ast.nodes.find(n => n.id === id);
                if (existing) {
                    existing.label = cleanLabel(props.label || id);
                    existing.shape = shape;
                    existing.style = { ...existing.style, fill: props.color || props.fillcolor };
                } else {
                    ast.nodes.push({
                        id,
                        label: cleanLabel(props.label || id),
                        shape,
                        style: { fill: props.color || props.fillcolor },
                        classes: [],
                    });
                }
                continue;
            }

            // Check edge declarations: e.g. A -> B [label="begin"];
            const edgeMatch = line.match(/^(\w+)\s*(->|--)\s*(\w+)(?:\s*\[(.*?)\])?;?$/);
            if (edgeMatch) {
                const sourceId = edgeMatch[1];
                const targetId = edgeMatch[3];
                const attrsStr = edgeMatch[4] || '';

                const props = parsePropsString(attrsStr.replace(/,/g, ' '));
                let linkStyle: 'solid' | 'dashed' | 'dotted' | 'thick' = 'solid';
                if (props.style === 'dashed') linkStyle = 'dashed';
                if (props.style === 'dotted') linkStyle = 'dotted';
                if (props.style === 'bold') linkStyle = 'thick';

                ast.edges.push({
                    id: `edge-${sourceId}-${targetId}-${ast.edges.length}`,
                    source: sourceId,
                    target: targetId,
                    label: props.label ? cleanLabel(props.label) : undefined,
                    style: linkStyle,
                    arrowhead: edgeMatch[2] === '->' ? 'arrow' : 'none',
                    arrowtail: 'none',
                    color: props.color || props.fillcolor,
                });

                // Add implicit nodes if they don't exist
                if (!ast.nodes.some(n => n.id === sourceId)) {
                    ast.nodes.push({ id: sourceId, label: sourceId, shape: 'rect', style: {}, classes: [] });
                }
                if (!ast.nodes.some(n => n.id === targetId)) {
                    ast.nodes.push({ id: targetId, label: targetId, shape: 'rect', style: {}, classes: [] });
                }
                continue;
            }

            // Simple node shorthand inside digraph block: nodeName;
            const simpleMatch = line.match(/^(\w+);?$/);
            if (simpleMatch) {
                const id = simpleMatch[1];
                if (id !== 'digraph' && id !== 'graph' && id !== '{' && id !== '}') {
                    if (!ast.nodes.some(n => n.id === id)) {
                        ast.nodes.push({ id, label: id, shape: 'rect', style: {}, classes: [] });
                    }
                }
                continue;
            }

        } catch (e: any) {
            errors.push({
                line: lineNum,
                column: 1,
                message: e.message || 'Error processing DOT statement',
                severity: 'error',
            });
        }
    }

    return { ast, errors };
}
