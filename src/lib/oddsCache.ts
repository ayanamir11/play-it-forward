const TTL_MS = 5 * 60 * 1000

type Entry = { data: unknown; expiresAt: number }
const store = new Map<string, Entry>()

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }
  return entry.data as T
}

export function cacheSet(key: string, data: unknown): void {
  store.set(key, { data, expiresAt: Date.now() + TTL_MS })
}

export function cacheGetAllEvents<T>(): T[] {
  const results: T[] = []
  for (const [key, entry] of store) {
    if (!key.startsWith('events:')) continue
    if (Date.now() > entry.expiresAt) {
      store.delete(key)
      continue
    }
    if (Array.isArray(entry.data)) {
      results.push(...(entry.data as T[]))
    }
  }
  return results
}
