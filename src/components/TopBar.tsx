import { useState } from 'react';
import { Copy, LogOut, Wifi, WifiOff, Download, HelpCircle } from 'lucide-react';
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
  onOpenHelp: () => void;
}

export function TopBar({
  roomId, status, peers, localUser, onLeave, onExportJSON, onExportMarkdown, onExportPNG, onOpenHelp,
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
    <header className="flex flex-wrap items-center justify-between px-4 py-3 gap-3 border-b border-narka-grey bg-[#1C1C1C]">
      <div className="flex items-center gap-4">
        <div className="hidden sm:flex items-center gap-2">
          <div className="w-3 h-3 border border-narka-light flex items-center justify-center">
            <div className="w-1 h-1 bg-narka-beige" />
          </div>
          <span className="text-xs font-bold tracking-widest uppercase text-narka-light">{APP_NAME}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-[10px] font-mono tracking-wider text-narka-grey hover:text-narka-light transition-colors uppercase border border-narka-grey px-2 py-1"
        >
          <span>ID: {roomId}</span>
          {copied ? <span className="text-narka-beige font-bold">COPIED</span> : <Copy className="w-3 h-3" />}
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="flex items-center -space-x-1">
          {allUsers.slice(0, 4).map((user, index) => (
            <div
              key={`${user.clientId}-${index}`}
              className="w-5 h-5 flex items-center justify-center text-[9px] font-bold text-narka-dark border border-[#1C1C1C]"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {allUsers.length > 4 && (
            <div className="w-5 h-5 flex items-center justify-center text-[9px] font-bold bg-[#333] text-narka-light border border-[#1C1C1C]">
              +{allUsers.length - 4}
            </div>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] tracking-widest uppercase">
          {status.isConnected ? (
            <><Wifi className="w-3.5 h-3.5 text-narka-beige" /><span className="text-narka-beige">Online</span></>
          ) : (
            <><WifiOff className="w-3.5 h-3.5 text-narka-grey" /><span className="text-narka-grey">Offline</span></>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setExportOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2 py-1.5 border border-narka-grey text-[10px] tracking-widest uppercase text-narka-light hover:border-narka-light transition-colors rounded-none"
          >
            <Download className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Data</span>
          </button>
          {exportOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setExportOpen(false)} />
              <div className="absolute right-0 top-full mt-2 z-20 w-40 border border-narka-grey bg-[#1C1C1C] shadow-none">
                {[
                  { label: 'Export JSON', action: onExportJSON },
                  { label: 'Export MD', action: onExportMarkdown },
                  { label: 'Export PNG', action: onExportPNG }
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={() => { item.action(); setExportOpen(false); }}
                    className="w-full px-3 py-2 text-left text-[10px] tracking-widest uppercase text-narka-grey hover:text-narka-light hover:bg-[#252525] border-b border-[#333333] last:border-0 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <button
          onClick={onOpenHelp}
          className="p-1.5 text-narka-grey hover:text-narka-light transition-colors"
          title="Help"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onLeave}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-narka-light text-narka-dark text-[10px] tracking-widest uppercase font-bold hover:bg-[#d4d4d4] transition-colors rounded-none"
        >
          <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
