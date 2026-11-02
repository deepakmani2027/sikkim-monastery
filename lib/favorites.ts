export type FavoriteStore = {
  [userId: string]: string[] // monastery ids
}

const STORAGE_KEY = "sikkim_monasteries_favorites_v1"

function readStore(): FavoriteStore {
  if (typeof window === "undefined") return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeStore(store: FavoriteStore) {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
  } catch {}
}

export function getFavorites(userId: string | undefined | null): string[] {
  if (!userId) return []
  const store = readStore()
  return store[userId] ?? []
}

export function isFavorite(userId: string | undefined | null, monasteryId: string): boolean {
  if (!userId) return false
  const favs = getFavorites(userId)
  return favs.includes(monasteryId)
}

export function addFavorite(userId: string | undefined | null, monasteryId: string): string[] {
  if (!userId) return []
  const store = readStore()
  const current = store[userId] ?? []
  if (!current.includes(monasteryId)) current.unshift(monasteryId)
  store[userId] = current
  writeStore(store)
  return current
}

export function removeFavorite(userId: string | undefined | null, monasteryId: string): string[] {
  if (!userId) return []
  const store = readStore()
  const current = (store[userId] ?? []).filter((id) => id !== monasteryId)
  store[userId] = current
  writeStore(store)
  return current
}

export function toggleFavorite(userId: string | undefined | null, monasteryId: string): {
  list: string[]
  active: boolean
} {
  if (!userId) return { list: [], active: false }
  const active = isFavorite(userId, monasteryId)
  const list = active ? removeFavorite(userId, monasteryId) : addFavorite(userId, monasteryId)
  return { list, active: !active }
}
