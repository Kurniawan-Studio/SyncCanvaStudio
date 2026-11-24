// src/App.tsx
import { useCallback, useEffect, useState } from 'react';
import { FileText, Code2 } from 'lucide-react';
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

  // Seed default content — only the creator, only once per room.
  useEffect(() => {
    if (!config.isCreator) return;
    const meta = doc.getMap<unknown>('__meta');
    if (meta.get('seeded') === true) return;

    doc.transact(() => {
      if (meta.get('seeded') === true) return;
      meta.set('seeded', true);
      if (markdownText.length === 0) {
        markdownText.insert(0, DEFAULT_MARKDOWN);
      }
      if (codeText.length === 0) {
        codeText.insert(0, DEFAULT_CODE);
      }
    }, null);
  }, [config.isCreator, doc, markdownText, codeText]);

  // Collaborative undo/redo keyboard shortcuts.
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

  const handleLeave = useCallback((): void => {
    onLeave();
  }, [onLeave]);

  const handleExportJSON = useCallback((): void => {
    exportToJSON(doc, config.roomId);
  }, [doc, config.roomId]);

  const handleExportMarkdown = useCallback((): void => {
    exportToMarkdown(doc, config.roomId);
  }, [doc, config.roomId]);

  const handleExportPNG = useCallback((): void => {
    exportToPNG(doc, config.roomId);
  }, [doc, config.roomId]);

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100">
      <TopBar
        roomId={config.roomId}
        status={status}
        peers={peers}
        localUser={{ name: config.userName, color: config.userColor }}
        onLeave={handleLeave}
        onExportJSON={handleExportJSON}
        onExportMarkdown={handleExportMarkdown}
        onExportPNG={handleExportPNG}
      />

      {status.error ? (
        <div className="px-4 py-2 bg-rose-500/10 border-b border-rose-500/30 text-rose-300 text-xs">
          {status.error}
        </div>
      ) : null}

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 min-w-0 relative bg-slate-900/30">
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

        <div className="w-[480px] flex-shrink-0 flex flex-col border-l border-slate-800 bg-slate-900/50">
          <div className="flex border-b border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('markdown')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                activeTab === 'markdown'
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Markdown
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('code')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
                activeTab === 'code'
                  ? 'bg-slate-800 text-slate-100 border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" /> Code
            </button>
          </div>

          <div className="flex-1 overflow-hidden">
            {activeTab === 'markdown' ? (
              <MarkdownEditor
                ytext={markdownText}
                peers={peers}
                setLocalSelection={sync.setLocalSelection}
              />
            ) : (
              <CodeEditor
                ytext={codeText}
                peers={peers}
                setLocalSelection={sync.setLocalSelection}
              />
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

  const handleLeave = useCallback((): void => {
    setConfig(null);
  }, []);

  return (
    <div className="h-full bg-slate-950">
      <RoomJoinModal
        isOpen={config === null}
        onJoin={(next) => setConfig(next)}
      />
      {config ? (
        <Workspace
          key={config.roomId}
          config={config}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLeave={handleLeave}
        />
      ) : null}
    </div>
  );
}
