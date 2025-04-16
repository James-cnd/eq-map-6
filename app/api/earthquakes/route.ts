import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Get current UTC time
    const currentTime = new Date()

    // Calculate the start time (24 hours ago)
    const startTime = new Date(currentTime)
    startTime.setHours(currentTime.getHours() - 24)

    // Format dates as 'YYYY-MM-DD HH:MM:SS'
    const formatDate = (date: Date) => {
      return date.toISOString().replace("T", " ").substring(0, 19)
    }

    const startTimeStr = formatDate(startTime)
    const endTimeStr = formatDate(currentTime)

    // Define the bounding box for all of Iceland
    const area = [
      [67.0, -26.0], // Top-left corner (lat_end, longitude_start)
      [67.0, -12.0], // Top-right corner (lat_end, longitude_end)
      [62.0, -12.0], // Bottom-right corner (lat_start, longitude_end)
      [62.0, -26.0], // Bottom-left corner (lat_start, longitude_start)
    ]

    // Prepare the payload matching the Python code
    const payload = {
      start_time: startTimeStr,
      end_time: endTimeStr,
      depth_min: 0,
      depth_max: 25,
      size_min: -2, // Include negative magnitudes
      size_max: 10,
      area: area,
      event_type: ["qu"],
      originating_system: ["SIL picks", "SIL aut.mag"],
      magnitude_preference: ["Mlw", "Autmag"],
      fields: ["event_id", "time", "lat", "long", "depth", "magnitude", "magnitude_type", "originating_system"],
    }

    // Make the POST request
    const response = await fetch("https://api.vedur.is/skjalftalisa/v1/quake/array", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error(`API returned status ${response.status}`)
      throw new Error(`API returned status ${response.status}`)
    }

    const data = await response.json()

    // Log the full response for debugging
    console.log("Full API response:", JSON.stringify(data))

    // More robust checking for data structure
    if (!data.data || !data.data.event_id) {
      console.error("Unexpected API response format:", JSON.stringify(data).substring(0, 500))
      throw new Error("Unexpected API response format")
    }

    // More robust checking for event_id
    if (!Array.isArray(data.data.event_id) || data.data.event_id.length === 0) {
      console.error("No earthquake data found in API response")
      throw new Error("No earthquake data found in API response")
    }

    // Transform the data into a more usable format
    const transformedData = []

    // Process each earthquake
    for (let i = 0; i < data.data.event_id.length; i++) {
      try {
        // Ensure all required fields exist
        if (
          data.data.time === undefined ||
          data.data.lat === undefined ||
          data.data.long === undefined ||
          data.data.depth === undefined ||
          data.data.magnitude === undefined
        ) {
          console.error("Missing required fields in earthquake data")
          continue
        }

        // Convert Unix timestamp to date string
        const unixTimestamp = Number.parseInt(data.data.time[i])
        const quakeTime = new Date(unixTimestamp * 1000).toISOString()

        const longitude = data.data.long[i]
        const latitude = data.data.lat[i]

        // Create a more descriptive human-readable location
        let humanReadableLocation = `${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W`

        // Add some basic region identification
        if (latitude >= 63.7 && latitude <= 64.1 && longitude >= -23.0 && longitude <= -21.5) {
          humanReadableLocation = `Reykjanes Peninsula (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`
        } else if (latitude >= 64.0 && latitude <= 64.3 && longitude >= -22.0 && longitude <= -21.5) {
          humanReadableLocation = `Near Reykjavík (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`
        } else if (latitude >= 64.3 && latitude <= 64.5 && longitude >= -17.5 && longitude <= -17.0) {
          humanReadableLocation = `Grímsvötn Area (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`
        } else if (latitude >= 64.6 && latitude <= 64.7 && longitude >= -17.6 && longitude <= -17.2) {
          humanReadableLocation = `Bárðarbunga Area (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`
        } else if (latitude >= 63.5 && latitude <= 63.7 && longitude >= -19.2 && longitude <= -18.7) {
          humanReadableLocation = `Katla Area (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`
        } else if (latitude >= 65.6 && latitude <= 65.8 && longitude >= -17.0 && longitude <= -16.6) {
          humanReadableLocation = `Krafla Area (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`
        }

        // Default to "am" if magnitude_type is undefined
        const review = data.data.magnitude_type && data.data.magnitude_type[i] === "autmag" ? "am" : "mlw"

        transformedData.push({
          id: `${data.data.event_id[i]}`,
          timestamp: quakeTime,
          latitude: latitude,
          longitude: longitude,
          depth: data.data.depth[i],
          size: data.data.magnitude[i],
          quality: 0,
          humanReadableLocation: humanReadableLocation,
          review: review,
        })
      } catch (err) {
        console.error(`Error processing earthquake at index ${i}:`, err)
        // Continue with the next earthquake
      }
    }

    // Sort by timestamp (newest first)
    transformedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      success: true,
      data: transformedData,
      timestamp: Date.now(),
      count: transformedData.length,
    })
  } catch (error) {
    console.error("Error fetching earthquake data:", error)

    // Return error response
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        timestamp: Date.now(),
      },
      { status: 500 },
    )
  }
}
