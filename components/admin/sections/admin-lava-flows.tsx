import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MapPin } from "lucide-react"
import { LavaFlow } from "@/types/lava-flow"

interface AdminLavaFlowsProps {
    map?: any // Replace with proper Leaflet type
    L?: any   // Replace with proper Leaflet type
}

export function AdminLavaFlows({ map, L }: AdminLavaFlowsProps) {
    const [error, setError] = useState("")
    const [flowName, setFlowName] = useState("")
    const [flowDescription, setFlowDescription] = useState("")
    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [opacity, setOpacity] = useState(0.6)
    const [isSelectingArea, setIsSelectingArea] = useState(false)
    const [customLavaFlows, setCustomLavaFlows] = useState<LavaFlow[]>([])
    const [selectedPoints, setSelectedPoints] = useState<[number, number][]>([])

    const flowColor = "#FF6600" // Default orange color for lava flows

    const startDrawingArea = () => {
        setIsSelectingArea(true)
        if (map && L) {
            // Trigger the polygon drawing tool
            const drawPolygonButton = document.querySelector(".leaflet-draw-draw-polygon")
            if (drawPolygonButton) {
                (drawPolygonButton as HTMLElement).click()

                // Set up event handlers for the drawn items
                map.off('draw:created').on('draw:created', (e: any) => {
                    const layer = e.layer
                    const coordinates = layer.getLatLngs()[0].map((latLng: any) => [latLng.lat, latLng.lng])
                    setSelectedPoints(coordinates)
                })

                map.off('draw:drawstop').on('draw:drawstop', () => {
                    setIsSelectingArea(false)
                })

                // Handle editing events
                map.off('draw:edited').on('draw:edited', (e: any) => {
                    const layers = e.layers
                    layers.eachLayer((layer: any) => {
                        const coordinates = layer.getLatLngs()[0].map((latLng: any) => [latLng.lat, latLng.lng])
                        setSelectedPoints(coordinates)
                    })
                })

                // Clean up layers when drawing is cancelled
                map.off('draw:deletestop').on('draw:deletestop', () => {
                    setSelectedPoints([])
                    setIsSelectingArea(false)
                })
            }
        }
    }

    const addLavaFlow = () => {
        if (!flowName.trim()) {
            setError("Please enter a name for the lava flow")
            return
        }

        if (!startDate) {
            setError("Please enter a start date")
            return
        }

        if (selectedPoints.length < 3) {
            setError("Please draw the lava flow area on the map")
            return
        }

        const newFlow: LavaFlow = {
            id: `flow-${Date.now()}`,
            name: flowName,
            description: flowDescription,
            coordinates: [selectedPoints], // Wrap in array to match type
            startDate,
            endDate: endDate || undefined,
            color: flowColor,
            opacity,
            createdAt: new Date().toISOString(),
        }

        setCustomLavaFlows([...customLavaFlows, newFlow])
        setFlowName("")
        setFlowDescription("")
        setStartDate("")
        setEndDate("")
        setSelectedPoints([])
        setError("")
        setIsSelectingArea(false)
    }

    const deleteLavaFlow = (id: string) => {
        setCustomLavaFlows(customLavaFlows.filter(flow => flow.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">Lava Flow Management</h3>
                    <p className="text-sm text-gray-300">
                        Add and manage lava flow areas on the map. Draw polygons to mark areas affected by lava flows.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-800/50 rounded-md">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="flow-name">Flow Name</Label>
                        <Input
                            id="flow-name"
                            value={flowName}
                            onChange={(e) => setFlowName(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Northern Lava Field"
                        />
                    </div>

                    <div>
                        <Label htmlFor="flow-description">Description (Optional)</Label>
                        <Input
                            id="flow-description"
                            value={flowDescription}
                            onChange={(e) => setFlowDescription(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Active lava flow from the 2024 eruption"
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

                    <div>
                        <Label htmlFor="opacity">Opacity ({Math.round(opacity * 100)}%)</Label>
                        <Input
                            id="opacity"
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={opacity}
                            onChange={(e) => setOpacity(parseFloat(e.target.value))}
                            className="bg-gray-800 border-gray-700 mt-1"
                        />
                    </div>

                    <Button
                        onClick={startDrawingArea}
                        disabled={isSelectingArea}
                        className="w-full bg-orange-600 hover:bg-orange-700"
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {isSelectingArea ? "Drawing Mode Active" : "Draw Lava Flow Area"}
                    </Button>

                    <Button
                        onClick={addLavaFlow}
                        disabled={!flowName || selectedPoints.length < 3}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Lava Flow
                    </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-3">Existing Lava Flows</h3>
                    <div className="space-y-3">
                        {customLavaFlows.map((flow) => (
                            <div key={flow.id} className="p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{flow.name}</div>
                                        {flow.description && (
                                            <div className="text-sm text-gray-400 mt-1">{flow.description}</div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Added: {new Date(flow.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Start: {new Date(flow.startDate).toLocaleDateString()}
                                            {flow.endDate && ` - End: ${new Date(flow.endDate).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteLavaFlow(flow.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}