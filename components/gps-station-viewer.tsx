"use client"

import { useState } from "react"
import { X, ZoomIn, ZoomOut, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { GpsStationExtended } from "@/data/gps-stations-extended"

interface GpsStationViewerProps {
  station: GpsStationExtended
  onClose: () => void
  position: number // 0, 1, or 2 for positioning
}

export default function GpsStationViewer({ station, onClose, position }: GpsStationViewerProps) {
  const [zoomLevel, setZoomLevel] = useState(1)

  // Calculate position based on index
  const topOffset = 70 + position * 40 // 70px from top for first one, then 40px spacing

  // Handle zoom in/out
  const zoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.1, 2))
  const zoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))

  // Determine if the station has a volcanic system reference
  const volcName = station.id.toLowerCase().includes("reyk")
    ? ""
    : station.id.toLowerCase().includes("they") || station.id.toLowerCase().includes("krac")
      ? "krafla"
      : station.id.toLowerCase().includes("isak")
        ? "hekla"
        : station.id.toLowerCase().includes("stor") || station.id.toLowerCase().includes("hamr")
          ? "katla"
          : ""

  return (
    <div
      className="fixed left-4 z-[1003] bg-gray-900/95 border border-gray-700 rounded-lg shadow-lg text-white overflow-hidden flex flex-col"
      style={{
        top: `${topOffset}px`,
        width: "500px",
        height: "400px",
        maxWidth: "calc(100vw - 32px)",
      }}
    >
      <div className="flex justify-between items-center p-3 border-b border-gray-700 bg-gray-800">
        <h2 className="font-bold truncate">
          {station.name} ({station.id})
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomOut}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={zoomIn}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-7 w-7 text-gray-400 hover:text-white hover:bg-gray-700"
            title="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto p-4"
        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top left" }}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-gray-400">Station ID:</div>
            <div>{station.id}</div>

            <div className="text-gray-400">Coordinates:</div>
            <div>
              {station.coordinates[0].toFixed(4)}°, {station.coordinates[1].toFixed(4)}°
            </div>

            <div className="text-gray-400">Source:</div>
            <div>{station.source}</div>

            <div className="text-gray-400">Type:</div>
            <div>{station.type}</div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-semibold mb-2">GPS Data</h3>
            <div className="space-y-4">
              {/* 90 Days Data */}
              <div>
                <h4 className="text-sm text-gray-400 mb-1">90 Days</h4>
                <div className="bg-white rounded-lg overflow-hidden">
                  <img
                    src={
                      volcName
                        ? `http://brunnur.vedur.is/gps/eldfjoll/${volcName}/${station.id}-plate-90d.png`
                        : `http://brunnur.vedur.is/gps/timeseries/${station.id}-plate-90d.png`
                    }
                    alt={`${station.name} 90 day data`}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {station.url && (
            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-semibold mb-2">External Resources</h3>
              <div className="space-y-2">
                <a
                  href={station.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Station Information</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
