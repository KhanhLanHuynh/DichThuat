"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";

export type ScrollPaneId = "zh" | "hv" | "vi";

function getScrollRatio(el: HTMLElement): number {
  const max = el.scrollHeight - el.clientHeight;
  return max <= 0 ? 0 : el.scrollTop / max;
}

function setScrollRatio(el: HTMLElement, ratio: number): void {
  const max = el.scrollHeight - el.clientHeight;
  el.scrollTop = ratio * max;
}

interface ScrollSyncContextValue {
  register: (paneId: ScrollPaneId, element: HTMLElement) => void;
  unregister: (paneId: ScrollPaneId) => void;
}

const ScrollSyncContext = createContext<ScrollSyncContextValue | null>(null);

interface ScrollSyncProviderProps {
  enabled: boolean;
  children: ReactNode;
}

export function ScrollSyncProvider({ enabled, children }: ScrollSyncProviderProps) {
  const panesRef = useRef<Map<ScrollPaneId, HTMLElement>>(new Map());
  const isSyncingRef = useRef(false);

  const syncFrom = useCallback((sourceId: ScrollPaneId, ratio: number) => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    for (const [id, el] of panesRef.current) {
      if (id !== sourceId) {
        setScrollRatio(el, ratio);
      }
    }
    requestAnimationFrame(() => {
      isSyncingRef.current = false;
    });
  }, []);

  const register = useCallback(
    (paneId: ScrollPaneId, element: HTMLElement) => {
      if (!enabled) return;

      const existing = panesRef.current.get(paneId);
      if (existing && existing !== element) {
        const cleanup = (existing as HTMLElement & { __scrollSyncCleanup?: () => void })
          .__scrollSyncCleanup;
        cleanup?.();
        delete (existing as HTMLElement & { __scrollSyncCleanup?: () => void }).__scrollSyncCleanup;
      }

      panesRef.current.set(paneId, element);

      const onScroll = () => {
        if (isSyncingRef.current) return;
        syncFrom(paneId, getScrollRatio(element));
      };

      element.addEventListener("scroll", onScroll, { passive: true });
      (element as HTMLElement & { __scrollSyncCleanup?: () => void }).__scrollSyncCleanup =
        () => element.removeEventListener("scroll", onScroll);
    },
    [enabled, syncFrom]
  );

  const unregister = useCallback((paneId: ScrollPaneId) => {
    const el = panesRef.current.get(paneId);
    if (el) {
      const cleanup = (el as HTMLElement & { __scrollSyncCleanup?: () => void })
        .__scrollSyncCleanup;
      cleanup?.();
      delete (el as HTMLElement & { __scrollSyncCleanup?: () => void }).__scrollSyncCleanup;
    }
    panesRef.current.delete(paneId);
  }, []);

  useEffect(() => {
    if (!enabled) {
      for (const paneId of [...panesRef.current.keys()]) {
        unregister(paneId);
      }
    }
  }, [enabled, unregister]);

  const value: ScrollSyncContextValue = { register, unregister };

  return (
    <ScrollSyncContext.Provider value={enabled ? value : null}>
      {children}
    </ScrollSyncContext.Provider>
  );
}

export function useScrollSyncRegister(
  paneId: ScrollPaneId | undefined,
  element: HTMLElement | null
): void {
  const ctx = useContext(ScrollSyncContext);

  useEffect(() => {
    if (!ctx || !paneId || !element) return;
    ctx.register(paneId, element);
    return () => ctx.unregister(paneId);
  }, [ctx, paneId, element]);
}
