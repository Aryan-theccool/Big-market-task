export const DiagramThemes = {
    system: {
        nodeFill: 'var(--bg-secondary)',
        nodeStroke: 'var(--border)',
        nodeText: 'var(--text-primary)',
        edgeColor: 'var(--text-secondary)',
        frameFill: 'rgba(150, 150, 150, 0.05)',
        accent: '#007AFF',
    },
    ocean: {
        nodeFill: '#E3F2FD',
        nodeStroke: '#1565C0',
        nodeText: '#0D47A1',
        edgeColor: '#42A5F5',
        frameFill: '#E3F2FD80',
        accent: '#1976D2',
    },
    forest: {
        nodeFill: '#E8F5E9',
        nodeStroke: '#2E7D32',
        nodeText: '#1B5E20',
        edgeColor: '#66BB6A',
        frameFill: '#E8F5E980',
        accent: '#388E3C',
    },
    sunset: {
        nodeFill: '#FFF3E0',
        nodeStroke: '#E65100',
        nodeText: '#BF360C',
        edgeColor: '#FFA726',
        frameFill: '#FFF3E080',
        accent: '#F57C00',
    },
    mono: {
        nodeFill: '#FAFAFA',
        nodeStroke: '#212121',
        nodeText: '#212121',
        edgeColor: '#757575',
        frameFill: '#F5F5F580',
        accent: '#424242',
    },
};
export type DiagramThemeType = keyof typeof DiagramThemes;
