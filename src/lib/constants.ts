// src/lib/constants.ts
export const APP_NAME = 'SyncCanvas Studio';

export const STROKE_COLORS: readonly string[] = [
  '#0f172a', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899',
];

export const STROKE_WIDTHS: readonly number[] = [2, 4, 8, 12];

export const ERASER_RADIUS_NORMALIZED = 0.025;

export const DEFAULT_MARKDOWN = `# Welcome to SyncCanvas Studio

A real-time, peer-to-peer collaborative workspace.

## What you can do here
- Draw together on the whiteboard
- Write and edit Markdown collaboratively
- Draft code side-by-side
- Export your work as JSON, Markdown or PNG

> Every edit is synced directly between peers — no server, no accounts.
`;

export const DEFAULT_CODE = `// SyncCanvas Code Workspace
interface Peer {
  id: string;
  name: string;
  color: string;
}

function greet(peer: Peer): string {
  return \`Hello, \${peer.name}!\`;
}

const peers: Peer[] = [
  { id: '1', name: 'Alice', color: '#ef4444' },
  { id: '2', name: 'Bob', color: '#3b82f6' },
];

peers.forEach((peer) => console.log(greet(peer)));
`;
