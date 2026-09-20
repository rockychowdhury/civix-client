type Listener = () => void;

const cache = new Map<string, string | null>();
const listeners = new Map<string, Set<Listener>>();

function getListeners(key: string) {
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  return set;
}

function notifyListeners(set: Set<Listener>) {
  for (const listener of set) {
    listener();
  }
}

export function subscribeToStoredValue(key: string, listener: Listener) {
  const set = getListeners(key);

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== key) return;
    cache.set(key, event.newValue);
    notifyListeners(set);
  };

  set.add(listener);
  window.addEventListener("storage", handleStorage);

  return () => {
    set.delete(listener);
    window.removeEventListener("storage", handleStorage);
  };
}

export function getStoredValueSnapshot(key: string) {
  if (!cache.has(key)) {
    cache.set(key, window.localStorage.getItem(key));
  }
  return cache.get(key) ?? null;
}

export function getStoredValueServerSnapshot() {
  return null;
}

export function setStoredValue(key: string, value: string) {
  cache.set(key, value);
  window.localStorage.setItem(key, value);
  notifyListeners(getListeners(key));
}
