'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  Search, 
  Terminal, 
  Eye, 
  Sparkles, 
  Grid, 
  Magnet, 
  Download, 
  Trash2, 
  ZoomIn, 
  Layers 
} from 'lucide-react';
import { triggerImageUpload } from '../../utils/imageHelper';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  toast: (msg: string, color?: string) => void;
  onOpenHelp: () => void;
  viewportWidth: number;
  viewportHeight: number;
}

interface CommandItem {
  id: string;
  category: string;
  title: string;
  subtitle: string;
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  toast,
  onOpenHelp,
  viewportWidth,
  viewportHeight,
}) => {
  const store = useCanvasStore();
  const [search, setSearch] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSearch('');
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // --- View and Canvas ---
    {
      id: 'zoom-100',
      category: 'View',
      title: 'Zoom to 100%',
      subtitle: 'Reset board magnification scale to default',
      shortcut: '0',
      icon: <ZoomIn className="w-4 h-4 text-indigo-500" />,
      action: () => { store.setViewport({ zoom: 1 }); toast('Zoom set to 100%', '#6366F1'); }
    },
    {
      id: 'zoom-fit',
      category: 'View',
      title: 'Fit Screen',
      subtitle: 'Zoom out to fit all active elements',
      shortcut: 'F',
      icon: <Eye className="w-4 h-4 text-indigo-500" />,
      action: () => { store.fitToScreen(viewportWidth, viewportHeight); toast('Fit screen executed', '#6366F1'); }
    },
    {
      id: 'toggle-grid',
      category: 'Canvas Settings',
      title: store.showGrid ? 'Hide Dot Grid' : 'Show Dot Grid',
      subtitle: 'Toggle visibility of radial background grids',
      shortcut: 'G',
      icon: <Grid className="w-4 h-4 text-amber-500" />,
      action: () => { store.toggleGrid(); toast('Grid toggled', '#6366F1'); }
    },
    {
      id: 'toggle-snap',
      category: 'Canvas Settings',
      title: store.snap ? 'Disable Grid Snapping' : 'Enable Grid Snapping',
      subtitle: 'Align coordinates to 24px increments',
      shortcut: 'S',
      icon: <Magnet className="w-4 h-4 text-emerald-500" />,
      action: () => { store.toggleSnap(); toast('Snap toggled', '#6366F1'); }
    },
    {
      id: 'toggle-minimap',
      category: 'Canvas Settings',
      title: store.showMini ? 'Hide Minimap' : 'Show Minimap',
      subtitle: 'Show outline map in the bottom-right corner',
      shortcut: 'M',
      icon: <Sparkles className="w-4 h-4 text-pink-500" />,
      action: () => { store.toggleMini(); toast('Minimap toggled', '#6366F1'); }
    },
    // --- Tools ---
    {
      id: 'tool-note',
      category: 'Tools',
      title: 'Sticky Note Tool',
      subtitle: 'Place a colored sticky note for notes',
      shortcut: 'N',
      icon: <Terminal className="w-4 h-4 text-indigo-500" />,
      action: () => store.setTool('note')
    },
    {
      id: 'tool-rect',
      category: 'Tools',
      title: 'Rectangle Shape Tool',
      subtitle: 'Draw responsive borders and colored boxes',
      shortcut: 'R',
      icon: <Terminal className="w-4 h-4 text-indigo-500" />,
      action: () => store.setTool('rect')
    },
    {
      id: 'tool-circle',
      category: 'Tools',
      title: 'Circle / Oval Tool',
      subtitle: 'Create vector curves and bubble shapes',
      shortcut: 'C',
      icon: <Terminal className="w-4 h-4 text-indigo-500" />,
      action: () => store.setTool('circle')
    },
    {
      id: 'tool-draw',
      category: 'Tools',
      title: 'Freehand Pen Draw Tool',
      subtitle: 'Sketch paths with smart closed figures & fills',
      shortcut: 'D',
      icon: <Terminal className="w-4 h-4 text-indigo-500" />,
      action: () => store.setTool('draw')
    },
    {
      id: 'tool-image',
      category: 'Tools',
      title: 'Insert Image / Screenshot',
      subtitle: 'Upload and place any image file centered on the canvas',
      shortcut: 'I',
      icon: <Terminal className="w-4 h-4 text-emerald-500" />,
      action: () => triggerImageUpload(store, toast)
    },
    // --- Exports ---
    {
      id: 'export-region',
      category: 'Export',
      title: 'Export Region Screenshot',
      subtitle: 'Crop a specific rectangle with satisfying peel',
      shortcut: 'E',
      icon: <Download className="w-4 h-4 text-sky-500" />,
      action: () => { store.setTool('export'); toast('Draw an export bounding box', '#6366F1'); }
    },
    {
      id: 'export-json',
      category: 'Export',
      title: 'Download JSON State',
      subtitle: 'Backup board elements and configuration locally',
      icon: <Download className="w-4 h-4 text-sky-500" />,
      action: () => {
        const data = { boardName: store.boardName, elements: store.elements };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'canvex-backup.json';
        a.click();
        URL.revokeObjectURL(url);
        toast('Board JSON downloaded', '#6366F1');
      }
    },
    // --- Stacking / Edits ---
    {
      id: 'layer-front',
      category: 'Layer Stacking',
      title: 'Bring Element to Front',
      subtitle: 'Push selected shapes to topmost z-layer',
      shortcut: ']',
      icon: <Layers className="w-4 h-4 text-violet-500" />,
      action: () => {
        if (!store.selected.length) return toast('Select an element first', '#F43F5E');
        store.pushHistory();
        const maxZ = Math.max(...store.elements.map((x) => x.z || 0));
        store.updateElement(store.selected[0], { z: maxZ + 1 });
        toast('Brought to front', '#6366F1');
      }
    },
    {
      id: 'layer-back',
      category: 'Layer Stacking',
      title: 'Send Element to Back',
      subtitle: 'Push selected shapes to bottom z-layer',
      shortcut: '[',
      icon: <Layers className="w-4 h-4 text-violet-500" />,
      action: () => {
        if (!store.selected.length) return toast('Select an element first', '#F43F5E');
        store.pushHistory();
        const minZ = Math.min(...store.elements.map((x) => x.z || 0));
        store.updateElement(store.selected[0], { z: minZ - 1 });
        toast('Sent to back', '#6366F1');
      }
    },
    // --- Danger zone ---
    {
      id: 'delete-selected',
      category: 'Danger Zone',
      title: 'Delete Selected Items',
      subtitle: 'Instantly purge highlighted components',
      shortcut: 'Del',
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      action: () => {
        if (!store.selected.length) return toast('Select items to delete', '#F43F5E');
        store.deleteSelected();
        toast('Deleted items', '#F43F5E');
      }
    },
    {
      id: 'clear-board',
      category: 'Danger Zone',
      title: 'Clear Canvas Board completely',
      subtitle: 'Wipe all items and structural layout elements',
      icon: <Trash2 className="w-4 h-4 text-red-500" />,
      action: () => {
        if (confirm('Are you absolutely sure you want to clear the canvas?')) {
          store.pushHistory();
          store.setElements([]);
          store.setSelected([]);
          toast('Canvas board completely wiped', '#F43F5E');
        }
      }
    },
    // --- Help ---
    {
      id: 'help-shortcuts',
      category: 'Help',
      title: 'Keyboard Shortcuts Guide',
      subtitle: 'Open the cheat sheet overlay for CANVEX',
      shortcut: '?',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      action: () => onOpenHelp()
    }
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(search.toLowerCase()) ||
      cmd.category.toLowerCase().includes(search.toLowerCase()) ||
      cmd.subtitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[activeIndex]) {
        filtered[activeIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/25 dark:bg-black/45 backdrop-blur-md z-[100] flex justify-center items-start pt-[12vh] pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[560px] mx-4 rounded-2xl glass overflow-hidden border border-borderLine flex flex-col max-h-[500px] shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 border-b border-borderLine">
          <Search className="w-5 h-5 text-mutedText flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="w-full h-14 bg-transparent text-primaryText font-ui text-[15px] outline-none placeholder:text-mutedText"
            placeholder="Search commands (e.g. Zoom, Grid, Export)..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setActiveIndex(0);
            }}
          />
          <span className="font-ui text-[10px] text-mutedText border border-borderLine px-2 py-0.5 rounded shadow-sm flex-shrink-0">
            ESC
          </span>
        </div>

        {/* Commands List */}
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-12 text-center font-ui text-xs text-mutedText">
              No commands matching "{search}" found.
            </div>
          ) : (
            <div>
              {filtered.map((cmd, idx) => {
                const isActive = idx === activeIndex;
                
                // Render category headers
                const showHeader = idx === 0 || filtered[idx - 1].category !== cmd.category;

                return (
                  <div key={cmd.id}>
                    {showHeader && (
                      <div className="font-ui text-[10px] font-black text-mutedText tracking-widest uppercase px-3 pt-3 pb-1">
                        {cmd.category}
                      </div>
                    )}
                    <button
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      className={`w-full text-left h-12 px-3 rounded-xl flex items-center gap-3.5 transition-all ${
                        isActive
                          ? 'bg-indigo-500/10 text-primaryText scale-[1.01]'
                          : 'text-secondaryText hover:bg-hover hover:text-primaryText'
                      }`}
                    >
                      <div className="flex-shrink-0">{cmd.icon}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-ui text-xs font-black truncate">{cmd.title}</div>
                        <div className="font-body text-[10px] text-mutedText truncate">{cmd.subtitle}</div>
                      </div>
                      {cmd.shortcut && (
                        <span className="font-ui text-[10px] text-mutedText bg-surface/60 border border-borderLine px-2 py-0.5 rounded shadow-xs flex-shrink-0">
                          {cmd.shortcut}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Command Footer hints */}
        <div className="h-9 px-4 border-t border-borderLine/35 bg-surface/20 flex items-center justify-between font-ui text-[10px] text-mutedText select-none">
          <div className="flex gap-4">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
          </div>
          <span>⌘K to close</span>
        </div>
      </div>
    </div>
  );
};
