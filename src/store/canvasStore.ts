import { create } from 'zustand';
import { createSmartConnectorSlice, SmartConnectorSlice, DrawingConnectorState } from './smartConnectorSlice';
export type { SmartConnectorSlice, DrawingConnectorState } from './smartConnectorSlice';

export type ElementType =
  | 'note' | 'rect' | 'circle' | 'line' | 'arrow'
  | 'draw' | 'text' | 'handwriting' | 'frame' | 'image'
  | 'smart-connector';

export interface CanvasElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  w?: number;
  h?: number;
  x2?: number;
  y2?: number;
  rot?: number;
  color?: string;
  text?: string;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  radius?: number;
  roughness?: number;
  closed?: boolean;
  points?: { x: number; y: number }[];
  z: number;
  src?: string;
  fontSize?: number;
  fontFamily?: string;
  align?: 'left' | 'center' | 'right';
  opacity?: number;

  // Smart Connector specific properties
  sourceElementId?: string;
  sourceAnchor?: string;
  targetElementId?: string;
  targetAnchor?: string;
  routingMode?: string;
  routingEngine?: string;
  waypoints?: any[];
  computedPath?: string;
  cornerRadius?: number;
  pathVersion?: number;
  labels?: any[];
  strokeColor?: string;
  strokeDash?: string;
  startMarker?: string;
  endMarker?: string;
  meta?: any;
  flipH?: boolean;
  flipV?: boolean;
  locked?: boolean;
  _typing?: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

export interface DiagramRegistryEntry {
  diagramId: string;
  codeBlockId: string;         // CodeMirror block node ID in TipTap doc
  canvasElementIds: string[];  // All canvas element IDs generated
  frameElementId: string;      // Containing frame element ID
  layoutEngine: 'dagre' | 'elk' | 'grid' | 'radial';
  theme: string;
  lastCompiledAt: number;
  sourceHash: string;          // Hash of source code for change detection
  syncMode: 'manual' | 'live';
}

export interface ParseError {
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  suggestion?: string;
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
  history: { past: string[]; future: string[] };
  roomId: string | null;
  viewMode: 'canvas' | 'split' | 'notes-only';
  splitRatio: number;
  noteTitle: string;

  // Markdown Editor State
  markdownViewMode: 'edit' | 'preview' | 'split';
  isHistoryOpen: boolean;
  isToolbarVisible: boolean;
  wordCount: number;
  charCount: number;
  lastSavedAt: number | null;
  isDirty: boolean;
  activeBlockId: string | null;
  selectedCommentId: string | null;
  isImportModalOpen: boolean;
  isExportMenuOpen: boolean;
  selectedSnapshotId: string | null;

  setTheme: (theme: 'light' | 'dark') => void;
  setViewMode: (mode: 'canvas' | 'split' | 'notes-only') => void;
  setSplitRatio: (ratio: number) => void;
  setNoteTitle: (title: string) => void;
  setMarkdownViewMode: (mode: 'edit' | 'preview' | 'split') => void;
  openHistory: () => void;
  closeHistory: () => void;
  setWordCount: (word: number, char: number) => void;
  setActiveBlock: (blockId: string | null) => void;
  selectComment: (commentId: string | null) => void;
  setImportModalOpen: (open: boolean) => void;
  setExportMenuOpen: (open: boolean) => void;
  selectSnapshot: (id: string | null) => void;
  markDirty: () => void;
  markSaved: () => void;
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
  hydrate: (roomId?: string) => Promise<void>;
  saveToStorage: () => void;
  bringToFront: (id: string) => void;
  sendToBack: (id: string) => void;
  bringForward: (id: string) => void;
  sendBackward: (id: string) => void;

  // Diagram Parser State
  diagrams: Record<string, DiagramRegistryEntry>;
  compilingDiagramId: string | null;
  compileProgress: number;
  compileErrors: Record<string, ParseError[]>;
  selectedDiagramId: string | null;
  hoveredDiagramElementId: string | null;
  isLayoutPickerOpen: boolean;
  isThemePickerOpen: boolean;
  defaultLayoutEngine: 'dagre' | 'elk' | 'grid' | 'radial';
  defaultTheme: 'system' | 'ocean' | 'forest' | 'sunset' | 'mono';
  defaultSyncMode: 'manual' | 'live';
  animateEntrance: boolean;

