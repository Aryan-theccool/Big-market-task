import { DiagramAST, ASTNode, ASTEdge, ASTFrame, ASTStyleOverride, ParseError, DiagramTheme } from './ASTTypes';
import { cleanLabel, parsePropsString } from './ParserUtils';

export function parseCanvexDSL(source: string): { ast: DiagramAST; errors: ParseError[] } {
    const ast: DiagramAST = {
        meta: {
            type: 'custom',
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

    const errors: ParseError[] = [];
    const lines = source.split('\n');

    for (let i = 0; i < lines.length; i++) {
        const rawLine = lines[i];
        const lineNum = i + 1;

        // Strip comments
        let line = rawLine.split('//')[0].trim();
        if (!line) continue;

        try {
            // 1. Meta hints: e.g. @diagram flowchart
            if (line.startsWith('@')) {
                const parts = line.slice(1).split(/\s+/);
                const directive = parts[0]?.toLowerCase();
                const value = parts[1];

                if (directive === 'diagram') {
                    ast.meta.type = (value as any) || 'custom';
                } else if (directive === 'layout') {
                    ast.meta.layoutEngine = (value as any) || 'dagre';
                } else if (directive === 'direction') {
                    let dir: 'TD' | 'LR' | 'RL' | 'BT' = 'TD';
                    if (value === 'left-right' || value === 'LR') dir = 'LR';
                    if (value === 'right-left' || value === 'RL') dir = 'RL';
                    if (value === 'bottom-up' || value === 'BT') dir = 'BT';
                    ast.meta.direction = dir;
                } else if (directive === 'theme') {
                    ast.meta.theme = (value as any) || 'system';
                } else {
                    errors.push({
                        line: lineNum,
                        column: 1,
                        message: `Unknown directive '@${directive}'`,
                        severity: 'warning',
                        suggestion: 'Use @diagram, @layout, @direction, or @theme',
                    });
                }
                continue;
            }

            // 2. Node definitions: node parent : shape=rounded-rect, label="Parent Node"
            if (line.startsWith('node ')) {
                const rest = line.slice(5).trim();
                const colonIdx = rest.indexOf(':');

                let idNode = rest;
                let propsStr = '';
                if (colonIdx !== -1) {
                    idNode = rest.slice(0, colonIdx).trim();
                    propsStr = rest.slice(colonIdx + 1).trim();
                }

                const props = parsePropsString(propsStr);
                const nodeShape = (props.shape as any) || 'rect';

                ast.nodes.push({
                    id: idNode,
                    label: cleanLabel(props.label || idNode),
                    shape: nodeShape,
                    style: {
                        fill: props.fill,
                        stroke: props.stroke,
                        strokeWidth: props.strokeWidth ? Number(props.strokeWidth) : undefined,
                        color: props.color,
                    },
                    classes: props.classes ? props.classes.split(',') : [],
                    url: props.url,
                    tooltip: props.tooltip,
                });
                continue;
            }

            // 3. Frame/group definitions: frame backend : label="Backend Services", contains=[process, done]
            if (line.startsWith('frame ')) {
                const rest = line.slice(6).trim();
                const colonIdx = rest.indexOf(':');

                let idFrame = rest;
                let propsStr = '';
                if (colonIdx !== -1) {
                    idFrame = rest.slice(0, colonIdx).trim();
                    propsStr = rest.slice(colonIdx + 1).trim();
                }

                const props = parsePropsString(propsStr);
                let containsIds: string[] = [];
                if (props.contains) {
                    containsIds = props.contains.replace(/[\[\]]/g, '').split(',').map(s => s.trim());
                }

                ast.frames.push({
                    id: idFrame,
                    label: cleanLabel(props.label || idFrame),
                    nodeIds: containsIds,
                    style: {
                        fill: props.fill,
                        stroke: props.stroke,
                    },
                });
                continue;
            }

            // 4. Style overrides: style decide : fontSize=13, fontWeight=bold
            if (line.startsWith('style ')) {
                const rest = line.slice(6).trim();
                const colonIdx = rest.indexOf(':');
                if (colonIdx === -1) {
                    errors.push({
                        line: lineNum,
                        column: 1,
                        message: `Invalid style definition. Missing colon separator.`,
                        severity: 'error',
                    });
                    continue;
                }
                const targetId = rest.slice(0, colonIdx).trim();
                const propsStr = rest.slice(colonIdx + 1).trim();
                const props = parsePropsString(propsStr);

                ast.styles.push({
                    targetId,
                    properties: props,
                });

                // Apply override directly to node if it exists
                const node = ast.nodes.find(n => n.id === targetId);
                if (node) {
                    node.style = {
                        ...node.style,
                        fontSize: props.fontSize ? Number(props.fontSize) : undefined,
                        fontWeight: props.fontWeight as string,
                        width: props.width ? Number(props.width) : undefined,
                        height: props.height ? Number(props.height) : undefined,
                    };
                }
                continue;
            }

            // 5. Edge definitions: edge start --> decide : label="submit"
            // Or: edge start <--> decide
            if (line.startsWith('edge ')) {
                const rest = line.slice(5).trim();
                const colonIdx = rest.indexOf(':');

                let connection = rest;
                let propsStr = '';
                if (colonIdx !== -1) {
                    connection = rest.slice(0, colonIdx).trim();
                    propsStr = rest.slice(colonIdx + 1).trim();
                }

                type ArrowheadType = 'arrow' | 'circle' | 'cross' | 'none' | 'diamond';
                let sType: 'solid' | 'dashed' | 'dotted' | 'thick' = 'solid';
                let arrowHead: ArrowheadType = 'arrow';
                let arrowTail: ArrowheadType = 'none';

                let source = '';
                let target = '';

                if (connection.includes('-->')) {
                    const parts = connection.split('-->');
                    source = parts[0].trim();
                    target = parts[1].trim();
                } else if (connection.includes('<-->')) {
                    const parts = connection.split('<-->');
                    source = parts[0].trim();
                    target = parts[1].trim();
                    arrowTail = 'arrow';
                } else if (connection.includes('--o')) {
                    const parts = connection.split('--o');
                    source = parts[0].trim();
                    target = parts[1].trim();
                    arrowHead = 'circle';
                } else {
                    errors.push({
                        line: lineNum,
                        column: 1,
                        message: `Unknown edge syntax in: "${connection}". Expected -->, <-->, or --o`,
                        severity: 'error',
                    });
                    continue;
                }

                const props = parsePropsString(propsStr);
                if (props.style === 'dashed') sType = 'dashed';
                if (props.style === 'dotted') sType = 'dotted';
                if (props.style === 'thick') sType = 'thick';

                ast.edges.push({
                    id: `edge-${source}-${target}-${ast.edges.length}`,
                    source,
                    target,
                    label: props.label ? cleanLabel(props.label) : undefined,
                    style: sType,
                    arrowhead: arrowHead,
                    arrowtail: arrowTail,
                    color: props.color,
                });

                // Ensure source and target nodes are defined implicitly if not explicitly defined
                if (!ast.nodes.some(n => n.id === source)) {
                    ast.nodes.push({
                        id: source,
                        label: source,
                        shape: 'rect',
                        style: {},
                        classes: [],
                    });
                }
                if (!ast.nodes.some(n => n.id === target)) {
                    ast.nodes.push({
                        id: target,
                        label: target,
                        shape: 'rect',
                        style: {},
                        classes: [],
                    });
                }
                continue;
            }

            // 6. Direct edge definitions shortcut (without 'edge ' prefix): start --> decide
            if (line.includes('-->') || line.includes('<-->') || line.includes('--o')) {
                const parts = line.split(/:/);
                const connection = parts[0].trim();
                const propsStr = parts[1] ? parts.slice(1).join(':').trim() : '';

                let source = '';
                let target = '';
                let arrowHead: 'arrow' | 'circle' = 'arrow';
                let arrowTail: 'none' | 'arrow' = 'none';

                if (connection.includes('-->')) {
                    const cParts = connection.split('-->');
                    source = cParts[0].trim();
                    target = cParts[1].trim();
                } else if (connection.includes('<-->')) {
                    const cParts = connection.split('<-->');
                    source = cParts[0].trim();
                    target = cParts[1].trim();
                    arrowTail = 'arrow';
                } else if (connection.includes('--o')) {
                    const cParts = connection.split('--o');
                    source = cParts[0].trim();
                    target = cParts[1].trim();
                    arrowHead = 'circle';
                }

                const props = parsePropsString(propsStr);
                let sStyle: 'solid' | 'dashed' | 'dotted' | 'thick' = 'solid';
                if (props.style === 'dashed') sStyle = 'dashed';
                if (props.style === 'dotted') sStyle = 'dotted';
                if (props.style === 'thick') sStyle = 'thick';

                ast.edges.push({
                    id: `edge-${source}-${target}-${ast.edges.length}`,
                    source,
                    target,
                    label: props.label ? cleanLabel(props.label) : undefined,
                    style: sStyle,
                    arrowhead: arrowHead,
                    arrowtail: arrowTail,
                    color: props.color,
                });

                // Ensure source and target nodes are defined implicitly
                if (!ast.nodes.some(n => n.id === source)) {
                    ast.nodes.push({ id: source, label: source, shape: 'rect', style: {}, classes: [] });
                }
                if (!ast.nodes.some(n => n.id === target)) {
                    ast.nodes.push({ id: target, label: target, shape: 'rect', style: {}, classes: [] });
                }
                continue;
            }

            // 7. Node shortcuts: start[Start Node] or start((Circle Node))
            // e.g. start[Text]
            const match = line.match(/^(\w+)(?:\[(.*?)\]|\((.*?)\)|\{\{(.*?)\}\})$/);
            if (match) {
                const id = match[1];
                const rectLbl = match[2];
                const circleLbl = match[3];
                const diamondLbl = match[4];

                let shape: any = 'rect';
                let label = id;
                if (rectLbl !== undefined) {
                    shape = 'rounded-rect';
                    label = rectLbl;
                } else if (circleLbl !== undefined) {
                    shape = 'circle';
                    label = circleLbl;
                } else if (diamondLbl !== undefined) {
                    shape = 'diamond';
                    label = diamondLbl;
                }

                ast.nodes.push({
                    id,
                    label: cleanLabel(label),
                    shape,
                    style: {},
                    classes: [],
                });
                continue;
            }

            // If we fall through and it is just a word, declare it as a node implicit definition
            if (/^\w+$/.test(line)) {
                if (!ast.nodes.some(n => n.id === line)) {
                    ast.nodes.push({ id: line, label: line, shape: 'rect', style: {}, classes: [] });
                }
                continue;
            }

            errors.push({
                line: lineNum,
                column: 1,
                message: `Failed to parse statement: "${line}"`,
                severity: 'error',
            });
        } catch (e: any) {
            errors.push({
                line: lineNum,
                column: 1,
                message: e.message || 'Parser internal error',
                severity: 'error',
            });
        }
    }

    return { ast, errors };
}
