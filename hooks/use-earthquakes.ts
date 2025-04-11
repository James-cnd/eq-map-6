"use client"

import { useState, useEffect, useRef } from "react"
import type { Earthquake } from "@/types/earthquake"

const getGlobalSettings = () => {
  try {
    const storedSettings = localStorage.getItem("earthquakeGlobalSettings")
    if (storedSettings) {
      return JSON.parse(storedSettings)
    }
  } catch (e) {
    console.error("Error parsing global settings:", e)
  }

  // Default values if not found
  return {
    apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
    refreshInterval: 10,
  }
}

export function useEarthquakes() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const lastSuccessfulFetch = useRef<number | null>(null)

  useEffect(() => {
    const fetchEarthquakes = async () => {
      try {
        setError(null)

        // Add retry logic
        let retryCount = 0
        const maxRetries = 3
        let success = false

        while (!success && retryCount < maxRetries) {
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
            // Using the coordinate order from the Python code
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

            console.log(`Attempt ${retryCount + 1}: Fetching earthquake data...`)

            // Make the POST request with a timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 30000) // Reduced timeout to 30 seconds

            const { apiEndpoint } = getGlobalSettings()
            const response = await fetch(apiEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                // Add additional headers that might help with CORS
                "Access-Control-Allow-Origin": "*",
              },
              body: JSON.stringify(payload),
              signal: controller.signal,
              cache: "no-store",
            })

            clearTimeout(timeoutId)

            // Log the response status for debugging
            console.log(`API Response Status: ${response.status}`)

            // Get the response text
            const responseText = await response.text()
            console.log("API Response:", responseText.substring(0, 200) + "...") // Log just the beginning to avoid huge logs

            // Parse the response if it's valid JSON
            if (response.ok && responseText) {
              try {
                const data = JSON.parse(responseText)

                // Check if we have valid data
                if (data.data && data.data.event_id && data.data.event_id.length > 0) {
                  const transformedData: Earthquake[] = []

                  // Process each earthquake
                  for (let i = 0; i < data.data.event_id.length; i++) {
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

                    const review = data.data.magnitude_type[i] === "autmag" ? "am" : "mlw"

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
                  }

                  // Sort by timestamp (newest first)
                  transformedData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

                  setEarthquakes(transformedData)
                  setLastUpdated(Date.now())
                  lastSuccessfulFetch.current = Date.now()
                  setIsLoading(false)
                  success = true
                  return
                } else {
                  throw new Error("No earthquake data found in API response")
                }
              } catch (parseError) {
                console.error("Error parsing JSON response:", parseError)
                throw new Error("Failed to parse API response")
              }
            } else {
              throw new Error(`API returned status ${response.status}`)
            }
          } catch (apiError) {
            console.error(`Attempt ${retryCount + 1} failed:`, apiError)
            retryCount++

            if (retryCount < maxRetries) {
              // Wait before retrying (exponential backoff)
              await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount)))
            } else {
              throw apiError
            }
          }
        }

        // If we reach here and success is still false, use fallback data
        if (!success) {
          console.log("All API attempts failed, using fallback data")

          // Use fallback data or cached data if available
          if (earthquakes.length > 0 && lastSuccessfulFetch.current) {
            console.log("Using existing earthquake data as fallback")
            setIsLoading(false)
            setError(new Error("Could not fetch new data. Showing previously loaded earthquakes."))
            return
          }

          // If no fallback data, generate mock data for testing
          if (process.env.NODE_ENV === "development") {
            console.log("Generating mock earthquake data for development")
            const mockData = generateMockEarthquakeData()
            setEarthquakes(mockData)
            setLastUpdated(Date.now())
            setIsLoading(false)
            setError(new Error("Using mock data for development. API connection failed."))
            return
          }

          throw new Error("Failed to fetch earthquake data after multiple attempts")
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err)
        setError(err instanceof Error ? err : new Error("Unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    // Fetch immediately
    fetchEarthquakes()

    // Then set up polling every 10 seconds
    const { refreshInterval } = getGlobalSettings()
    const intervalId = setInterval(fetchEarthquakes, refreshInterval * 1000)

    return () => clearInterval(intervalId)
  }, [])

  function generateMockEarthquakeData(): Earthquake[] {
    const mockData: Earthquake[] = []
    const now = new Date()

    // Generate 50 mock earthquakes
    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - i * 1000 * 60 * 10) // Each 10 minutes apart
      const latitude = 63.8 + Math.random() * 0.5
      const longitude = -22.2 - Math.random() * 0.5
      const depth = Math.random() * 10
      const size = Math.random() * 3

      mockData.push({
        id: `mock-${i}`,
        timestamp: timestamp.toISOString(),
        latitude,
        longitude,
        depth,
        size,
        quality: 0,
        humanReadableLocation: `Reykjanes Peninsula (${latitude.toFixed(2)}°N, ${longitude.toFixed(2)}°W)`,
        review: Math.random() > 0.7 ? "mlw" : "am",
      })
    }

    return mockData
  }

  return { earthquakes, isLoading, error, lastUpdated }
}
