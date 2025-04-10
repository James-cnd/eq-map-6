"use client"

import { Slider } from "@/components/ui/slider"
import type { Earthquake } from "@/types/earthquake"
import { ICELAND_ZONES } from "@/types/zones"
import { formatDistanceToNow, format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EarthquakeSidebarProps {
    earthquakes: Earthquake[]
    onSelectEarthquake: (earthquake: Earthquake) => void
    magnitudeRange: [number, number]
    setMagnitudeRange: (value: [number, number]) => void
    depthRange: [number, number]
    setDepthRange: (value: [number, number]) => void
    timeFilterRange: [number, number]
    setTimeFilterRange: (value: [number, number]) => void
    zoneFilter: string
    setZoneFilter: (value: string) => void
    activePanel: "settings" | "list" | null
}

// Helper function to format time values with hours and minutes
const formatTimeValue = (value: number): string => {
    const hours = Math.floor(value)
    const minutes = Math.round((value - hours) * 60)

    if (minutes === 0) {
        return `${hours} ${hours === 1 ? "hour" : "hours"}`
    } else {
        return `${hours}h ${minutes}m`
    }
}

export default function EarthquakeSidebar({
    earthquakes,
    onSelectEarthquake,
    magnitudeRange,
    setMagnitudeRange,
    depthRange,
    setDepthRange,
    timeFilterRange,
    setTimeFilterRange,
    zoneFilter,
    setZoneFilter,
    activePanel,
}: EarthquakeSidebarProps) {
    if (activePanel === "settings") {
        return (
            <div className="p-4 text-gray-200">
                <div className="space-y-6">
                    <div>
                        <h3 className="font-medium mb-2">
                            Magnitude Range: {magnitudeRange[0].toFixed(1)} - {magnitudeRange[1].toFixed(1)}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Minimum Magnitude: {magnitudeRange[0].toFixed(1)}
                                </label>
                                <Slider
                                    value={[magnitudeRange[0]]}
                                    min={-2}
                                    max={magnitudeRange[1]}
                                    step={0.1}
                                    onValueChange={(value) => {
                                        if (value[0] !== magnitudeRange[0]) {
                                            setMagnitudeRange([value[0], magnitudeRange[1]])
                                        }
                                    }}
                                    className="py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Maximum Magnitude: {magnitudeRange[1].toFixed(1)}
                                </label>
                                <Slider
                                    value={[magnitudeRange[1]]}
                                    min={magnitudeRange[0]}
                                    max={8}
                                    step={0.1}
                                    onValueChange={(value) => {
                                        if (value[0] !== magnitudeRange[1]) {
                                            setMagnitudeRange([magnitudeRange[0], value[0]])
                                        }
                                    }}
                                    className="py-2"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Show earthquakes with magnitude between {magnitudeRange[0].toFixed(1)} and {magnitudeRange[1].toFixed(1)}
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">
                            Depth Range: {depthRange[0].toFixed(1)} - {depthRange[1].toFixed(1)} km
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Minimum Depth: {depthRange[0].toFixed(1)} km</label>
                                <Slider
                                    value={[depthRange[0]]}
                                    min={0}
                                    max={depthRange[1]}
                                    step={0.5}
                                    onValueChange={(value) => {
                                        if (value[0] !== depthRange[0]) {
                                            setDepthRange([value[0], depthRange[1]])
                                        }
                                    }}
                                    className="py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">Maximum Depth: {depthRange[1].toFixed(1)} km</label>
                                <Slider
                                    value={[depthRange[1]]}
                                    min={depthRange[0]}
                                    max={25}
                                    step={0.5}
                                    onValueChange={(value) => {
                                        if (value[0] !== depthRange[1]) {
                                            setDepthRange([depthRange[0], value[0]])
                                        }
                                    }}
                                    className="py-2"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Show earthquakes with depth between {depthRange[0].toFixed(1)} and {depthRange[1].toFixed(1)} km
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">
                            Time Window: {formatTimeValue(timeFilterRange[0])} - {formatTimeValue(timeFilterRange[1])} ago
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Most Recent: {formatTimeValue(timeFilterRange[0])} ago
                                </label>
                                <Slider
                                    value={[timeFilterRange[0]]}
                                    min={0}
                                    max={timeFilterRange[1]}
                                    step={0.25} // 15-minute intervals
                                    onValueChange={(value) => {
                                        if (value[0] !== timeFilterRange[0]) {
                                            setTimeFilterRange([value[0], timeFilterRange[1]])
                                        }
                                    }}
                                    className="py-2"
                                />
                            </div>
                            <div>
                                <label className="text-sm text-gray-400 mb-1 block">
                                    Oldest: {formatTimeValue(timeFilterRange[1])} ago
                                </label>
                                <Slider
                                    value={[timeFilterRange[1]]}
                                    min={timeFilterRange[0]}
                                    max={24}
                                    step={0.25} // 15-minute intervals
                                    onValueChange={(value) => {
                                        if (value[0] !== timeFilterRange[1]) {
                                            setTimeFilterRange([timeFilterRange[0], value[0]])
                                        }
                                    }}
                                    className="py-2"
                                />
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">
                            Show earthquakes from {formatTimeValue(timeFilterRange[0])} to {formatTimeValue(timeFilterRange[1])} ago
                        </p>
                    </div>

                    <div>
                        <h3 className="font-medium mb-2">Geographic Zone</h3>
                        <Select value={zoneFilter} onValueChange={setZoneFilter}>
                            <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                                <SelectValue placeholder="Select a zone" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-700 text-white z-[2000]">
                                {ICELAND_ZONES.map((zone) => (
                                    <SelectItem key={zone.id} value={zone.id} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                                        {zone.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-400 mt-1">Filter earthquakes by volcanic/seismic zone</p>
                    </div>
                </div>
            </div>
        )
    }

    if (activePanel === "list") {
        return (
            <div className="p-4 text-gray-200">
                <div className="mb-2">
                    <p className="text-sm">
                        Showing {earthquakes.length} earthquakes
                        {(magnitudeRange[0] > -2 || magnitudeRange[1] < 5) &&
                            ` with magnitude between ${magnitudeRange[0].toFixed(1)} and ${magnitudeRange[1].toFixed(1)}`}
                        {(depthRange[0] > 0 || depthRange[1] < 25) &&
                            ` at depths between ${depthRange[0].toFixed(1)} and ${depthRange[1].toFixed(1)} km`}
                        {(timeFilterRange[0] > 0 || timeFilterRange[1] < 24) &&
                            ` from ${formatTimeValue(timeFilterRange[0])} to ${formatTimeValue(timeFilterRange[1])} ago`}
                        {zoneFilter !== "all" && ` in ${ICELAND_ZONES.find((z) => z.id === zoneFilter)?.name || ""}`}
                    </p>
                </div>

                {earthquakes.length === 0 ? (
                    <p className="text-sm text-gray-400 py-4">No earthquakes match your filters</p>
                ) : (
                    <div className="space-y-2">
                        {earthquakes.map((quake, index) => {
                            const quakeDate = new Date(quake.timestamp)
                            const isNewest = index === 0 // First earthquake is the newest

                            return (
                                <div
                                    key={quake.id}
                                    className={`border border-gray-700 rounded-lg p-2 hover:bg-gray-800 cursor-pointer transition-colors text-sm ${isNewest ? "border-red-500" : ""
                                        }`}
                                    onClick={() => onSelectEarthquake(quake)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="truncate">
                                            <p className="font-medium truncate text-white">
                                                {isNewest && (
                                                    <span className="inline-block h-2 w-2 rounded-full bg-red-500 mr-1 animate-pulse"></span>
                                                )}
                                                {quake.humanReadableLocation}
                                            </p>
                                            <div className="flex flex-col gap-1">
                                                {/* Add exact timestamp */}
                                                <p className="text-xs text-gray-400">{format(quakeDate, "yyyy-MM-dd HH:mm:ss")}</p>
                                                <div className="flex items-center gap-1">
                                                    <p className="text-xs text-gray-400">{formatDistanceToNow(quakeDate, { addSuffix: true })}</p>
                                                    <span className="text-xs px-1 bg-gray-800 rounded text-gray-400">
                                                        {quake.depth.toFixed(1)} km
                                                    </span>
                                                    {quake.review && (
                                                        <span className="text-xs px-1 bg-gray-800 rounded text-gray-400">{quake.review}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            className="flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-xs shrink-0 ml-1"
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
            </div>
        )
    }

    return null
}

function getColorForMagnitude(magnitude: number): string {
    if (magnitude < 0) return "#3498DB" // Blue for negative magnitudes
    if (magnitude < 1) return "#2ECC71" // Green
    if (magnitude < 2) return "#F1C40F" // Yellow
    if (magnitude < 3) return "#E67E22" // Orange
    if (magnitude < 4) return "#E74C3C" // Red
    return "#8E44AD" // Purple for 4+
}