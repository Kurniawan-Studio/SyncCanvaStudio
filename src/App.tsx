import { useCallback, useEffect, useState } from 'react';
import { useP2PSync, SHARED_KEYS } from './hooks/useP2PSync';
import { RoomJoinModal, type JoinConfig } from './components/RoomJoinModal';
import { TopBar } from './components/TopBar';
import { WhiteboardCanvas } from './components/WhiteboardCanvas';
import { MarkdownEditor } from './components/MarkdownEditor';
import { CodeEditor } from './components/CodeEditor';
import { DEFAULT_MARKDOWN, DEFAULT_CODE } from './lib/constants';
import { exportToJSON, exportToMarkdown, exportToPNG } from './lib/exporters';

type EditorTab = 'markdown' | 'code';

interface WorkspaceProps {
  config: JoinConfig;
  activeTab: EditorTab;
  setActiveTab: (tab: EditorTab) => void;
  onLeave: () => void;
}

function Workspace({ config, activeTab, setActiveTab, onLeave }: WorkspaceProps): JSX.Element {
  const sync = useP2PSync({
    roomId: config.roomId,
    password: config.password,
    user: { name: config.userName, color: config.userColor },
  });

  const { doc, status, peers, undoState, undo, redo, transact } = sync;

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
      if (event.key === 'z' && !event.shiftKey) {
        event.preventDefault();
        undo();
      } else if ((event.key === 'z' && event.shiftKey) || event.key === 'y') {
        event.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [undo, redo]);

  const handleExportJSON = useCallback(() => exportToJSON(doc, config.roomId), [doc, config.roomId]);
  const handleExportMarkdown = useCallback(() => exportToMarkdown(doc, config.roomId), [doc, config.roomId]);
  const handleExportPNG = useCallback(() => exportToPNG(doc, config.roomId), [doc, config.roomId]);

  return (
    <div className="flex flex-col h-screen bg-[#1C1C1C] text-narka-light font-sans">
      <TopBar
        roomId={config.roomId}
        status={status}
        peers={peers}
        localUser={{ name: config.userName, color: config.userColor }}
        onLeave={onLeave}
        onExportJSON={handleExportJSON}
        onExportMarkdown={handleExportMarkdown}
        onExportPNG={handleExportPNG}
      />

      {status.error && (
        <div className="px-6 py-2 bg-[#ff3d00]/10 border-b border-[#ff3d00] text-[#ff3d00] text-[10px] tracking-widest uppercase">
          [SYS.ERR] {status.error}
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 relative border-r border-narka-grey">
          <WhiteboardCanvas
            doc={doc}
            transact={transact}
            peers={peers}
            setLocalCursor={sync.setLocalCursor}
            onUndo={undo}
            onRedo={redo}
            canUndo={undoState.canUndo}
            canRedo={undoState.canRedo}
          />
        </div>

        <div className="w-[480px] flex-shrink-0 flex flex-col bg-[#1C1C1C]">
          <div className="flex border-b border-narka-grey">
            <button
              onClick={() => setActiveTab('markdown')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors border-r border-narka-grey ${
                activeTab === 'markdown'
                  ? 'bg-narka-beige text-narka-dark'
                  : 'text-narka-grey hover:text-narka-light'
              }`}
            >
              01 / Markdown
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-3 text-[10px] font-bold tracking-widest uppercase transition-colors ${
                activeTab === 'code'
                  ? 'bg-narka-beige text-narka-dark'
                  : 'text-narka-grey hover:text-narka-light'
              }`}
            >
              02 / Code
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'markdown' ? (
              <MarkdownEditor ytext={markdownText} peers={peers} setLocalSelection={sync.setLocalSelection} />
            ) : (
              <CodeEditor ytext={codeText} peers={peers} setLocalSelection={sync.setLocalSelection} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App(): JSX.Element {
  const [config, setConfig] = useState<JoinConfig | null>(null);
  const [activeTab, setActiveTab] = useState<EditorTab>('markdown');

  const handleLeave = useCallback(() => setConfig(null), []);

  return (
    <div className="h-full bg-[#1C1C1C]">
      <RoomJoinModal isOpen={config === null} onJoin={(next) => setConfig(next)} />
      {config && (
        <Workspace
          key={config.roomId}
          config={config}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLeave={handleLeave}
        />
      )}
    </div>
  );
}
