import { NextResponse } from "next/server"
import { getGpsStationsWithLinks, updateGpsStationLink } from "@/lib/storage"

export async function GET() {
  try {
    const stations = await getGpsStationsWithLinks()
    return NextResponse.json({ success: true, data: stations })
  } catch (error) {
    console.error("Error fetching GPS stations:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch GPS stations",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { stationId, link } = body

    if (!stationId || !link) {
      return NextResponse.json({ success: false, error: "Station ID and link are required" }, { status: 400 })
    }

    const success = await updateGpsStationLink(stationId, link)

    if (success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json({ success: false, error: "Failed to update GPS station link" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error updating GPS station link:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update GPS station link",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
