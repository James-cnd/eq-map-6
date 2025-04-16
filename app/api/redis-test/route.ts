import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Try to ping Redis to check connectivity
    const result = await redis.ping()

    // Return environment variables (sanitized) for debugging
    const envVars = {
      KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Not set",
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
      KV_URL: process.env.KV_URL ? "Set" : "Not set",
      REDIS_URL: process.env.REDIS_URL ? "Set" : "Not set",
    }

    return NextResponse.json({
      success: true,
      ping: result,
      message: "Redis connection successful",
      environment: envVars,
    })
  } catch (error) {
    console.error("Redis test failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Redis connection failed",
        details: error instanceof Error ? error.message : String(error),
        environment: {
          KV_REST_API_URL: process.env.KV_REST_API_URL ? "Set" : "Not set",
          KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? "Set" : "Not set",
          KV_URL: process.env.KV_URL ? "Set" : "Not set",
          REDIS_URL: process.env.REDIS_URL ? "Set" : "Not set",
        },
      },
      { status: 500 },
    )
  }
}
