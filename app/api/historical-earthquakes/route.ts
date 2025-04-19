import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get("start")
    const endDate = searchParams.get("end")

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, error: "Start and end dates are required" }, { status: 400 })
    }

    // Validate date format
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json({ success: false, error: "Invalid date format" }, { status: 400 })
    }

    // Format dates for API
    const startStr = start.toISOString().split("T")[0]
    const endStr = end.toISOString().split("T")[0]

    // Fetch data from Icelandic Meteorological Office API
    const apiUrl = `https://api.vedur.is/skjalftalisa/v1/quakedata?start=${startStr}&end=${endStr}`

    console.log(`Fetching historical earthquake data from: ${apiUrl}`)

    // Set up timeout for the fetch request
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Accept: "application/json",
        },
        signal: controller.signal,
        cache: "no-store",
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`)
      }

      // First get the response as text
      const responseText = await response.text()

      // Check if the response is empty
      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response from API")
      }

      // Then parse it as JSON
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Response text:", responseText.substring(0, 200) + "...")
        throw new Error("Invalid JSON response from API")
      }

      // Check if the data has the expected structure
      if (!data.results || !Array.isArray(data.results)) {
        // If the API format has changed or is empty, return sample data
        return NextResponse.json({
          success: true,
          data: getSampleHistoricalData(start, end),
          isMockData: true,
          timestamp: Date.now(),
        })
      }

      // Transform the data to match our Earthquake type
      const transformedData = data.results.map((item: any) => ({
        id: item.id || `eq-${Date.now()}-${Math.random()}`,
        timestamp: item.time,
        latitude: item.lat,
        longitude: item.lon,
        depth: item.depth,
        size: item.size,
        quality: item.quality,
        humanReadableLocation: item.location || "Unknown location",
        review: item.humanReview ? "mlw" : undefined,
      }))

      return NextResponse.json({
        success: true,
        data: transformedData,
        timestamp: Date.now(),
      })
    } catch (fetchError) {
      if (fetchError.name === "AbortError") {
        console.error("Fetch request timed out")
        return NextResponse.json({
          success: true,
          data: getSampleHistoricalData(start, end),
          isMockData: true,
          error: "Request timed out, showing sample data",
          timestamp: Date.now(),
        })
      }
      throw fetchError
    }
  } catch (error) {
    console.error("Error fetching historical earthquake data:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    )
  }
}

// Function to generate sample historical data when the API fails
function getSampleHistoricalData(start: Date, end: Date) {
  const sampleData = []
  const dayDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  const numQuakes = Math.min(dayDiff * 5, 100) // Generate about 5 quakes per day, max 100

  for (let i = 0; i < numQuakes; i++) {
    const quakeDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

    sampleData.push({
      id: `sample-${i}`,
      timestamp: quakeDate.toISOString(),
      latitude: 63.5 + Math.random() * 2, // Iceland latitude range
      longitude: -22 + Math.random() * 4, // Iceland longitude range
      depth: Math.random() * 20,
      size: Math.random() * 4 + 0.5, // Magnitude between 0.5 and 4.5
      quality: Math.random() > 0.5 ? 90 : 50,
      humanReadableLocation: "Sample location in Iceland",
      review: Math.random() > 0.7 ? "mlw" : undefined,
    })
  }

  return sampleData
}
