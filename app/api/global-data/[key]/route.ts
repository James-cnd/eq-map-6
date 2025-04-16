import { type NextRequest, NextResponse } from "next/server"
import { redis, KEYS } from "@/lib/redis"

export async function GET(request: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key

  try {
    let data
    let redisKey

    // Map the route parameter to the actual Redis key
    switch (key) {
      case "lava-flows":
        redisKey = KEYS.LAVA_FLOWS
        break
      case "berms":
        redisKey = KEYS.BERMS
        break
      case "gps-stations":
        redisKey = KEYS.GPS_STATIONS
        break
      case "seismometers":
        redisKey = KEYS.CUSTOM_SEISMOMETERS
        break
      case "youtube-feeds":
        redisKey = KEYS.YOUTUBE_FEEDS
        break
      case "global-settings":
        redisKey = KEYS.GLOBAL_SETTINGS
        break
      case "welcome-message":
        redisKey = KEYS.WELCOME_MESSAGE
        break
      case "fissures":
        redisKey = KEYS.CUSTOM_FISSURES
        break
      default:
        return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }

    data = await redis.get(redisKey)

    // Add cache control headers to prevent caching
    return NextResponse.json(data || [], {
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error(`Error fetching ${key}:`, error)
    return NextResponse.json([], {
      status: 500,
      headers: {
        "Cache-Control": "no-store, max-age=0, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  }
}

export async function POST(request: NextRequest, { params }: { params: { key: string } }) {
  const key = params.key

  try {
    const data = await request.json()
    let redisKey

    // Map the route parameter to the actual Redis key
    switch (key) {
      case "lava-flows":
        redisKey = KEYS.LAVA_FLOWS
        break
      case "berms":
        redisKey = KEYS.BERMS
        break
      case "gps-stations":
        redisKey = KEYS.GPS_STATIONS
        break
      case "seismometers":
        redisKey = KEYS.CUSTOM_SEISMOMETERS
        break
      case "youtube-feeds":
        redisKey = KEYS.YOUTUBE_FEEDS
        break
      case "global-settings":
        redisKey = KEYS.GLOBAL_SETTINGS
        break
      case "welcome-message":
        redisKey = KEYS.WELCOME_MESSAGE
        break
      case "fissures":
        redisKey = KEYS.CUSTOM_FISSURES
        break
      default:
        return NextResponse.json({ error: "Invalid key" }, { status: 400 })
    }

    await redis.set(redisKey, data)

    // Add cache control headers to prevent caching
    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error(`Error saving ${key}:`, error)
    return NextResponse.json(
      { success: false, error: String(error) },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
