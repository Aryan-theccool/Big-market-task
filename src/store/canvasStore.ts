import { create } from 'zustand';

export interface CanvasElement {
  id: string;
  type: 'note' | 'rect' | 'circle' | 'line' | 'arrow' | 'draw' | 'text' | 'frame' | 'image';
  x: number;
  y: number;
  w?: number;
  h?: number;
  x2?: number;
  y2?: number;
  rot?: number;
  color?: string; // Preset note background
  text?: string;  // Content for notes/text
  fill?: string;  // Object fill color
  stroke?: string;// Object border or text color
  strokeWidth?: number;
  radius?: number;// Rect radius
  closed?: boolean; // Close path for draw
  points?: { x: number; y: number }[];
  z: number;
  _typing?: boolean;
  src?: string;   // Base64 image data source
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface CanvasState {
  theme: 'light' | 'dark';
  boardName: string;
  viewport: Viewport;
  elements: CanvasElement[];
  selected: string[];
  activeTool: string;
  showGrid: boolean;
  snap: boolean;
  showMini: boolean;
  clipboard: CanvasElement[] | null;
  history: {
    past: string[];
    future: string[];
  };
  
  // Actions
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  setBoardName: (name: string) => void;
  setViewport: (patch: Partial<Viewport> | ((v: Viewport) => Viewport)) => void;
  setElements: (els: CanvasElement[] | ((prev: CanvasElement[]) => CanvasElement[])) => void;
  updateElement: (id: string, patch: Partial<CanvasElement>) => void;
  addElement: (el: CanvasElement) => void;
  setSelected: (ids: string[]) => void;
  setTool: (tool: string) => void;
  toggleGrid: () => void;
  toggleSnap: () => void;
  toggleMini: () => void;
  deleteSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  pasteSelected: () => void;
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
  alignSelection: (alignment: 'left' | 'right' | 'center' | 'top' | 'bottom' | 'middle') => void;
  distributeSelection: (axis: 'x' | 'y') => void;
  fitToScreen: (viewportWidth: number, viewportHeight: number) => void;
  importBoard: (elements: CanvasElement[], name?: string, viewport?: Viewport) => void;
  hydrate: () => void;
  saveToStorage: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;
}

const uid = () => 'el_' + Math.random().toString(36).slice(2, 9);
const notes = { sun: '#FEF3C7', rose: '#FFE4E6', sky: '#E0F2FE', sage: '#DCFCE7', lilac: '#F3E8FF', peach: '#FFEDD5' };

export const useCanvasStore = create<CanvasState>((set, get) => ({
  theme: 'light',
  boardName: 'Untitled Board',
  viewport: { x: 260, y: 140, zoom: 1 },
  elements: [],
  selected: [],
  activeTool: 'select',
  showGrid: true,
  snap: false,
  showMini: true,
  clipboard: null,
  history: { past: [], future: [] },

  setTheme: (theme) => {
    set({ theme });
    document.body.dataset.theme = theme;
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
    get().saveToStorage();
  },

  setBoardName: (boardName) => {
    set({ boardName });
    get().saveToStorage();
  },

  setViewport: (patch) => {
    set((state) => ({
      viewport: typeof patch === 'function' ? patch(state.viewport) : { ...state.viewport, ...patch },
    }));
    get().saveToStorage();
  },

  setElements: (els) => {
    set((state) => ({
      elements: typeof els === 'function' ? els(state.elements) : els,
    }));
    get().saveToStorage();
  },

  updateElement: (id, patch) => {
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    }));
    get().saveToStorage();
  },

  addElement: (el) => {
    get().pushHistory();
    set((state) => ({
      elements: [...state.elements, el],
      selected: [el.id],
    }));
    get().saveToStorage();
  },

  setSelected: (selected) => set({ selected }),

  setTool: (activeTool) => set({ activeTool }),

  toggleGrid: () => {
    set((state) => ({ showGrid: !state.showGrid }));
    get().saveToStorage();
  },

