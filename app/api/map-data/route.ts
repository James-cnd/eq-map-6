import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

// Keys for different types of data
const KEYS = {
  FISSURES: "global_fissures",
  LAVA_FLOWS: "global_lava_flows",
  BERMS: "global_berms",
  SEISMOMETERS: "global_seismometers",
  GPS_STATIONS: "global_gps_stations",
  RASPBERRY_SHAKES: "global_raspberry_shakes",
  YOUTUBE_FEEDS: "global_youtube_feeds",
  MAP_SETTINGS: "global_map_settings",
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const dataType = url.searchParams.get("type")

    if (!dataType) {
      return NextResponse.json({ success: false, error: "Data type is required" }, { status: 400 })
    }

    const key = KEYS[dataType.toUpperCase() as keyof typeof KEYS]
    if (!key) {
      return NextResponse.json({ success: false, error: "Invalid data type" }, { status: 400 })
    }

    // Get data from Redis
    const data = await redis.get(key)

    // Return the data directly without trying to map it
    return NextResponse.json({
      success: true,
      data: data || [],
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error(`Error fetching ${request.url}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const dataType = url.searchParams.get("type")

    if (!dataType) {
      return NextResponse.json({ success: false, error: "Data type is required" }, { status: 400 })
    }

    const key = KEYS[dataType.toUpperCase() as keyof typeof KEYS]
    if (!key) {
      return NextResponse.json({ success: false, error: "Invalid data type" }, { status: 400 })
    }

    // Get data from request body
    const body = await request.json()

    // Save data to Redis
    await redis.set(key, body)

    return NextResponse.json({
      success: true,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error(`Error saving ${request.url}:`, error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}
