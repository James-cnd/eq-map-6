"use client"

import { useState, useEffect, useRef } from "react"
import type { Earthquake } from "@/types/earthquake"
import { useGlobalSettings } from "./use-global-settings"

// Sample data to use as fallback when API fails
const FALLBACK_DATA: Earthquake[] = [
  {
    id: "fallback-1",
    timestamp: new Date().toISOString(),
    latitude: 63.9,
    longitude: -22.0,
    depth: 5.2,
    size: 3.5,
    quality: 90,
    humanReadableLocation: "Reykjanes Peninsula (63.90°N, 22.00°W)",
    review: "mlw",
  },
  {
    id: "fallback-2",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    latitude: 64.0,
    longitude: -21.8,
    depth: 3.1,
    size: 2.7,
    quality: 85,
    humanReadableLocation: "Near Reykjavík (64.00°N, 21.80°W)",
    review: "am",
  },
  {
    id: "fallback-3",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    latitude: 63.8,
    longitude: -22.2,
    depth: 6.5,
    size: 1.9,
    quality: 80,
    humanReadableLocation: "Reykjanes Peninsula (63.80°N, 22.20°W)",
    review: "mlw",
  },
]

export function useEarthquakes() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const lastSuccessfulFetch = useRef<number | null>(null)
  const isFetchingRef = useRef(false)
  const failedAttemptsRef = useRef(0)

  // Get refresh interval from global settings
  const { globalSettings } = useGlobalSettings()

  // Default to 10 seconds if not specified in settings
  const refreshInterval = globalSettings.refreshInterval || 10

  useEffect(() => {
    const fetchEarthquakes = async () => {
      // Prevent concurrent fetches
      if (isFetchingRef.current) return

      try {
        isFetchingRef.current = true

        // Don't clear error if we're retrying - this keeps the error message visible
        if (failedAttemptsRef.current === 0) {
          setError(null)
        }

        // Check if we need to throttle requests (if last fetch was too recent)
        const now = Date.now()
        if (lastSuccessfulFetch.current && now - lastSuccessfulFetch.current < refreshInterval * 1000 * 0.9) {
          console.log("Throttling API request - too soon since last successful fetch")
          isFetchingRef.current = false
          return
        }

        // Add retry logic
        let retryCount = 0
        const maxRetries = 2 // Reduced from 3 to 2 to avoid too many requests
        let success = false

        while (!success && retryCount < maxRetries) {
          try {
            console.log(`Attempt ${retryCount + 1}: Fetching earthquake data...`)

            // Make the request to our API endpoint with a timeout
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

            try {
              const response = await fetch("/api/earthquakes", {
                cache: "no-store",
                next: { revalidate: 0 },
                signal: controller.signal,
              })

              // Clear the timeout
              clearTimeout(timeoutId)

              if (!response.ok) {
                // Special handling for rate limiting (429)
                if (response.status === 429) {
                  console.warn("Rate limit exceeded. Backing off...")
                  throw new Error("Rate limit exceeded. Please try again later.")
                }
                throw new Error(`API returned status ${response.status}`)
              }

              // Get the response text first to check if it's valid JSON
              const responseText = await response.text()

              // Check if the response is empty
              if (!responseText || responseText.trim() === "") {
                console.error("Empty response received from API")
                throw new Error("Empty response received from API")
              }

              // Try to parse the JSON
              let data
              try {
                data = JSON.parse(responseText)
              } catch (parseError) {
                console.error("Failed to parse JSON response:", parseError)
                throw new Error("Invalid JSON response from API")
              }

              if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
                setEarthquakes(data.data)
                setLastUpdated(data.timestamp || Date.now())
                lastSuccessfulFetch.current = Date.now()
                setIsLoading(false)
                setIsMockData(false)
                failedAttemptsRef.current = 0 // Reset failed attempts counter
                success = true
                return
              } else {
                // If we got a response but no data, show error
                console.error("No earthquake data found in API response:", data)
                throw new Error(data.error || "No earthquake data found in API response")
              }
            } catch (abortError) {
              // Clear the timeout
              clearTimeout(timeoutId)

              // Check if it was an abort error (timeout)
              if (abortError.name === "AbortError") {
                console.error("Request timed out after 15 seconds")
                throw new Error("Request to earthquake API timed out")
              }

              // Re-throw other errors
              throw abortError
            }
          } catch (apiError) {
            console.error(`Attempt ${retryCount + 1} failed:`, apiError)
            retryCount++

            if (retryCount < maxRetries) {
              // Wait before retrying (exponential backoff with longer delays)
              await new Promise((resolve) => setTimeout(resolve, 2000 * Math.pow(2, retryCount)))
            } else {
              throw apiError
            }
          }
        }

        // If we reach here and success is still false, use existing data if available
        if (!success) {
          console.log("All API attempts failed")
          failedAttemptsRef.current += 1

          // Use existing data if available
          if (earthquakes.length > 0 && lastSuccessfulFetch.current) {
            console.log("Using existing earthquake data as fallback")
            setIsLoading(false)
            setError(new Error("Could not fetch new data. Showing previously loaded earthquakes."))
            return
          }

          // If no existing data, use fallback data
          console.log("Using fallback earthquake data")
          setEarthquakes(FALLBACK_DATA)
          setLastUpdated(Date.now())
          setIsLoading(false)
          setIsMockData(true)
          setError(new Error("Unable to fetch earthquake data. Showing sample data."))
          return
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err)
        failedAttemptsRef.current += 1

        // If we have existing data, keep using it instead of showing an error
        if (earthquakes.length > 0 && lastSuccessfulFetch.current) {
          console.log("Using existing earthquake data as fallback")
          setIsLoading(false)
          setError(new Error("Could not fetch new data. Showing previously loaded earthquakes."))
          return
        }

        // Use fallback data if we have no existing data
        console.log("Using fallback earthquake data")
        setEarthquakes(FALLBACK_DATA)
        setLastUpdated(Date.now())
        setIsLoading(false)
        setIsMockData(true)
        setError(
          err instanceof Error
            ? new Error(`Error: ${err.message}. Showing sample data.`)
            : new Error("Unknown error occurred. Showing sample data."),
        )
      } finally {
        setIsLoading(false)
        isFetchingRef.current = false
      }
    }

    // Fetch immediately
    fetchEarthquakes()

    // Then set up polling with the specified interval (in seconds)
    console.log(`Setting up polling interval: ${refreshInterval} seconds`)
    const intervalId = setInterval(fetchEarthquakes, refreshInterval * 1000)

    // Clean up interval on unmount
    return () => {
      console.log("Cleaning up earthquake data polling interval")
      clearInterval(intervalId)
    }
  }, [refreshInterval, earthquakes.length]) // Only re-run if refreshInterval changes or earthquakes array length changes

  return { earthquakes, isLoading, error, lastUpdated, isMockData }
}
