export const APP_NAME = 'SyncCanvas Studio';

export const STROKE_COLORS: readonly string[] = [
  '#F5F5F0', // off-white
  '#D6C6B8', // narka beige
  '#FF3D00', // signal orange
  '#B85450', // muted red
  '#A68A4E', // gold
  '#5E8B7E', // sage
  '#5E7A8B', // slate blue
  '#1C1C1C', // near-black
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
  { id: '1', name: 'Alice', color: '#B85450' },
  { id: '2', name: 'Bob', color: '#5E7A8B' },
];

peers.forEach((peer) => console.log(greet(peer)));
`;
