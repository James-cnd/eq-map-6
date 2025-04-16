import { Redis } from "@upstash/redis"
import { type NextRequest, NextResponse } from "next/server"

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL || "",
  token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
})

export const runtime = "edge"

/**
 * GET handler - Get list items
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")
    const start = Number.parseInt(searchParams.get("start") || "0")
    const end = Number.parseInt(searchParams.get("end") || "-1")

    if (!key) {
      return NextResponse.json({ error: "Key parameter is required" }, { status: 400 })
    }

    // Get list items
    const items = await redis.lrange(key, start, end)

    return NextResponse.json({ key, items })
  } catch (error) {
    console.error("Error fetching list:", error)
    return NextResponse.json({ error: "Failed to fetch list" }, { status: 500 })
  }
}

/**
 * POST handler - Add item to list
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, position = "right" } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    let newLength: number

    // Add item to list (either left or right)
    if (position === "left") {
      newLength = await redis.lpush(key, value)
    } else {
      newLength = await redis.rpush(key, value)
    }

    return NextResponse.json({
      success: true,
      key,
      length: newLength,
    })
  } catch (error) {
    console.error("Error adding to list:", error)
    return NextResponse.json({ error: "Failed to add item to list" }, { status: 500 })
  }
}

/**
 * DELETE handler - Remove item from list
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value, count = 1 } = body

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 })
    }

    // Remove item from list
    const removed = await redis.lrem(key, count, value)

    return NextResponse.json({
      success: true,
      key,
      removed,
    })
  } catch (error) {
    console.error("Error removing from list:", error)
    return NextResponse.json({ error: "Failed to remove item from list" }, { status: 500 })
  }
}
