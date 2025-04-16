import { NextResponse } from "next/server"
import { getGlobalSettings, setGlobalSettings } from "@/lib/storage"

export async function GET() {
  try {
    const settings = await getGlobalSettings()
    return NextResponse.json({ success: true, data: settings, source: "storage" })
  } catch (error) {
    console.error("Error fetching global settings:", error)

    // Return default settings on error
    return NextResponse.json({
      success: true,
      data: {
        apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
        refreshInterval: 10,
        notificationThreshold: 30,
        version: 1,
      },
      source: "default",
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const success = await setGlobalSettings(body)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update global settings",
          localSuccess: true,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating global settings:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update global settings",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
