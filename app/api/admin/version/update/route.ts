import { NextResponse } from "next/server"
import { redis } from "@/lib/redis"

export async function POST(request: Request) {
  try {
    const { newVersion, updateMessage, isCritical } = await request.json()

    // Validate inputs
    if (!newVersion) {
      return NextResponse.json({ success: false, message: "Version number is required" }, { status: 400 })
    }

    // Store the version update information
    await redis.set("current_version", newVersion)
    await redis.set(
      "version_update_info",
      JSON.stringify({
        version: newVersion,
        message: updateMessage,
        isCritical: isCritical,
        releaseDate: new Date().toISOString(),
      }),
    )

    return NextResponse.json({
      success: true,
      message: `Version ${newVersion} has been released successfully`,
    })
  } catch (error) {
    console.error("Error updating version:", error)
    return NextResponse.json({ success: false, message: "Failed to update version" }, { status: 500 })
  }
}
