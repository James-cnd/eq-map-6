"use client"

import { useState, useEffect, useRef } from "react"
import type { Earthquake } from "@/types/earthquake"
import { useGlobalSettings } from "./use-global-settings"

export function useEarthquakes() {
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const [isMockData, setIsMockData] = useState(false)
  const lastSuccessfulFetch = useRef<number | null>(null)
  const isFetchingRef = useRef(false)

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
        setError(null)

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

            // Make the request to our API endpoint
            const response = await fetch("/api/earthquakes", {
              cache: "no-store",
              next: { revalidate: 0 },
            })

            if (!response.ok) {
              // Special handling for rate limiting (429)
              if (response.status === 429) {
                console.warn("Rate limit exceeded. Backing off...")
                throw new Error("Rate limit exceeded. Please try again later.")
              }
              throw new Error(`API returned status ${response.status}`)
            }

            const data = await response.json()

            if (data.success && data.data && Array.isArray(data.data) && data.data.length > 0) {
              setEarthquakes(data.data)
              setLastUpdated(data.timestamp || Date.now())
              lastSuccessfulFetch.current = Date.now()
              setIsLoading(false)
              success = true
              return
            } else {
              // If we got a response but no data, show error
              console.error("No earthquake data found in API response:", data)
              throw new Error(data.error || "No earthquake data found in API response")
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

          // Use existing data if available
          if (earthquakes.length > 0 && lastSuccessfulFetch.current) {
            console.log("Using existing earthquake data as fallback")
            setIsLoading(false)
            setError(new Error("Could not fetch new data. Showing previously loaded earthquakes."))
            return
          }

          // If no existing data, show error
          setEarthquakes([])
          setIsLoading(false)
          setError(new Error("Unable to fetch earthquake data. Please try again later."))
          return
        }
      } catch (err) {
        console.error("Error fetching earthquake data:", err)

        // If we have existing data, keep using it instead of showing an error
        if (earthquakes.length > 0 && lastSuccessfulFetch.current) {
          console.log("Using existing earthquake data as fallback")
          setIsLoading(false)
          setError(new Error("Could not fetch new data. Showing previously loaded earthquakes."))
          return
        }

        // Otherwise, show error
        setEarthquakes([])
        setIsLoading(false)
        setError(err instanceof Error ? err : new Error("Unknown error occurred"))
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
