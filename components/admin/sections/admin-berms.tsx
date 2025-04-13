import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MapPin } from "lucide-react"
import { Berm } from "@/types/berm"

interface AdminBermsProps {
    map?: any // Replace with proper Leaflet type
    L?: any   // Replace with proper Leaflet type
}

export function AdminBerms({ map, L }: AdminBermsProps) {
    const [error, setError] = useState("")
    const [bermName, setBermName] = useState("")
    const [bermDescription, setBermDescription] = useState("")
    const [constructionDate, setConstructionDate] = useState("")
    const [completionDate, setCompletionDate] = useState("")
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [customBerms, setCustomBerms] = useState<Berm[]>([])
    const [selectedPoints, setSelectedPoints] = useState<[number, number][]>([])

    const bermColor = "#8B4513" // Brown color for berms

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

    const addBerm = () => {
        if (!bermName.trim()) {
            setError("Please enter a name for the berm")
            return
        }

        if (!constructionDate) {
            setError("Please enter a construction start date")
            return
        }

        if (selectedPoints.length < 2) {
            setError("Please draw the berm line on the map")
            return
        }

        const newBerm: Berm = {
            id: `berm-${Date.now()}`,
            name: bermName,
            description: bermDescription,
            coordinates: [selectedPoints], // Wrap in array to match type
            constructionDate,
            completionDate: completionDate || undefined,
            color: bermColor,
            createdAt: new Date().toISOString(),
        }

        setCustomBerms([...customBerms, newBerm])
        setBermName("")
        setBermDescription("")
        setConstructionDate("")
        setCompletionDate("")
        setSelectedPoints([])
        setError("")
        setIsSelectingLocation(false)
    }

    const deleteBerm = (id: string) => {
        setCustomBerms(customBerms.filter(berm => berm.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">Berm Management</h3>
                    <p className="text-sm text-gray-300">
                        Add and manage berms on the map. Berms are protective barriers that can be drawn as lines.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-800/50 rounded-md">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="berm-name">Berm Name</Label>
                        <Input
                            id="berm-name"
                            value={bermName}
                            onChange={(e) => setBermName(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Northern Protection Barrier"
                        />
                    </div>

                    <div>
                        <Label htmlFor="berm-description">Description (Optional)</Label>
                        <Input
                            id="berm-description"
                            value={bermDescription}
                            onChange={(e) => setBermDescription(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Protective berm constructed to divert lava flow"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="construction-date">Construction Start</Label>
                            <Input
                                id="construction-date"
                                type="date"
                                value={constructionDate}
                                onChange={(e) => setConstructionDate(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="completion-date">Completion Date (Optional)</Label>
                            <Input
                                id="completion-date"
                                type="date"
                                value={completionDate}
                                onChange={(e) => setCompletionDate(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                            />
                        </div>
                    </div>

                    <Button
                        onClick={startDrawing}
                        disabled={isSelectingLocation}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {isSelectingLocation ? "Drawing Mode Active" : "Draw Berm Line"}
                    </Button>

                    <Button
                        onClick={addBerm}
                        disabled={!bermName || selectedPoints.length < 2}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Berm
                    </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-3">Existing Berms</h3>
                    <div className="space-y-3">
                        {customBerms.map((berm) => (
                            <div key={berm.id} className="p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{berm.name}</div>
                                        {berm.description && (
                                            <div className="text-sm text-gray-400 mt-1">{berm.description}</div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Construction: {new Date(berm.constructionDate).toLocaleDateString()}
                                            {berm.completionDate &&
                                                ` - Completed: ${new Date(berm.completionDate).toLocaleDateString()}`}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Added: {new Date(berm.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteBerm(berm.id)}
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