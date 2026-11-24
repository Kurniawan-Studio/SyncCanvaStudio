// src/components/MarkdownEditor.tsx
import { useCallback, useRef } from 'react';
import * as Y from 'yjs';
import type { PeerSelection, PeerUser } from '../hooks/useP2PSync';
import { useCollabText } from '../hooks/useCollabText';

interface MarkdownEditorProps {
  ytext: Y.Text;
  peers: PeerUser[];
  setLocalSelection: (selection: PeerSelection | null) => void;
}

interface SelectionRange {
  peerId: number;
  start: number;
  end: number;
  color: string;
}

function renderHighlightedText(
  text: string,
  selections: SelectionRange[],
): React.ReactNode {
  if (selections.length === 0) {
    return text;
  }

  const boundaries = new Set<number>([0, text.length]);
  selections.forEach((selection) => {
    if (selection.start > 0 && selection.start < text.length) {
      boundaries.add(selection.start);
    }
    if (selection.end > 0 && selection.end < text.length) {
      boundaries.add(selection.end);
    }
  });

  const points = Array.from(boundaries).sort((a, b) => a - b);
  const nodes: React.ReactNode[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    const start = points[index];
    const end = points[index + 1];
    if (typeof start !== 'number' || typeof end !== 'number' || end <= start) {
      continue;
    }
    const segmentText = text.slice(start, end);
    const covering = selections.filter(
      (selection) => selection.start <= start && selection.end >= end,
    );
    if (covering.length === 0) {
      nodes.push(<span key={index}>{segmentText}</span>);
    } else {
      const lead = covering[0];
      const background = lead ? `${lead.color}33` : 'transparent';
      nodes.push(
        <span key={index} style={{ backgroundColor: background }}>
          {segmentText}
        </span>,
      );
    }
  }

  return nodes;
}

export function MarkdownEditor({
  ytext,
  peers,
  setLocalSelection,
}: MarkdownEditorProps): JSX.Element {
  const { value, updateValue, updateSelection, clearSelection } = useCollabText({
    ytext,
    field: 'markdown',
    setLocalSelection,
  });

  const overlayRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((event: React.UIEvent<HTMLTextAreaElement>): void => {
    if (overlayRef.current) {
      overlayRef.current.scrollTop = event.currentTarget.scrollTop;
      overlayRef.current.scrollLeft = event.currentTarget.scrollLeft;
    }
  }, []);

  const selectionRanges: SelectionRange[] = peers
    .filter(
      (peer): peer is PeerUser & { selection: PeerSelection } =>
        peer.selection !== null &&
        peer.selection.field === 'markdown' &&
        peer.selection.start !== peer.selection.end,
    )
    .map((peer) => ({
      peerId: peer.clientId,
      start: peer.selection.start,
      end: peer.selection.end,
      color: peer.color,
    }));

  const editingPeers = peers.filter((peer) => peer.selection?.field === 'markdown');

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
        <span className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
          Markdown
        </span>
        <div className="flex items-center gap-1">
          {editingPeers.map((peer) => (
            <span
              key={peer.clientId}
              className="px-2 py-0.5 rounded-full text-[10px] font-medium text-white"
              style={{ backgroundColor: peer.color }}
            >
              {peer.name}
            </span>
          ))}
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={overlayRef}
          className="absolute inset-0 p-4 text-sm font-mono leading-relaxed whitespace-pre-wrap break-words text-transparent pointer-events-none overflow-hidden no-scrollbar"
          aria-hidden
        >
          {renderHighlightedText(value, selectionRanges)}
        </div>
        <textarea
          value={value}
          onChange={(event) => updateValue(event.target.value)}
          onSelect={(event) =>
            updateSelection(event.currentTarget.selectionStart, event.currentTarget.selectionEnd)
          }
          onBlur={clearSelection}
          onScroll={handleScroll}
          placeholder="Write your collaborative markdown here..."
          spellCheck={false}
          className="absolute inset-0 w-full h-full p-4 text-sm font-mono leading-relaxed bg-transparent text-slate-100 resize-none border-0 outline-none focus:outline-none focus:ring-0 placeholder:text-slate-600 no-scrollbar"
        />
      </div>
    </div>
  );
}
