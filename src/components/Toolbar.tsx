// src/components/Toolbar.tsx
import { Pen, Eraser, Trash2, Undo2, Redo2 } from 'lucide-react';
import type { CanvasTool } from '../types';
import { STROKE_COLORS, STROKE_WIDTHS } from '../lib/constants';

interface ToolbarProps {
  tool: CanvasTool;
  setTool: (tool: CanvasTool) => void;
  color: string;
  setColor: (color: string) => void;
  width: number;
  setWidth: (width: number) => void;
  onClear: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function Toolbar({
  tool,
  setTool,
  color,
  setColor,
  width,
  setWidth,
  onClear,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}: ToolbarProps): JSX.Element {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/90 backdrop-blur border border-slate-700 shadow-lg">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => setTool('pen')}
          className={`p-1.5 rounded-md transition-colors ${
            tool === 'pen'
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
          title="Pen"
          aria-label="Pen tool"
        >
          <Pen className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setTool('eraser')}
          className={`p-1.5 rounded-md transition-colors ${
            tool === 'eraser'
              ? 'bg-indigo-500 text-white'
              : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
          }`}
          title="Eraser"
          aria-label="Eraser tool"
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      <div className="w-px h-5 bg-slate-700" />

      <div className="flex items-center gap-1">
        {STROKE_COLORS.map((swatch) => (
          <button
            key={swatch}
            type="button"
            onClick={() => setColor(swatch)}
            className={`w-5 h-5 rounded-full transition-transform ${
              color === swatch
                ? 'ring-2 ring-offset-1 ring-offset-slate-800 ring-white scale-110'
                : 'hover:scale-105'
            }`}
            style={{ backgroundColor: swatch }}
            title={swatch}
            aria-label={`Color ${swatch}`}
          />
        ))}
      </div>

      <div className="w-px h-5 bg-slate-700" />

      <div className="flex items-center gap-1">
        {STROKE_WIDTHS.map((strokeWidth) => (
          <button
            key={strokeWidth}
            type="button"
            onClick={() => setWidth(strokeWidth)}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              width === strokeWidth ? 'bg-slate-600' : 'hover:bg-slate-700'
            }`}
            title={`${strokeWidth}px`}
            aria-label={`Stroke width ${strokeWidth}`}
          >
            <div
              className="rounded-full bg-slate-200"
              style={{
                width: Math.min(strokeWidth, 14),
                height: Math.min(strokeWidth, 14),
              }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-5 bg-slate-700" />

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo}
          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onRedo}
          disabled={!canRedo}
          className="p-1.5 rounded-md text-slate-400 hover:bg-slate-700 hover:text-slate-200 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onClear}
          className="p-1.5 rounded-md text-rose-400 hover:bg-rose-500/20 transition-colors"
          title="Clear canvas"
          aria-label="Clear canvas"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
