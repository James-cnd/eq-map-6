import { redis } from "./redis"

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

// Default values for various data types
const DEFAULTS = {
  GLOBAL_SETTINGS: {
    apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
    refreshInterval: 10,
    notificationThreshold: 30,
    version: 1,
  },
  WELCOME_MESSAGE: {
    title: "Welcome to Icelandic Earthquake Monitor",
    content:
      "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
    version: 1,
  },
  YOUTUBE_FEEDS: [
    { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
    { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
    { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
  ],
}

// Flag to completely disable Redis
const DISABLE_REDIS = true

// Helper function to get data from localStorage
function getFromLocalStorage(key: string, defaultValue: any): any {
  if (typeof window === "undefined") return defaultValue

  try {
    const item = window.localStorage.getItem(key)
    if (!item) return defaultValue
    return JSON.parse(item)
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Helper function to save data to localStorage
function saveToLocalStorage(key: string, value: any): boolean {
  if (typeof window === "undefined") return false

  try {
    window.localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error)
    return false
  }
}

// Function to get global settings
export async function getGlobalSettings(): Promise<any> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return getFromLocalStorage(KEYS.GLOBAL_SETTINGS, DEFAULTS.GLOBAL_SETTINGS)
  }

  // This code will only run on the server if Redis is enabled
  try {
    const data = await redis.get(KEYS.GLOBAL_SETTINGS)
    if (!data) return DEFAULTS.GLOBAL_SETTINGS

    if (typeof data === "object" && !Array.isArray(data)) {
      return data
    }

    try {
      return JSON.parse(String(data))
    } catch (parseError) {
      console.error("Error parsing global settings:", parseError)
      return DEFAULTS.GLOBAL_SETTINGS
    }
  } catch (error) {
    console.error("Error fetching global settings:", error)
    return DEFAULTS.GLOBAL_SETTINGS
  }
}

// Function to set global settings
export async function setGlobalSettings(settings: any): Promise<boolean> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return saveToLocalStorage(KEYS.GLOBAL_SETTINGS, settings)
  }

  // This code will only run on the server if Redis is enabled
  try {
    await redis.set(KEYS.GLOBAL_SETTINGS, JSON.stringify(settings))
    return true
  } catch (error) {
    console.error("Error saving global settings:", error)
    return false
  }
}

// Function to get welcome message
export async function getWelcomeMessage(): Promise<any> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return getFromLocalStorage(KEYS.WELCOME_MESSAGE, DEFAULTS.WELCOME_MESSAGE)
  }

  // This code will only run on the server if Redis is enabled
  try {
    const data = await redis.get(KEYS.WELCOME_MESSAGE)
    if (!data) return DEFAULTS.WELCOME_MESSAGE

    if (typeof data === "object" && !Array.isArray(data)) {
      return data
    }

    try {
      return JSON.parse(String(data))
    } catch (parseError) {
      console.error("Error parsing welcome message:", parseError)
      return DEFAULTS.WELCOME_MESSAGE
    }
  } catch (error) {
    console.error("Error fetching welcome message:", error)
    return DEFAULTS.WELCOME_MESSAGE
  }
}

// Function to set welcome message
export async function setWelcomeMessage(message: any): Promise<boolean> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return saveToLocalStorage(KEYS.WELCOME_MESSAGE, message)
  }

  // This code will only run on the server if Redis is enabled
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
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return getFromLocalStorage(KEYS.GPS_STATIONS, {})
  }

  // This code will only run on the server if Redis is enabled
  try {
    const data = await redis.get(KEYS.GPS_STATIONS)
    if (!data) return {}

    if (typeof data === "object" && !Array.isArray(data)) {
      return data as Record<string, string>
    }

    try {
      return JSON.parse(String(data)) as Record<string, string>
    } catch (parseError) {
      console.error("Error parsing GPS stations data:", parseError)
      return {}
    }
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

    // Always use localStorage
    if (DISABLE_REDIS || typeof window !== "undefined") {
      return saveToLocalStorage(KEYS.GPS_STATIONS, updatedLinks)
    }

    // This code will only run on the server if Redis is enabled
    await redis.set(KEYS.GPS_STATIONS, updatedLinks)
    return true
  } catch (error) {
    console.error("Error updating GPS station link:", error)
    return false
  }
}

// Function to get fissures
export async function getFissures(): Promise<any[]> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return getFromLocalStorage(KEYS.CUSTOM_FISSURES, [])
  }

  // This code will only run on the server if Redis is enabled
  try {
    const data = await redis.get(KEYS.CUSTOM_FISSURES)
    if (!data) return []

    if (Array.isArray(data)) {
      return data
    }

    try {
      return JSON.parse(String(data)) as any[]
    } catch (parseError) {
      console.error("Error parsing fissures data:", parseError)
      return []
    }
  } catch (error) {
    console.error("Error fetching fissures:", error)
    return []
  }
}

// Function to set fissures
export async function setFissures(fissures: any[]): Promise<boolean> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return saveToLocalStorage(KEYS.CUSTOM_FISSURES, fissures)
  }

  // This code will only run on the server if Redis is enabled
  try {
    await redis.set(KEYS.CUSTOM_FISSURES, fissures)
    return true
  } catch (error) {
    console.error("Error saving fissures:", error)
    return false
  }
}

// Function to get YouTube feeds
export async function getYoutubeFeeds(): Promise<any[]> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return getFromLocalStorage(KEYS.YOUTUBE_FEEDS, DEFAULTS.YOUTUBE_FEEDS)
  }

  // This code will only run on the server if Redis is enabled
  try {
    const data = await redis.get(KEYS.YOUTUBE_FEEDS)
    if (!data) return DEFAULTS.YOUTUBE_FEEDS

    if (Array.isArray(data)) {
      return data
    }

    try {
      return JSON.parse(String(data)) as any[]
    } catch (parseError) {
      console.error("Error parsing YouTube feeds data:", parseError)
      return DEFAULTS.YOUTUBE_FEEDS
    }
  } catch (error) {
    console.error("Error fetching YouTube feeds:", error)
    return DEFAULTS.YOUTUBE_FEEDS
  }
}

// Function to set YouTube feeds
export async function setYoutubeFeeds(feeds: any[]): Promise<boolean> {
  // Always use localStorage
  if (DISABLE_REDIS || typeof window !== "undefined") {
    return saveToLocalStorage(KEYS.YOUTUBE_FEEDS, feeds)
  }

  // This code will only run on the server if Redis is enabled
  try {
    await redis.set(KEYS.YOUTUBE_FEEDS, feeds)
    return true
  } catch (error) {
    console.error("Error saving YouTube feeds:", error)
    return false
  }
}

// Add similar functions for other data types (lava flows, berms, seismometers)
// following the same pattern
