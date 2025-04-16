"use client"

import { useEffect } from "react"
import { toast } from "@/components/ui/use-toast"

// This component handles real-time data synchronization
export function DataSync() {
  useEffect(() => {
    let eventSource: EventSource | null = null

    const setupSSE = () => {
      // Close any existing connection
      if (eventSource) {
        eventSource.close()
      }

      // Create a new EventSource connection
      eventSource = new EventSource("/api/data-sync")

      // Handle connection open
      eventSource.onopen = () => {
        console.log("SSE connection established")
      }

      // Handle data updates
      eventSource.addEventListener("data-update", (event) => {
        try {
          const data = JSON.parse(event.data)
          if (data.key && data.timestamp) {
            // Publish an event that other components can listen for
            const updateEvent = new CustomEvent("data-updated", {
              detail: { key: data.key, timestamp: data.timestamp },
            })
            window.dispatchEvent(updateEvent)

            // Optionally show a toast notification
            toast({
              title: "Data Updated",
              description: `${data.key} has been updated.`,
              duration: 3000,
            })
          }
        } catch (error) {
          console.error("Error processing SSE event:", error)
        }
      })

      // Handle errors
      eventSource.onerror = (error) => {
        console.error("SSE connection error:", error)
        // Close the connection
        eventSource?.close()
        // Try to reconnect after a delay
        setTimeout(setupSSE, 5000)
      }
    }

    // Set up the SSE connection
    setupSSE()

    // Clean up on unmount
    return () => {
      if (eventSource) {
        eventSource.close()
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
