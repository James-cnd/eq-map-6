"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

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
      </div>
    </main>
  )
}
