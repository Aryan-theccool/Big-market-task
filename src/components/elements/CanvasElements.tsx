'use client';

import React, { useRef, useEffect, useState } from 'react';
import { CanvasElement, useCanvasStore } from '../../store/canvasStore';
import { X, GripHorizontal, Eye } from 'lucide-react';

interface ElementProps {
  element: CanvasElement;
  isSelected: boolean;
  onPointerDown: (e: React.PointerEvent) => void;
}

const notesPreset: Record<string, string> = {
  sun: '#FEF3C7',
  rose: '#FFE4E6',
  sky: '#E0F2FE',
  sage: '#DCFCE7',
  lilac: '#F3E8FF',
  peach: '#FFEDD5',
};

// ==================== STICKY NOTE ====================
export const StickyNote: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const bodyRef = useRef<HTMLDivElement>(null);
  
  const bg = notesPreset[element.color || 'sun'];
  const rot = element.rot || 0;

  // Track double click to edit
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (bodyRef.current && bodyRef.current.innerText !== element.text) {
      bodyRef.current.innerText = element.text || '';
    }
  }, [element.text]);

  const handleBlur = () => {
    setIsEditing(false);
    if (bodyRef.current) {
      updateElement(element.id, { text: bodyRef.current.innerText });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) {
      e.stopPropagation();
      return;
    }
    onPointerDown(e);
  };

  const handlePresetColor = (color: string) => {
    useCanvasStore.getState().pushHistory();
    updateElement(element.id, { color });
  };

  const noteBorder = element.strokeWidth && element.strokeWidth > 0 
    ? `${element.strokeWidth}px solid ${element.stroke || 'rgba(0,0,0,0.12)'}`
    : '1px solid rgba(0,0,0,0.06)';

  return (
    <div
      data-id={element.id}
      className={`absolute select-none pointer-events-auto rounded-xl flex flex-col transition-shadow duration-200 group ${
        isSelected ? 'z-50' : ''
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.w || 220,
        height: element.h || 220,
        transform: `rotate(${rot}deg)`,
        backgroundColor: bg,
        boxShadow: isSelected
          ? '0 18px 58px rgba(26,21,35,0.22)'
          : '0 3px 12px rgba(26,21,35,0.08), 0 1px 3px rgba(26,21,35,0.04)',
        border: noteBorder,
        zIndex: element.z || 0,
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Top Header rail - draggable */}
      <div 
        className={`h-7 flex items-center gap-1.5 px-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 border-b border-dashed border-black/5 cursor-grab`}
      >
        <GripHorizontal className="w-3.5 h-3.5 text-black/40" />
        <span className="font-ui text-[10px] text-black/45 tracking-wide">NOTE</span>
        <button
          className="ml-auto w-4.5 h-4.5 rounded flex items-center justify-center text-black/50 hover:bg-black/5"
          onClick={(e) => {
            e.stopPropagation();
            deleteSelected();
          }}
          title="Delete Note"
        >
          <X className="w-3 h-3" />
        </button>
      </div>

      {/* Note Body */}
      <div
        ref={bodyRef}
        contentEditable={useCanvasStore.getState().activeTool === 'select'}
        suppressContentEditableWarning
        className={`flex-1 p-3.5 pt-1.5 font-note text-2xl leading-tight text-primaryText focus:outline-none overflow-hidden select-text`}
        style={{ fontFamily: 'var(--font-note)' }}
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
      />

      {/* Folded Corner CSS Effect */}
      <div
        className="absolute bottom-0 right-0 w-7 h-7 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, transparent 50%, rgba(0,0,0,0.12) 50%)',
          borderBottomRightRadius: '11px',
        }}
      />

      {/* Floating note color picker preset on selection */}
      {isSelected && !isEditing && (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full glass z-50 animate-fade-slide-up">
          {Object.keys(notesPreset).map((colorKey) => (
            <button
              key={colorKey}
              className={`w-5.5 h-5.5 rounded-full border border-white/60 shadow-sm transition-transform duration-100 hover:scale-115 ${
                element.color === colorKey ? 'ring-2 ring-indigo-500 scale-105' : ''
              }`}
              style={{ backgroundColor: notesPreset[colorKey] }}
              onClick={(e) => {
                e.stopPropagation();
                handlePresetColor(colorKey);
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ==================== TEXT ELEMENT ====================
export const TextElement: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const updateElement = useCanvasStore((s) => s.updateElement);
  const textRef = useRef<HTMLDivElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (textRef.current && textRef.current.innerText !== element.text) {
      textRef.current.innerText = element.text || '';
    }
  }, [element.text]);

  const handleBlur = () => {
    setIsEditing(false);
    if (textRef.current) {
      updateElement(element.id, { text: textRef.current.innerText });
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isEditing) {
      e.stopPropagation();
      return;
    }
    onPointerDown(e);
  };

  const textColor = element.stroke || 'var(--text-primary)';
  const borderStyle = element.strokeWidth && element.strokeWidth > 0
    ? `${element.strokeWidth}px solid ${textColor}`
    : isSelected ? '1px dashed var(--accent)' : '1px solid transparent';

  const fillBg = element.fill && element.fill !== 'none' && element.fill !== 'transparent'
    ? element.fill
    : 'transparent';

  return (
    <div
      data-id={element.id}
      className={`absolute select-none pointer-events-auto rounded-lg transition-shadow duration-150 ${
        isSelected ? 'z-50' : ''
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.w || 'auto',
        minWidth: 100,
        minHeight: 40,
        transform: `rotate(${element.rot || 0}deg)`,
        border: borderStyle,
        backgroundColor: fillBg,
        padding: '6px 12px',
        color: textColor,
        fontFamily: 'var(--font-display)',
        boxShadow: isSelected ? '0 10px 30px rgba(99,102,241,0.08)' : 'none',
        zIndex: element.z || 0,
      }}
      onPointerDown={handlePointerDown}
    >
      <div
        ref={textRef}
        contentEditable={useCanvasStore.getState().activeTool === 'select'}
        suppressContentEditableWarning
        className="text-[30px] font-display leading-tight outline-none select-text break-words"
        onFocus={() => setIsEditing(true)}
        onBlur={handleBlur}
      />
    </div>
  );
};

