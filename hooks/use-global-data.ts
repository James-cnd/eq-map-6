"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"
import { dispatchCustomEvent } from "@/utils/events"

export function useGlobalData<T>(
  dataType: string,
  localStorageKey: string,
  defaultValue: T,
): {
  data: T
  setData: (data: T) => Promise<boolean>
  isLoading: boolean
  error: Error | null
  lastUpdated: number | null
} {
  const [data, setLocalData] = useLocalStorage<T>(localStorageKey, defaultValue)
  const [serverData, setServerData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)

  // Fetch data from server
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/map-data?type=${dataType}`)

        if (!response.ok) {
          throw new Error(`Failed to fetch ${dataType}: ${response.statusText}`)
        }

        const result = await response.json()

        if (result.success && result.data) {
          setServerData(result.data as T)
          // Only update local data if it's different to avoid infinite loops
          if (JSON.stringify(result.data) !== JSON.stringify(data)) {
            setLocalData(result.data as T)
          }
          setLastUpdated(result.timestamp)
        }
      } catch (err) {
        console.error(`Error fetching ${dataType}:`, err)
        setError(err instanceof Error ? err : new Error(String(err)))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()

    // Set up polling to check for updates every 30 seconds
    const intervalId = setInterval(fetchData, 30000)

    // Listen for custom events to update data
    const handleDataChanged = () => {
      fetchData()
    }

    window.addEventListener(`${dataType}Changed`, handleDataChanged)

    return () => {
      clearInterval(intervalId)
      window.removeEventListener(`${dataType}Changed`, handleDataChanged)
    }
  }, [dataType]) // Remove setLocalData and data from dependencies

  // Function to update data both locally and on the server
  const setData = async (newData: T): Promise<boolean> => {
    try {
      // Only update local data if it's different to avoid infinite loops
      if (JSON.stringify(newData) !== JSON.stringify(data)) {
        setLocalData(newData)
      }

      // Send data to server
      const response = await fetch(`/api/map-data?type=${dataType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      })

      if (!response.ok) {
        throw new Error(`Failed to save ${dataType}: ${response.statusText}`)
      }

      const result = await response.json()

      if (result.success) {
        setLastUpdated(result.timestamp)

        // Dispatch a custom event to notify other components
        dispatchCustomEvent(`${dataType}Changed`, newData)

        return true
      } else {
        throw new Error(result.error || `Failed to save ${dataType}`)
      }
    } catch (err) {
      console.error(`Error saving ${dataType}:`, err)
      setError(err instanceof Error ? err : new Error(String(err)))
      return false
    }
  }

  // Use server data if available, otherwise use local data
  const currentData = serverData !== null ? serverData : data

  return {
    data: currentData,
    setData,
    isLoading,
    error,
    lastUpdated,
  }
}
