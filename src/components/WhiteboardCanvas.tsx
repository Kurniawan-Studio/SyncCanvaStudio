import { useCallback, useEffect, useRef, useState } from 'react';
import * as Y from 'yjs';
import type { CanvasTool, StrokePoint, StrokeRecord } from '../types';
import type { PeerUser } from '../hooks/useP2PSync';
import { SHARED_KEYS } from '../hooks/useP2PSync';
import { ERASER_RADIUS_NORMALIZED } from '../lib/constants';
import { Toolbar } from './Toolbar';
import { PeerCursors } from './PeerCursors';

interface WhiteboardCanvasProps {
  doc: Y.Doc;
  transact: (fn: () => void) => void;
  peers: PeerUser[];
  setLocalCursor: (cursor: { x: number; y: number } | null) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface ActiveStroke {
  color: string;
  width: number;
  points: StrokePoint[];
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function drawStrokeOnContext(
  ctx: CanvasRenderingContext2D, color: string, lineWidth: number, points: StrokePoint[], canvasWidth: number, canvasHeight: number,
): void {
  if (points.length === 0) return;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (points.length === 1) {
    const point = points[0];
    if (!point) return;
    ctx.beginPath();
    ctx.arc(point.x * canvasWidth, point.y * canvasHeight, lineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    return;
  }

  ctx.beginPath();
  const first = points[0];
  if (!first) return;
  ctx.moveTo(first.x * canvasWidth, first.y * canvasHeight);
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (!point) continue;
    ctx.lineTo(point.x * canvasWidth, point.y * canvasHeight);
  }
  ctx.stroke();
}

export function WhiteboardCanvas({
  doc, transact, peers, setLocalCursor, onUndo, onRedo, canUndo, canRedo,
}: WhiteboardCanvasProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const [tool, setTool] = useState<CanvasTool>('pen');
  const [color, setColor] = useState<string>('#F5F5F0');
  const [width, setWidth] = useState<number>(4);
  const [canvasSize, setCanvasSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  const activeStrokeRef = useRef<ActiveStroke | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const committedStrokesRef = useRef<StrokeRecord[]>([]);
  const sizeRef = useRef<{ width: number; height: number }>({ width: 0, height: 0 });
  const dprRef = useRef<number>(typeof window !== 'undefined' ? Math.max(1, window.devicePixelRatio || 1) : 1);

  const strokesArray = doc.getArray<StrokeRecord>(SHARED_KEYS.strokes);

  const redrawBase = useCallback((): void => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: cw, height: ch } = sizeRef.current;
    ctx.clearRect(0, 0, cw, ch);
    committedStrokesRef.current.forEach((stroke) => {
      drawStrokeOnContext(ctx, stroke.color, stroke.width, stroke.points, cw, ch);
    });
  }, []);

  const redrawOverlay = useCallback((): void => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { width: cw, height: ch } = sizeRef.current;
    ctx.clearRect(0, 0, cw, ch);
    const active = activeStrokeRef.current;
    if (active) {
      drawStrokeOnContext(ctx, active.color, active.width, active.points, cw, ch);
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const applySize = (): void => {
      const rect = container.getBoundingClientRect();
      const dpr = dprRef.current;
      sizeRef.current = { width: rect.width, height: rect.height };

      [baseCanvasRef.current, overlayCanvasRef.current].forEach((canvas) => {
        if (!canvas) return;
        canvas.width = Math.max(1, Math.round(rect.width * dpr));
        canvas.height = Math.max(1, Math.round(rect.height * dpr));
        canvas.style.width = `${rect.width}px`;
        canvas.style.height = `${rect.height}px`;
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      });

      setCanvasSize({ width: rect.width, height: rect.height });
      redrawBase();
      redrawOverlay();
    };

    applySize();
    const observer = new ResizeObserver(applySize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [redrawBase, redrawOverlay]);

  useEffect(() => {
    const handleChange = (): void => {
      committedStrokesRef.current = strokesArray.toArray();
      redrawBase();
    };
    handleChange();
    strokesArray.observe(handleChange);
    return () => { strokesArray.unobserve(handleChange); };
  }, [strokesArray, redrawBase]);

  const pointerToNormalized = useCallback((event: React.PointerEvent<HTMLCanvasElement>): StrokePoint => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
    return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height };
  }, []);

  const eraseAt = useCallback((point: StrokePoint): void => {
    const toDelete: number[] = [];
    strokesArray.toArray().forEach((stroke, index) => {
      const hit = stroke.points.some((strokePoint) => {
        const dx = strokePoint.x - point.x;
        const dy = strokePoint.y - point.y;
        return Math.hypot(dx, dy) < ERASER_RADIUS_NORMALIZED;
      });
      if (hit) toDelete.push(index);
    });
    if (toDelete.length === 0) return;
    transact(() => {
      for (let i = toDelete.length - 1; i >= 0; i -= 1) {
        const index = toDelete[i];
        if (typeof index === 'number') strokesArray.delete(index, 1);
      }
    });
  }, [strokesArray, transact]);

  const commitActiveStroke = useCallback((): void => {
    const active = activeStrokeRef.current;
    activeStrokeRef.current = null;
    if (!active || active.points.length === 0) return;
    const record: StrokeRecord = { id: uuid(), color: active.color, width: active.width, points: active.points };
    transact(() => { strokesArray.push([record]); });
  }, [strokesArray, transact]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    const point = pointerToNormalized(event);
    setLocalCursor(point);
    if (tool === 'eraser') { eraseAt(point); return; }
    isDrawingRef.current = true;
    activeStrokeRef.current = { color, width, points: [point] };
    redrawOverlay();
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    const point = pointerToNormalized(event);
    setLocalCursor(point);
    if (tool === 'eraser') { if (event.buttons === 1) eraseAt(point); return; }
    if (!isDrawingRef.current || !activeStrokeRef.current) return;
    activeStrokeRef.current.points.push(point);
    redrawOverlay();
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLCanvasElement>): void => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    commitActiveStroke();
    redrawOverlay();
  };

  const handlePointerLeave = (): void => { setLocalCursor(null); };

  const handleClear = useCallback((): void => {
    if (strokesArray.length === 0) return;
    transact(() => { strokesArray.delete(0, strokesArray.length); });
  }, [strokesArray, transact]);

  return (
    <div ref={containerRef} className="relative w-full h-full bg-grid-pattern">
      <canvas
        ref={baseCanvasRef}
        className="absolute inset-0 cursor-crosshair touch-none"
        onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp} onPointerLeave={handlePointerLeave}
      />
      <canvas ref={overlayCanvasRef} className="absolute inset-0 pointer-events-none" aria-hidden />
      <PeerCursors peers={peers} containerWidth={canvasSize.width} containerHeight={canvasSize.height} />
      
      {/* Toolbar positioning: Bottom on mobile, Top-Left on desktop */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 md:translate-x-0 md:bottom-auto md:top-6 md:left-6 z-10 w-max max-w-[90vw] overflow-x-auto no-scrollbar">
        <Toolbar
          tool={tool} setTool={setTool} color={color} setColor={setColor}
          width={width} setWidth={setWidth} onClear={handleClear}
          onUndo={onUndo} onRedo={onRedo} canUndo={canUndo} canRedo={canRedo}
        />
      </div>
    </div>
  );
}
