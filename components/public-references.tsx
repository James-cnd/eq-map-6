"use client"

import { useState, useEffect } from "react"
import { X, ExternalLink, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Reference } from "@/components/references-popup"

interface PublicReferencesProps {
  onClose: () => void
}

export default function PublicReferences({ onClose }: PublicReferencesProps) {
  // Get references from localStorage
  const [references] = useLocalStorage<Reference[]>("earthquakeReferences", [
    {
      id: "ref-1",
      title: "Icelandic Meteorological Office API",
      url: "https://api.vedur.is/?urls.primaryName=Skjálftalísa",
      description: "Official API for earthquake data from the Icelandic Meteorological Office",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Data Source",
    },
    {
      id: "ref-3",
      title: "Icelandic Meteorological Office",
      url: "https://en.vedur.is/",
      description: "Official source for earthquake and volcanic activity data in Iceland",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Data Source",
    },
    {
      id: "ref-4",
      title: "Leaflet.js",
      url: "https://leafletjs.com/",
      description: "Open-source JavaScript library for interactive maps used in this application",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Technology",
    },
    {
      id: "ref-5",
      title: "Leaflet.markercluster",
      url: "https://github.com/Leaflet/Leaflet.markercluster",
      description: "Plugin for Leaflet that provides beautiful animated marker clustering",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Technology",
    },
    {
      id: "ref-6",
      title: "Raspberry Shake",
      url: "https://raspberryshake.org/",
      description: "Personal seismograph network used for seismic data visualization",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Technology",
    },
    {
      id: "ref-7",
      title: "Icelandic Volcanoes",
      url: "https://icelandicvolcanos.is/",
      description:
        "Comprehensive information about Icelandic volcanic systems, used for identifying which volcanic system earthquakes occur in",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Data Source",
    },
  ])

  const [mounted, setMounted] = useState(false)

  // Handle window events for references changes
  useEffect(() => {
    setMounted(true)

    // Listen for reference changes from admin panel
    const handleReferenceChange = () => {
      // Force a re-render when references change
      setMounted(false)
      setTimeout(() => setMounted(true), 0)
    }

    window.addEventListener("referencesChanged", handleReferenceChange)

    return () => {
      window.removeEventListener("referencesChanged", handleReferenceChange)
    }
  }, [])

  // Group references by category
  const referencesByCategory = references.reduce(
    (acc, ref) => {
      if (!acc[ref.category]) {
        acc[ref.category] = []
      }
      acc[ref.category].push(ref)
      return acc
    },
    {} as Record<string, Reference[]>,
  )

  if (!mounted) return null

  return (
    <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/50">
      <div
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white flex items-center">
            <BookOpen className="h-5 w-5 mr-2" />
            References & Resources
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* References by category */}
          {Object.keys(referencesByCategory).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No references available.</p>
            </div>
          ) : (
            Object.entries(referencesByCategory).map(([category, refs]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-white border-b border-gray-700 pb-2">{category}</h3>
                <div className="space-y-3">
                  {refs.map((ref) => (
                    <div key={ref.id} className="p-3 bg-gray-800 rounded-lg">
                      <div>
                        <h4 className="font-medium text-white">{ref.title}</h4>
                        <a
                          href={ref.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                        >
                          {ref.url}
                          <ExternalLink className="h-3 w-3 ml-1" />
                        </a>
                        {ref.description && <p className="text-gray-300 text-sm mt-2">{ref.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <p className="text-sm text-gray-400">
            Total references: {references.length} across {Object.keys(referencesByCategory).length} categories
          </p>
        </div>
      </div>
    </div>
  )
}
