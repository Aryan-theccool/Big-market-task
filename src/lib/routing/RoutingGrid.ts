// ─────────────────────────────────────────────────────────────────────────────
// RoutingGrid.ts — Build sparse obstacle grid + clearance distance transform
// ─────────────────────────────────────────────────────────────────────────────

import { CanvasElement } from '../../store/canvasStore';
import { getElementBounds } from './AnchorCalculator';
import { GRID_CELL_SIZE, OBSTACLE_MARGIN, Point } from './RoutingTypes';

export interface RoutingGrid {
    cellSize: number;
    originX: number;
    originY: number;
    cols: number;
    rows: number;
    blocked: Uint8Array;       // 1 = blocked, 0 = free
    clearance: Float32Array;   // distance (in cells) to nearest obstacle
}

function worldToCell(wx: number, wy: number, grid: RoutingGrid): { cx: number; cy: number } {
    return {
        cx: Math.round((wx - grid.originX) / grid.cellSize),
        cy: Math.round((wy - grid.originY) / grid.cellSize),
    };
}

export function cellToWorld(cx: number, cy: number, grid: RoutingGrid): Point {
    return {
        x: grid.originX + cx * grid.cellSize,
        y: grid.originY + cy * grid.cellSize,
    };
}

export function worldPointToCell(p: Point, grid: RoutingGrid): { cx: number; cy: number } {
    return worldToCell(p.x, p.y, grid);
}

export function isBlocked(cx: number, cy: number, grid: RoutingGrid): boolean {
    if (cx < 0 || cy < 0 || cx >= grid.cols || cy >= grid.rows) return true;
    return grid.blocked[cy * grid.cols + cx] === 1;
}

export function getClearance(cx: number, cy: number, grid: RoutingGrid): number {
    if (cx < 0 || cy < 0 || cx >= grid.cols || cy >= grid.rows) return 0;
    return grid.clearance[cy * grid.cols + cx];
}

/** Build routing grid from current canvas element layout */
export function buildRoutingGrid(
    elements: CanvasElement[],
    sourceId: string,
    targetId: string,
    worldPad = 80,
): RoutingGrid {
    const obstacles = elements.filter(
        el => el.id !== sourceId && el.id !== targetId && el.type !== 'smart-connector'
    );

    if (elements.length === 0) {
        const grid: RoutingGrid = {
            cellSize: GRID_CELL_SIZE,
            originX: 0, originY: 0,
            cols: 50, rows: 50,
            blocked: new Uint8Array(2500),
            clearance: new Float32Array(2500),
        };
        grid.clearance.fill(10);
        return grid;
    }

    // Compute world bounding box
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const el of elements) {
        const b = getElementBounds(el);
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w);
        maxY = Math.max(maxY, b.y + b.h);
    }

    const originX = minX - worldPad;
    const originY = minY - worldPad;
    const cols = Math.ceil((maxX - originX + worldPad) / GRID_CELL_SIZE) + 2;
    const rows = Math.ceil((maxY - originY + worldPad) / GRID_CELL_SIZE) + 2;

    const blocked = new Uint8Array(cols * rows);
    const clearance = new Float32Array(cols * rows).fill(cols + rows);

    // Mark obstacle cells
    for (const el of obstacles) {
        const b = getElementBounds(el);
        const x0 = Math.floor((b.x - OBSTACLE_MARGIN - originX) / GRID_CELL_SIZE);
        const y0 = Math.floor((b.y - OBSTACLE_MARGIN - originY) / GRID_CELL_SIZE);
        const x1 = Math.ceil((b.x + b.w + OBSTACLE_MARGIN - originX) / GRID_CELL_SIZE);
        const y1 = Math.ceil((b.y + b.h + OBSTACLE_MARGIN - originY) / GRID_CELL_SIZE);

        for (let cy = Math.max(0, y0); cy <= Math.min(rows - 1, y1); cy++) {
            for (let cx = Math.max(0, x0); cx <= Math.min(cols - 1, x1); cx++) {
                blocked[cy * cols + cx] = 1;
                clearance[cy * cols + cx] = 0;
            }
        }
    }

    // BFS distance transform for clearance map
    const queue: number[] = [];
    for (let i = 0; i < blocked.length; i++) {
        if (blocked[i] === 1) { clearance[i] = 0; queue.push(i); }
    }

    let qi = 0;
    const dirs = [-1, 1, -cols, cols];
    while (qi < queue.length) {
        const idx = queue[qi++];
        const cy = Math.floor(idx / cols);
        const cx = idx % cols;
        const d = clearance[idx];

        for (const dir of dirs) {
            const ni = idx + dir;
            const ny = Math.floor(ni / cols);
            const nx = ni % cols;
            if (ni < 0 || ni >= blocked.length) continue;
            if (Math.abs(nx - cx) + Math.abs(ny - cy) !== 1) continue;  // bounds
            if (clearance[ni] > d + 1) {
                clearance[ni] = d + 1;
                queue.push(ni);
            }
        }
    }

    return { cellSize: GRID_CELL_SIZE, originX, originY, cols, rows, blocked, clearance };
}
