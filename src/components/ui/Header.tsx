'use client';

import React, { useState } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  HelpCircle, 
  Upload, 
  Download, 
  ChevronDown, 
  Sun, 
  Moon, 
  Users 
} from 'lucide-react';
import { compressAndResizeImage } from '../../utils/imageHelper';

interface HeaderProps {
  toast: (msg: string, color?: string) => void;
  onOpenHelp: () => void;
  viewportRef: React.RefObject<HTMLDivElement>;
}

export const Header: React.FC<HeaderProps> = ({ toast, onOpenHelp, viewportRef }) => {
  const store = useCanvasStore();
  const [exportOpen, setExportOpen] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    store.setBoardName(e.target.value);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      toast('Processing imported image...', '#6366F1');
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Str = event.target?.result as string;
        const state = useCanvasStore.getState();
        const viewportW = window.innerWidth;
        const viewportH = window.innerHeight;
        
        const centerX = (viewportW / 2 - state.viewport.x) / state.viewport.zoom;
        const centerY = (viewportH / 2 - state.viewport.y) / state.viewport.zoom;

        const compressed = await compressAndResizeImage(base64Str);

        store.addElement({
          id: 'el_' + Math.random().toString(36).slice(2, 9),
          type: 'image',
          x: centerX - compressed.w / 2,
          y: centerY - compressed.h / 2,
          w: compressed.w,
          h: compressed.h,
          src: compressed.src,
          z: Date.now() % 100000,
        });
        toast('Image imported successfully!', '#10B981');
      };
      reader.readAsDataURL(file);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = reader.result as string;
        const cleanText = text.replace(/^\ufeff/, '');
        const data = JSON.parse(cleanText);
        
        let elements = null;
        let boardName = store.boardName;
        let viewport = store.viewport;

        if (Array.isArray(data)) {
          elements = data;
        } else if (data && typeof data === 'object') {
          elements = Array.isArray(data.elements) ? data.elements : null;
          if (data.boardName) boardName = data.boardName;
          if (data.viewport) viewport = data.viewport;
        }

        if (elements) {
          store.importBoard(elements, boardName, viewport);
          toast('Board imported successfully!', '#10B981');
        } else {
          toast('Invalid board file structure: "elements" array not found', '#F43F5E');
        }
      } catch (err) {
        toast('Failed to parse board file: invalid JSON format', '#F43F5E');
      }
      
      // Reset input value so onChange can be triggered for the same file consecutively
      e.target.value = '';
    };
    reader.readAsText(file);
  };

  const handleExportJSON = () => {
    const data = {
      boardName: store.boardName,
      viewport: store.viewport,
      elements: store.elements,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.boardName.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Board state exported as JSON', '#6366F1');
    setExportOpen(false);
  };

  const triggerRegionExport = () => {
    store.setTool('export');
    toast('Select region to export · Esc to cancel', '#6366F1');
    setExportOpen(false);
  };

  const handleExportSVG = () => {
    if (!viewportRef.current) return;
    
    // Simple mock visibility export as per Vanilla
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" width="100%" height="100%">
      <rect width="100%" height="100%" fill="${store.theme === 'light' ? '#F7F6F3' : '#0C0B10'}" />
      ${store.elements.map(el => {
        if (el.type === 'rect') return `<rect x="${el.x}" y="${el.y}" width="${el.w || 100}" height="${el.h || 60}" rx="${el.radius || 8}" fill="${el.fill || 'rgba(99,102,241,0.08)'}" stroke="${el.stroke || '#6366F1'}" stroke-width="${el.strokeWidth || 2}" />`;
        if (el.type === 'circle') return `<ellipse cx="${el.x + (el.w || 100)/2}" cy="${el.y + (el.h || 60)/2}" rx="${(el.w || 100)/2}" ry="${(el.h || 60)/2}" fill="${el.fill || 'rgba(99,102,241,0.08)'}" stroke="${el.stroke || '#6366F1'}" stroke-width="${el.strokeWidth || 2}" />`;
        if (el.type === 'note') return `<rect x="${el.x}" y="${el.y}" width="${el.w || 220}" height="${el.h || 220}" rx="12" fill="#FEF3C7" stroke="rgba(0,0,0,0.06)" stroke-width="1" />`;
        if (el.type === 'text') return `<text x="${el.x}" y="${el.y + 30}" font-family="sans-serif" font-size="30" fill="${el.stroke || '#1A1523'}">${el.text || ''}</text>`;
        return '';
      }).join('\n')}
    </svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${store.boardName.toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    toast('Visible SVG exported', '#6366F1');
    setExportOpen(false);
  };

  return (
    <header className="absolute top-0 left-0 right-0 h-14 bg-panel backdrop-blur-md border-b border-borderLine flex items-center gap-4 px-4 z-30 select-none shadow-sm pointer-events-auto">
      {/* Brand Logomark */}
      <div className="flex items-center gap-2">
        <svg 
          className="w-7 h-7 filter drop-shadow-[0_8px_18px_rgba(99,102,241,0.25)] text-indigo-500" 
          viewBox="0 0 32 32"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M16 3 L27 9.5 V22.5 L16 29 L5 22.5 V9.5 Z" />
          <path d="M23 23 L29 29" className="text-indigo-400" />
        </svg>
        <span className="font-ui text-sm font-black tracking-widest text-primaryText uppercase hidden sm:inline">
          CANVEX
        </span>
      </div>

      <div className="w-[1px] h-5 bg-borderLine hidden sm:block" />

      {/* Editable Board Title */}
      <div className="flex items-center gap-1.5 max-w-[200px] sm:max-w-xs">
        <input
          type="text"
          value={store.boardName}
          onChange={handleNameChange}
          className="font-display italic text-lg sm:text-xl font-bold bg-transparent text-primaryText focus:bg-hover hover:bg-hover px-2 py-0.5 rounded-lg outline-none w-full transition-colors border border-transparent focus:border-borderLine"
          placeholder="Untitled Board"
        />
      </div>

      <div className="flex-1" />

      {/* Control Actions & Buttons */}
      <div className="flex items-center gap-2">
        {/* Help Menu Trigger */}
        <button
          onClick={onOpenHelp}
          className="h-9 px-3.5 rounded-xl border border-borderLine text-mutedText hover:bg-hover hover:text-primaryText font-ui text-xs font-bold transition-all flex items-center gap-1.5"
          title="Keyboard Shortcuts Guide"
        >
          <HelpCircle className="w-4 h-4 text-indigo-500" />
          <span className="hidden md:inline">Help</span>
        </button>

        {/* Dynamic Board Import */}
        <label 
          htmlFor="canvex-import-input"
          className="h-9 px-3.5 rounded-xl border border-borderLine text-mutedText hover:bg-hover hover:text-primaryText font-ui text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none"
        >
          <Upload className="w-4 h-4 text-indigo-500" />
          <span className="hidden md:inline">Import</span>
        </label>
        <input
          id="canvex-import-input"
          type="file"
          accept=".json,application/json,image/*"
          onChange={handleImport}
          className="hidden"
        />

        {/* Active Collaborator Badges */}
        <div className="hidden sm:flex items-center ml-2 border border-borderLine rounded-full p-0.5 bg-surface/50">
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-surface relative shadow-sm"
            style={{ backgroundColor: '#F43F5E' }}
            title="Priya S. (Online)"
          >
            PS
            <span className="absolute -right-0.5 -bottom-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-surface" />
          </div>
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-surface -ml-2.5 relative shadow-sm"
            style={{ backgroundColor: '#10B981' }}
            title="James K. (Active)"
          >
            JK
          </div>
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white border-2 border-surface -ml-2.5 relative shadow-sm"
            style={{ backgroundColor: '#F59E0B' }}
            title="Lena V. (Viewing)"
          >
            LV
          </div>
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-mutedText bg-hover border-2 border-surface -ml-2.5 relative"
            title="+1 more spectator"
          >
            +1
          </div>
        </div>

        {/* Export Dropdown Wrappers */}
        <div className="relative">
          <button
            onClick={() => setExportOpen(!exportOpen)}
            className="h-9 px-3.5 rounded-xl border border-borderLine bg-surface text-primaryText hover:bg-hover font-ui text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4 text-indigo-500" />
            <span>Export</span>
            <ChevronDown className={`w-3.5 h-3.5 text-mutedText transition-transform ${exportOpen ? 'rotate-180' : ''}`} />
          </button>

          {exportOpen && (
            <>
              {/* Invisible Click Backdrop */}
              <div 
                className="fixed inset-0 z-40 cursor-default" 
                onClick={() => setExportOpen(false)}
              />
              <div className="absolute right-0 top-11 w-56 rounded-xl glass p-1.5 z-50 flex flex-col gap-1 shadow-lg animate-scale-in">
                <button
                  onClick={triggerRegionExport}
                  className="w-full text-left h-8 px-2.5 rounded-lg text-xs font-ui text-secondaryText hover:bg-hover hover:text-primaryText flex items-center justify-between"
                >
                  <span>✂ Selection Crop</span>
                  <span className="text-[9px] text-mutedText border border-borderLine rounded px-1">E</span>
                </button>
                <button
                  onClick={handleExportSVG}
                  className="w-full text-left h-8 px-2.5 rounded-lg text-xs font-ui text-secondaryText hover:bg-hover hover:text-primaryText flex items-center justify-between"
                >
                  <span>⬡ Visible SVG</span>
                  <span className="text-[9px] text-mutedText border border-borderLine rounded px-1">SVG</span>
                </button>
                <button
                  onClick={() => {
                    toast('Compiling canvas to high-res PNG...', '#6366F1');
                    setExportOpen(false);
                  }}
                  className="w-full text-left h-8 px-2.5 rounded-lg text-xs font-ui text-secondaryText hover:bg-hover hover:text-primaryText flex items-center justify-between"
                >
                  <span>▣ Visible PNG</span>
                  <span className="text-[9px] text-mutedText border border-borderLine rounded px-1">PNG</span>
                </button>
                <div className="h-[1px] bg-borderLine my-1" />
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left h-8 px-2.5 rounded-lg text-xs font-ui text-secondaryText hover:bg-hover hover:text-primaryText flex items-center justify-between"
                >
                  <span>{} Board State JSON</span>
                  <span className="text-[9px] text-mutedText border border-borderLine rounded px-1">JSON</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Cinematic Theme Toggle Pill */}
        <button
          onClick={store.toggleTheme}
          className="h-9 w-16 rounded-full p-1 bg-hover border border-borderLine relative flex items-center justify-between text-mutedText overflow-hidden"
          title="Toggle Light/Dark Theme"
        >
          <div 
            className="absolute top-1 bottom-1 w-7 rounded-full bg-surface shadow-sm transition-transform duration-300"
            style={{
              transform: store.theme === 'dark' ? 'translateX(28px)' : 'translateX(0px)'
            }}
          />
          <span className="z-10 text-[11px] ml-1.5">☀</span>
          <span className="z-10 text-[11px] mr-1.5">🌙</span>
        </button>
      </div>
    </header>
  );
};
