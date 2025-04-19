"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
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
  const [yearRange, setYearRange] = useState<[number, number]>([2023, 2024])
  const [monthRange, setMonthRange] = useState<[number, number]>([0, 11]) // 0-11 for Jan-Dec
  const [dayRange, setDayRange] = useState<[number, number]>([1, 31])
  const [hourRange, setHourRange] = useState<[number, number]>([0, 23])
  const [timeView, setTimeView] = useState<"years" | "months" | "days" | "hours">("months")

  // State for filter settings
  const [magnitudeRange, setMagnitudeRange] = useLocalStorage<[number, number]>("historicalMagnitudeRange", [0, 8])
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
  const getMaxDaysInMonth = () => {
    // If month range spans multiple months, use 31 as max
    if (monthRange[0] !== monthRange[1]) {
      return 31
    }
    return DAYS_IN_MONTH[monthRange[0]]
  }

  // Adjust day range when month changes
  useEffect(() => {
    const maxDays = getMaxDaysInMonth()
    if (dayRange[1] > maxDays) {
      setDayRange([dayRange[0], maxDays])
    }
  }, [monthRange, dayRange])

  // Fetch historical earthquake data
  useEffect(() => {
    const fetchHistoricalData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Calculate start and end dates based on selection
        let startDate: Date, endDate: Date

        if (timeView === "years") {
          startDate = new Date(yearRange[0], 0, 1, 0, 0, 0)
          endDate = new Date(yearRange[1], 11, 31, 23, 59, 59)
        } else if (timeView === "months") {
          startDate = new Date(yearRange[0], monthRange[0], 1, 0, 0, 0)
          endDate = new Date(yearRange[1], monthRange[1], DAYS_IN_MONTH[monthRange[1]], 23, 59, 59)
        } else if (timeView === "days") {
          startDate = new Date(yearRange[0], monthRange[0], dayRange[0], 0, 0, 0)
          endDate = new Date(yearRange[0], monthRange[0], dayRange[1], 23, 59, 59)
        } else {
          // Hours view
          startDate = new Date(yearRange[0], monthRange[0], dayRange[0], hourRange[0], 0, 0)
          endDate = new Date(yearRange[0], monthRange[0], dayRange[0], hourRange[1], 59, 59)
        }

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
          throw new Error(data.error || "No earthquake data found")
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
  }, [yearRange, monthRange, dayRange, hourRange, timeView])

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
    let result = ""

    if (timeView === "years") {
      result = `${yearRange[0]} - ${yearRange[1]}`
    } else if (timeView === "months") {
      result = `${MONTHS[monthRange[0]]} ${yearRange[0]} - ${MONTHS[monthRange[1]]} ${yearRange[1]}`
    } else if (timeView === "days") {
      result = `${dayRange[0]}-${dayRange[1]} ${MONTHS[monthRange[0]]} ${yearRange[0]}`
    } else {
      // Hours
      result = `${hourRange[0]}:00 - ${hourRange[1]}:59, ${dayRange[0]} ${MONTHS[monthRange[0]]} ${yearRange[0]}`
    }

    return result
  }

  // Render time period selector based on current view
  const renderTimePeriodSelector = () => {
    switch (timeView) {
      case "years":
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">Year Range</h3>
            <div className="mb-1 flex justify-between text-sm">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
            <Slider
              value={yearRange}
              min={2020}
              max={2024}
              step={1}
              onValueChange={(value) => setYearRange(value as [number, number])}
              className="mb-6"
            />
          </div>
        )
      case "months":
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">Year Range</h3>
            <div className="mb-1 flex justify-between text-sm">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
            <Slider
              value={yearRange}
              min={2020}
              max={2024}
              step={1}
              onValueChange={(value) => setYearRange(value as [number, number])}
              className="mb-6"
            />

            <h3 className="font-semibold mb-2">Month Range</h3>
            <div className="mb-1 flex justify-between text-sm">
              <span>{MONTHS[monthRange[0]]}</span>
              <span>{MONTHS[monthRange[1]]}</span>
            </div>
            <Slider
              value={monthRange}
              min={0}
              max={11}
              step={1}
              onValueChange={(value) => setMonthRange(value as [number, number])}
              className="mb-6"
            />
          </div>
        )
      case "days":
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">Month</h3>
            <div className="flex justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  let newDay = dayRange[0] - 1
                  let newMonth = monthRange[0]
                  let newYear = yearRange[0]

                  if (newDay < 1) {
                    newMonth = newMonth > 0 ? newMonth - 1 : 11
                    newYear = newMonth === 11 && monthRange[0] === 0 ? newYear - 1 : newYear
                    newDay = DAYS_IN_MONTH[newMonth]
                  }

                  if (newYear >= 2020) {
                    setDayRange([newDay, newDay])
                    setMonthRange([newMonth, newMonth])
                    setYearRange([newYear, newYear])
                  }
                }}
                disabled={yearRange[0] === 2020 && monthRange[0] === 0 && dayRange[0] === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="py-2 px-4 font-medium">
                {MONTHS[monthRange[0]]} {yearRange[0]}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  let newDay = dayRange[0] + 1
                  let newMonth = monthRange[0]
                  let newYear = yearRange[0]

                  if (newDay > DAYS_IN_MONTH[newMonth]) {
                    newDay = 1
                    newMonth = newMonth < 11 ? newMonth + 1 : 0
                    newYear = newMonth === 0 && monthRange[0] === 11 ? newYear + 1 : newYear
                  }

                  if (newYear <= 2024) {
                    setDayRange([newDay, newDay])
                    setMonthRange([newMonth, newMonth])
                    setYearRange([newYear, newYear])
                  }
                }}
                disabled={yearRange[0] === 2024 && monthRange[0] === 11 && dayRange[0] === 31}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="font-semibold mb-2 mt-4">Day Range</h3>
            <div className="mb-1 flex justify-between text-sm">
              <span>{dayRange[0]}</span>
              <span>{dayRange[1]}</span>
            </div>
            <Slider
              value={dayRange}
              min={1}
              max={getMaxDaysInMonth()}
              step={1}
              onValueChange={(value) => setDayRange(value as [number, number])}
              className="mb-6"
            />
          </div>
        )
      case "hours":
        return (
          <div className="p-4">
            <h3 className="font-semibold mb-2">Date</h3>
            <div className="flex justify-between mb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  let newDay = dayRange[0] - 1
                  let newMonth = monthRange[0]
                  let newYear = yearRange[0]

                  if (newDay < 1) {
                    newMonth = newMonth > 0 ? newMonth - 1 : 11
                    newYear = newMonth === 11 && monthRange[0] === 0 ? newYear - 1 : newYear
                    newDay = DAYS_IN_MONTH[newMonth]
                  }

                  if (newYear >= 2020) {
                    setDayRange([newDay, newDay])
                    setMonthRange([newMonth, newMonth])
                    setYearRange([newYear, newYear])
                  }
                }}
                disabled={yearRange[0] === 2020 && monthRange[0] === 0 && dayRange[0] === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="py-2 px-4 font-medium">
                {dayRange[0]} {MONTHS[monthRange[0]]} {yearRange[0]}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  let newDay = dayRange[0] + 1
                  let newMonth = monthRange[0]
                  let newYear = yearRange[0]

                  if (newDay > DAYS_IN_MONTH[newMonth]) {
                    newDay = 1
                    newMonth = newMonth < 11 ? newMonth + 1 : 0
                    newYear = newMonth === 0 && monthRange[0] === 11 ? newYear + 1 : newYear
                  }

                  if (newYear <= 2024) {
                    setDayRange([newDay, newDay])
                    setMonthRange([newMonth, newMonth])
                    setYearRange([newYear, newYear])
                  }
                }}
                disabled={yearRange[0] === 2024 && monthRange[0] === 11 && dayRange[0] === 31}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <h3 className="font-semibold mb-2">Hour Range</h3>
            <div className="mb-1 flex justify-between text-sm">
              <span>{hourRange[0]}:00</span>
              <span>{hourRange[1]}:59</span>
            </div>
            <Slider
              value={hourRange}
              min={0}
              max={23}
              step={1}
              onValueChange={(value) => setHourRange(value as [number, number])}
              className="mb-6"
            />

            <div className="grid grid-cols-6 gap-1 mt-4">
              {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                <Button
                  key={hour}
                  variant="outline"
                  size="sm"
                  className={`text-xs ${
                    hour >= hourRange[0] && hour <= hourRange[1] ? "bg-blue-600 border-blue-600" : ""
                  }`}
                  onClick={() => setHourRange([hour, hour])}
                >
                  {hour}:00
                </Button>
              ))}
            </div>
          </div>
        )
      default:
        return null
    }
  }

  const isMobile = window.innerWidth <= 768

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
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className={timeView === "years" ? "bg-blue-600 border-blue-600" : ""}
                onClick={() => setTimeView("years")}
              >
                Years
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={timeView === "months" ? "bg-blue-600 border-blue-600" : ""}
                onClick={() => setTimeView("months")}
              >
                Months
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={timeView === "days" ? "bg-blue-600 border-blue-600" : ""}
                onClick={() => setTimeView("days")}
              >
                Days
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={timeView === "hours" ? "bg-blue-600 border-blue-600" : ""}
                onClick={() => setTimeView("hours")}
              >
                Hours
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">{renderTimePeriodSelector()}</div>

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
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Min: {magnitudeRange[0].toFixed(1)}</span>
                    <span>Max: {magnitudeRange[1].toFixed(1)}</span>
                  </div>
                  <Slider
                    defaultValue={magnitudeRange}
                    min={0}
                    max={8}
                    step={0.1}
                    onValueChange={(value) => setMagnitudeRange(value as [number, number])}
                  />
                </div>

                {/* Depth filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Depth Range (km)</h3>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>Min: {depthRange[0].toFixed(1)} km</span>
                    <span>Max: {depthRange[1].toFixed(1)} km</span>
                  </div>
                  <Slider
                    defaultValue={depthRange}
                    min={0}
                    max={25}
                    step={0.5}
                    onValueChange={(value) => setDepthRange(value as [number, number])}
                  />
                </div>

                {/* Zone filter */}
                <div>
                  <h3 className="text-lg font-semibold mb-2">Zone Filter</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {ICELAND_ZONES.map((zone) => (
                      <Button
                        key={zone.id}
                        variant={zoneFilter === zone.id ? "default" : "outline"}
                        className={zoneFilter === zone.id ? "bg-blue-600" : ""}
                        onClick={() => setZoneFilter(zone.id)}
                      >
                        {zone.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Map display options */}
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
