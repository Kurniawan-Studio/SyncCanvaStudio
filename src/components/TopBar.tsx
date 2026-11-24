// src/components/TopBar.tsx
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
  roomId,
  status,
  peers,
  localUser,
  onLeave,
  onExportJSON,
  onExportMarkdown,
  onExportPNG,
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
    <header className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-400" />
          <span className="text-sm font-semibold text-slate-100">{APP_NAME}</span>
        </div>
        <div className="h-5 w-px bg-slate-800" />
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
          title="Copy room ID"
        >
          <span>{roomId}</span>
          <Copy className="w-3 h-3" />
          {copied ? <span className="text-emerald-400 text-[10px]">Copied!</span> : null}
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center -space-x-1.5">
          {allUsers.slice(0, 5).map((user, index) => (
            <div
              key={`${user.clientId}-${index}`}
              className="w-6 h-6 rounded-full border-2 border-slate-900 flex items-center justify-center text-[10px] font-semibold text-white"
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {allUsers.length > 5 ? (
            <div className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[10px] font-semibold text-slate-300">
              +{allUsers.length - 5}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-800 text-xs">
          {status.isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">{status.peerCount} peers</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-slate-500" />
              <span className="text-slate-500">Offline</span>
            </>
          )}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setExportOpen((prev) => !prev)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          {exportOpen ? (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setExportOpen(false)}
                aria-hidden
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg bg-slate-800 border border-slate-700 shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onExportJSON();
                    setExportOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700"
                >
                  Export as JSON
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportMarkdown();
                    setExportOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700"
                >
                  Export as Markdown
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onExportPNG();
                    setExportOpen(false);
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-slate-200 hover:bg-slate-700"
                >
                  Export Canvas as PNG
                </button>
              </div>
            </>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onLeave}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" /> Leave
        </button>
      </div>
    </header>
  );
}