  // Diagram Parser Actions
  registerDiagram: (entry: DiagramRegistryEntry) => void;
  updateDiagramRegistry: (diagramId: string, updates: Partial<DiagramRegistryEntry>) => void;
  removeDiagram: (diagramId: string) => void;
  setCompiling: (diagramId: string | null) => void;
  setCompileErrors: (diagramId: string, errors: ParseError[]) => void;
  selectDiagram: (diagramId: string | null) => void;
  setDefaultLayoutEngine: (engine: 'dagre' | 'elk' | 'grid' | 'radial') => void;
  setDefaultTheme: (theme: string) => void;
  reRenderDiagram: (diagramId: string) => Promise<void>;
  reRenderAllOutOfSync: () => Promise<void>;
}

export type CanvasStoreType = CanvasState & SmartConnectorSlice;

const uid = () => 'el_' + Math.random().toString(36).slice(2, 9);

export const useCanvasStore = create<CanvasState & SmartConnectorSlice>((set, get) => ({
  ...createSmartConnectorSlice(set, get),
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
  roomId: null,

  // Diagram Parser State
  diagrams: {},
  compilingDiagramId: null,
  compileProgress: 0,
  compileErrors: {},
  selectedDiagramId: null,
  hoveredDiagramElementId: null,
  isLayoutPickerOpen: false,
  isThemePickerOpen: false,
  defaultLayoutEngine: 'dagre',
  defaultTheme: 'system',
  defaultSyncMode: 'manual',
  animateEntrance: true,
  viewMode: 'canvas',
  splitRatio: 35,
  noteTitle: 'Meeting Notes',

  // Markdown Editor defaults
  markdownViewMode: 'edit',
  isHistoryOpen: false,
  isToolbarVisible: true,
  wordCount: 0,
  charCount: 0,
  lastSavedAt: null,
  isDirty: false,
  activeBlockId: null,
  selectedCommentId: null,
  isImportModalOpen: false,
  isExportMenuOpen: false,
  selectedSnapshotId: null,

  setTheme: (theme) => {
    set({ theme });
    if (typeof document !== 'undefined') document.body.dataset.theme = theme;
  },

  toggleTheme: () => {
    const next = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(next);
    get().saveToStorage();
  },

  setBoardName: (boardName) => { set({ boardName }); get().saveToStorage(); },
  setViewMode: (viewMode) => { set({ viewMode }); get().saveToStorage(); },
  setSplitRatio: (splitRatio) => { set({ splitRatio }); get().saveToStorage(); },
  setNoteTitle: (noteTitle) => { set({ noteTitle }); get().saveToStorage(); },

  // Markdown editor actions
  setMarkdownViewMode: (markdownViewMode) => { set({ markdownViewMode }); },
  openHistory: () => { set({ isHistoryOpen: true }); },
  closeHistory: () => { set({ isHistoryOpen: false }); },
  setWordCount: (wordCount, charCount) => { set({ wordCount, charCount }); },
  setActiveBlock: (activeBlockId) => { set({ activeBlockId }); },
  selectComment: (selectedCommentId) => { set({ selectedCommentId }); },
  setImportModalOpen: (isImportModalOpen) => { set({ isImportModalOpen }); },
  setExportMenuOpen: (isExportMenuOpen) => { set({ isExportMenuOpen }); },
  selectSnapshot: (selectedSnapshotId) => { set({ selectedSnapshotId }); },
  markDirty: () => { set({ isDirty: true }); },
  markSaved: () => { set({ isDirty: false, lastSavedAt: Date.now() }); },

  // Diagram Parser Actions
  registerDiagram: (entry) => set((state) => ({ diagrams: { ...state.diagrams, [entry.diagramId]: entry } })),
  updateDiagramRegistry: (diagramId, updates) => set((state) => {
    const entry = state.diagrams[diagramId];
    if (!entry) return {};
    return { diagrams: { ...state.diagrams, [diagramId]: { ...entry, ...updates } } };
  }),
  removeDiagram: (diagramId) => set((state) => {
    const next = { ...state.diagrams };
    delete next[diagramId];
    return { diagrams: next };
  }),
  setCompiling: (compilingDiagramId) => set({ compilingDiagramId }),
  setCompileErrors: (diagramId, errors) => set((state) => ({ compileErrors: { ...state.compileErrors, [diagramId]: errors } })),
  selectDiagram: (selectedDiagramId) => set({ selectedDiagramId }),
  setDefaultLayoutEngine: (defaultLayoutEngine) => set({ defaultLayoutEngine }),
  setDefaultTheme: (defaultTheme) => set({ defaultTheme: defaultTheme as any }),
  reRenderDiagram: async (diagramId) => {
    const emitter = (window as any).__diagramReRenderEmitter;
    if (emitter) emitter(diagramId);
  },
  reRenderAllOutOfSync: async () => {
    const emitter = (window as any).__diagramReRenderAllEmitter;
    if (emitter) emitter();
  },

  setViewport: (patch) => {
    set((state) => ({
      viewport: typeof patch === 'function' ? patch(state.viewport) : { ...state.viewport, ...patch },
    }));
  },

  setElements: (els) => {
    set((state) => ({
      elements: typeof els === 'function' ? els(state.elements) : els,
    }));
  },

  updateElement: (id, patch) => {
    set((state) => ({
      elements: state.elements.map((el) => (el.id === id ? { ...el, ...patch } : el)),
    }));
    get().saveToStorage();
  },

  addElement: (el) => {
    get().pushHistory();
    set((state) => ({ elements: [...state.elements, el], selected: [el.id] }));
    get().saveToStorage();
  },

  setSelected: (selected) => set({ selected }),
  setTool: (activeTool) => set({ activeTool }),
  toggleGrid: () => { set((s) => ({ showGrid: !s.showGrid })); get().saveToStorage(); },
  toggleSnap: () => { set((s) => ({ snap: !s.snap })); get().saveToStorage(); },
  toggleMini: () => { set((s) => ({ showMini: !s.showMini })); get().saveToStorage(); },

  pushHistory: () => {
    const cur = JSON.stringify(get().elements);
    set((state) => {
      const past = [...state.history.past, cur];
      if (past.length > 100) past.shift();
      return { history: { past, future: [] } };
    });
  },

  undo: () => {
    const { past, future } = get().history;
    if (!past.length) return;
    const prev = JSON.parse(past[past.length - 1]);
    const curStr = JSON.stringify(get().elements);
    set({
      elements: prev, selected: [],
      history: { past: past.slice(0, -1), future: [...future, curStr] },
    });
    get().saveToStorage();
  },

  redo: () => {
    const { past, future } = get().history;
    if (!future.length) return;
    const next = JSON.parse(future[future.length - 1]);
    const curStr = JSON.stringify(get().elements);
    set({
      elements: next,
      history: { past: [...past, curStr], future: future.slice(0, -1) },
    });
    get().saveToStorage();
  },

  deleteSelected: () => {
    const { selected, elements } = get();
    if (!selected.length) return;
    get().pushHistory();
    set({ elements: elements.filter((el) => !selected.includes(el.id)), selected: [] });
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
    set((state) => ({ elements: [...state.elements, ...copies], selected: copies.map((el) => el.id) }));
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
    if (!clipboard?.length) return;
    get().pushHistory();
    const copies = clipboard.map((el) => ({
      ...el, id: uid(), x: el.x + 40, y: el.y + 40,
      x2: el.x2 !== undefined ? el.x2 + 40 : undefined,
      y2: el.y2 !== undefined ? el.y2 + 40 : undefined,
      z: el.z + 2,
    }));
    set((state) => ({ elements: [...state.elements, ...copies], selected: copies.map((el) => el.id) }));
    get().saveToStorage();
  },

  alignSelection: (alignment) => {
    const { selected, elements } = get();
    if (selected.length < 2) return;
    get().pushHistory();
    const selected_els = selected
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is CanvasElement => !!el);
    const getBounds = (el: CanvasElement) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const x = Math.min(el.x, el.x2 || el.x), y = Math.min(el.y, el.y2 || el.y);
        return { id: el.id, x, y, w: Math.abs((el.x2 || el.x) - el.x) || 1, h: Math.abs((el.y2 || el.y) - el.y) || 1 };
      }
      return { id: el.id, x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
    };
    const bounds = selected_els.map(getBounds);
    const left = Math.min(...bounds.map((b) => b.x));
    const right = Math.max(...bounds.map((b) => b.x + b.w));
    const top = Math.min(...bounds.map((b) => b.y));
    const bottom = Math.max(...bounds.map((b) => b.y + b.h));
    const cx = (left + right) / 2, cy = (top + bottom) / 2;
    set((state) => ({
      elements: state.elements.map((el) => {
        if (!selected.includes(el.id)) return el;
        const b = bounds.find((it) => it.id === el.id)!;
        const copy = { ...el };
        if (alignment === 'left') { copy.x = left; }
        if (alignment === 'right') { copy.x = right - b.w; }
        if (alignment === 'center') { copy.x = cx - b.w / 2; }
        if (alignment === 'top') { copy.y = top; }
        if (alignment === 'bottom') { copy.y = bottom - b.h; }
        if (alignment === 'middle') { copy.y = cy - b.h / 2; }
        return copy;
      }),
    }));
    get().saveToStorage();
  },

  distributeSelection: (axis) => {
    const { selected, elements } = get();
    if (selected.length < 3) return;
    get().pushHistory();
    const items = selected
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is CanvasElement => !!el)
      .map((el) => {
        let x = el.x, y = el.y, w = el.w || 100, h = el.h || 60;
        if (el.type === 'line' || el.type === 'arrow') {
          x = Math.min(el.x, el.x2 || el.x); y = Math.min(el.y, el.y2 || el.y);
          w = Math.abs((el.x2 || el.x) - el.x) || 1; h = Math.abs((el.y2 || el.y) - el.y) || 1;
        }
        return { el, x, y, w, h };
      })
      .sort((a, b) => (axis === 'x' ? a.x - b.x : a.y - b.y));
    const first = items[0], last = items[items.length - 1];
    const startVal = axis === 'x' ? first.x : first.y;
    const endVal = axis === 'x' ? last.x : last.y;
    const gap = (endVal - startVal) / (items.length - 1);
    set((state) => ({
      elements: state.elements.map((el) => {
        const idx = items.findIndex((it) => it.el.id === el.id);
        if (idx === -1) return el;
        const item = items[idx];
        return axis === 'x'
          ? { ...el, x: startVal + gap * idx }
          : { ...el, y: startVal + gap * idx, x: item.x };
      }),
    }));
    get().saveToStorage();
  },

  fitToScreen: (vw, vh) => {
    const { elements } = get();
    if (!elements.length) { set({ viewport: { x: vw / 2, y: vh / 2, zoom: 1 } }); return; }
    const bounds = elements.map((el) => {
      if (el.type === 'line' || el.type === 'arrow') {
        const x = Math.min(el.x, el.x2 || el.x), y = Math.min(el.y, el.y2 || el.y);
        return { x, y, w: Math.abs((el.x2 || el.x) - el.x) || 1, h: Math.abs((el.y2 || el.y) - el.y) || 1 };
      }
      return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
    });
    const minX = Math.min(...bounds.map((b) => b.x));
    const minY = Math.min(...bounds.map((b) => b.y));
    const maxX = Math.max(...bounds.map((b) => b.x + b.w));
    const maxY = Math.max(...bounds.map((b) => b.y + b.h));
    const contentW = maxX - minX, contentH = maxY - minY;
    const zoom = Math.max(0.15, Math.min(2, Math.min((vw - 200) / contentW, (vh - 160) / contentH)));
    set({ viewport: { x: (vw - contentW * zoom) / 2 - minX * zoom, y: (vh - contentH * zoom) / 2 - minY * zoom, zoom } });
    get().saveToStorage();
  },

  importBoard: (elements, name, viewport) => {
    get().pushHistory();
    set((state) => ({
      elements, boardName: name || state.boardName,
      viewport: viewport || state.viewport, selected: [],
    }));
    get().saveToStorage();
  },

  bringToFront: (id) => {
    get().pushHistory();
    const els = get().elements;
    const maxZ = Math.max(...els.map((e) => e.z || 0));
    set({ elements: els.map((e) => e.id === id ? { ...e, z: maxZ + 1 } : e) });
    get().saveToStorage();
  },

  sendToBack: (id) => {
    get().pushHistory();
    const els = get().elements;
    const minZ = Math.min(...els.map((e) => e.z || 0));
    set({ elements: els.map((e) => e.id === id ? { ...e, z: minZ - 1 } : e) });
    get().saveToStorage();
  },

  bringForward: (id) => {
    get().pushHistory();
    const sorted = [...get().elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx === -1 || idx === sorted.length - 1) return;
    const next = sorted[idx + 1];
    set({ elements: get().elements.map((e) => e.id === id ? { ...e, z: next.z } : e.id === next.id ? { ...e, z: sorted[idx].z } : e) });
    get().saveToStorage();
  },

  sendBackward: (id) => {
    get().pushHistory();
    const sorted = [...get().elements].sort((a, b) => (a.z || 0) - (b.z || 0));
    const idx = sorted.findIndex((e) => e.id === id);
    if (idx <= 0) return;
    const prev = sorted[idx - 1];
    set({ elements: get().elements.map((e) => e.id === id ? { ...e, z: prev.z } : e.id === prev.id ? { ...e, z: sorted[idx].z } : e) });
    get().saveToStorage();
  },

  hydrate: async (roomId) => {
    if (typeof window === 'undefined') return;
    try {
      const t = localStorage.getItem('inkspace-theme') as 'light' | 'dark';
      get().setTheme(t || 'light');

      if (roomId) {
        set({ roomId });
        const res = await fetch(`/api/board/${roomId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.board) {
            set({
              boardName: data.board.boardName || 'Untitled Board',
              viewport: data.board.viewport || { x: 260, y: 140, zoom: 1 },
              elements: data.board.elements || [],
              viewMode: data.board.viewMode || 'canvas',
              splitRatio: data.board.splitRatio !== undefined ? data.board.splitRatio : 35,
              noteTitle: data.board.noteTitle || 'Meeting Notes',
            });
            return;
          }
        }
      }

      const saved = localStorage.getItem('inkspace-board');
      if (saved) {
        const data = JSON.parse(saved);
        set((state) => ({
          boardName: data.boardName || state.boardName,
          viewport: data.viewport || state.viewport,
          elements: data.elements || [],
          showGrid: data.showGrid !== false,
          snap: !!data.snap,
          showMini: data.showMini !== false,
          viewMode: data.viewMode || 'canvas',
          splitRatio: data.splitRatio !== undefined ? data.splitRatio : 35,
          noteTitle: data.noteTitle || 'Meeting Notes',
        }));
      }
    } catch { /* ignore */ }
  },

  saveToStorage: () => {
    if (typeof window === 'undefined') return;
    const { boardName, viewport, elements, showGrid, snap, showMini, theme, roomId, viewMode, splitRatio, noteTitle } = get();
    try {
      localStorage.setItem('inkspace-theme', theme);
      localStorage.setItem('inkspace-board', JSON.stringify({ boardName, viewport, elements, showGrid, snap, showMini, viewMode, splitRatio, noteTitle }));

      if (roomId) {
        fetch(`/api/board/${roomId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ boardName, viewport, elements, viewMode, splitRatio, noteTitle }),
        }).catch((err) => console.error('Error auto-saving board to database:', err));
      }
    } catch { /* ignore quota errors */ }
  },
}));
