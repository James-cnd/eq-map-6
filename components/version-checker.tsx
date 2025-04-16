"use client"

import { useEffect, useState } from "react"
import { APP_VERSION, isNewerVersion } from "@/lib/version"
import { toast } from "@/components/ui/use-toast"

export function VersionChecker() {
  const [updateInfo, setUpdateInfo] = useState<{
    version: string
    message: string
    isCritical: boolean
    releaseDate: string
  } | null>(null)

  useEffect(() => {
    // Store the current version in localStorage for comparison
    const storedVersion = localStorage.getItem("appVersion")
    if (!storedVersion) {
      localStorage.setItem("appVersion", APP_VERSION)
    }

    // Check for updates every 5 minutes
    const checkForUpdates = async () => {
      try {
        // Add a cache-busting query parameter
        const response = await fetch(`/api/version?t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          const currentVersion = localStorage.getItem("appVersion") || APP_VERSION

          if (data.updateInfo && isNewerVersion(currentVersion, data.updateInfo.version)) {
            setUpdateInfo(data.updateInfo)

            // Show toast notification
            toast({
              title: "New Version Available",
              description: data.updateInfo.message || "Refresh the page to get the latest updates.",
              duration: data.updateInfo.isCritical ? Number.POSITIVE_INFINITY : 10000,
            })
          }
        }
      } catch (error) {
        console.error("Failed to check for updates:", error)
      }
    }

    // Check immediately on component mount
    checkForUpdates()

    // Then check periodically
    const interval = setInterval(checkForUpdates, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (!updateInfo) return null

  // For critical updates, create a modal that can't be dismissed
  if (updateInfo.isCritical) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold mb-2">Critical Update Required</h2>
          <p className="mb-4">
            {updateInfo.message || "A critical update is available. Please refresh to continue using the application."}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Update Now
          </button>
        </div>
      </div>
    )
  }

  // For non-critical updates, show a dismissable notification
  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm">
      <button onClick={() => setUpdateInfo(null)} className="absolute top-2 right-2 text-white">
        ✕
      </button>
      <p className="font-bold">New version available!</p>
      <p className="text-sm mb-2">{updateInfo.message || "Refresh to update to the latest version."}</p>
      <button onClick={() => window.location.reload()} className="bg-white text-blue-600 px-4 py-2 rounded font-medium">
        Refresh Now
      </button>
    </div>
  )
}
