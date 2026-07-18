import { ElementType } from '../store/canvasStore';

export function mapASTShapeToCanvex(astShape: string): ElementType {
    switch (astShape) {
        case 'rect': return 'rect';
        case 'rounded-rect': return 'rect'; // Styled with rounded corners
        case 'circle': return 'circle';
        case 'diamond': return 'rect'; // Rotated rectangle (represented as rect with rot=45)
        case 'hexagon': return 'rect'; // Fallback
        case 'parallelogram': return 'rect'; // Fallback
        case 'cylinder': return 'rect'; // Fallback
        case 'stadium': return 'rect';
        case 'actor': return 'draw'; // Stick figure SVG path
        case 'note': return 'note';   // Yellow sticky note
        default: return 'rect';
    }
}
