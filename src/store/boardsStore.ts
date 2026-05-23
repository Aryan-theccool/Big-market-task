import { create } from 'zustand';

export interface BoardMeta {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  elementCount: number;
  colorIdx: number;
}

interface BoardsState {
  boards: BoardMeta[];
  createBoard: (name?: string) => string;
  deleteBoard: (id: string) => void;
  duplicateBoard: (id: string) => string;
  renameBoard: (id: string, name: string) => void;
  updateMeta: (id: string, patch: Partial<BoardMeta>) => void;
  hydrate: () => void;
  save: () => void;
}

const STORAGE_KEY = 'inkspace-boards';

function uid() {
  return Math.random().toString(36).slice(2, 8) + Math.random().toString(36).slice(2, 8);
}

export const useBoardsStore = create<BoardsState>((set, get) => ({
  boards: [],

  createBoard: (name) => {
    const id = uid();
    const meta: BoardMeta = {
      id,
      name: name || 'Untitled Board',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      elementCount: 0,
      colorIdx: get().boards.length % 8,
    };
    set((s) => ({ boards: [meta, ...s.boards] }));
    get().save();
    return id;
  },

  deleteBoard: (id) => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`inkspace-board-${id}`);
    }
    set((s) => ({ boards: s.boards.filter((b) => b.id !== id) }));
    get().save();
  },

  duplicateBoard: (id) => {
    const src = get().boards.find((b) => b.id === id);
    if (!src) return uid();
    const newId = uid();
    const newMeta: BoardMeta = {
      ...src,
      id: newId,
      name: src.name + ' Copy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    // Copy board data
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem(`inkspace-board-${id}`);
      if (data) localStorage.setItem(`inkspace-board-${newId}`, data);
    }
    set((s) => ({ boards: [newMeta, ...s.boards] }));
    get().save();
    return newId;
  },

  renameBoard: (id, name) => {
    set((s) => ({
      boards: s.boards.map((b) => b.id === id ? { ...b, name, updatedAt: Date.now() } : b),
    }));
    get().save();
    // Also update the stored board data name
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem(`inkspace-board-${id}`);
      if (raw) {
        try {
          const data = JSON.parse(raw);
          localStorage.setItem(`inkspace-board-${id}`, JSON.stringify({ ...data, boardName: name }));
        } catch { /* ignore */ }
      }
    }
  },

  updateMeta: (id, patch) => {
    set((s) => ({
      boards: s.boards.map((b) => b.id === id ? { ...b, ...patch, updatedAt: Date.now() } : b),
    }));
    get().save();
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) set({ boards: JSON.parse(raw) });
    } catch { /* ignore */ }
  },

  save: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(get().boards));
    } catch { /* ignore quota */ }
  },
}));
