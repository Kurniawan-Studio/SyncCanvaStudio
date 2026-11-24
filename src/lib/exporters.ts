// src/lib/exporters.ts
import * as Y from 'yjs';
import { SHARED_KEYS } from '../hooks/useP2PSync';
import type { StrokeRecord } from '../types';

/** Trigger a browser download for an in-memory Blob. */
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function collectStrokes(doc: Y.Doc): StrokeRecord[] {
  return doc.getArray<StrokeRecord>(SHARED_KEYS.strokes).toArray();
}

export function exportToJSON(doc: Y.Doc, roomId: string): void {
  const payload = {
    app: 'SyncCanvas Studio',
    exportedAt: new Date().toISOString(),
    roomId,
    workspace: {
      markdown: doc.getText(SHARED_KEYS.markdown).toString(),
      code: doc.getText(SHARED_KEYS.code).toString(),
    },
    strokes: collectStrokes(doc),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  downloadBlob(blob, `synccanvas-${roomId}.json`);
}

export function exportToMarkdown(doc: Y.Doc, roomId: string): void {
  const markdown = doc.getText(SHARED_KEYS.markdown).toString();
  const code = doc.getText(SHARED_KEYS.code).toString();
  const strokes = collectStrokes(doc);

  const sections: string[] = [
    `# SyncCanvas Export — Room ${roomId}`,
    '',
    `_Exported at ${new Date().toISOString()}_`,
    '',
    '## Markdown Workspace',
    '',
    markdown.trim() || '_(empty)_',
    '',
    '## Code Workspace',
    '',
    '```ts',
    code.trim() || '// (empty)',
    '```',
    '',
    `## Whiteboard (${strokes.length} stroke${strokes.length === 1 ? '' : 's'})`,
    '',
    '_Use the JSON or PNG export to preserve the whiteboard rendering._',
  ];

  downloadBlob(
    new Blob([sections.join('\n')], { type: 'text/markdown' }),
    `synccanvas-${roomId}.md`,
  );
}

export function exportToPNG(doc: Y.Doc, roomId: string): void {
  const strokes = collectStrokes(doc);
  const width = 1600;
  const height = 1000;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return;
  }

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  strokes.forEach((stroke) => {
    if (stroke.points.length === 0) {
      return;
    }
    ctx.strokeStyle = stroke.color;
    ctx.fillStyle = stroke.color;
    ctx.lineWidth = stroke.width;

    if (stroke.points.length === 1) {
      const p = stroke.points[0];
      if (!p) return;
      ctx.beginPath();
      ctx.arc(p.x * width, p.y * height, stroke.width / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.beginPath();
    const [first, ...rest] = stroke.points;
    if (!first) return;
    ctx.moveTo(first.x * width, first.y * height);
    rest.forEach((p) => ctx.lineTo(p.x * width, p.y * height));
    ctx.stroke();
  });

  canvas.toBlob((blob) => {
    if (blob) {
      downloadBlob(blob, `synccanvas-${roomId}.png`);
    }
  }, 'image/png');
}
