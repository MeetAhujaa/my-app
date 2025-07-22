export const getCachedData = (key, maxAgeMs) => {
  if (typeof window === "undefined") return null
  try {
    const cached = localStorage.getItem(key)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < maxAgeMs) {
        return data
      }
    }
  } catch (error) {
    console.error("Error parsing cached data for key:", key, error)
    localStorage.removeItem(key)
  }
  return null
}

export const setCachedData = (key, data) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch (error) {
    console.error("Error setting cached data for key:", key, error)
  }
}

export const CACHE_DURATION_COINS_MS = 43200 * 1000
export const CACHE_DURATION_GLOBAL_MS = 86400 * 1000
export const CACHE_DURATION_DETAIL_MS = 1 * 60 * 1000
export const CACHE_DURATION_HISTORY_MS = 30 * 60 * 1000
