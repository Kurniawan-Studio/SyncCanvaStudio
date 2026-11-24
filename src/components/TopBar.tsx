import { useState } from 'react';
import { Copy, LogOut, Wifi, WifiOff, Download } from 'lucide-react';
import type { PeerUser, P2PSyncStatus } from '../hooks/useP2PSync';
import { APP_NAME } from '../lib/constants';

interface TopBarProps {
  roomId: string;
  status: P2PSyncStatus;
  peers: PeerUser[];
  localUser: { name: string; color: string };
  onLeave: () => void;
  onExportJSON: () => void;
  onExportMarkdown: () => void;
  onExportPNG: () => void;
}

export function TopBar({
  roomId, status, peers, localUser, onLeave, onExportJSON, onExportMarkdown, onExportPNG,
}: TopBarProps): JSX.Element {
  const [copied, setCopied] = useState<boolean>(false);
  const [exportOpen, setExportOpen] = useState<boolean>(false);

  const handleCopy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  const allUsers = [
    { clientId: -1, name: localUser.name, color: localUser.color },
    ...peers.map((p) => ({ clientId: p.clientId, name: p.name, color: p.color })),
  ];

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-narka-grey bg-[#1C1C1C]">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 border border-narka-light flex items-center justify-center">
            <div className="w-1 h-1 bg-narka-beige" />
          </div>
          <span className="text-sm font-bold tracking-widest uppercase text-narka-light">{APP_NAME}</span>
        </div>
        <div className="h-4 w-[1px] bg-narka-grey" />
        <button
          onClick={handleCopy}
          className="flex items-center gap-3 text-xs font-mono tracking-wider text-narka-grey hover:text-narka-light transition-colors uppercase"
        >
          <span>ID: {roomId}</span>
          {copied ? <span className="text-narka-beige text-[10px] tracking-widest">[Copied]</span> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-[10px] tracking-widest uppercase text-narka-grey">Active Nodes</span>
          <div className="flex items-center -space-x-1">
            {allUsers.slice(0, 5).map((user, index) => (
              <div
                key={`${user.clientId}-${index}`}
                className="w-5 h-5 flex items-center justify-center text-[10px] font-bold text-narka-dark border border-[#1C1C1C]"
                style={{ backgroundColor: user.color }}
                title={user.name}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs tracking-widest uppercase">
          {status.isConnected ? (
            <><Wifi className="w-3.5 h-3.5 text-narka-beige" /><span className="text-narka-beige">{status.peerCount} P2P</span></>
          ) : (
            <><WifiOff className="w-3.5 h-3.5 text-narka-grey" /><span className="text-narka-grey">Offline</span></>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setExportOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 border border-narka-grey text-xs tracking-widest uppercase text-narka-light hover:border-narka-light transition-colors rounded-none"
          >
            <Download className="w-3.5 h-3.5" /> Data
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-48 border border-narka-grey bg-[#1C1C1C] shadow-none">
                {[
                  { label: 'JSON Format', action: onExportJSON },
                  { label: 'Markdown Format', action: onExportMarkdown },
                  { label: 'Canvas (PNG)', action: onExportPNG }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setExportOpen(false); }}
                    className="w-full px-4 py-2 text-left text-[10px] tracking-widest uppercase text-narka-grey hover:text-narka-light hover:bg-[#252525] border-b border-[#333333] last:border-0 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={onLeave}
          className="flex items-center gap-2 px-3 py-1.5 border border-narka-grey text-xs tracking-widest uppercase text-narka-light hover:bg-narka-light hover:text-narka-dark transition-colors rounded-none"
        >
          <LogOut className="w-3.5 h-3.5" /> Exit
        </button>
      </div>
    </header>
  );
}
