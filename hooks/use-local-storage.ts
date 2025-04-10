"use client"

import { useState, useEffect, useRef } from "react"

// Hook for using localStorage with fallback for SSR
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue)

    // Keep track of if this is the first render
    const isFirstRender = useRef(true)

    // Initialize on first render only
    useEffect(() => {
        if (typeof window === "undefined") return

        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key)
            // Parse stored json or if none return initialValue
            if (item) {
                setStoredValue(JSON.parse(item))
            }
        } catch (error) {
            console.log("Error reading from localStorage:", error)
        }

        // After first initialization, set flag to false
        isFirstRender.current = false
    }, [key])

    // Return a wrapped version of useState's setter function that
    // persists the new value to localStorage
    const setValue = (value: T) => {
        try {
            // Allow value to be a function so we have same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value

            // Only update state if the value is different
            if (JSON.stringify(valueToStore) !== JSON.stringify(storedValue)) {
                // Save state
                setStoredValue(valueToStore)

                // Save to local storage
                if (typeof window !== "undefined") {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore))
                }
            }
        } catch (error) {
            console.log("Error saving to localStorage:", error)
        }
    }

    return [storedValue, setValue]
}
