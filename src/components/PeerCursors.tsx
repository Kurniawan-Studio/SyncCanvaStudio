// src/components/PeerCursors.tsx
import type { PeerUser } from '../hooks/useP2PSync';

interface PeerCursorsProps {
  peers: PeerUser[];
  containerWidth: number;
  containerHeight: number;
}

export function PeerCursors({
  peers,
  containerWidth,
  containerHeight,
}: PeerCursorsProps): JSX.Element {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {peers.map((peer) => {
        if (!peer.cursor || containerWidth === 0 || containerHeight === 0) {
          return null;
        }
        const x = peer.cursor.x * containerWidth;
        const y = peer.cursor.y * containerHeight;
        return (
          <div
            key={peer.clientId}
            className="absolute top-0 left-0 will-change-transform"
            style={{
              transform: `translate3d(${x}px, ${y}px, 0)`,
              transition: 'transform 60ms linear',
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.45))' }}
            >
              <path
                d="M3 2L17 10L10 11L8 18L3 2Z"
                fill={peer.color}
                stroke="white"
                strokeWidth="1"
                strokeLinejoin="round"
              />
            </svg>
            <div
              className="absolute left-4 top-4 px-1.5 py-0.5 rounded text-[10px] font-medium text-white whitespace-nowrap"
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
