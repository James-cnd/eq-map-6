"use client"

import { useEffect, useState } from "react"

export function EnvDebugger() {
  const [envVars, setEnvVars] = useState<Record<string, string>>({})

  useEffect(() => {
    // Collect all NEXT_PUBLIC environment variables
    const publicEnvVars: Record<string, string> = {}

    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        publicEnvVars[key] = process.env[key] || "undefined"
      }
    })

    setEnvVars(publicEnvVars)
  }, [])

  return (
    <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-80 p-4 rounded text-white max-w-md max-h-96 overflow-auto">
      <h3 className="text-lg font-bold mb-2">Environment Variables</h3>
      {Object.keys(envVars).length === 0 ? (
        <p>No NEXT_PUBLIC environment variables found</p>
      ) : (
        <ul className="space-y-1">
          {Object.entries(envVars).map(([key, value]) => (
            <li key={key}>
              <strong>{key}:</strong> {value}
            </li>
          ))}
        </ul>
      )}
      <div className="mt-4">
        <p className="text-sm">
          <strong>BUILD_ID directly:</strong> {process.env.NEXT_PUBLIC_BUILD_ID || "undefined"}
        </p>
      </div>
      <button
        onClick={() => window.location.reload()}
        className="mt-2 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
      >
        Refresh Page
      </button>
    </div>
  )
}
