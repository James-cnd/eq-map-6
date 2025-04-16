import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Redis client
// Note: We're using environment variables that should be set in your Vercel project
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export const runtime = "edge"

/**
 * GET handler - Retrieve data from Redis
 */
export async function GET(request: NextRequest) {
  try {
    // Get the key from the URL query parameters
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 })
    }

    // Fetch data from Redis
    const data = await redis.get(key)

    if (data === null) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching from Redis:", error)
    return NextResponse.json({ error: "Failed to fetch data from Redis" }, { status: 500 })
  }
}

/**
 * POST handler - Store data in Redis
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, expiration } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    // Store data in Redis with optional expiration (in seconds)
    if (expiration) {
      await redis.set(key, value, { ex: expiration })
    } else {
      await redis.set(key, value)
    }

    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error("Error storing in Redis:", error)
    return NextResponse.json({ error: "Failed to store data in Redis" }, { status: 500 })
  }
}

/**
 * DELETE handler - Remove data from Redis
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 })
    }

    // Delete key from Redis
    const deleted = await redis.del(key)

    if (deleted === 0) {
      return NextResponse.json({ error: "Key not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, key })
  } catch (error) {
    console.error("Error deleting from Redis:", error)
    return NextResponse.json({ error: "Failed to delete data from Redis" }, { status: 500 })
  }
}
