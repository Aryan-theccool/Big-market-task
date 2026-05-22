'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { Header } from '../../components/ui/Header';
import { LeftToolRail } from '../../components/ui/LeftToolRail';
import { CanvasViewport } from '../../components/canvas/CanvasViewport';
import { InspectorPanel } from '../../components/ui/InspectorPanel';
import { StatusBar } from '../../components/ui/StatusBar';
import { CanvasMiniMap } from '../../components/canvas/CanvasMiniMap';
import { CommandPalette } from '../../components/ui/CommandPalette';
import { X, Crop, Download, Info } from 'lucide-react';
import { triggerImageUpload } from '../../utils/imageHelper';

interface Toast {
  id: string;
  message: string;
  color: string;
}

export default function BoardPage() {
  const store = useCanvasStore();
  const boardRef = useRef<HTMLDivElement>(null);
  
  // Viewport sizes for Fit actions
  const [vpSize, setVpSize] = useState({ w: 1200, h: 800 });

  // Notifications Stack
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (message: string, color = '#6366F1') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, color }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  // Overlays
  const [helpOpen, setHelpOpen] = useState(false);
  const [cmdOpen, setCmdOpen] = useState(false);

  // Region crop coordinates & triggers
  const [regionStart, setRegionStart] = useState<{ x: number; y: number } | null>(null);
  const [regionBox, setRegionBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [exportFormat, setExportFormat] = useState<'PNG' | 'SVG'>('PNG');
  const [exportScale, setExportScale] = useState<number>(2);
  const [exportBg, setExportBg] = useState<'Transparent' | 'Canvas'>('Canvas');
  const [isWipePlaying, setIsWipePlaying] = useState(true);

  // Measure viewport wrapper on resize/mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Play intro sweep swipe animation
    const timer = setTimeout(() => setIsWipePlaying(false), 900);

    const handleResize = () => {
      if (boardRef.current) {
        setVpSize({
          w: boardRef.current.clientWidth,
          h: boardRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial measurement
    
    addToast('Welcome to CANVEX Whiteboard App', '#6366F1');

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Keyboard Hotkeys Manager
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Allow writing inside editable boxes
      const activeEl = document.activeElement;
      const isEditable = activeEl?.getAttribute('contenteditable') === 'true' || 
                         activeEl?.tagName === 'INPUT' || 
                         activeEl?.tagName === 'TEXTAREA';
      
      if (isEditable) {
        if (e.key === 'Escape') {
          (activeEl as HTMLElement).blur();
          store.setTool('select');
        }
        return;
      }

      // Command Palette (⌘K)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdOpen((prev) => !prev);
        return;
      }

      // Undo (⌘Z)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          store.redo();
          addToast('Redo', '#10B981');
        } else {
          store.undo();
          addToast('Undo', '#0EA5E9');
        }
        return;
      }

      // Redo (⌘Y)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        store.redo();
        addToast('Redo', '#10B981');
        return;
      }

      // Copy (⌘C)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        store.copySelected();
        addToast('Selected copied', '#6366F1');
        return;
      }


      // Duplicate (⌘D)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        store.duplicateSelected();
        addToast('Duplicated selected elements', '#6366F1');
        return;
      }

      // Delete (Backspace / Delete)
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        if (store.selected.length) {
          store.deleteSelected();
          addToast('Deleted element', '#F43F5E');
        }
        return;
      }

      // Layer stack reordering hotkeys
      if (e.key === '[') {
        e.preventDefault();
        if (store.selected.length === 1) {
          const id = store.selected[0];
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            store.sendToBack(id);
            addToast('Sent element to back', '#6366F1');
          } else {
            store.sendBackward(id);
            addToast('Sent element backward', '#6366F1');
          }
        }
        return;
      }

      if (e.key === ']') {
        e.preventDefault();
        if (store.selected.length === 1) {
          const id = store.selected[0];
          if (e.shiftKey || e.metaKey || e.ctrlKey) {
            store.bringToFront(id);
            addToast('Brought element to front', '#6366F1');
          } else {
            store.bringForward(id);
            addToast('Brought element forward', '#6366F1');
          }
        }
        return;
      }

      // Escape keys (Cancel active tools)
      if (e.key === 'Escape') {
        e.preventDefault();
        store.setTool('select');
        setRegionBox(null);
        setRegionStart(null);
        addToast('Selection reset', '#6366F1');
        return;
      }

      // Single character tool select bindings
      const key = e.key.toLowerCase();
      switch (key) {
        case 'v':
          store.setTool('select');
          break;
        case 'h':
          store.setTool('hand');
          break;
        case 'n':
          store.setTool('note');
          break;
        case 'r':
          store.setTool('rect');
          break;
        case 'c':
          store.setTool('circle');
          break;
        case 'l':
          store.setTool('line');
          break;
        case 'a':
          store.setTool('arrow');
          break;
        case 'd':
          store.setTool('draw');
          break;
        case 't':
          store.setTool('text');
          break;
        case 'i':
          triggerImageUpload(store, addToast);
          break;
        case 'f':
          store.setTool('frame');
          break;
        case 's':
          store.setTool('lasso');
          break;
        case 'e':
          store.setTool('export');
          addToast('Draw an export crop region', '#6366F1');
          break;
        case '?':
          setHelpOpen(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [store]);

  // Actual Download Action for cropped region screenshots
  const handleDownloadCrop = () => {
    if (!regionBox) return;

    // Trigger simulated download with satisfying pop-out animations
    addToast('Preparing high-fidelity render of crop region...', '#6366F1');
    
    // Animate bounding crop elements
    const element = document.getElementById('regionExportPanel');
    if (element) {
      element.classList.add('peel');
      setTimeout(() => {
        element.classList.remove('peel');
        setRegionBox(null);
        store.setTool('select');
        addToast('Region cropped successfully!', '#10B981');
      }, 500);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-canvas transition-colors duration-300" ref={boardRef}>
      {/* Dynamic Page Intro Sweep Transition */}
      {isWipePlaying && (
        <div className="fixed inset-0 z-[50000] bg-gradient-to-r from-indigo-500 to-violet-600 animate-page-wipe pointer-events-none" />
      )}

      {/* Header and Brand Layer */}
      <Header 
        toast={addToast} 
        onOpenHelp={() => setHelpOpen(true)}
        viewportRef={boardRef}
      />

      {/* Primary SVG / HTML interactive Viewport */}
      <CanvasViewport
        viewportRef={boardRef}
        regionStart={regionStart}
        setRegionStart={setRegionStart}
        regionBox={regionBox}
        setRegionBox={setRegionBox}
        toast={addToast}
      />

      {/* Left Tool rail */}
      <LeftToolRail toast={addToast} />

      {/* Right Properties inspector for elements styles */}
      <InspectorPanel toast={addToast} />

      {/* Interactive Minimap */}
      <CanvasMiniMap 
        viewportWidth={vpSize.w} 
        viewportHeight={vpSize.h} 
      />

      {/* Bottom Status bar metrics */}
      <StatusBar 
        toast={addToast}
        viewportWidth={vpSize.w}
        viewportHeight={vpSize.h}
      />

      {/* Active Crop selection banner */}
      {store.activeTool === 'export' && !regionBox && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 bg-panel border border-borderLine px-4 py-2.5 rounded-full shadow-md z-30 font-ui text-[11px] text-primaryText flex items-center gap-2 animate-fade-slide-up">
          <Crop className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
          <span>Click and drag to define your export area</span>
          <span className="text-[9px] text-mutedText border border-borderLine px-1 rounded shadow-xs ml-1">ESC</span>
          <span>to cancel</span>
        </div>
      )}

      {/* Region Export Details Customizer Box */}
      {regionBox && (
        <div 
          id="regionExportPanel"
          className="absolute left-1/2 top-20 -translate-x-1/2 w-[340px] rounded-2xl glass p-4 pointer-events-auto z-40 flex flex-col gap-3.5 shadow-xl border border-borderLine animate-scale-in"
        >
          <div className="flex items-center justify-between border-b border-borderLine pb-2">
            <span className="font-ui text-xs font-black tracking-wide text-primaryText uppercase flex items-center gap-1.5">
              ✂ Region Crop Export
            </span>
            <button 
              className="text-xs hover:bg-hover px-2 py-0.5 rounded text-mutedText"
              onClick={() => { setRegionBox(null); store.setTool('select'); }}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] text-mutedText uppercase font-bold tracking-wider">Format</label>
            <div className="flex gap-1.5 p-1 rounded-xl bg-hover border border-borderLine">
              <button
                onClick={() => setExportFormat('PNG')}
                className={`flex-1 h-7 rounded-lg font-ui text-xs font-bold transition-all ${
                  exportFormat === 'PNG' ? 'bg-surface text-indigo-500 shadow-sm' : 'text-secondaryText hover:text-primaryText'
                }`}
              >
                PNG
              </button>
              <button
                onClick={() => setExportFormat('SVG')}
                className={`flex-1 h-7 rounded-lg font-ui text-xs font-bold transition-all ${
                  exportFormat === 'SVG' ? 'bg-surface text-indigo-500 shadow-sm' : 'text-secondaryText hover:text-primaryText'
                }`}
              >
                SVG
              </button>
            </div>
          </div>

          {exportFormat === 'PNG' && (
            <div className="flex flex-col gap-1">
              <label className="font-ui text-[10px] text-mutedText uppercase font-bold tracking-wider">Scale</label>
              <div className="flex gap-1.5 p-1 rounded-xl bg-hover border border-borderLine">
                {[1, 2, 4].map((scaleVal) => (
                  <button
                    key={scaleVal}
                    onClick={() => setExportScale(scaleVal)}
                    className={`flex-1 h-7 rounded-lg font-ui text-xs font-bold transition-all ${
                      exportScale === scaleVal ? 'bg-surface text-indigo-500 shadow-sm' : 'text-secondaryText hover:text-primaryText'
                    }`}
                  >
                    {scaleVal}x
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] text-mutedText uppercase font-bold tracking-wider">Background</label>
            <div className="flex gap-1.5 p-1 rounded-xl bg-hover border border-borderLine">
              {(['Transparent', 'Canvas'] as const).map((bgType) => (
                <button
                  key={bgType}
                  onClick={() => setExportBg(bgType)}
                  className={`flex-1 h-7 rounded-lg font-ui text-xs font-bold transition-all ${
                    exportBg === bgType ? 'bg-surface text-indigo-500 shadow-sm' : 'text-secondaryText hover:text-primaryText'
                  }`}
                >
                  {bgType}
                </button>
              ))}
            </div>
          </div>

          {/* Simple thumbnail preview mockup */}
          <div className="h-[74px] rounded-xl border border-borderLine bg-surface/50 overflow-hidden flex items-center justify-center relative shadow-inner">
            <span className="font-ui text-[9px] text-mutedText uppercase tracking-wider flex items-center gap-1.5 select-none">
              <Info className="w-3.5 h-3.5 text-indigo-400" />
              {Math.round(regionBox.w)} × {Math.round(regionBox.h)} px Clip
            </span>
          </div>

          <button
            onClick={handleDownloadCrop}
            className="h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-ui text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Crop Clip
          </button>
        </div>
      )}

      {/* Notification Toast HUD */}
      <div className="absolute right-4 top-16 z-[1000] flex flex-col gap-2.5 pointer-events-none w-80">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            className="w-full rounded-2xl glass p-3.5 pointer-events-none flex flex-col gap-2.5 shadow-lg border border-borderLine animate-toast-in overflow-hidden"
          >
            <div className="flex items-center gap-2.5 font-ui text-[12px] font-bold text-primaryText">
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: toastItem.color }} />
              <span className="w-2 h-2 rounded-full absolute" style={{ backgroundColor: toastItem.color }} />
              <span>{toastItem.message}</span>
            </div>
            <div 
              className="h-[2.5px] rounded-full overflow-hidden" 
              style={{
                background: `linear-gradient(90deg, ${toastItem.color}, #8B5CF6)`
              }}
            >
              <div className="h-full bg-white/20 animate-toast-bar origin-left" />
            </div>
          </div>
        ))}
      </div>

      {/* Immersive Keyboard Shortcuts Help Modal Overlay */}
      {helpOpen && (
        <div 
          className="fixed inset-0 bg-black/25 dark:bg-black/45 backdrop-blur-md z-[500] flex justify-center items-center pointer-events-auto"
          onClick={() => setHelpOpen(false)}
        >
          <div 
            className="w-full max-w-[700px] mx-4 rounded-3xl glass p-6 shadow-2xl overflow-y-auto max-h-[82vh] border border-borderLine animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-borderLine pb-4 mb-4">
              <div>
                <h2 className="font-display text-4xl font-bold tracking-tight text-primaryText">
                  Think in space.
                </h2>
                <p className="font-body text-xs text-mutedText mt-1">
                  Keyboard shortcuts to accelerate your spatial flow in CANVEX
                </p>
              </div>
              <button 
                className="w-8 h-8 rounded-full hover:bg-hover flex items-center justify-center border border-borderLine text-mutedText transition-colors"
                onClick={() => setHelpOpen(false)}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest pl-1">
                  Shape Tools
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Select Tool</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">V</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Hand Pan</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">H</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Sticky Note</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">N</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Rectangle</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">R</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Circle</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">C</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Freehand Pen</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">D</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="font-ui text-[10px] font-black text-indigo-500 uppercase tracking-widest pl-1">
                  Actions & Overlays
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Command Bar</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">⌘K</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Undo</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">⌘Z</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Duplicate</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">⌘D</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Lasso Select</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">S</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Crop Region</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">E</span>
                  </div>
                  <div className="rounded-xl bg-hover border border-borderLine p-2.5 flex items-center justify-between font-ui text-[11px] text-primaryText">
                    <span>Help Guide</span>
                    <span className="bg-surface border border-borderLine px-2 py-0.5 rounded text-[10px] text-mutedText font-black">?</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 rounded-2xl bg-indigo-500/8 border border-indigo-500/20 p-4 font-body text-xs text-secondaryText leading-relaxed flex items-center gap-3.5">
              <span className="text-xl">💡</span>
              <p>
                Pressing <span className="font-ui font-black bg-surface border border-borderLine rounded px-1 text-[10px] text-primaryText">SPACE</span> while drawing triggers the Hand Pan tool instantaneously, letting you scroll infinite board areas without changing your active pen tool.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fuzzy search Command Palette */}
      <CommandPalette
        isOpen={cmdOpen}
        onClose={() => setCmdOpen(false)}
        toast={addToast}
        onOpenHelp={() => { setCmdOpen(false); setHelpOpen(true); }}
        viewportWidth={vpSize.w}
        viewportHeight={vpSize.h}
      />
    </div>
  );
}
