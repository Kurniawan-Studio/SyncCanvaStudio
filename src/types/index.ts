// src/types/index.ts
export interface StrokePoint {
  x: number;
  y: number;
}

export interface StrokeRecord {
  id: string;
  color: string;
  width: number;
  points: StrokePoint[];
}

export type CanvasTool = 'pen' | 'eraser';
