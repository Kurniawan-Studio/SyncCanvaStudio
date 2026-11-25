import { useCallback, useEffect, useState } from 'react';
import { PenTool, FileText, Code2 } from 'lucide-react';
import { useP2PSync, SHARED_KEYS } from './hooks/useP2PSync';
import { RoomJoinModal, type JoinConfig } from './components/RoomJoinModal';
import { TopBar } from './components/TopBar';
import { WhiteboardCanvas } from './components/WhiteboardCanvas';
import { MarkdownEditor } from './components/MarkdownEditor';
import { CodeEditor } from './components/CodeEditor';
import { OnboardingModal } from './components/OnboardingModal';
import { DEFAULT_MARKDOWN, DEFAULT_CODE } from './lib/constants';
import { exportToJSON, exportToMarkdown, exportToPNG } from './lib/exporters';

type MobileTab = 'canvas' | 'markdown' | 'code';

interface WorkspaceProps {
  config: JoinConfig;
  onLeave: () => void;
}

function Workspace({ config, onLeave }: WorkspaceProps): JSX.Element {
  const sync = useP2PSync({
    roomId: config.roomId,
    password: config.password,
    user: { name: config.userName, color: config.userColor },
  });

  const { doc, status, peers, undoState, undo, redo, transact } = sync;
  const [mobileTab, setMobileTab] = useState<MobileTab>('canvas');
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const markdownText = doc.getText(SHARED_KEYS.markdown);
  const codeText = doc.getText(SHARED_KEYS.code);

  useEffect(() => {
    if (!config.isCreator) return;
    const meta = doc.getMap<unknown>('__meta');
    if (meta.get('seeded') === true) return;
    doc.transact(() => {
      if (meta.get('seeded') === true) return;
      meta.set('seeded', true);
      if (markdownText.length === 0) markdownText.insert(0, DEFAULT_MARKDOWN);
      if (codeText.length === 0) codeText.insert(0, DEFAULT_CODE);
    }, null);
  }, [config.isCreator, doc, markdownText, codeText]);

  useEffect(() => {
    const handler = (event: KeyboardEvent): void => {
      const isModifier = event.ctrlKey || event.metaKey;
      if (!isModifier) return;
      if (event.key === 'z' && !event.shiftKey) { event.preventDefault(); undo(); }
      else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') { event.preventDefault(); redo(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleExportJSON = useCallback(() => exportToJSON(doc, config.roomId), [doc, config.roomId]);
  const handleExportMarkdown = useCallback(() => exportToMarkdown(doc, config.roomId), [doc, config.roomId]);
  const handleExportPNG = useCallback(() => exportToPNG(doc, config.roomId), [doc, config.roomId]);

  return (
    <div className="flex flex-col h-[100dvh] bg-[#1C1C1C] text-narka-light font-sans overflow-hidden">
      <TopBar
        roomId={config.roomId} status={status} peers={peers} localUser={{ name: config.userName, color: config.userColor }}
        onLeave={onLeave} onExportJSON={handleExportJSON} onExportMarkdown={handleExportMarkdown} onExportPNG={handleExportPNG}
        onOpenHelp={() => setShowHelp(true)}
      />

      {status.error && (
        <div className="px-4 py-1.5 bg-[#ff3d00]/10 border-b border-[#ff3d00] text-[#ff3d00] text-[10px] tracking-widest uppercase truncate">
          [ERR] {status.error}
        </div>
      )}

      {/* Main Content Area - Responsive Split */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CANVAS PANEL */}
        <div className={`flex-1 relative border-r border-narka-grey ${mobileTab !== 'canvas' ? 'hidden md:block' : 'block'}`}>
          <WhiteboardCanvas
            doc={doc} transact={transact} peers={peers} setLocalCursor={sync.setLocalCursor}
            onUndo={undo} onRedo={redo} canUndo={undoState.canUndo} canRedo={undoState.canRedo}
          />
        </div>

        {/* EDITOR PANEL */}
        <div className={`w-full md:w-[480px] flex-shrink-0 flex-col bg-[#1C1C1C] ${mobileTab === 'canvas' ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex border-b border-narka-grey bg-[#1C1C1C]">
            <button
              onClick={() => setMobileTab('markdown')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors border-r border-narka-grey flex items-center justify-center gap-2 ${
                mobileTab === 'markdown' || (mobileTab !== 'code' && mobileTab !== 'canvas' && window.innerWidth >= 768) ? 'bg-narka-beige text-narka-dark' : 'text-narka-grey hover:text-narka-light'
              }`}
            >
              <FileText className="w-3 h-3" /> Markdown
            </button>
            <button
              onClick={() => setMobileTab('code')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 ${
                mobileTab === 'code' ? 'bg-narka-beige text-narka-dark' : 'text-narka-grey hover:text-narka-light'
              }`}
            >
              <Code2 className="w-3 h-3" /> Code
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {mobileTab === 'code' ? (
              <CodeEditor ytext={codeText} peers={peers} setLocalSelection={sync.setLocalSelection} />
            ) : (
              <MarkdownEditor ytext={markdownText} peers={peers} setLocalSelection={sync.setLocalSelection} />
            )}
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden flex border-t border-narka-grey bg-[#1C1C1C]">
        <button
          onClick={() => setMobileTab('canvas')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'canvas' ? 'text-narka-beige' : 'text-narka-grey'}`}
        >
          <PenTool className="w-4 h-4" /> Canvas
        </button>
        <button
          onClick={() => setMobileTab('markdown')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors border-l border-r border-narka-grey ${mobileTab === 'markdown' ? 'text-narka-beige' : 'text-narka-grey'}`}
        >
          <FileText className="w-4 h-4" /> Markdown
        </button>
        <button
          onClick={() => setMobileTab('code')}
          className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 text-[9px] font-bold uppercase tracking-widest transition-colors ${mobileTab === 'code' ? 'text-narka-beige' : 'text-narka-grey'}`}
        >
          <Code2 className="w-4 h-4" /> Code
        </button>
      </div>

      <OnboardingModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
}

export default function App(): JSX.Element {
  const [config, setConfig] = useState<JoinConfig | null>(null);

  const handleLeave = useCallback(() => setConfig(null), []);

  return (
    <div className="h-full bg-[#1C1C1C]">
      <RoomJoinModal isOpen={config === null} onJoin={(next) => setConfig(next)} />
      {config && <Workspace key={config.roomId} config={config} onLeave={handleLeave} />}
    </div>
  );
}
