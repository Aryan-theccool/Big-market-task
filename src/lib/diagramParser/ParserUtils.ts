import CryptoJS from 'crypto-js';

export function computeSourceHash(source: string): string {
    return CryptoJS.MD5(source).toString();
}

/**
 * Normalizes text content for label cleanups
 */
export function cleanLabel(label: string): string {
    return label.replace(/^["']|["']$/g, '').trim();
}

/**
 * Extracts options from a property string like "shape=circle, label=\"Start\", color=green"
 */
export function parsePropsString(propsStr: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!propsStr) return result;

    // Match key=value pairs, handling quoted values
    const regex = /(\w+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s,]+))/g;
    let match;
    while ((match = regex.exec(propsStr)) !== null) {
        const key = match[1];
        const val = match[2] || match[3] || match[4];
        result[key] = val;
    }
    return result;
}
