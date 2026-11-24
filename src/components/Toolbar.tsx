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
  tool, setTool, color, setColor, width, setWidth, onClear, onUndo, onRedo, canUndo, canRedo,
}: ToolbarProps): JSX.Element {
  return (
    <div className="flex items-stretch border border-narka-grey bg-[#1C1C1C] p-1 gap-1">
      <div className="flex gap-1 border-r border-narka-grey pr-1">
        <button
          onClick={() => setTool('pen')}
          className={`p-2 rounded-none transition-colors ${tool === 'pen' ? 'bg-narka-beige text-narka-dark' : 'text-narka-grey hover:text-narka-light'}`}
        >
          <Pen className="w-4 h-4" />
        </button>
        <button
          onClick={() => setTool('eraser')}
          className={`p-2 rounded-none transition-colors ${tool === 'eraser' ? 'bg-narka-beige text-narka-dark' : 'text-narka-grey hover:text-narka-light'}`}
        >
          <Eraser className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-narka-grey">
        {STROKE_COLORS.map((swatch) => (
          <button
            key={swatch}
            onClick={() => setColor(swatch)}
            className={`w-4 h-4 rounded-none border border-transparent transition-transform ${color === swatch ? 'ring-1 ring-narka-beige scale-110' : 'hover:scale-105'}`}
            style={{ backgroundColor: swatch }}
          />
        ))}
      </div>

      <div className="flex items-center gap-1 px-2 border-r border-narka-grey">
        {STROKE_WIDTHS.map((strokeWidth) => (
          <button
            key={strokeWidth}
            onClick={() => setWidth(strokeWidth)}
            className={`w-6 h-6 flex items-center justify-center rounded-none transition-colors ${width === strokeWidth ? 'bg-[#333333]' : 'hover:bg-[#252525]'}`}
          >
            <div className="bg-narka-light" style={{ width: Math.min(strokeWidth, 12), height: Math.min(strokeWidth, 12) }} />
          </button>
        ))}
      </div>

      <div className="flex gap-1 pl-1">
        <button onClick={onUndo} disabled={!canUndo} className="p-2 text-narka-grey hover:text-narka-light disabled:opacity-30 transition-colors">
          <Undo2 className="w-4 h-4" />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="p-2 text-narka-grey hover:text-narka-light disabled:opacity-30 transition-colors">
          <Redo2 className="w-4 h-4" />
        </button>
        <button onClick={onClear} className="p-2 text-[#ff3d00] hover:bg-[#ff3d00]/10 transition-colors">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
