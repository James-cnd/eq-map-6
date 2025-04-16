import { NextResponse } from "next/server"
import { getWelcomeMessage, setWelcomeMessage } from "@/lib/storage"

export async function GET() {
  try {
    const message = await getWelcomeMessage()
    return NextResponse.json({ success: true, data: message, source: "storage" })
  } catch (error) {
    console.error("Error fetching welcome message:", error)

    // Return a default welcome message on error
    return NextResponse.json({
      success: true,
      data: {
        title: "Welcome to Icelandic Earthquake Monitor",
        content:
          "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
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
    const success = await setWelcomeMessage(body)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update welcome message",
          localSuccess: true,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error updating welcome message:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update welcome message",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