// ==================== SVG SHAPE / LINES ====================
export const SvgShape: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const getBounds = () => {
    if (element.type === 'line' || element.type === 'arrow') {
      const minX = Math.min(element.x, element.x2 || element.x);
      const minY = Math.min(element.y, element.y2 || element.y);
      const w = Math.abs((element.x2 || element.x) - element.x) || 1;
      const h = Math.abs((element.y2 || element.y) - element.y) || 1;
      return { x: minX, y: minY, w, h };
    }
    if (element.type === 'draw') {
      if (element.points && element.points.length > 0) {
        const xs = element.points.map((p) => p.x);
        const ys = element.points.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        return {
          x: minX,
          y: minY,
          w: Math.max(1, maxX - minX),
          h: Math.max(1, maxY - minY),
        };
      }
      return { x: element.x, y: element.y, w: 1, h: 1 };
    }
    return {
      x: element.x,
      y: element.y,
      w: element.w || 10,
      h: element.h || 10,
    };
  };

  const b = getBounds();
  const strokeColor = element.stroke || '#6366F1';
  const fillColor = element.fill || 'rgba(99, 102, 241, 0.08)';
  const strokeW = element.strokeWidth !== undefined ? element.strokeWidth : 2;

  // Coordinates translation for elements relative to Svg coordinate system
  const localX = (xVal: number) => xVal - b.x;
  const localY = (yVal: number) => yVal - b.y;

  const renderShapeBody = () => {
    switch (element.type) {
      case 'rect':
        return (
          <rect
            x={strokeW / 2}
            y={strokeW / 2}
            width={Math.max(1, b.w - strokeW)}
            height={Math.max(1, b.h - strokeW)}
            rx={element.radius || 8}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        );
      case 'circle':
        return (
          <ellipse
            cx={b.w / 2}
            cy={b.h / 2}
            rx={Math.max(1, b.w / 2 - strokeW / 2)}
            ry={Math.max(1, b.h / 2 - strokeW / 2)}
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeW}
          />
        );
      case 'frame':
        return (
          <g>
            <rect
              x={strokeW / 2}
              y={strokeW / 2}
              width={Math.max(1, b.w - strokeW)}
              height={Math.max(1, b.h - strokeW)}
              rx={16}
              fill={element.fill || 'rgba(99,102,241,0.03)'}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeDasharray="8 6"
            />
            {/* Frame Label */}
            <foreignObject x={8} y={-24} width={180} height={32} className="overflow-visible select-none">
              <span className="inline-block px-3 py-1 font-ui text-[11px] font-extrabold text-accent bg-panel border border-borderLine rounded-full shadow-sm">
                ⬡ {element.text || 'Frame Section'}
              </span>
            </foreignObject>
          </g>
        );
      case 'line':
        return (
          <line
            x1={localX(element.x)}
            y1={localY(element.y)}
            x2={localX(element.x2 || element.x)}
            y2={localY(element.y2 || element.y)}
            stroke={strokeColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
          />
        );
      case 'arrow':
        const markerId = `arrow-marker-${element.id}`;
        return (
          <g>
            <defs>
              <marker
                id={markerId}
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto"
              >
                <path d="M0 0 L10 5 L0 10z" fill={strokeColor} />
              </marker>
            </defs>
            <line
              x1={localX(element.x)}
              y1={localY(element.y)}
              x2={localX(element.x2 || element.x)}
              y2={localY(element.y2 || element.y)}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinecap="round"
              markerEnd={`url(#${markerId})`}
            />
          </g>
        );
      case 'draw':
        const pointsStr = (element.points || [])
          .map((p) => `${localX(p.x)},${localY(p.y)}`)
          .join(' ');
        
        if (element.closed) {
          return (
            <polygon
              points={pointsStr}
              fill={fillColor !== 'none' ? fillColor : 'rgba(99, 102, 241, 0.1)'}
              stroke={strokeColor}
              strokeWidth={strokeW}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          );
        }
        return (
          <polyline
            points={pointsStr}
            fill="none"
            stroke={strokeColor}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        );
      default:
        return null;
    }
  };

  // Add rotation style for shape boxes (excluding straight vectors like line/arrow)
  const isLineType = ['line', 'arrow', 'draw'].includes(element.type);
  const rot = element.rot || 0;

  return (
    <svg
      data-id={element.id}
      className={`absolute select-none pointer-events-auto overflow-visible ${
        isSelected ? 'z-50' : ''
      }`}
      style={{
        left: b.x,
        top: b.y,
        width: Math.max(1, b.w),
        height: Math.max(1, b.h),
        transform: isLineType ? 'none' : `rotate(${rot}deg)`,
        transformOrigin: 'center center',
        filter: isSelected ? 'drop-shadow(0 4px 12px rgba(99,102,241,0.12))' : 'none',
        zIndex: element.z || 0,
      }}
      onPointerDown={onPointerDown}
    >
      {renderShapeBody()}
    </svg>
  );
};

