"use client"

import { useState, useEffect } from "react"
import { useLocalStorage } from "./use-local-storage"

// Default global settings
const DEFAULT_GLOBAL_SETTINGS = {
  apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
  refreshInterval: 10,
  notificationThreshold: 30,
  version: 1,
}

// Default welcome message
const DEFAULT_WELCOME_MESSAGE = {
  title: "Welcome to Icelandic Earthquake Monitor",
  content:
    "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
  version: 1,
}

export function useGlobalSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Use localStorage as the primary storage mechanism
  const [globalSettings, setGlobalSettings] = useLocalStorage("earthquakeGlobalSettings", DEFAULT_GLOBAL_SETTINGS)
  const [welcomeMessage, setWelcomeMessage] = useLocalStorage("earthquakeWelcomeMessage", DEFAULT_WELCOME_MESSAGE)
  const [gpsStationLinks, setGpsStationLinks] = useState<Record<string, string>>({})

  // Fetch global settings from the API
  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Try to fetch settings from API, but don't worry if it fails
        try {
          const settingsRes = await fetch("/api/settings/global")
          if (settingsRes.ok) {
            const { data } = await settingsRes.json()
            if (data) {
              setGlobalSettings(data)
            }
          }
        } catch (settingsError) {
          console.warn("Could not fetch global settings from API:", settingsError)
          // Continue with localStorage values
        }

        // Try to fetch welcome message from API, but don't worry if it fails
        try {
          const welcomeRes = await fetch("/api/settings/welcome")
          if (welcomeRes.ok) {
            const { data } = await welcomeRes.json()
            if (data) {
              setWelcomeMessage(data)
            }
          }
        } catch (welcomeError) {
          console.warn("Could not fetch welcome message from API:", welcomeError)
          // Continue with localStorage values
        }

        // Try to fetch GPS station links from API, but don't worry if it fails
        try {
          const stationsRes = await fetch("/api/gps-stations")
          if (stationsRes.ok) {
            const { data } = await stationsRes.json()
            if (data) {
              setGpsStationLinks(data)
            }
          }
        } catch (stationsError) {
          console.warn("Could not fetch GPS station links from API:", stationsError)
          // Continue with empty object
        }
      } catch (err) {
        console.error("Error in fetchSettings:", err)
        setError(err instanceof Error ? err : new Error("Failed to fetch settings"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()

    // Listen for global settings changes
    const handleGlobalSettingsChanged = (event: CustomEvent) => {
      setGlobalSettings(event.detail)
    }

    // Listen for welcome message changes
    const handleWelcomeMessageChanged = (event: CustomEvent) => {
      setWelcomeMessage(event.detail)
    }

    // Listen for GPS station links changes
    const handleGpsStationLinksChanged = (event: CustomEvent) => {
      setGpsStationLinks(event.detail)
    }

    window.addEventListener("globalSettingsChanged", handleGlobalSettingsChanged as EventListener)
    window.addEventListener("welcomeMessageChanged", handleWelcomeMessageChanged as EventListener)
    window.addEventListener("gpsStationLinksChanged", handleGpsStationLinksChanged as EventListener)

    return () => {
      window.removeEventListener("globalSettingsChanged", handleGlobalSettingsChanged as EventListener)
      window.removeEventListener("welcomeMessageChanged", handleWelcomeMessageChanged as EventListener)
      window.removeEventListener("gpsStationLinksChanged", handleGpsStationLinksChanged as EventListener)
    }
  }, [])

  return {
    globalSettings,
    welcomeMessage,
    gpsStationLinks,
    isLoading,
    error,
  }
}
