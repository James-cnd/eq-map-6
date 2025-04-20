"use client"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Earthquake } from "@/types/earthquake"
import { ICELAND_ZONES } from "@/types/zones"
import dynamic from "next/dynamic"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { EarthquakeDetails } from "@/components/earthquake-details"

// Dynamically import Leaflet with no SSR
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-gray-800" />,
})

interface HistoricalEarthquakeViewerProps {
  onClose: () => void
}

// Time period options
const YEARS = ["2020", "2021", "2022", "2023", "2024"]
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] // Including leap year February

export default function HistoricalEarthquakeViewer({ onClose }: HistoricalEarthquakeViewerProps) {
  // State for time period selection
  const [startYear, setStartYear] = useState(2023)
  const [endYear, setEndYear] = useState(2024)
  const [startMonth, setStartMonth] = useState(0) // 0-11 for Jan-Dec
  const [endMonth, setEndMonth] = useState(11) // 0-11 for Jan-Dec
  const [startDay, setStartDay] = useState(1)
  const [endDay, setEndDay] = useState(31)
  const [startHour, setStartHour] = useState(0)
  const [endHour, setEndHour] = useState(23)

  // State for filter settings
  const [magnitudeRange, setMagnitudeRange] = useLocalStorage<[number, number]>("historicalMagnitudeRange", [-2, 8])
  const [depthRange, setDepthRange] = useLocalStorage<[number, number]>("historicalDepthRange", [0, 25])
  const [zoneFilter, setZoneFilter] = useLocalStorage("historicalZoneFilter", "all")

  // State for map settings
  const [showSeismicStations, setShowSeismicStations] = useState(false)
  const [showGpsStations, setShowGpsStations] = useState(true)
  const [showFissures, setShowFissures] = useState(true)

  // State for earthquakes and loading
  const [earthquakes, setEarthquakes] = useState<Earthquake[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null)
  const [isMockData, setIsMockData] = useState(false)

  // Map reference
  const mapRef = useRef<any>(null)

  // Calculate max days based on selected month
  const getMaxDaysInMonth = (month: number) => {
    return DAYS_IN_MONTH[month]
  }

  // Fetch historical earthquake data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Calculate start and end dates based on selection
        const startDate = new Date(startYear, startMonth, startDay, startHour, 0, 0)
        const endDate = new Date(endYear, endMonth, endDay, endHour, 59, 59)

        // Format dates for API
        const startStr = startDate.toISOString()
        const endStr = endDate.toISOString()

        console.log(`Fetching historical data from ${startStr} to ${endStr}`)

        // Fetch data from API with time range
        const response = await fetch(`/api/historical-earthquakes?start=${startStr}&end=${endStr}`, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.data && Array.isArray(data.data)) {
          // Filter out negative magnitudes
          const filteredData = data.data.filter((quake: Earthquake) => quake.size >= 0)
          setEarthquakes(filteredData)
          setIsMockData(data.isMockData || false)
        } else {
          throw new Error(data.error || data.message || "No earthquake data found")
        }
      } catch (err) {
        console.error("Error fetching historical earthquake data:", err)
        setError(err instanceof Error ? err : new Error("Unknown error occurred"))
        setEarthquakes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchHistoricalData()
  }, [startYear, endYear, startMonth, endMonth, startDay, endDay, startHour, endHour])

  // Filter earthquakes based on settings
  const filteredEarthquakes = earthquakes.filter((quake) => {
    // Apply magnitude range filter
    if (quake.size < magnitudeRange[0] || quake.size > magnitudeRange[1]) return false

    // Apply depth range filter
    if (quake.depth < depthRange[0] || quake.depth > depthRange[1]) return false

    // Apply zone filter
    if (zoneFilter !== "all") {
      const zone = ICELAND_ZONES.find((z) => z.id === zoneFilter)
      if (zone) {
        const [minLat, minLng, maxLat, maxLng] = zone.bounds
        if (
          quake.latitude < minLat ||
          quake.latitude > maxLat ||
          quake.longitude < minLng ||
          quake.longitude > maxLng
        ) {
          return false
        }
      }
    }

    return true
  })

  // Handle map reference
  const handleMapReference = (map: any, L: any) => {
    mapRef.current = { map, L }
  }

  // Format date range for display
  const formatDateRange = () => {
    return `${startYear}-${startMonth + 1}-${startDay} ${startHour}:00 - ${endYear}-${endMonth + 1}-${endDay} ${endHour}:59`
  }

  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768) // Adjust the breakpoint as needed
    }

    // Set initial value
    handleResize()

    // Add event listener
    window.addEventListener("resize", handleResize)

    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="fixed inset-0 z-[1004] bg-gray-950 text-white overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 p-3 flex justify-between items-center border-b border-gray-700">
        <h2 className="text-xl font-bold">Past Earthquake Data</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Time navigation sidebar */}
        <div className="w-64 bg-gray-900 border-r border-gray-700 flex flex-col">
          <div className="p-3 border-b border-gray-700">
            <h3 className="font-semibold mb-2">Time Period</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="year-range" className="text-sm mb-1 block">
                  Year Range: {startYear} - {endYear}
                </Label>
                <Slider
                  id="year-range"
                  min={2020}
                  max={2024}
                  step={1}
                  value={[startYear, endYear]}
                  onValueChange={(value) => {
                    setStartYear(value[0])
                    setEndYear(value[1])
                  }}
                />
              </div>

              <div>
                <Label htmlFor="month-range" className="text-sm mb-1 block">
                  Month Range: {MONTHS[startMonth]} - {MONTHS[endMonth]}
                </Label>
                <Slider
                  id="month-range"
                  min={0}
                  max={11}
                  step={1}
                  value={[startMonth, endMonth]}
                  onValueChange={(value) => {
                    setStartMonth(value[0])
                    setEndMonth(value[1])
                  }}
                />
              </div>

              <div>
                <Label htmlFor="day-range" className="text-sm mb-1 block">
                  Day Range: {startDay} - {endDay}
                </Label>
                <Slider
                  id="day-range"
                  min={1}
                  max={getMaxDaysInMonth(startMonth)}
                  step={1}
                  value={[startDay, endDay]}
                  onValueChange={(value) => {
                    setStartDay(value[0])
                    setEndDay(value[1])
                  }}
                />
              </div>

              <div>
                <Label htmlFor="hour-range" className="text-sm mb-1 block">
                  Hour Range: {startHour}:00 - {endHour}:59
                </Label>
                <Slider
                  id="hour-range"
                  min={0}
                  max={23}
                  step={1}
                  value={[startHour, endHour]}
                  onValueChange={(value) => {
                    setStartHour(value[0])
                    setEndHour(value[1])
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 border-t border-gray-700">
            <div className="text-sm text-gray-400 mb-2">Current Selection:</div>
            <div className="font-medium">{formatDateRange()}</div>
            <div className="mt-2 text-sm">
              {isLoading ? (
                <span className="text-blue-400">Loading data...</span>
              ) : (
                <span>
                  {filteredEarthquakes.length} earthquakes found
                  {isMockData && <span className="text-yellow-400 ml-1">(sample data)</span>}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Map and filter area */}
        <div className="flex-1 flex flex-col">
          <Tabs defaultValue="map" className="flex-1 flex flex-col">
            <div className="bg-gray-900 border-b border-gray-700 px-3">
              <TabsList className="bg-gray-800">
                <TabsTrigger value="map">Map</TabsTrigger>
                <TabsTrigger value="filters">Filters</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="map" className="flex-1 p-0 m-0">
              {isLoading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-2"></div>
                    <div>Loading historical earthquake data...</div>
                  </div>
                </div>
              ) : error ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center text-red-500 max-w-md p-4">
                    <div className="text-xl mb-2">Error</div>
                    <div>{error.message}</div>
                  </div>
                </div>
              ) : filteredEarthquakes.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center max-w-md p-4">
                    <div className="text-xl mb-2">No Earthquakes Found</div>
                    <div>Try adjusting your date range or filters to see more data.</div>
                  </div>
                </div>
              ) : (
                <div className="h-full relative">
                  <LeafletMap
                    earthquakes={filteredEarthquakes}
                    onSelectEarthquake={setSelectedEarthquake}
                    selectedEarthquake={selectedEarthquake}
                    showSeismicStations={showSeismicStations}
                    showGpsStations={showGpsStations}
                    showFissures={showFissures}
                    showEarthquakes={true}
                    onMapReference={handleMapReference}
                  />

                  {/* Earthquake count overlay */}
                  <div className="absolute bottom-4 right-4 bg-gray-900/80 p-2 rounded shadow-md">
                    {filteredEarthquakes.length} earthquakes
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="filters" className="flex-1 p-4 m-0 overflow-y-auto">
              <div className="space-y-6 max-w-md mx-auto">
                {/* Magnitude filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Magnitude Range</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="min-magnitude" className="text-sm mb-1 block">
                        Minimum Magnitude: {magnitudeRange[0].toFixed(1)}
                      </Label>
                      <Slider
                        value={[magnitudeRange[0]]}
                        min={-2}
                        max={magnitudeRange[1]}
                        step={0.1}
                        onValueChange={(value) => {
                          setMagnitudeRange([value[0], magnitudeRange[1]])
                        }}
                        className="py-4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="max-magnitude" className="text-sm mb-1 block">
                        Maximum Magnitude: {magnitudeRange[1].toFixed(1)}
                      </Label>
                      <Slider
                        value={[magnitudeRange[1]]}
                        min={magnitudeRange[0]}
                        max={8}
                        step={0.1}
                        onValueChange={(value) => {
                          setMagnitudeRange([magnitudeRange[0], value[0]])
                        }}
                        className="py-4"
                      />
                    </div>
                  </div>
                </div>

                {/* Zone filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Zone Filter</h3>
                  <Select value={zoneFilter} onValueChange={setZoneFilter}>
                    <SelectTrigger className="w-full bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Select zone" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all" className="text-white hover:bg-gray-700">
                        All Zones
                      </SelectItem>
                      {ICELAND_ZONES.map((zone) => (
                        <SelectItem key={zone.id} value={zone.id} className="text-white hover:bg-gray-700">
                          {zone.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Map display */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Map Display</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seismic-stations" className="cursor-pointer">
                        Show Seismic Stations
                      </Label>
                      <Switch
                        id="seismic-stations"
                        checked={showSeismicStations}
                        onCheckedChange={setShowSeismicStations}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="gps-stations" className="cursor-pointer">
                        Show GPS Stations
                      </Label>
                      <Switch id="gps-stations" checked={showGpsStations} onCheckedChange={setShowGpsStations} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="fissures" className="cursor-pointer">
                        Show Fissures
                      </Label>
                      <Switch id="fissures" checked={showFissures} onCheckedChange={setShowFissures} />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Selected earthquake details */}
      {selectedEarthquake && (
        <div className={`fixed z-[1003] max-w-sm ${isMobile ? "bottom-16 left-4 right-4" : "bottom-4 left-4"}`}>
          <EarthquakeDetails earthquake={selectedEarthquake} onClose={() => setSelectedEarthquake(null)} />
        </div>
      )}
    </div>
  )
}
