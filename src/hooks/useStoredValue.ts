"use client";

import { useCallback, useSyncExternalStore } from "react";

import {
  getStoredValueServerSnapshot,
  getStoredValueSnapshot,
  subscribeToStoredValue,
} from "@/lib/local-storage-store";

export function useStoredValue(key: string) {
  const subscribe = useCallback(
    (listener: () => void) => subscribeToStoredValue(key, listener),
    [key],
  );
  const getSnapshot = useCallback(() => getStoredValueSnapshot(key), [key]);

  return useSyncExternalStore(subscribe, getSnapshot, getStoredValueServerSnapshot);
}
