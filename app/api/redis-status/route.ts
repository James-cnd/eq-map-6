import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Try to ping Redis to check connectivity
    const pingResult = await redis.ping()

    // Return success response with environment variable info (sanitized)
    return NextResponse.json({
      success: true,
      ping: pingResult,
      env: {
        UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "Set" : "Not set",
        UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "Set" : "Not set",
        KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Not set",
        KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
      },
    })
  } catch (error) {
    console.error("Redis connection test failed:", error)

    // Return error response with details
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        env: {
          UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? "Set" : "Not set",
          UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? "Set" : "Not set",
          KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Not set",
          KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
        },
      },
      { status: 500 },
    )
  }
}
