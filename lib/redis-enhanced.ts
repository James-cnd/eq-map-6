import { Redis } from "@upstash/redis"
import { sendUpdateToClients } from "@/app/api/data-sync/route"

// Create a Redis client
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || "",
})

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

// Function to set data with notification
export async function setDataWithNotification(key: string, data: any): Promise<boolean> {
  try {
    await redis.set(key, JSON.stringify(data))

    // Map Redis key to API key for notifications
    let apiKey
    switch (key) {
      case KEYS.LAVA_FLOWS:
        apiKey = "lava-flows"
        break
      case KEYS.BERMS:
        apiKey = "berms"
        break
      case KEYS.GPS_STATIONS:
        apiKey = "gps-stations"
        break
      case KEYS.CUSTOM_SEISMOMETERS:
        apiKey = "seismometers"
        break
      case KEYS.YOUTUBE_FEEDS:
        apiKey = "youtube-feeds"
        break
      case KEYS.GLOBAL_SETTINGS:
        apiKey = "global-settings"
        break
      case KEYS.WELCOME_MESSAGE:
        apiKey = "welcome-message"
        break
      case KEYS.CUSTOM_FISSURES:
        apiKey = "fissures"
        break
      default:
        apiKey = key
    }

    // Send update notification to all connected clients
    sendUpdateToClients(apiKey)

    return true
  } catch (error) {
    console.error(`Error saving data to ${key}:`, error)
    return false
  }
}

// Update all the setter functions to use setDataWithNotification
// For example:

export async function setLavaFlows(lavaFlows: any[]): Promise<boolean> {
  return setDataWithNotification(KEYS.LAVA_FLOWS, lavaFlows)
}

export async function setBerms(berms: any[]): Promise<boolean> {
  return setDataWithNotification(KEYS.BERMS, berms)
}

// ... and so on for all other setter functions
