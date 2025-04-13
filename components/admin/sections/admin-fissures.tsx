import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MapPin } from "lucide-react"
import { Fissure } from "@/types/fissures"

interface AdminFissuresProps {
    map?: any // Replace with proper Leaflet type
    L?: any   // Replace with proper Leaflet type
}

export function AdminFissures({ map, L }: AdminFissuresProps) {
    const [error, setError] = useState("")
    const [fissureName, setFissureName] = useState("")
    const [fissureDescription, setFissureDescription] = useState("")
    const [eruption, setEruption] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [customFissures, setCustomFissures] = useState<Fissure[]>([])
    const [selectedPoints, setSelectedPoints] = useState<[number, number][]>([])
    const [isActive, setIsActive] = useState(false)

    const fissureColor = "#FF0000" // Default red color for fissures

    const startDrawing = () => {
        setIsSelectingLocation(true)
        if (map && L) {
            // Trigger the polyline drawing tool
            const drawPolylineButton = document.querySelector(".leaflet-draw-draw-polyline")
            if (drawPolylineButton) {
                (drawPolylineButton as HTMLElement).click()

                // Set up event handlers for the drawn items
                map.off('draw:created').on('draw:created', (e: any) => {
                    const layer = e.layer
                    const coordinates = layer.getLatLngs().map((latLng: any) => [latLng.lat, latLng.lng])
                    setSelectedPoints(coordinates)
                })

                map.off('draw:drawstop').on('draw:drawstop', () => {
                    setIsSelectingLocation(false)
                })

                // Handle editing events
                map.off('draw:edited').on('draw:edited', (e: any) => {
                    const layers = e.layers
                    layers.eachLayer((layer: any) => {
                        const coordinates = layer.getLatLngs().map((latLng: any) => [latLng.lat, latLng.lng])
                        setSelectedPoints(coordinates)
                    })
                })

                // Clean up layers when drawing is cancelled
                map.off('draw:deletestop').on('draw:deletestop', () => {
                    setSelectedPoints([])
                    setIsSelectingLocation(false)
                })
            }
        }
    }

    const addFissure = () => {
        if (!fissureName.trim()) {
            setError("Please enter a name for the fissure")
            return
        }

        if (!eruption.trim()) {
            setError("Please enter the associated eruption")
            return
        }

        if (!startDate) {
            setError("Please enter a start date")
            return
        }

        if (selectedPoints.length < 2) {
            setError("Please draw the fissure line on the map")
            return
        }

        const newFissure: Fissure = {
            id: `fissure-${Date.now()}`,
            name: fissureName,
            description: fissureDescription,
            eruption,
            coordinates: [selectedPoints], // Wrap the points array in another array to match the type
            startDate,
            endDate: endDate || undefined,
            color: fissureColor,
            isActive,
            createdAt: new Date().toISOString(),
        }

        setCustomFissures([...customFissures, newFissure])
        setFissureName("")
        setFissureDescription("")
        setEruption("")
        setStartDate("")
        setEndDate("")
        setSelectedPoints([])
        setIsActive(false)
        setError("")
        setIsSelectingLocation(false)
    }

    const deleteFissure = (id: string) => {
        setCustomFissures(customFissures.filter(fissure => fissure.id !== id))
    }

    const toggleFissureStatus = (id: string) => {
        setCustomFissures(customFissures.map(fissure => {
            if (fissure.id === id) {
                return { ...fissure, isActive: !fissure.isActive }
            }
            return fissure
        }))
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">Fissure Management</h3>
                    <p className="text-sm text-gray-300">
                        Add and manage volcanic fissures on the map. Draw lines to mark fissure locations and track their activity status.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-800/50 rounded-md">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="fissure-name">Fissure Name</Label>
                        <Input
                            id="fissure-name"
                            value={fissureName}
                            onChange={(e) => setFissureName(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Northern Fissure"
                        />
                    </div>

                    <div>
                        <Label htmlFor="eruption">Associated Eruption</Label>
                        <Input
                            id="eruption"
                            value={eruption}
                            onChange={(e) => setEruption(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Sundhnúkur 2024"
                        />
                    </div>

                    <div>
                        <Label htmlFor="fissure-description">Description (Optional)</Label>
                        <Input
                            id="fissure-description"
                            value={fissureDescription}
                            onChange={(e) => setFissureDescription(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Active fissure from the 2024 eruption"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="start-date">Start Date</Label>
                            <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="end-date">End Date (Optional)</Label>
                            <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="is-active"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="rounded border-gray-700 bg-gray-800"
                        />
                        <Label htmlFor="is-active">Currently Active</Label>
                    </div>

                    <Button
                        onClick={startDrawing}
                        disabled={isSelectingLocation}
                        className="w-full bg-red-600 hover:bg-red-700"
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {isSelectingLocation ? "Drawing Mode Active" : "Draw Fissure Line"}
                    </Button>

                    <Button
                        onClick={addFissure}
                        disabled={!fissureName || selectedPoints.length < 2}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Fissure
                    </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-3">Existing Fissures</h3>
                    <div className="space-y-3">
                        {customFissures.map((fissure) => (
                            <div key={fissure.id} className="p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{fissure.name}</span>
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded ${fissure.isActive ? "bg-red-800 text-red-200" : "bg-gray-700 text-gray-300"
                                                    }`}
                                            >
                                                {fissure.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
                                        {fissure.description && (
                                            <div className="text-sm text-gray-400 mt-1">{fissure.description}</div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Added: {new Date(fissure.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => toggleFissureStatus(fissure.id)}
                                            className={`${fissure.isActive
                                                ? "text-red-400 hover:text-red-300"
                                                : "text-gray-400 hover:text-gray-300"
                                                }`}
                                        >
                                            {fissure.isActive ? "Set Inactive" : "Set Active"}
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteFissure(fissure.id)}
                                            className="text-gray-400 hover:text-red-500"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}