// ==================== IMAGE ELEMENT ====================
export const ImageElement: React.FC<ElementProps> = ({ element, isSelected, onPointerDown }) => {
  const deleteSelected = useCanvasStore((s) => s.deleteSelected);
  const rot = element.rot || 0;

  const imageBorder = element.strokeWidth && element.strokeWidth > 0 
    ? `${element.strokeWidth}px solid ${element.stroke || '#6366F1'}`
    : isSelected ? '1px dashed var(--accent)' : '1px solid transparent';

  const borderRadius = element.radius !== undefined ? `${element.radius}px` : '12px';

  return (
    <div
      data-id={element.id}
      className={`absolute select-none pointer-events-auto flex flex-col group transition-shadow duration-200 ${
        isSelected ? 'z-50' : ''
      }`}
      style={{
        left: element.x,
        top: element.y,
        width: element.w || 200,
        height: element.h || 150,
        transform: `rotate(${rot}deg)`,
        transformOrigin: 'center center',
        boxShadow: isSelected
          ? '0 18px 58px rgba(26,21,35,0.22)'
          : '0 3px 12px rgba(26,21,35,0.08), 0 1px 3px rgba(26,21,35,0.04)',
        border: imageBorder,
        borderRadius: borderRadius,
        overflow: 'visible',
        zIndex: element.z || 0,
      }}
      onPointerDown={onPointerDown}
    >
      {/* Absolute image overlay delete button on hover */}
      <button
        className="absolute -top-3.5 -right-3.5 w-7 h-7 rounded-full bg-panel border border-borderLine shadow-md flex items-center justify-center text-primaryText opacity-0 group-hover:opacity-100 transition-all duration-150 z-[100] cursor-pointer hover:bg-black/5 hover:scale-110 active:scale-95"
        onClick={(e) => {
          e.stopPropagation();
          deleteSelected();
        }}
        title="Delete Image"
      >
        <X className="w-4 h-4 text-rose-500" />
      </button>

      {/* Actual base64 Image */}
      <img
        src={element.src || ''}
        alt="Canvas item"
        className="w-full h-full object-contain pointer-events-none select-none"
        style={{ borderRadius: `calc(${borderRadius} - 1px)` }}
      />
    </div>
  );
};

// ==================== SELECTION BOX HANDLES ====================
interface SelectionBoxProps {
  elements: CanvasElement[];
  viewport: { x: number; y: number; zoom: number };
  onResizeStart: (handle: string, e: React.PointerEvent) => void;
  onRotateStart: (e: React.PointerEvent) => void;
}

