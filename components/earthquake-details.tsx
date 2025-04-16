"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Earthquake } from "@/types/earthquake"
import { formatDistanceToNow, format } from "date-fns"
import { X, MapPin, Calendar, Clock, ArrowDown, Activity, ExternalLink } from "lucide-react"
import { getVolcanicSystem, getVolcanicSystemLink } from "@/utils/volcanic-systems"

interface EarthquakeDetailsProps {
  earthquake: Earthquake
  onClose: () => void
}

export function EarthquakeDetails({ earthquake, onClose }: EarthquakeDetailsProps) {
  const quakeDate = new Date(earthquake.timestamp)
  const volcanicSystem = getVolcanicSystem(earthquake.latitude, earthquake.longitude)
  const isManuallyReviewed = earthquake.review === "mlw"

  return (
    <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-white">{earthquake.humanReadableLocation}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div
                className="relative flex items-center justify-center"
                style={{ width: "36px", height: "36px", transform: "scale(0.75)" }}
              >
                {isManuallyReviewed && (
                  <div
                    className="absolute rounded-full bg-black"
                    style={{
                      width: "36px",
                      height: "36px",
                      transform: "scale(1.33)",
                      top: "0",
                      left: "0",
                      zIndex: 0,
                    }}
                  ></div>
                )}
                <div
                  className="absolute rounded-full flex items-center justify-center text-white font-bold text-lg z-10"
                  style={{
                    backgroundColor: getColorForMagnitude(earthquake.size),
                    width: "36px",
                    height: "36px",
                  }}
                >
                  {earthquake.size.toFixed(1)}
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-400">Magnitude</p>
                <p className="font-medium text-white">{getMagnitudeDescription(earthquake.size)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400">Depth</p>
              <div className="flex items-center gap-1 text-white">
                <ArrowDown className="h-4 w-4" />
                <p className="font-medium">{earthquake.depth.toFixed(1)} km</p>
              </div>
            </div>
          </div>

          {volcanicSystem && (
            <div>
              <p className="text-sm text-gray-400 mb-1">Volcanic System</p>
              <div className="flex items-center">
                <span
                  className="px-2 py-1 rounded-md mr-2 text-white"
                  style={{ backgroundColor: volcanicSystem.color }}
                >
                  {volcanicSystem.name}
                </span>
                <a
                  href={getVolcanicSystemLink(volcanicSystem.id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center"
                >
                  View details
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
              {volcanicSystem.lastEruption && (
                <p className="text-xs text-gray-400 mt-1">Last eruption: {volcanicSystem.lastEruption}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">Date</span>
              </div>
              <p className="text-white">{format(quakeDate, "PPP")}</p>
            </div>
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Time</span>
              </div>
              <p className="text-white">{format(quakeDate, "p")}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <MapPin className="h-4 w-4" />
              <span className="text-sm">Coordinates</span>
            </div>
            <p className="text-white">
              {earthquake.latitude.toFixed(4)}°, {earthquake.longitude.toFixed(4)}°
            </p>
          </div>

          {earthquake.review && (
            <div>
              <div className="flex items-center gap-2 text-gray-400 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-sm">Review Status</span>
              </div>
              <p className="text-white">{isManuallyReviewed ? "Manually Reviewed" : "Automatic"}</p>
            </div>
          )}

          <div className="pt-2">
            <p className="text-sm text-gray-400">{formatDistanceToNow(quakeDate, { addSuffix: true })}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function getColorForMagnitude(magnitude: number): string {
  if (magnitude < 0) return "#3498DB" // Blue for negative magnitudes
  if (magnitude < 1) return "#2ECC71" // Green
  if (magnitude < 2) return "#F1C40F" // Yellow
  if (magnitude < 3) return "#E67E22" // Orange
  if (magnitude < 4) return "#E74C3C" // Red
  return "#8E44AD" // Purple for 4+
}

function getMagnitudeDescription(magnitude: number): string {
  if (magnitude < 0) return "Micro"
  if (magnitude < 1) return "Minor"
  if (magnitude < 2) return "Light"
  if (magnitude < 3) return "Moderate"
  if (magnitude < 4) return "Strong"
  return "Major"
}