  toggleSnap: () => {
    set((state) => ({ snap: !state.snap }));
    get().saveToStorage();
  },

  toggleMini: () => {
    set((state) => ({ showMini: !state.showMini }));
    get().saveToStorage();
  },

  pushHistory: () => {
    const cur = JSON.stringify(get().elements);
    set((state) => {
      const past = [...state.history.past, cur];
      if (past.length > 100) past.shift();
      return {
        history: { past, future: [] },
      };
    });
  },

  undo: () => {
    const { past, future } = get().history;
    if (!past.length) return;
    const prevStr = past[past.length - 1];
    const prev = JSON.parse(prevStr);
    const curStr = JSON.stringify(get().elements);

    set({
      elements: prev,
      selected: [],
      history: {
        past: past.slice(0, -1),
        future: [...future, curStr],
      },
    });
    get().saveToStorage();
  },

  redo: () => {
    const { past, future } = get().history;
    if (!future.length) return;
    const nextStr = future[future.length - 1];
    const next = JSON.parse(nextStr);
    const curStr = JSON.stringify(get().elements);

    set({
      elements: next,
      history: {
        past: [...past, curStr],
        future: future.slice(0, -1),
      },
    });
    get().saveToStorage();
  },

  deleteSelected: () => {
    const { selected, elements } = get();
    if (!selected.length) return;
    get().pushHistory();
    set({
      elements: elements.filter((el) => !selected.includes(el.id)),
      selected: [],
    });
    get().saveToStorage();
  },

  duplicateSelected: () => {
    const { selected, elements } = get();
    if (!selected.length) return;
    get().pushHistory();
    const copies = selected
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is CanvasElement => !!el)
      .map((el) => ({
        ...JSON.parse(JSON.stringify(el)),
        id: uid(),
        x: el.x + 28,
        y: el.y + 28,
        x2: el.x2 !== undefined ? el.x2 + 28 : undefined,
        y2: el.y2 !== undefined ? el.y2 + 28 : undefined,
        z: el.z + 1,
      }));

