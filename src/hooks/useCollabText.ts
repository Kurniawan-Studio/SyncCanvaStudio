// src/hooks/useCollabText.ts
import { useCallback, useEffect, useState } from 'react';
import * as Y from 'yjs';
import type { WorkspaceField } from './useP2PSync';

/**
 * Apply a minimal delete+insert diff between the current Y.Text value and
 * a new plain string. Used by controlled textareas so that concurrent remote
 * edits are preserved by Yjs rather than being clobbered.
 */
export function applyTextDiff(ytext: Y.Text, newValue: string): void {
  const oldValue = ytext.toString();
  if (oldValue === newValue) {
    return;
  }

  let start = 0;
  const minLen = Math.min(oldValue.length, newValue.length);
  while (start < minLen && oldValue[start] === newValue[start]) {
    start += 1;
  }

  let endOld = oldValue.length;
  let endNew = newValue.length;
  while (
    endOld > start &&
    endNew > start &&
    oldValue[endOld - 1] === newValue[endNew - 1]
  ) {
    endOld -= 1;
    endNew -= 1;
  }

  const deleteCount = endOld - start;
  const insertText = newValue.slice(start, endNew);

  ytext.doc?.transact(() => {
    if (deleteCount > 0) {
      ytext.delete(start, deleteCount);
    }
    if (insertText.length > 0) {
      ytext.insert(start, insertText);
    }
  }, null);
}

export interface UseCollabTextOptions {
  ytext: Y.Text;
  field: WorkspaceField;
  setLocalSelection: (
    selection: { start: number; end: number; field: WorkspaceField } | null,
  ) => void;
}

export interface UseCollabTextResult {
  value: string;
  updateValue: (nextValue: string) => void;
  updateSelection: (start: number, end: number) => void;
  clearSelection: () => void;
}

export function useCollabText(options: UseCollabTextOptions): UseCollabTextResult {
  const { ytext, field, setLocalSelection } = options;
  const [value, setValue] = useState<string>(() => ytext.toString());

  useEffect(() => {
    const observer = (): void => {
      setValue(ytext.toString());
    };
    ytext.observe(observer);
    return () => {
      ytext.unobserve(observer);
    };
  }, [ytext]);

  const updateValue = useCallback(
    (nextValue: string): void => {
      applyTextDiff(ytext, nextValue);
    },
    [ytext],
  );

  const updateSelection = useCallback(
    (start: number, end: number): void => {
      if (start === end) {
        setLocalSelection(null);
      } else {
        setLocalSelection({ start, end, field });
      }
    },
    [field, setLocalSelection],
  );

  const clearSelection = useCallback((): void => {
    setLocalSelection(null);
  }, [setLocalSelection]);

  return { value, updateValue, updateSelection, clearSelection };
}
