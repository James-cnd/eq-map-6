"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEarthquakes } from "@/hooks/use-earthquakes"
import { EarthquakeDetails } from "@/components/earthquake-details"
import type { Earthquake } from "@/types/earthquake"
import { formatDistanceToNow } from "date-fns"
import { Search, SlidersHorizontal, ExternalLink } from "lucide-react"
import { getVolcanicSystem, getVolcanicSystemLink } from "@/utils/volcanic-systems"

export default function EarthquakeList() {
  const { earthquakes, isLoading, error } = useEarthquakes()
  const [searchTerm, setSearchTerm] = useState("")
  const [magnitudeFilter, setMagnitudeFilter] = useState("all")
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredEarthquakes = earthquakes
    .filter((quake) => {
      // Apply magnitude filter
      if (magnitudeFilter === "all") return true
      const magnitude = Number.parseFloat(magnitudeFilter)
      return quake.size >= magnitude
    })
    .filter((quake) => {
      // Apply search filter
      if (!searchTerm) return true
      return quake.humanReadableLocation.toLowerCase().includes(searchTerm.toLowerCase())
    })

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-red-500">Error loading earthquake data</p>
            <p className="text-sm text-gray-500">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Recent Earthquakes</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search locations..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => setShowFilters(!showFilters)}>
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {showFilters && (
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <div className="w-full sm:w-1/2">
                <label className="text-sm font-medium mb-1 block">Magnitude</label>
                <Select value={magnitudeFilter} onValueChange={setMagnitudeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by magnitude" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All magnitudes</SelectItem>
                    <SelectItem value="1">1.0 and above</SelectItem>
                    <SelectItem value="2">2.0 and above</SelectItem>
                    <SelectItem value="3">3.0 and above</SelectItem>
                    <SelectItem value="4">4.0 and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {filteredEarthquakes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No earthquakes match your filters</div>
          ) : (
            <div className="space-y-4">
              {filteredEarthquakes.map((quake) => {
                // Get volcanic system information
                const volcanicSystem = getVolcanicSystem(quake.latitude, quake.longitude)

                return (
                  <div
                    key={quake.timestamp + quake.latitude + quake.longitude}
                    className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => setSelectedEarthquake(quake)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{quake.humanReadableLocation}</h3>
                        {volcanicSystem && (
                          <div className="flex items-center mt-1">
                            <span
                              className="text-xs px-2 py-0.5 rounded-full mr-1"
                              style={{ backgroundColor: volcanicSystem.color, color: "white" }}
                            >
                              {volcanicSystem.name}
                            </span>
                            <a
                              href={getVolcanicSystemLink(volcanicSystem.id)}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-500 hover:text-blue-700 flex items-center"
                            >
                              <ExternalLink className="h-3 w-3 ml-0.5" />
                            </a>
                          </div>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(quake.timestamp), { addSuffix: true })}
                        </p>
                      </div>
                      <div
                        className="flex items-center justify-center w-10 h-10 rounded-full text-white font-bold"
                        style={{
                          backgroundColor: getColorForMagnitude(quake.size),
                        }}
                      >
                        {quake.size.toFixed(1)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedEarthquake && (
        <EarthquakeDetails earthquake={selectedEarthquake} onClose={() => setSelectedEarthquake(null)} />
      )}
    </div>
  )
}

function getColorForMagnitude(magnitude: number): string {
  if (magnitude < 1) return "#2ECC71" // Green
  if (magnitude < 2) return "#F1C40F" // Yellow
  if (magnitude < 3) return "#E67E22" // Orange
  if (magnitude < 4) return "#E74C3C" // Red
  return "#8E44AD" // Purple for 4+
}
