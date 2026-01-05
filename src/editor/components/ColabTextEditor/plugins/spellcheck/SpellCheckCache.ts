const CACHE_STORAGE_KEY = 'colabri_spellcheck_cache_v1';
const MAX_CACHE_BYTES = 2 * 1024 * 1024; // 2 MB ceiling
const ENTRY_TTL_MS = 1000 * 60 * 5; // 5 minutes

export type SpellCheckCachePayload = {
  matches: any[];
  [key: string]: any;
};

type CacheEntry = {
  ts: number;
  size: number;
  data: SpellCheckCachePayload;
};

type CacheStore = {
  totalSize: number;
  order: string[];
  entries: Record<string, CacheEntry>;
};

type CacheContext = {
  storage: Storage;
  store: CacheStore;
};

const createEmptyStore = (): CacheStore => ({
  totalSize: 0,
  order: [],
  entries: {},
});

const getStorage = (): Storage | null => {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage;
  } catch (error) {
    console.warn('SpellCheck cache unavailable', error);
    return null;
  }
};

const loadCacheContext = (): CacheContext | null => {
  const storage = getStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(CACHE_STORAGE_KEY);
    if (!raw) {
      return { storage, store: createEmptyStore() };
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { storage, store: createEmptyStore() };
    }

    const store: CacheStore = {
      totalSize:
        typeof (parsed as any).totalSize === 'number'
          ? (parsed as any).totalSize
          : 0,
      order: Array.isArray((parsed as any).order)
        ? [...(parsed as any).order]
        : [],
      entries:
        typeof (parsed as any).entries === 'object' && (parsed as any).entries
          ? { ...(parsed as any).entries }
          : {},
    };

    return { storage, store };
  } catch (error) {
    console.warn('SpellCheck cache read failed', error);
    storage.removeItem(CACHE_STORAGE_KEY);
    return { storage, store: createEmptyStore() };
  }
};

const persistCacheContext = (context: CacheContext) => {
  try {
    context.storage.setItem(CACHE_STORAGE_KEY, JSON.stringify(context.store));
  } catch (error) {
    console.warn('SpellCheck cache write failed', error);
  }
};

const removeEntry = (store: CacheStore, key: string) => {
  const entry = store.entries[key];
  if (!entry) {
    return;
  }
  delete store.entries[key];
  const index = store.order.indexOf(key);
  if (index !== -1) {
    store.order.splice(index, 1);
  }
  store.totalSize = Math.max(0, store.totalSize - entry.size);
};

const evictUntilFits = (store: CacheStore, bytesNeeded: number) => {
  while (
    store.totalSize + bytesNeeded > MAX_CACHE_BYTES &&
    store.order.length
  ) {
    const oldestKey = store.order[0];
    removeEntry(store, oldestKey);
  }
};

const prioritizeKey = (store: CacheStore, key: string) => {
  const index = store.order.indexOf(key);
  if (index !== -1) {
    store.order.splice(index, 1);
  }
  store.order.push(key);
};

const hashText = (value: string) => {
  let hash = 0;
  for (let idx = 0; idx < value.length; idx += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(idx);
    hash |= 0;
  }
  return hash.toString(16);
};

const buildCacheKey = (langCode: string | undefined, text: string) => {
  const normalizedLang = (langCode || 'auto').toLowerCase();
  return `${normalizedLang}|${hashText(text)}`;
};

export const getCachedSpellCheckResult = (
  langCode: string | undefined,
  text: string,
): SpellCheckCachePayload | null => {
  const context = loadCacheContext();
  if (!context) {
    return null;
  }

  const key = buildCacheKey(langCode, text);
  const entry = context.store.entries[key];
  if (!entry) {
    return null;
  }

  const isExpired = Date.now() - entry.ts > ENTRY_TTL_MS;
  if (isExpired) {
    removeEntry(context.store, key);
    persistCacheContext(context);
    return null;
  }

  prioritizeKey(context.store, key);
  persistCacheContext(context);
  return entry.data;
};

export const setCachedSpellCheckResult = (
  langCode: string | undefined,
  text: string,
  data: SpellCheckCachePayload,
) => {
  const context = loadCacheContext();
  if (!context) {
    return;
  }

  const serializedData = JSON.stringify(data);
  const entrySize = serializedData.length;
  if (entrySize > MAX_CACHE_BYTES) {
    return;
  }

  const key = buildCacheKey(langCode, text);
  removeEntry(context.store, key);
  evictUntilFits(context.store, entrySize);

  const entry: CacheEntry = {
    ts: Date.now(),
    size: entrySize,
    data,
  };

  context.store.entries[key] = entry;
  context.store.order.push(key);
  context.store.totalSize += entrySize;

  persistCacheContext(context);
};
