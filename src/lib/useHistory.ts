import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Edits arriving faster than this to the same field are merged into one
 * undo step, so a drag on the gradient picker undoes as a single change.
 */
const COALESCE_MS = 400;

type Entry<T> = { state: T; field: string | null; at: number };

/**
 * A value with an undo/redo stack. `set` names the field it changes so
 * rapid edits to one control fold into a single step. Cmd+Z and
 * Cmd+Shift+Z (Ctrl on other platforms) walk the stack, except while a
 * text field has focus, where the browser's own undo applies.
 */
export function useHistory<T>(initial: () => T) {
  const [state, setState] = useState(initial);
  const past = useRef<Entry<T>[]>([]);
  const future = useRef<T[]>([]);
  const current = useRef<Entry<T>>(null as unknown as Entry<T>);
  if (current.current === null) current.current = { state, field: null, at: 0 };

  const set = useCallback((field: string, update: T | ((prev: T) => T)) => {
    const prev = current.current;
    const next = typeof update === "function" ? (update as (p: T) => T)(prev.state) : update;
    if (Object.is(next, prev.state)) return;
    const now = Date.now();
    const merge = prev.field === field && now - prev.at < COALESCE_MS;
    if (!merge) past.current.push(prev);
    future.current = [];
    current.current = { state: next, field, at: now };
    setState(next);
  }, []);

  const undo = useCallback(() => {
    const entry = past.current.pop();
    if (!entry) return;
    future.current.push(current.current.state);
    current.current = { state: entry.state, field: null, at: 0 };
    setState(entry.state);
  }, []);

  const redo = useCallback(() => {
    const next = future.current.pop();
    if (next === undefined) return;
    past.current.push(current.current);
    current.current = { state: next, field: null, at: 0 };
    setState(next);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.metaKey || e.ctrlKey) || e.altKey || e.key.toLowerCase() !== "z") return;
      if (isTextTarget(e.target)) return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  return { state, set, undo, redo };
}

function isTextTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return (
    target.isContentEditable ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement
  );
}
