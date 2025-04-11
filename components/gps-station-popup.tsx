"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { CustomGpsStation } from "@/types/stations"

interface GpsStationPopupProps {
  station: CustomGpsStation
  onClose: () => void
}

export default function GpsStationPopup({ station, onClose }: GpsStationPopupProps) {
  // Determine if the station has a volcanic system reference
  const hasVolcData = station.description?.includes("volc:")
  const volcName = hasVolcData ? station.description.split("volc:")[1].trim() : ""

  return (
    <div className="fixed left-0 top-0 bottom-0 w-full md:w-1/2 bg-gray-900/95 border-r border-gray-700 z-[2002] overflow-auto flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">
          {station.name} ({station.id})
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-white">Station Information</h3>
            <p className="text-gray-300 mt-1">{station.description?.split("volc:")[0] || station.description}</p>
            <p className="text-gray-400 text-sm mt-2">
              Coordinates: {station.coordinates[0].toFixed(6)}°, {station.coordinates[1].toFixed(6)}°
            </p>
            <p className="text-gray-400 text-sm">Added: {new Date(station.dateAdded).toLocaleDateString()}</p>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white mb-3">GPS Data</h3>

            {/* 90 Days Data */}
            <div className="mb-6">
              <h4 className="font-medium mb-2">90 Days</h4>
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={
                    hasVolcData && volcName
                      ? `http://brunnur.vedur.is/gps/eldfjoll/${volcName}/${station.id}-plate-90d.png`
                      : `http://brunnur.vedur.is/gps/timeseries/${station.id}-plate-90d.png`
                  }
                  alt={`${station.name} 90 day data`}
                  className="w-full"
                />
              </div>
            </div>

            {/* Year Data */}
            <div>
              <h4 className="font-medium mb-2">Year</h4>
              <div className="bg-white rounded-lg overflow-hidden">
                <img
                  src={
                    hasVolcData && volcName
                      ? `http://brunnur.vedur.is/gps/eldfjoll/${volcName}/${station.id}-plate-year.png`
                      : `http://brunnur.vedur.is/gps/timeseries/${station.id}-plate-year.png`
                  }
                  alt={`${station.name} yearly data`}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="text-lg font-medium text-white mb-3">External Resources</h3>
            <a
              href={station.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Open in New Tab
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
