import { Redis } from "@upstash/redis"

// Create a Redis client singleton
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",
})

/**
 * Cache data with Redis
 * @param key - The cache key
 * @param data - The data to cache
 * @param ttl - Time to live in seconds (optional)
 */
export async function cacheData<T>(key: string, data: T, ttl?: number): Promise<void> {
  try {
    if (ttl) {
      await redis.set(key, JSON.stringify(data), { ex: ttl })
    } else {
      await redis.set(key, JSON.stringify(data))
    }
  } catch (error) {
    console.error(`Error caching data for key ${key}:`, error)
    throw error
  }
}

/**
 * Get cached data from Redis
 * @param key - The cache key
 * @returns The cached data or null if not found
 */
export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const data = await redis.get(key)
    if (data === null) return null
    return JSON.parse(data as string) as T
  } catch (error) {
    console.error(`Error getting cached data for key ${key}:`, error)
    throw error
  }
}

/**
 * Delete cached data from Redis
 * @param key - The cache key
 * @returns True if the key was deleted, false otherwise
 */
export async function deleteCachedData(key: string): Promise<boolean> {
  try {
    const result = await redis.del(key)
    return result > 0
  } catch (error) {
    console.error(`Error deleting cached data for key ${key}:`, error)
    throw error
  }
}

/**
 * Increment a counter in Redis
 * @param key - The counter key
 * @param increment - The amount to increment (default: 1)
 * @returns The new counter value
 */
export async function incrementCounter(key: string, increment = 1): Promise<number> {
  try {
    return await redis.incrby(key, increment)
  } catch (error) {
    console.error(`Error incrementing counter for key ${key}:`, error)
    throw error
  }
}

/**
 * Add an item to a Redis list
 * @param key - The list key
 * @param value - The value to add
 * @param position - Whether to add to the left or right of the list (default: 'right')
 * @returns The new length of the list
 */
export async function addToList(key: string, value: any, position: "left" | "right" = "right"): Promise<number> {
  try {
    if (position === "left") {
      return await redis.lpush(key, JSON.stringify(value))
    } else {
      return await redis.rpush(key, JSON.stringify(value))
    }
  } catch (error) {
    console.error(`Error adding to list for key ${key}:`, error)
    throw error
  }
}

/**
 * Get items from a Redis list
 * @param key - The list key
 * @param start - The start index (default: 0)
 * @param end - The end index (default: -1, meaning all items)
 * @returns The list items
 */
export async function getListItems<T>(key: string, start = 0, end = -1): Promise<T[]> {
  try {
    const items = await redis.lrange(key, start, end)
    return items.map((item) => JSON.parse(item as string)) as T[]
  } catch (error) {
    console.error(`Error getting list items for key ${key}:`, error)
    throw error
  }
}

// Keys for different types of data
export const KEYS = {
  GPS_STATIONS: "gps_stations_links",
  CUSTOM_FISSURES: "custom_fissures",
  LAVA_FLOWS: "lava_flows",
  BERMS: "berms",
  CUSTOM_SEISMOMETERS: "custom_seismometers",
  YOUTUBE_FEEDS: "youtube_feeds",
  GLOBAL_SETTINGS: "global_settings",
  WELCOME_MESSAGE: "welcome_message",
}

// Function to get global settings
export async function getGlobalSettings(): Promise<any | null> {
  try {
    // Add a try-catch block specifically for the Redis get operation
    let data
    try {
      data = await redis.get(KEYS.GLOBAL_SETTINGS)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      // Return default settings instead of null
      return {
        apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
        refreshInterval: 10,
        notificationThreshold: 30,
        version: 1,
      }
    }

    // Handle the case where data might not be a string
    if (data === null || data === undefined) {
      return {
        apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
        refreshInterval: 10,
        notificationThreshold: 30,
        version: 1,
      }
    }

    // If data is already an object, return it directly
    if (typeof data === "object" && !Array.isArray(data)) {
      return data
    }

    // Otherwise, try to parse it as JSON
    try {
      return JSON.parse(String(data))
    } catch (parseError) {
      console.error("Error parsing global settings:", parseError)
      return {
        apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
        refreshInterval: 10,
        notificationThreshold: 30,
        version: 1,
      }
    }
  } catch (error) {
    console.error("Error fetching global settings:", error)
    return {
      apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
      refreshInterval: 10,
      notificationThreshold: 30,
      version: 1,
    }
  }
}

