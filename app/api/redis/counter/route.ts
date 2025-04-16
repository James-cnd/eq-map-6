import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export const runtime = "edge"

/**
 * GET handler - Get counter value
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 })
    }

    // Get counter value
    const value = await redis.get(key)

    return NextResponse.json({
      key,
      value: value === null ? 0 : value,
    })
  } catch (error) {
    console.error("Error fetching counter:", error)
    return NextResponse.json({ error: "Failed to fetch counter" }, { status: 500 })
  }
}

/**
 * POST handler - Increment counter
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, increment = 1 } = body

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 })
    }

    // Increment counter
    const newValue = await redis.incrby(key, increment)

    return NextResponse.json({ key, value: newValue })
  } catch (error) {
    console.error("Error incrementing counter:", error)
    return NextResponse.json({ error: "Failed to increment counter" }, { status: 500 })
  }
}
