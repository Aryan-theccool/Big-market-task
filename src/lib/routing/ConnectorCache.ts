// ─────────────────────────────────────────────────────────────────────────────
// ConnectorCache.ts — LRU cache for computed SVG routes
// ─────────────────────────────────────────────────────────────────────────────

interface CacheEntry {
    path: string;
    obstacleHash: string;
    sourceX: number;
    sourceY: number;
    targetX: number;
    targetY: number;
}

const MAX_SIZE = 500;

class ConnectorRouteCache {
    private cache = new Map<string, CacheEntry>();

    get(
        connectorId: string,
        sourceX: number, sourceY: number,
        targetX: number, targetY: number,
        obstacleHash: string,
    ): string | null {
        const entry = this.cache.get(connectorId);
        if (!entry) return null;
        if (
            Math.abs(entry.sourceX - sourceX) > 0.5 ||
            Math.abs(entry.sourceY - sourceY) > 0.5 ||
            Math.abs(entry.targetX - targetX) > 0.5 ||
            Math.abs(entry.targetY - targetY) > 0.5 ||
            entry.obstacleHash !== obstacleHash
        ) return null;
        return entry.path;
    }

    set(
        connectorId: string,
        path: string,
        sourceX: number, sourceY: number,
        targetX: number, targetY: number,
        obstacleHash: string,
    ): void {
        if (this.cache.size >= MAX_SIZE) {
            const oldest = this.cache.keys().next().value;
            if (oldest) this.cache.delete(oldest);
        }
        this.cache.set(connectorId, { path, obstacleHash, sourceX, sourceY, targetX, targetY });
    }

    invalidate(connectorId: string): void {
        this.cache.delete(connectorId);
    }

    clear(): void {
        this.cache.clear();
    }
}

// Singleton cache shared across the app
export const connectorCache = new ConnectorRouteCache();