// Function to set global settings
export async function setGlobalSettings(settings: any): Promise<boolean> {
  try {
    await redis.set(KEYS.GLOBAL_SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Error saving global settings:", error)
    return false
  }
}

// Function to get welcome message
export async function getWelcomeMessage(): Promise<any | null> {
  try {
    let data
    try {
      data = await redis.get(KEYS.WELCOME_MESSAGE)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return {
        title: "Welcome to Icelandic Earthquake Monitor",
        content:
          "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
        version: 1,
      }
    }

    if (data === null || data === undefined) {
      return {
        title: "Welcome to Icelandic Earthquake Monitor",
        content:
          "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
        version: 1,
      }
    }

    // If data is already an object, return it directly
    if (typeof data === "object" && !Array.isArray(data)) {
      return data
    }

    // Otherwise, try to parse it as JSON
    try {
      return JSON.parse(String(data))
    } catch (parseError) {
      console.error("Error parsing welcome message:", parseError)
      return {
        title: "Welcome to Icelandic Earthquake Monitor",
        content:
          "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
        version: 1,
      }
    }
  } catch (error) {
    console.error("Error fetching welcome message:", error)
    return {
      title: "Welcome to Icelandic Earthquake Monitor",
      content:
        "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
      version: 1,
    }
  }
}

// Function to set welcome message
export async function setWelcomeMessage(message: any): Promise<boolean> {
  try {
    await redis.set(KEYS.WELCOME_MESSAGE, JSON.stringify(message))
    return true
  } catch (error) {
    console.error("Error saving welcome message:", error)
    return false
  }
}

// Function to get all GPS stations with their custom links
export async function getGpsStationsWithLinks(): Promise<Record<string, string>> {
  try {
    let data
    try {
      data = await redis.get(KEYS.GPS_STATIONS)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return {}
    }

    // If data is null or undefined, return empty object
    if (!data) {
      return {}
    }

    // If data is an object, return it
    if (typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, string>
    }

    // Try to parse as JSON if it's a string
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as Record<string, string>
      } catch (parseError) {
        console.error("Error parsing GPS stations data:", parseError)
      }
    }

    // Return empty object as fallback
    return {}
  } catch (error) {
    console.error("Error fetching GPS stations with links:", error)
    return {}
  }
}

// Function to update a GPS station link
export async function updateGpsStationLink(stationId: string, link: string): Promise<boolean> {
  try {
    // Get existing links
    const existingLinks = await getGpsStationsWithLinks()

    // Update the link
    const updatedLinks = {
      ...existingLinks,
      [stationId]: link,
    }

    await redis.set(KEYS.GPS_STATIONS, updatedLinks)
    return true
  } catch (error) {
    console.error("Error updating GPS station link:", error)
    return false
  }
}

// Function to get fissures
export async function getFissures(): Promise<any[]> {
  try {
    let data
    try {
      data = await redis.get(KEYS.CUSTOM_FISSURES)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return []
    }

    // If data is null or undefined, return empty array
    if (!data) {
      return []
    }

    // If data is an array, return it
    if (Array.isArray(data)) {
      return data
    }

    // Try to parse as JSON if it's a string
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as any[]
      } catch (parseError) {
        console.error("Error parsing fissures data:", parseError)
      }
    }

    // Return empty array as fallback
    return []
  } catch (error) {
    console.error("Error fetching fissures:", error)
    return []
  }
}

// Function to set fissures
export async function setFissures(fissures: any[]): Promise<boolean> {
  try {
    await redis.set(KEYS.CUSTOM_FISSURES, fissures)
    return true
  } catch (error) {
    console.error("Error saving fissures:", error)
    return false
  }
}

