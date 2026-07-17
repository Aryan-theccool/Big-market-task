// Persistent active style registry by tool type

export interface ToolStyle {
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  roughness?: number;
  fontSize?: number;
}

export const activeStylesByTool: Record<string, ToolStyle> = {
  draw: { stroke: 'var(--rough-stroke)', strokeWidth: 3 },
  line: { stroke: 'var(--rough-stroke)', strokeWidth: 2 },
  arrow: { stroke: 'var(--rough-stroke)', strokeWidth: 2 },
  rect: { stroke: 'var(--rough-stroke)', strokeWidth: 2, fill: 'var(--rough-fill)', roughness: 1.2 },
  circle: { stroke: 'var(--rough-stroke)', strokeWidth: 2, fill: 'var(--rough-fill)', roughness: 1.2 },
  frame: { stroke: 'var(--rough-stroke)', strokeWidth: 2, fill: 'rgba(99,102,241,0.03)', roughness: 1.2 },
  handwriting: { stroke: 'var(--text-primary)', fontSize: 28 },
  text: { stroke: 'var(--text-primary)', fontSize: 28 },
};

// Tracks custom styling modifications in the Inspector Panel
export function saveActiveStyle(type: string, patch: any) {
  if (!activeStylesByTool[type]) {
    activeStylesByTool[type] = {};
  }
  if (patch.stroke !== undefined) activeStylesByTool[type].stroke = patch.stroke;
  if (patch.strokeWidth !== undefined) activeStylesByTool[type].strokeWidth = patch.strokeWidth;
  if (patch.fill !== undefined) activeStylesByTool[type].fill = patch.fill;
  if (patch.roughness !== undefined) activeStylesByTool[type].roughness = patch.roughness;
  if (patch.fontSize !== undefined) (activeStylesByTool[type] as any).fontSize = patch.fontSize;
}
