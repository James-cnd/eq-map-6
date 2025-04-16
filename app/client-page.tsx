"use client"

import dynamic from "next/dynamic"
import { Suspense, useEffect } from "react"
import { VersionChecker } from "@/components/version-checker"
import { EnvDebugger } from "@/components/env-debugger"

// Dynamically import the ReferencesButton with no SSR
const ReferencesButton = dynamic(() => import("@/components/references-button"), {
  ssr: false,
})

// Dynamically import the EarthquakeMap component with no SSR
const EarthquakeMap = dynamic(() => import("@/components/earthquake-map"), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full bg-gray-950 flex items-center justify-center text-white">
      Loading earthquake map...
    </div>
  ),
})

export default function ClientPage() {
  // Register service worker for PWA support and updates
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").then(
          (registration) => {
            console.log("ServiceWorker registration successful with scope: ", registration.scope)
          },
          (err) => {
            console.log("ServiceWorker registration failed: ", err)
          },
        )
      })
    }
  }, [])

  return (
    <main className="flex min-h-screen flex-col bg-gray-950 text-white">
      <div className="h-screen w-full">
        <Suspense
          fallback={
            <div className="h-screen w-full bg-gray-950 flex items-center justify-center text-white">
              Loading earthquake map...
            </div>
          }
        >
          <EarthquakeMap />
        </Suspense>
        <ReferencesButton />
        <VersionChecker />
        <EnvDebugger />
      </div>
    </main>
  )
}
