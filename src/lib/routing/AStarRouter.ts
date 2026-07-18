// ─────────────────────────────────────────────────────────────────────────────
// AStarRouter.ts — Full A* pathfinding for orthogonal obstacle-aware routing
// ─────────────────────────────────────────────────────────────────────────────

import { AnchorPoint, Point, TURN_PENALTY_COST, CLEARANCE_WEIGHT, MAX_CLEARANCE_BONUS, GRID_CELL_SIZE } from './RoutingTypes';
import { RoutingGrid, buildRoutingGrid, cellToWorld, worldPointToCell, isBlocked, getClearance } from './RoutingGrid';
import { computeElbowRoute, inferElbowAxis } from './ElbowRouter';
import { CanvasElement } from '../../store/canvasStore';

// ── Minimal inline MinHeap ────────────────────────────────────────────────────
class MinHeap<T> {
    private items: T[] = [];
    constructor(private key: (item: T) => number) { }

    push(item: T) {
        this.items.push(item);
        this.bubbleUp(this.items.length - 1);
    }

    pop(): T {
        const top = this.items[0];
        const last = this.items.pop()!;
        if (this.items.length > 0) { this.items[0] = last; this.siftDown(0); }
        return top;
    }

    get size() { return this.items.length; }

    private bubbleUp(i: number) {
        while (i > 0) {
            const p = Math.floor((i - 1) / 2);
            if (this.key(this.items[p]) <= this.key(this.items[i])) break;
            [this.items[p], this.items[i]] = [this.items[i], this.items[p]];
            i = p;
        }
    }

    private siftDown(i: number) {
        const n = this.items.length;
        while (true) {
            let smallest = i;
            const l = 2 * i + 1, r = 2 * i + 2;
            if (l < n && this.key(this.items[l]) < this.key(this.items[smallest])) smallest = l;
            if (r < n && this.key(this.items[r]) < this.key(this.items[smallest])) smallest = r;
            if (smallest === i) break;
            [this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]];
            i = smallest;
        }
    }
}

// ── A* node ───────────────────────────────────────────────────────────────────
interface AStarNode {
    cx: number;
    cy: number;
    g: number;
    f: number;
    parent: AStarNode | null;
    lastDirH: boolean | null;  // true = last move was horizontal
}

const DIRS = [
    { dcx: 1, dcy: 0, isH: true },
    { dcx: -1, dcy: 0, isH: true },
    { dcx: 0, dcy: 1, isH: false },
    { dcx: 0, dcy: -1, isH: false },
];

function manhattanH(cx: number, cy: number, gx: number, gy: number): number {
    return (Math.abs(cx - gx) + Math.abs(cy - gy)) * GRID_CELL_SIZE;
}

function reconstructPath(node: AStarNode, grid: RoutingGrid): Point[] {
    const cells: Array<{ cx: number; cy: number }> = [];
    let cur: AStarNode | null = node;
    while (cur) { cells.unshift({ cx: cur.cx, cy: cur.cy }); cur = cur.parent; }
    return cells.map(c => cellToWorld(c.cx, c.cy, grid));
}

/** Run A* from source anchor to target anchor on the given routing grid */
export function aStarRoute(
    source: AnchorPoint,
    target: AnchorPoint,
    grid: RoutingGrid,
): Point[] {
    const start = worldPointToCell(source, grid);
    const goal = worldPointToCell(target, grid);

    const open = new MinHeap<AStarNode>(n => n.f);
    const visited = new Map<string, number>(); // key → best g

    open.push({ cx: start.cx, cy: start.cy, g: 0, f: manhattanH(start.cx, start.cy, goal.cx, goal.cy), parent: null, lastDirH: null });

    const MAX_ITER = 3000;
    let iter = 0;

    while (open.size > 0 && iter++ < MAX_ITER) {
        const cur = open.pop();

        if (cur.cx === goal.cx && cur.cy === goal.cy) {
            return reconstructPath(cur, grid);
        }

        const key = `${cur.cx},${cur.cy}`;
        const prevG = visited.get(key);
        if (prevG !== undefined && prevG <= cur.g) continue;
        visited.set(key, cur.g);

        for (const dir of DIRS) {
            const ncx = cur.cx + dir.dcx;
            const ncy = cur.cy + dir.dcy;
            if (isBlocked(ncx, ncy, grid)) continue;

            const isTurn = cur.lastDirH !== null && cur.lastDirH !== dir.isH;
            const turnPenalty = isTurn ? TURN_PENALTY_COST : 0;
            const clearBonus = Math.min(getClearance(ncx, ncy, grid) * CLEARANCE_WEIGHT, MAX_CLEARANCE_BONUS);
            const g = cur.g + GRID_CELL_SIZE + turnPenalty - clearBonus;

            const nKey = `${ncx},${ncy}`;
            if (visited.has(nKey) && visited.get(nKey)! <= g) continue;

            const h = manhattanH(ncx, ncy, goal.cx, goal.cy);
            open.push({ cx: ncx, cy: ncy, g, f: g + h, parent: cur, lastDirH: dir.isH });
        }
    }

    // Fallback to simple elbow route
    return computeElbowRoute(source, target, inferElbowAxis(source, target));
}

/**
 * High-level router: builds grid, runs A*, returns world-space Point array.
 * Use this from the store action.
 */
export function computeAStarRoute(
    source: AnchorPoint,
    target: AnchorPoint,
    elements: CanvasElement[],
): Point[] {
    const grid = buildRoutingGrid(elements, source.elementId, target.elementId);
    return aStarRoute(source, target, grid);
}
