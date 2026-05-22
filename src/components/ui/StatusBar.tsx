'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import { 
  Grid, 
  Magnet, 
  Map, 
  Minimize2, 
  RotateCcw, 
  RotateCw, 
  ZoomIn, 
  ZoomOut 
} from 'lucide-react';

interface StatusBarProps {
  toast: (msg: string, color?: string) => void;
  viewportWidth: number;
  viewportHeight: number;
}

export const StatusBar: React.FC<StatusBarProps> = ({ toast, viewportWidth, viewportHeight }) => {
  const store = useCanvasStore();

  const handleZoomOut = () => {
    const nz = Math.max(0.1, store.viewport.zoom - 0.1);
    store.setViewport({ zoom: nz });
  };

  const handleZoomIn = () => {
    const nz = Math.min(4.0, store.viewport.zoom + 0.1);
    store.setViewport({ zoom: nz });
  };

  const handleZoomReset = () => {
    store.setViewport({ zoom: 1 });
    toast('Zoom reset to 100%', '#6366F1');
  };

  const handleFit = () => {
    store.fitToScreen(viewportWidth, viewportHeight);
    toast('Viewport fit to elements', '#6366F1');
  };

  const handleGrid = () => {
    store.toggleGrid();
    toast(store.showGrid ? 'Grid lines disabled' : 'Grid lines enabled', '#6366F1');
  };

  const handleSnap = () => {
    store.toggleSnap();
    toast(store.snap ? 'Grid snapping disabled' : 'Grid snapping enabled', '#6366F1');
  };

  const handleMini = () => {
    store.toggleMini();
    toast(store.showMini ? 'Minimap hidden' : 'Minimap displayed', '#6366F1');
  };

  const hasPast = store.history.past.length > 0;
  const hasFuture = store.history.future.length > 0;

  return (
    <div className="absolute left-0 right-0 bottom-0 h-9 bg-panel backdrop-blur-md border-t border-borderLine flex items-center gap-3 px-4 z-30 font-ui text-[11px] text-secondaryText shadow-sm select-none pointer-events-auto">
      {/* Zoom Controls */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={handleZoomOut}
          className="h-6 w-6 rounded-md hover:bg-hover hover:text-indigo-500 transition-colors flex items-center justify-center"
          title="Zoom Out"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleZoomReset}
          className="h-6 px-1.5 rounded-md hover:bg-hover hover:text-indigo-500 font-bold transition-colors"
          title="Reset Zoom to 100%"
        >
          {Math.round(store.viewport.zoom * 100)}%
        </button>
        <button
          onClick={handleZoomIn}
          className="h-6 w-6 rounded-md hover:bg-hover hover:text-indigo-500 transition-colors flex items-center justify-center"
          title="Zoom In"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="w-[1px] h-3.5 bg-borderLine" />

      {/* Viewport Fit */}
      <button
        onClick={handleFit}
        disabled={store.elements.length === 0}
        className={`h-6 px-2 rounded-md hover:bg-hover hover:text-indigo-500 transition-colors flex items-center gap-1 font-bold ${
          store.elements.length === 0 ? 'opacity-40 cursor-not-allowed' : ''
        }`}
        title="Fit All Elements on Screen"
      >
        <Minimize2 className="w-3.5 h-3.5" />
        <span>Fit Screen</span>
      </button>

      <div className="w-[1px] h-3.5 bg-borderLine" />

      {/* Settings Toggles */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleGrid}
          className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold transition-colors ${
            store.showGrid
              ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/18'
              : 'hover:bg-hover text-mutedText hover:text-primaryText'
          }`}
          title="Toggle Grid Lines visibility"
        >
          <Grid className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Grid</span>
        </button>
        <button
          onClick={handleSnap}
          className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold transition-colors ${
            store.snap
              ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/18'
              : 'hover:bg-hover text-mutedText hover:text-primaryText'
          }`}
          title="Toggle Grid Snapping (24px interval)"
        >
          <Magnet className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Snap</span>
        </button>
        <button
          onClick={handleMini}
          className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold transition-colors ${
            store.showMini
              ? 'bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/18'
              : 'hover:bg-hover text-mutedText hover:text-primaryText'
          }`}
          title="Toggle Canvas Minimap overlay"
        >
          <Map className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Map</span>
        </button>
      </div>

      <div className="w-[1px] h-3.5 bg-borderLine" />

      {/* Object Count */}
      <span className="font-medium">
        {store.elements.length} {store.elements.length === 1 ? 'object' : 'objects'}
      </span>

      <div className="flex-grow" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => {
            store.undo();
            toast('Undo', '#0EA5E9');
          }}
          disabled={!hasPast}
          className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold transition-colors ${
            hasPast
              ? 'hover:bg-hover text-secondaryText hover:text-indigo-500'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title="Undo Action (⌘Z)"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Undo</span>
        </button>
        <button
          onClick={() => {
            store.redo();
            toast('Redo', '#10B981');
          }}
          disabled={!hasFuture}
          className={`h-6 px-2 rounded-md flex items-center gap-1 font-bold transition-colors ${
            hasFuture
              ? 'hover:bg-hover text-secondaryText hover:text-indigo-500'
              : 'opacity-40 cursor-not-allowed'
          }`}
          title="Redo Action (⌘Y)"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Redo</span>
        </button>
      </div>
    </div>
  );
};
