"use client"

import { useEffect } from "react"
import { APP_VERSION } from "@/lib/version"

export function VersionReporter() {
  useEffect(() => {
    // Generate a semi-persistent user ID
    let userId = localStorage.getItem("user_id")
    if (!userId) {
      userId = `user_${Math.random().toString(36).substring(2, 15)}`
      localStorage.setItem("user_id", userId)
    }

    // Report the version on page load
    const reportVersion = async () => {
      try {
        await fetch("/api/analytics/version", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ version: APP_VERSION, userId }),
        })
      } catch (error) {
        console.error("Failed to report version:", error)
      }
    }

    reportVersion()

    // Report again every 24 hours
    const interval = setInterval(reportVersion, 24 * 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  // This component doesn't render anything
  return null
}
