import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { version, userId } = await request.json()

    // Store the user's version in Redis
    // Use a hash structure to store user:version mappings
    await redis.hset("user_versions", userId || `anon_${Date.now()}`, version)

    // Increment the count for this version
    await redis.hincrby("version_counts", version, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error tracking version:", error)
    return NextResponse.json({ success: false, error: "Failed to track version" }, { status: 500 })
  }
}