// Function to get lava flows
export async function getLavaFlows(): Promise<any[]> {
  try {
    let data
    try {
      data = await redis.get(KEYS.LAVA_FLOWS)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return []
    }

    // If data is null or undefined, return empty array
    if (!data) {
      return []
    }

    // If data is an array, return it
    if (Array.isArray(data)) {
      return data
    }

    // Try to parse as JSON if it's a string
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as any[]
      } catch (parseError) {
        console.error("Error parsing lava flows data:", parseError)
      }
    }

    // Return empty array as fallback
    return []
  } catch (error) {
    console.error("Error fetching lava flows:", error)
    return []
  }
}

// Function to set lava flows
export async function setLavaFlows(lavaFlows: any[]): Promise<boolean> {
  try {
    await redis.set(KEYS.LAVA_FLOWS, lavaFlows)
    return true
  } catch (error) {
    console.error("Error saving lava flows:", error)
    return false
  }
}

// Function to get berms
export async function getBerms(): Promise<any[]> {
  try {
    let data
    try {
      data = await redis.get(KEYS.BERMS)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return []
    }

    // If data is null or undefined, return empty array
    if (!data) {
      return []
    }

    // If data is an array, return it
    if (Array.isArray(data)) {
      return data
    }

    // Try to parse as JSON if it's a string
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as any[]
      } catch (parseError) {
        console.error("Error parsing berms data:", parseError)
      }
    }

    // Return empty array as fallback
    return []
  } catch (error) {
    console.error("Error fetching berms:", error)
    return []
  }
}

// Function to set berms
export async function setBerms(berms: any[]): Promise<boolean> {
  try {
    await redis.set(KEYS.BERMS, berms)
    return true
  } catch (error) {
    console.error("Error saving berms:", error)
    return false
  }
}

// Function to get seismometers
export async function getSeismometers(): Promise<any[]> {
  try {
    let data
    try {
      data = await redis.get(KEYS.CUSTOM_SEISMOMETERS)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return []
    }

    // If data is null or undefined, return empty array
    if (!data) {
      return []
    }

    // If data is an array, return it
    if (Array.isArray(data)) {
      return data
    }

    // Try to parse as JSON if it's a string
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as any[]
      } catch (parseError) {
        console.error("Error parsing seismometers data:", parseError)
      }
    }

    // Return empty array as fallback
    return []
  } catch (error) {
    console.error("Error fetching seismometers:", error)
    return []
  }
}

// Function to set seismometers
export async function setSeismometers(seismometers: any[]): Promise<boolean> {
  try {
    await redis.set(KEYS.CUSTOM_SEISMOMETERS, seismometers)
    return true
  } catch (error) {
    console.error("Error saving seismometers:", error)
    return false
  }
}

// Function to get YouTube feeds
export async function getYoutubeFeeds(): Promise<any[]> {
  try {
    let data
    try {
      data = await redis.get(KEYS.YOUTUBE_FEEDS)
    } catch (redisError) {
      console.error("Redis get operation failed:", redisError)
      return [
        { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
        { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
        { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
      ]
    }

    // If data is null or undefined, return default feeds
    if (!data) {
      return [
        { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
        { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
        { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
      ]
    }

    // If data is an array, return it
    if (Array.isArray(data)) {
      return data
    }

    // Try to parse as JSON if it's a string
    if (typeof data === "string") {
      try {
        return JSON.parse(data) as any[]
      } catch (parseError) {
        console.error("Error parsing YouTube feeds data:", parseError)
      }
    }

    // Return default feeds as fallback
    return [
      { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
      { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
      { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
    ]
  } catch (error) {
    console.error("Error fetching YouTube feeds:", error)
    return [
      { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
      { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
      { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
    ]
  }
}

// Function to set YouTube feeds
export async function setYoutubeFeeds(feeds: any[]): Promise<boolean> {
  try {
    await redis.set(KEYS.YOUTUBE_FEEDS, feeds)
    return true
  } catch (error) {
    console.error("Error saving YouTube feeds:", error)
    return false
  }
}