export const SelectionBox: React.FC<SelectionBoxProps> = ({
  elements,
  onResizeStart,
  onRotateStart,
}) => {
  if (!elements.length) return null;

  const boundsList = elements.map((el) => {
    if (el.type === 'line' || el.type === 'arrow') {
      const minX = Math.min(el.x, el.x2 || el.x);
      const minY = Math.min(el.y, el.y2 || el.y);
      const w = Math.abs((el.x2 || el.x) - el.x) || 1;
      const h = Math.abs((el.y2 || el.y) - el.y) || 1;
      return { x: minX, y: minY, w, h };
    }
    if (el.type === 'draw') {
      if (el.points && el.points.length > 0) {
        const xs = el.points.map((p) => p.x);
        const ys = el.points.map((p) => p.y);
        const minX = Math.min(...xs);
        const minY = Math.min(...ys);
        const maxX = Math.max(...xs);
        const maxY = Math.max(...ys);
        return {
          x: minX,
          y: minY,
          w: Math.max(1, maxX - minX),
          h: Math.max(1, maxY - minY),
        };
      }
      return { x: el.x, y: el.y, w: 1, h: 1 };
    }
    return { x: el.x, y: el.y, w: el.w || 100, h: el.h || 60 };
  });

  const minX = Math.min(...boundsList.map((b) => b.x));
  const minY = Math.min(...boundsList.map((b) => b.y));
  const maxX = Math.max(...boundsList.map((b) => b.x + b.w));
  const maxY = Math.max(...boundsList.map((b) => b.y + b.h));

  const w = maxX - minX;
  const h = maxY - minY;

  // Line drawing vectors do not get rotate/resize handles directly
  const single = elements[0];
  const isLineType = elements.length === 1 && ['line', 'arrow', 'draw'].includes(single.type);
  const rot = elements.length === 1 && !isLineType ? (single.rot || 0) : 0;

  // Handle styles
  const handleClass =
    'absolute w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full shadow-md z-50 cursor-pointer pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 hover:scale-120 hover:bg-indigo-50 transition-transform duration-75';

  return (
    <div
      className="absolute border border-indigo-500/70 border-dashed pointer-events-none select-none z-40 animate-marching-ants"
      style={{
        left: minX,
        top: minY,
        width: w,
        height: h,
        outline: '1px solid rgba(99,102,241,0.2)',
        transform: `rotate(${rot}deg)`,
        transformOrigin: 'center center',
        zIndex: 999999,
      }}
    >
      {/* 8 Resize grips (hidden if it is a line vector draw) */}
      {!isLineType && (
        <>
          <div
            className={`${handleClass} left-0 top-0 cursor-nwse-resize`}
            onPointerDown={(e) => onResizeStart('nw', e)}
          />
          <div
            className={`${handleClass} left-1/2 top-0 cursor-ns-resize`}
            onPointerDown={(e) => onResizeStart('n', e)}
          />
          <div
            className={`${handleClass} left-full top-0 cursor-nesw-resize`}
            onPointerDown={(e) => onResizeStart('ne', e)}
          />
          <div
            className={`${handleClass} left-full top-1/2 cursor-ew-resize`}
            onPointerDown={(e) => onResizeStart('e', e)}
          />
          <div
            className={`${handleClass} left-full top-full cursor-nwse-resize`}
            onPointerDown={(e) => onResizeStart('se', e)}
          />
          <div
            className={`${handleClass} left-1/2 top-full cursor-ns-resize`}
            onPointerDown={(e) => onResizeStart('s', e)}
          />
          <div
            className={`${handleClass} left-0 top-full cursor-nesw-resize`}
            onPointerDown={(e) => onResizeStart('sw', e)}
          />
          <div
            className={`${handleClass} left-0 top-1/2 cursor-ew-resize`}
            onPointerDown={(e) => onResizeStart('w', e)}
          />
          
          {/* Rotation Handle */}
          <div
            className="absolute left-1/2 -top-[34px] -translate-x-1/2 w-5.5 h-5.5 rounded-full bg-white border border-indigo-500 shadow-md flex items-center justify-center cursor-grab pointer-events-auto hover:bg-indigo-50"
            onPointerDown={onRotateStart}
            title="Rotate Element"
          >
            <span className="text-[10px] text-indigo-500 font-extrabold select-none">↻</span>
          </div>
          <div 
            className="absolute left-1/2 -top-[16px] -translate-x-1/2 w-0.5 h-[16px] bg-indigo-500/70"
          />
        </>
      )}
    </div>
  );
};
