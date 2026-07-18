import { DiagramAST, ParseError } from './ASTTypes';
import { parseCanvexDSL } from './CanvexDSLParser';
import { parseMermaid } from './MermaidParser';
import { parseDOT } from './DotParser';

export function parseDiagramSource(source: string, langHint?: string): { ast: DiagramAST; errors: ParseError[] } {
    const content = source.trim();
    const lowerContent = content.toLowerCase();

    // 1. Detect language if not explicitly provided
    let detectedLang = langHint ? langHint.toLowerCase() : '';

    if (!detectedLang) {
        if (lowerContent.includes('@diagram') || lowerContent.includes('@layout') || lowerContent.startsWith('node ') || lowerContent.startsWith('edge ') || lowerContent.includes('-->') && (lowerContent.includes('//') || lowerContent.includes('style '))) {
            detectedLang = 'canvex';
        } else if (lowerContent.startsWith('flowchart') || lowerContent.startsWith('graph') || lowerContent.startsWith('sequencediagram') || lowerContent.startsWith('classdiagram') || lowerContent.startsWith('statediagram') || lowerContent.startsWith('erdiagram') || lowerContent.startsWith('mindmap') || lowerContent.includes('%%')) {
            detectedLang = 'mermaid';
        } else if (lowerContent.startsWith('digraph') || lowerContent.startsWith('graph') && lowerContent.includes('{')) {
            detectedLang = 'dot';
        } else {
            // Default fallback
            detectedLang = 'canvex';
        }
    }

    // 2. Delegate to correct sub-parser
    if (detectedLang === 'mermaid') {
        const { ast, errors } = parseMermaid(content);
        return { ast, errors: errors as ParseError[] };
    } else if (detectedLang === 'dot') {
        const { ast, errors } = parseDOT(content);
        return { ast, errors: errors as ParseError[] };
    } else {
        return parseCanvexDSL(content);
    }
}
