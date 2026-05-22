'use client';

import React from 'react';
import { useCanvasStore } from '../../store/canvasStore';
import {
  MousePointer,
  Hand,
  StickyNote,
  Square,
  Circle,
  Slash,
  ArrowRight,
  Edit2,
  Type,
  Maximize,
  Lasso,
  Crop,
  Image as ImageIcon,
} from 'lucide-react';
import { triggerImageUpload } from '../../utils/imageHelper';

interface ToolButtonProps {
  tool: string;
  label: string;
  shortcut: string;
  icon: React.ReactNode;
}

export const LeftToolRail: React.FC<{ toast?: (msg: string, color?: string) => void }> = ({ toast }) => {
  const activeTool = useCanvasStore((s) => s.activeTool);
  const setTool = useCanvasStore((s) => s.setTool);
  const store = useCanvasStore();

  const tools: ToolButtonProps[] = [
    { tool: 'select', label: 'Select', shortcut: 'V', icon: <MousePointer className="w-5 h-5" /> },
    { tool: 'hand', label: 'Hand / Pan', shortcut: 'H', icon: <Hand className="w-5 h-5" /> },
    { tool: 'note', label: 'Sticky Note', shortcut: 'N', icon: <StickyNote className="w-5 h-5" /> },
    { tool: 'rect', label: 'Rectangle', shortcut: 'R', icon: <Square className="w-5 h-5" /> },
    { tool: 'circle', label: 'Circle', shortcut: 'C', icon: <Circle className="w-5 h-5" /> },
    { tool: 'line', label: 'Line', shortcut: 'L', icon: <Slash className="w-5 h-5" /> },
    { tool: 'arrow', label: 'Arrow', shortcut: 'A', icon: <ArrowRight className="w-5 h-5" /> },
    { tool: 'draw', label: 'Freehand Draw', shortcut: 'D', icon: <Edit2 className="w-5 h-5" /> },
    { tool: 'text', label: 'Text', shortcut: 'T', icon: <Type className="w-5 h-5" /> },
    { tool: 'image', label: 'Insert Image', shortcut: 'I', icon: <ImageIcon className="w-5 h-5" /> },
    { tool: 'frame', label: 'Frame', shortcut: 'F', icon: <Maximize className="w-5 h-5" /> },
    { tool: 'lasso', label: 'Selection Lasso', shortcut: 'S', icon: <Lasso className="w-5 h-5" /> },
    { tool: 'export', label: 'Region Export', shortcut: 'E', icon: <Crop className="w-5 h-5" /> },
  ];

  return (
    <div
      id="toolRail"
      className="absolute left-4 top-1/2 -translate-y-1/2 w-14 rounded-2.5xl p-2 flex flex-col gap-1.5 glass z-30 pointer-events-auto shadow-lg animate-fade-slide-up"
    >
      {tools.map((t, idx) => {
        const isActive = activeTool === t.tool;
        
        // Add visual separation bars in the toolrail
        const needsSeparator = [2, 3, 10].includes(idx);
        
        return (
          <React.Fragment key={t.tool}>
            {needsSeparator && <div className="h-[1px] bg-borderLine my-1 mx-1.5" />}
            <button
              onClick={() => {
                if (t.tool === 'image') {
                  triggerImageUpload(store, toast);
                } else {
                  setTool(t.tool);
                }
              }}
              className={`relative h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-150 group ${
                isActive
                  ? 'bg-indigo-500/12 text-indigo-500 hover:scale-100'
                  : 'text-mutedText hover:bg-hover hover:text-primaryText hover:scale-105'
              }`}
            >
              {t.icon}
              
              {/* Highlight strip for active tool */}
              {isActive && (
                <div className="absolute left-[-8px] top-2 bottom-2 w-0.5 rounded-r bg-indigo-500 shadow-[0_0_10px_#6366F1]" />
              )}

              {/* Tooltip Badge */}
              <div className="absolute left-13 top-1/2 -translate-y-1/2 opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 pointer-events-none transition-all duration-150 ease-out-expo select-none shadow-md border border-borderLine rounded-full px-3.5 py-1.5 font-ui text-[11px] text-primaryText bg-panel backdrop-blur-md whitespace-nowrap z-50">
                {t.label} &nbsp; <span className="text-[10px] text-mutedText border border-borderLine rounded px-1">{t.shortcut}</span>
              </div>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
