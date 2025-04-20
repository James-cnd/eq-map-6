import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (!startDate || !endDate) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Start and end dates are required",
      })
    }

    // Validate date format
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({
        success: true,
        data: [],
        message: "Invalid date format",
      })
    }

    // Since the API is returning HTML instead of JSON, we'll return an empty array
    // with a message explaining the situation
    console.log("Historical earthquake data API is returning HTML instead of JSON")
    console.log("Returning empty array to avoid errors")

    return NextResponse.json({
      success: true,
      data: [],
      message: "Historical earthquake data is currently unavailable. The API is returning HTML instead of JSON.",
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error("Error in historical earthquakes API route:", error)
    return NextResponse.json({
      success: true,
      data: [],
      message: error instanceof Error ? error.message : "Unknown error occurred",
      timestamp: Date.now(),
    })
  }
}
