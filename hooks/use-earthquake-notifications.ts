"use client"

import { useState, useEffect, useRef } from "react"
import { playSound } from "@/utils/sound"
import type { Earthquake } from "@/types/earthquake"
import { useLocalStorage } from "@/hooks/use-local-storage"

// Increase the threshold from 15 to 30
const HIGH_ACTIVITY_THRESHOLD = 30

export function useEarthquakeNotifications(earthquakes: Earthquake[]) {
    // Store the previously seen earthquakes for comparison
    const [previousEarthquakes, setPreviousEarthquakes] = useState<Record<string, Earthquake>>({})

    // Store notification settings in localStorage with a higher default volume
    const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage("earthquakeNotificationsEnabled", true)
    const [notificationVolume, setNotificationVolume] = useLocalStorage("earthquakeNotificationVolume", 0.7)

    // Add a new localStorage setting for MLW notifications
    const [mlwNotificationsEnabled, setMlwNotificationsEnabled] = useLocalStorage(
        "earthquakeMlwNotificationsEnabled",
        true,
    )

    // Track the last hour's earthquakes for filtering
    const lastHourEarthquakesRef = useRef<Earthquake[]>([])

    // Process earthquakes and trigger notifications
    useEffect(() => {
        if (!earthquakes.length || !notificationsEnabled) return

        // Get current time for filtering
        const now = Date.now()
        const oneHourAgo = now - 60 * 60 * 1000

        // Update the last hour's earthquakes
        lastHourEarthquakesRef.current = earthquakes.filter((quake) => new Date(quake.timestamp).getTime() > oneHourAgo)

        // Count earthquakes in the last hour
        const lastHourCount = lastHourEarthquakesRef.current.length

        // Create a map of current earthquakes by ID
        const currentEarthquakes: Record<string, Earthquake> = {}
        earthquakes.forEach((quake) => {
            const quakeId = `${quake.timestamp}-${quake.latitude}-${quake.longitude}-${quake.depth}-${quake.size}`
            currentEarthquakes[quakeId] = quake
        })

        // Find new earthquakes and review status changes
        const newEarthquakes: Earthquake[] = []
        const reviewChangedEarthquakes: Earthquake[] = []

        // Check for new earthquakes or review status changes
        Object.entries(currentEarthquakes).forEach(([id, quake]) => {
            const previousQuake = previousEarthquakes[id]

            // If this is a new earthquake
            if (!previousQuake) {
                newEarthquakes.push(quake)
            }
            // If the review status changed from "am" to "mlw"
            else if (previousQuake.review === "am" && quake.review === "mlw") {
                reviewChangedEarthquakes.push(quake)
            }
        })

        // Update the shouldNotify function to respect the MLW notifications setting
        const shouldNotify = (quake: Earthquake) => {
            // For review status changes, check if MLW notifications are enabled and magnitude > 1
            if (quake.review === "mlw") {
                if (!mlwNotificationsEnabled) {
                    return false
                }
                if (quake.size <= 1) {
                    return false
                }
            }

            // If there are more than 30 earthquakes in the last hour (increased from 15)
            if (lastHourCount > HIGH_ACTIVITY_THRESHOLD) {
                // Only notify for earthquakes with magnitude > 1
                return quake.size > 1
            }
            // Otherwise notify for all earthquakes
            return true
        }

        // Play notification sounds for new earthquakes that pass the filter
        newEarthquakes.filter(shouldNotify).forEach((quake) => {
            try {
                playSound(notificationVolume)
                console.log(`New earthquake notification: M${quake.size.toFixed(1)} at ${quake.humanReadableLocation}`)
            } catch (error) {
                console.error("Failed to play notification for new earthquake:", error)
            }
        })

        // Always play notification for review status changes
        reviewChangedEarthquakes.filter(shouldNotify).forEach((quake) => {
            try {
                playSound(notificationVolume)
                console.log(`Earthquake review status changed: M${quake.size.toFixed(1)} at ${quake.humanReadableLocation}`)
            } catch (error) {
                console.error("Failed to play notification for review status change:", error)
            }
        })

        // Update previous earthquakes for next comparison
        setPreviousEarthquakes(currentEarthquakes)
    }, [earthquakes, notificationsEnabled, notificationVolume, mlwNotificationsEnabled])

    // Update the return statement to include the new state
    return {
        notificationsEnabled,
        setNotificationsEnabled,
        notificationVolume,
        setNotificationVolume,
        recentEarthquakeCount: lastHourEarthquakesRef.current.length,
        highActivityThreshold: HIGH_ACTIVITY_THRESHOLD,
        mlwNotificationsEnabled,
        setMlwNotificationsEnabled,
    }
}