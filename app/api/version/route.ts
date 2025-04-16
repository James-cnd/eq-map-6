import { NextResponse } from "next/server"
import { APP_VERSION } from "@/lib/version"
import { redis } from "@/lib/redis"

export async function GET() {
  try {
    // Get the current version from Redis
    const currentVersion = (await redis.get("current_version")) || APP_VERSION

    // Get update information
    const updateInfoStr = await redis.get("version_update_info")
    let updateInfo = null

    if (updateInfoStr) {
      try {
        updateInfo = JSON.parse(String(updateInfoStr))
      } catch (e) {
        console.error("Error parsing update info:", e)
      }
    }

    // Add cache control headers to prevent caching
    return NextResponse.json(
      {
        version: currentVersion,
        timestamp: Date.now(),
        updateInfo,
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  } catch (error) {
    console.error("Error fetching version info:", error)
    return NextResponse.json(
      { version: APP_VERSION, timestamp: Date.now() },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}
