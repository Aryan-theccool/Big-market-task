'use client';

import React from 'react';
import { useCanvasStore, CanvasElement } from '../../store/canvasStore';
import { Trash2, ArrowUp, ArrowDown, ChevronUp, ChevronDown, LayoutGrid, CheckSquare } from 'lucide-react';

interface InspectorPanelProps {
  toast: (msg: string, color?: string) => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ toast }) => {
  const store = useCanvasStore();
  
  if (!store.selected.length) return null;

  const isMultiSelect = store.selected.length > 1;

  // Handle Multi-select inspector layout
  if (isMultiSelect) {
    return (
      <aside className="absolute right-4 top-16 bottom-12 w-66 rounded-2xl glass p-4 pointer-events-auto z-25 flex flex-col gap-4 shadow-lg overflow-y-auto animate-scale-in">
        <div className="flex items-center justify-between border-b border-borderLine pb-2.5">
          <span className="font-ui text-xs font-black tracking-wide text-primaryText uppercase">
            {store.selected.length} Selected
          </span>
          <button 
            className="text-xs hover:bg-hover px-2 py-1 rounded" 
            onClick={() => store.setSelected([])}
          >
            ×
          </button>
        </div>

        <div className="flex gap-2">
          <button 
            className="flex-1 text-[11px] font-ui h-8 border border-borderLine hover:bg-hover rounded-lg transition-colors flex items-center justify-center gap-1.5"
            onClick={() => {
              store.setSelected(store.selected);
              toast('Group created (visual grouping ready)', '#6366F1');
            }}
          >
            <LayoutGrid className="w-3.5 h-3.5" /> Group ⌘G
          </button>
          <button 
            className="flex-1 text-[11px] font-ui h-8 border border-borderLine hover:bg-red-500/10 text-red-500 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            onClick={() => {
              store.deleteSelected();
              toast('Deleted elements', '#F43F5E');
            }}
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>

        {/* Alignment */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Align Objects</label>
          <div className="grid grid-cols-3 gap-1.5">
            <button 
              className="h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors"
              onClick={() => { store.alignSelection('left'); toast('Aligned Left', '#6366F1'); }}
              title="Align Left"
            >
              ⊣ Left
            </button>
            <button 
              className="h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors"
              onClick={() => { store.alignSelection('center'); toast('Aligned Center', '#6366F1'); }}
              title="Align Center"
            >
              ⊥ Center
            </button>
            <button 
              className="h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors"
              onClick={() => { store.alignSelection('right'); toast('Aligned Right', '#6366F1'); }}
              title="Align Right"
            >
              ⊢ Right
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <button 
              className="h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors"
              onClick={() => { store.alignSelection('top'); toast('Aligned Top', '#6366F1'); }}
              title="Align Top"
            >
              ⊤ Top
            </button>
            <button 
              className="h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors"
              onClick={() => { store.alignSelection('middle'); toast('Aligned Middle', '#6366F1'); }}
              title="Align Middle"
            >
              ⊞ Mid
            </button>
            <button 
              className="h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors"
              onClick={() => { store.alignSelection('bottom'); toast('Aligned Bottom', '#6366F1'); }}
              title="Align Bottom"
            >
              ⊦ Btm
            </button>
          </div>
        </div>

        {/* Distribution */}
        <div className="flex flex-col gap-2">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Distribute</label>
          <div className="flex gap-2">
            <button 
              className="flex-1 h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors flex items-center justify-center gap-1.5"
              onClick={() => { store.distributeSelection('x'); toast('Distributed Horizontally', '#6366F1'); }}
              title="Distribute Horizontally"
            >
              ↔ Horizontal
            </button>
            <button 
              className="flex-1 h-8 border border-borderLine rounded-lg font-ui text-xs hover:bg-hover transition-colors flex items-center justify-center gap-1.5"
              onClick={() => { store.distributeSelection('y'); toast('Distributed Vertically', '#6366F1'); }}
              title="Distribute Vertically"
            >
              ↕ Vertical
            </button>
          </div>
        </div>
      </aside>
    );
  }

  // Single select
  const el = store.elements.find((x) => x.id === store.selected[0]);
  if (!el) return null;

  const notesPreset = { sun: '#FEF3C7', rose: '#FFE4E6', sky: '#E0F2FE', sage: '#DCFCE7', lilac: '#F3E8FF', peach: '#FFEDD5' };

  const supportsFill = ['rect', 'circle', 'frame', 'text', 'draw'].includes(el.type);
  const supportsStroke = ['rect', 'circle', 'frame', 'text', 'draw', 'line', 'arrow', 'note'].includes(el.type);
  const supportsStrokeWidth = ['rect', 'circle', 'frame', 'text', 'draw', 'line', 'arrow', 'note'].includes(el.type);
  const isLineType = ['line', 'arrow', 'draw'].includes(el.type);

  const getHexColor = (colorStr?: string) => {
    if (!colorStr) return '#6366F1';
    if (colorStr.startsWith('#')) return colorStr;
    if (colorStr.startsWith('rgb')) {
      const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return '#' + [match[1], match[2], match[3]].map((x) => (+x).toString(16).padStart(2, '0')).join('');
      }
    }
    return '#6366F1';
  };

  const handlePropChange = (prop: string, val: any) => {
    store.pushHistory();
    const patch: Partial<CanvasElement> = { [prop]: val };
    
    // Auto-adjust secondary coordinates for lines/arrows during simple X/Y input shifts
    if (['line', 'arrow'].includes(el.type) && (prop === 'x' || prop === 'y')) {
      const delta = val - el[prop as 'x' | 'y'];
      const oppositeProp = prop === 'x' ? 'x2' : 'y2';
      if (el[oppositeProp] !== undefined) {
        patch[oppositeProp] = el[oppositeProp]! + delta;
      }
    }

    store.updateElement(el.id, patch);
  };

  const handleBringFront = () => {
    store.bringToFront(el.id);
    toast('Moved element to front', '#6366F1');
  };

  const handleBringForward = () => {
    store.bringForward(el.id);
    toast('Moved element forward', '#6366F1');
  };

  const handleSendBackward = () => {
    store.sendBackward(el.id);
    toast('Moved element backward', '#6366F1');
  };

  const handleSendBack = () => {
    store.sendToBack(el.id);
    toast('Moved element to back', '#6366F1');
  };

  return (
    <aside className="absolute right-4 top-16 bottom-12 w-66 rounded-2xl glass p-4 pointer-events-auto z-25 flex flex-col gap-3.5 shadow-lg overflow-y-auto animate-scale-in">
      <div className="flex items-center justify-between border-b border-borderLine pb-2.5">
        <span className="font-ui text-xs font-black tracking-wide text-primaryText uppercase flex items-center gap-1.5">
          {el.type === 'note' ? '🗒' : el.type === 'rect' ? '▣' : el.type === 'circle' ? '○' : el.type === 'frame' ? '⬡' : '✏'} {el.type}
        </span>
        <button 
          className="text-xs hover:bg-hover px-2 py-1 rounded" 
          onClick={() => store.setSelected([])}
        >
          ×
        </button>
      </div>

      {/* Title input for Frame/Sections */}
      {el.type === 'frame' && (
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Section Name</label>
          <input
            type="text"
            className="h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none focus:border-borderFocus"
            value={el.text || 'Section Frame'}
            onChange={(e) => handlePropChange('text', e.target.value)}
          />
        </div>
      )}

      {/* Geometry coordinates */}
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">X</label>
          <input
            type="number"
            className="h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none"
            value={Math.round(el.x)}
            onChange={(e) => handlePropChange('x', +e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Y</label>
          <input
            type="number"
            className="h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none"
            value={Math.round(el.y)}
            onChange={(e) => handlePropChange('y', +e.target.value)}
          />
        </div>
      </div>

      {/* Dimensions (skipped for lines/vectors) */}
      {!isLineType && (
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Width</label>
            <input
              type="number"
              className="h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none"
              value={Math.round(el.w || 100)}
              onChange={(e) => handlePropChange('w', +e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Height</label>
            <input
              type="number"
              className="h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none"
              value={Math.round(el.h || 60)}
              onChange={(e) => handlePropChange('h', +e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Color styling properties */}
      {supportsFill && (
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Fill / Background</label>
          <div className="flex gap-2">
            <input
              type="color"
              className="h-8 w-10 p-0 rounded-md border border-borderLine bg-surface overflow-hidden outline-none cursor-pointer"
              value={getHexColor(el.fill && el.fill !== 'none' ? el.fill : '#ffffff')}
              onChange={(e) => handlePropChange('fill', e.target.value)}
            />
            <input
              type="text"
              className="flex-1 h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none"
              value={el.fill || 'none'}
              onChange={(e) => handlePropChange('fill', e.target.value)}
              placeholder="e.g. #ff0000 or none"
            />
          </div>
        </div>
      )}

      {supportsStroke && (
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">
            {el.type === 'text' ? 'Text Color' : 'Border / Stroke Color'}
          </label>
          <div className="flex gap-2">
            <input
              type="color"
              className="h-8 w-10 p-0 rounded-md border border-borderLine bg-surface overflow-hidden outline-none cursor-pointer"
              value={getHexColor(el.stroke)}
              onChange={(e) => handlePropChange('stroke', e.target.value)}
            />
            <input
              type="text"
              className="flex-1 h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2.5 outline-none"
              value={el.stroke || '#6366F1'}
              onChange={(e) => handlePropChange('stroke', e.target.value)}
            />
          </div>
        </div>
      )}

      {supportsStrokeWidth && (
        <div className="flex flex-col gap-1">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold flex justify-between">
            <span>Border / Stroke Width</span>
            <span>{el.strokeWidth !== undefined ? el.strokeWidth : 2}px</span>
          </label>
          <input
            type="range"
            min={(el.type === 'text' || el.type === 'note') ? 0 : 1}
            max="24"
            className="w-full h-1.5 bg-borderLine rounded-lg appearance-none cursor-pointer"
            value={el.strokeWidth !== undefined ? el.strokeWidth : ((el.type === 'note' || el.type === 'text') ? 0 : 2)}
            onChange={(e) => handlePropChange('strokeWidth', +e.target.value)}
          />
        </div>
      )}

      {/* Closed Path check for Freehand Drawing */}
      {el.type === 'draw' && (
        <div className="flex items-center gap-2 border-t border-borderLine/30 pt-1 my-1">
          <input
            type="checkbox"
            id="collab-close-path"
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-borderLine cursor-pointer"
            checked={!!el.closed}
            onChange={(e) => {
              store.pushHistory();
              const isClosed = e.target.checked;
              store.updateElement(el.id, {
                closed: isClosed,
                fill: isClosed && (!el.fill || el.fill === 'none') ? 'rgba(99,102,241,0.12)' : el.fill,
              });
              toast(isClosed ? 'Path Closed & Filled' : 'Path Opened', '#6366F1');
            }}
          />
          <label htmlFor="collab-close-path" className="font-ui text-[10px] text-primaryText tracking-wide cursor-pointer font-bold select-none uppercase">
            Close Path & Fill
          </label>
        </div>
      )}

      {/* Note Color presets selector */}
      {el.type === 'note' && (
        <div className="flex flex-col gap-1 border-t border-borderLine/30 pt-2.5">
          <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Note Preset Color</label>
          <select
            className="h-8 rounded-lg border border-borderLine bg-surface text-primaryText font-ui text-xs px-2 outline-none cursor-pointer"
            value={el.color || 'sun'}
            onChange={(e) => handlePropChange('color', e.target.value)}
          >
            {Object.keys(notesPreset).map((k) => (
              <option key={k} value={k}>
                {k.toUpperCase()} preset
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Layer stack options */}
      <div className="flex flex-col gap-2 border-t border-borderLine/30 pt-3">
        <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold">Stacking Layer</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            className="h-8 rounded-lg border border-borderLine hover:bg-hover font-ui text-[11px] transition-colors flex items-center justify-center gap-1.5"
            onClick={handleBringFront}
            title="Bring to absolute front"
          >
            <ArrowUp className="w-3.5 h-3.5 text-indigo-500" /> Bring Front
          </button>
          <button
            className="h-8 rounded-lg border border-borderLine hover:bg-hover font-ui text-[11px] transition-colors flex items-center justify-center gap-1.5"
            onClick={handleBringForward}
            title="Bring forward one layer"
          >
            <ChevronUp className="w-3.5 h-3.5 text-indigo-500" /> Bring Fwd
          </button>
          <button
            className="h-8 rounded-lg border border-borderLine hover:bg-hover font-ui text-[11px] transition-colors flex items-center justify-center gap-1.5"
            onClick={handleSendBackward}
            title="Send backward one layer"
          >
            <ChevronDown className="w-3.5 h-3.5 text-indigo-500" /> Send Bwd
          </button>
          <button
            className="h-8 rounded-lg border border-borderLine hover:bg-hover font-ui text-[11px] transition-colors flex items-center justify-center gap-1.5"
            onClick={handleSendBack}
            title="Send to absolute back"
          >
            <ArrowDown className="w-3.5 h-3.5 text-indigo-500" /> Send Back
          </button>
        </div>
      </div>

      {/* Delete button */}
      <button
        className="h-9 w-full mt-2 rounded-lg bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-ui text-xs font-bold transition-all flex items-center justify-center gap-2 border border-red-500/20"
        onClick={() => {
          store.deleteSelected();
          toast('Deleted Element', '#F43F5E');
        }}
      >
        <Trash2 className="w-4 h-4" /> Delete Element
      </button>

      {/* Activity Logs inside Single element */}
      <div className="border-t border-borderLine/30 mt-2.5 pt-3 select-none">
        <label className="font-ui text-[10px] text-mutedText tracking-wider uppercase font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Activity logs
        </label>
        <ul className="mt-2.5 flex flex-col gap-2 text-[10px] font-ui text-secondaryText leading-relaxed">
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Priya edited note details
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> James added vector rectangles
          </li>
          <li className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Lena joined this canvas session
          </li>
        </ul>
      </div>
    </aside>
  );
};
