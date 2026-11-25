import { X, MousePointer2, Layers, Share2, Download } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingModal({ isOpen, onClose }: OnboardingModalProps): JSX.Element | null {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1C1C1C]/90 p-4 font-sans backdrop-blur-sm">
      <div className="w-full max-w-lg border border-narka-grey bg-[#1C1C1C] shadow-none">
        <div className="flex items-center justify-between px-6 py-4 border-b border-narka-grey">
          <h2 className="text-sm font-bold tracking-widest uppercase text-narka-light">
            System Guide / Quick Start
          </h2>
          <button onClick={onClose} className="text-narka-grey hover:text-narka-light transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-1"><Share2 className="w-5 h-5 text-narka-beige" /></div>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-narka-light">1. Share & Collaborate</h3>
                <p className="text-xs text-narka-grey mt-1 leading-relaxed">
                  Copy your Room ID from the top bar and send it to a peer. Anyone with the ID (and Access Key, if set) can join instantly. Data flows P2P — no servers.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1"><MousePointer2 className="w-5 h-5 text-narka-beige" /></div>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-narka-light">2. Live Multi-Cursor</h3>
                <p className="text-xs text-narka-grey mt-1 leading-relaxed">
                  Draw on the canvas and type in the editor simultaneously. You will see peer cursors and text selections update in real-time.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1"><Layers className="w-5 h-5 text-narka-beige" /></div>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-narka-light">3. Independent Undo/Redo</h3>
                <p className="text-xs text-narka-grey mt-1 leading-relaxed">
                  Use <kbd className="font-mono bg-[#333] px-1 py-0.5 text-narka-light border border-narka-grey">Ctrl+Z</kbd> / <kbd className="font-mono bg-[#333] px-1 py-0.5 text-narka-light border border-narka-grey">Ctrl+Y</kbd> to undo/redo. Your history is yours alone — you won't accidentally undo a peer's work.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1"><Download className="w-5 h-5 text-narka-beige" /></div>
              <div>
                <h3 className="text-xs font-bold tracking-widest uppercase text-narka-light">4. Export Anywhere</h3>
                <p className="text-xs text-narka-grey mt-1 leading-relaxed">
                  Use the Data menu in the top bar to export your whiteboard as PNG, or the whole workspace as JSON/Markdown.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-narka-grey">
          <button
            onClick={onClose}
            className="w-full py-3 bg-narka-beige text-narka-dark text-xs tracking-widest uppercase font-bold hover:bg-[#c4b4a6] transition-colors rounded-none"
          >
            Acknowledge & Enter
          </button>
        </div>
      </div>
    </div>
  );
}