    set((state) => ({
      elements: [...state.elements, ...copies],
      selected: copies.map((el) => el.id),
    }));
    get().saveToStorage();
  },

  copySelected: () => {
    const { selected, elements } = get();
    if (!selected.length) return;
    const copies = selected
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is CanvasElement => !!el)
      .map((el) => JSON.parse(JSON.stringify(el)));
    set({ clipboard: copies });
  },

  pasteSelected: () => {
    const { clipboard } = get();
    if (!clipboard || !clipboard.length) return;
    get().pushHistory();
    const copies = clipboard.map((el) => ({
      ...el,
      id: uid(),
      x: el.x + 40,
      y: el.y + 40,
      x2: el.x2 !== undefined ? el.x2 + 40 : undefined,
      y2: el.y2 !== undefined ? el.y2 + 40 : undefined,
      z: el.z + 2,
    }));

    set((state) => ({
      elements: [...state.elements, ...copies],
      selected: copies.map((el) => el.id),
    }));
    get().saveToStorage();
  },

  alignSelection: (alignment) => {
    const { selected, elements } = get();
    if (selected.length < 2) return;
    get().pushHistory();

    const selectedElements = selected
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is CanvasElement => !!el);

    const boundsList = selectedElements.map((el) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const x = Math.min(el.x, el.x2 || el.x);
        const y = Math.min(el.y, el.y2 || el.y);
        const w = Math.abs((el.x2 || el.x) - el.x) || 1;
        const h = Math.abs((el.y2 || el.y) - el.y) || 1;
        return { id: el.id, x, y, w, h };
      }
      return { id: el.id, x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
    });

    const left = Math.min(...boundsList.map((b) => b.x));
    const right = Math.max(...boundsList.map((b) => b.x + b.w));
    const top = Math.min(...boundsList.map((b) => b.y));
    const bottom = Math.max(...boundsList.map((b) => b.y + b.h));
    const cx = (left + right) / 2;
    const cy = (top + bottom) / 2;

    const moveElement = (el: CanvasElement, newX: number, newY: number) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const dx = newX - el.x;
        const dy = newY - el.y;
        el.x += dx;
        el.y += dy;
        if (el.x2 !== undefined) el.x2 += dx;
        if (el.y2 !== undefined) el.y2 += dy;
      } else {
        el.x = newX;
        el.y = newY;
      }
    };

    set((state) => {
      const nextElements = state.elements.map((el) => {
        if (!selected.includes(el.id)) return el;
        const copy = { ...el };
        const b = boundsList.find((it) => it.id === el.id)!;
        if (alignment === 'left') moveElement(copy, left, b.y);
        if (alignment === 'right') moveElement(copy, right - b.w, b.y);
        if (alignment === 'center') moveElement(copy, cx - b.w / 2, b.y);
        if (alignment === 'top') moveElement(copy, b.x, top);
        if (alignment === 'bottom') moveElement(copy, b.x, bottom - b.h);
        if (alignment === 'middle') moveElement(copy, b.x, cy - b.h / 2);
        return copy;
      });
      return { elements: nextElements };
    });
    get().saveToStorage();
  },

  distributeSelection: (axis) => {
    const { selected, elements } = get();
    if (selected.length < 3) return;
    get().pushHistory();

    const selectedElements = selected
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is CanvasElement => !!el);

    const items = selectedElements.map((el) => {
      let x = el.x, y = el.y, w = el.w || 100, h = el.h || 60;
      if (el.type === 'line' || el.type === 'arrow') {
        x = Math.min(el.x, el.x2 || el.x);
        y = Math.min(el.y, el.y2 || el.y);
        w = Math.abs((el.x2 || el.x) - el.x) || 1;
        h = Math.abs((el.y2 || el.y) - el.y) || 1;
      }
      return { el, x, y, w, h };
    });

    items.sort((a, b) => (axis === 'x' ? a.x - b.x : a.y - b.y));

    const first = items[0];
    const last = items[items.length - 1];
    const startVal = axis === 'x' ? first.x : first.y;
    const endVal = axis === 'x' ? last.x : last.y;
    const gap = (endVal - startVal) / (items.length - 1);

    const moveElement = (el: CanvasElement, newX: number, newY: number) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const dx = newX - el.x;
        const dy = newY - el.y;
        el.x += dx;
        el.y += dy;
        if (el.x2 !== undefined) el.x2 += dx;
        if (el.y2 !== undefined) el.y2 += dy;
      } else {
        el.x = newX;
        el.y = newY;
      }
    };

    set((state) => {
      const nextElements = state.elements.map((el) => {
        const index = items.findIndex((it) => it.el.id === el.id);
        if (index === -1) return el;
        const copy = { ...el };
        const item = items[index];
        if (axis === 'x') {
          moveElement(copy, startVal + gap * index, item.y);
        } else {
          moveElement(copy, item.x, startVal + gap * index);
        }
        return copy;
      });
      return { elements: nextElements };
    });
    get().saveToStorage();
  },

  fitToScreen: (vw, vh) => {
    const { elements } = get();
    if (!elements.length) return;
    
    const boundsList = elements.map((el) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const x = Math.min(el.x, el.x2 || el.x);
        const y = Math.min(el.y, el.y2 || el.y);
        const w = Math.abs((el.x2 || el.x) - el.x) || 1;
        const h = Math.abs((el.y2 || el.y) - el.y) || 1;
        return { x, y, w, h };
      }
      return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
    });

    const minX = Math.min(...boundsList.map((b) => b.x));
    const minY = Math.min(...boundsList.map((b) => b.y));
    const maxX = Math.max(...boundsList.map((b) => b.x + b.w));
    const maxY = Math.max(...boundsList.map((b) => b.y + b.h));

    const contentW = maxX - minX;
    const contentH = maxY - minY;
    
    const zoom = Math.max(0.15, Math.min(2, Math.min((vw - 220) / contentW, (vh - 160) / contentH)));
    const x = (vw - contentW * zoom) / 2 - minX * zoom;
    const y = (vh - contentH * zoom) / 2 - minY * zoom;

    set({ viewport: { x, y, zoom } });
    get().saveToStorage();
  },

  importBoard: (elements, name, viewport) => {
    get().pushHistory();
    set((state) => ({
      elements,
      boardName: name || state.boardName,
      viewport: viewport || state.viewport,
      selected: [],
    }));
    get().saveToStorage();
  },

  bringToFront: (id) => {
    get().pushHistory();
    const elements = [...get().elements];
    if (elements.length <= 1) return;
    
    const sorted = [...elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    sorted.forEach((el, index) => {
      el.z = index;
    });
    
    const targetIdx = sorted.findIndex((el) => el.id === id);
    if (targetIdx === -1) return;
    
    const target = sorted[targetIdx];
    const maxZ = sorted[sorted.length - 1].z;
    target.z = maxZ + 1;
    
    set({ elements: sorted });
    get().saveToStorage();
  },

  sendToBack: (id) => {
    get().pushHistory();
    const elements = [...get().elements];
    if (elements.length <= 1) return;
    
    const sorted = [...elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    sorted.forEach((el, index) => {
      el.z = index;
    });
    
    const targetIdx = sorted.findIndex((el) => el.id === id);
    if (targetIdx === -1) return;
    
    const target = sorted[targetIdx];
    const minZ = sorted[0].z;
    target.z = minZ - 1;
    
    set({ elements: sorted });
    get().saveToStorage();
  },

  bringForward: (id) => {
    get().pushHistory();
    const elements = [...get().elements];
    if (elements.length <= 1) return;
    
    const sorted = [...elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    sorted.forEach((el, index) => {
      el.z = index;
    });
    
    const targetIdx = sorted.findIndex((el) => el.id === id);
    if (targetIdx === -1 || targetIdx === sorted.length - 1) return;
    
    const next = sorted[targetIdx + 1];
    const target = sorted[targetIdx];
    
    const tempZ = target.z;
    target.z = next.z;
    next.z = tempZ;
    
    set({ elements: sorted });
    get().saveToStorage();
  },

  sendBackward: (id) => {
    get().pushHistory();
    const elements = [...get().elements];
    if (elements.length <= 1) return;
    
    const sorted = [...elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    sorted.forEach((el, index) => {
      el.z = index;
    });
    
    const targetIdx = sorted.findIndex((el) => el.id === id);
    if (targetIdx === -1 || targetIdx === 0) return;
    
    const prev = sorted[targetIdx - 1];
    const target = sorted[targetIdx];
    
    const tempZ = target.z;
    target.z = prev.z;
    prev.z = tempZ;
    
    set({ elements: sorted });
    get().saveToStorage();
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('canvex-board');
      if (saved) {
        const data = JSON.parse(saved);
        set((state) => ({
          boardName: data.boardName || state.boardName,
          viewport: data.viewport || state.viewport,
          elements: data.elements || [],
          showGrid: data.showGrid !== false,
          snap: !!data.snap,
          showMini: data.showMini !== false,
        }));
      }
      const t = localStorage.getItem('canvex-theme') as 'light' | 'dark';
      if (t) {
        get().setTheme(t);
      } else {
        get().setTheme('light');
      }
    } catch (e) {
      console.warn('Hydration failed', e);
    }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    const { boardName, viewport, elements, showGrid, snap, showMini, theme } = get();
    localStorage.setItem('canvex-theme', theme);
    localStorage.setItem(
      'canvex-board',
      JSON.stringify({ boardName, viewport, elements, showGrid, snap, showMini })
    );
  },
}));
