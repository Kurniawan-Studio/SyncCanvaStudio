import type { PeerUser } from '../hooks/useP2PSync';

interface PeerCursorsProps {
  peers: PeerUser[];
  containerWidth: number;
  containerHeight: number;
}

export function PeerCursors({ peers, containerWidth, containerHeight }: PeerCursorsProps): JSX.Element {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {peers.map((peer) => {
        if (!peer.cursor || containerWidth === 0 || containerHeight === 0) return null;
        const x = peer.cursor.x * containerWidth;
        const y = peer.cursor.y * containerHeight;
        return (
          <div
            key={peer.clientId}
            className="absolute top-0 left-0 will-change-transform"
            style={{ transform: `translate3d(${x}px, ${y}px, 0)`, transition: 'transform 60ms linear' }}
          >
            <div 
              className="w-2 h-2 border border-narka-light" 
              style={{ backgroundColor: peer.color }} 
            />
            <div
              className="absolute left-3 top-0 px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider text-narka-dark border border-narka-light whitespace-nowrap"
              style={{ backgroundColor: peer.color }}
            >
              {peer.name}
            </div>
          </div>
        );
      })}
    </div>
  );
}
