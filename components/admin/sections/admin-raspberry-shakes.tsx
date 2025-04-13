import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, MapPin } from "lucide-react"
import { Seismometer } from "@/types/seismometer"

interface AdminRaspberryShakesProps {
    map?: any // Replace with proper Leaflet type
    L?: any   // Replace with proper Leaflet type
}

export function AdminRaspberryShakes({ map, L }: AdminRaspberryShakesProps) {
    const [error, setError] = useState("")
    const [stationName, setStationName] = useState("")
    const [stationLatitude, setStationLatitude] = useState("")
    const [stationLongitude, setStationLongitude] = useState("")
    const [stationDescription, setStationDescription] = useState("")
    const [stationId, setStationId] = useState("")
    const [stationChannel, setStationChannel] = useState("EHZ")
    const [isSelectingLocation, setIsSelectingLocation] = useState(false)
    const [customStations, setCustomStations] = useState<Seismometer[]>([])

    const startLocationSelection = () => {
        setIsSelectingLocation(true)
        if (map && L) {
            // TODO: Implement map click handler for location selection
        }
    }

    const addStation = () => {
        if (!stationName.trim() || !stationId.trim()) {
            setError("Please enter both a name and station ID")
            return
        }

        if (!stationLatitude || !stationLongitude) {
            setError("Please select a location on the map")
            return
        }

        const newStation: Seismometer = {
            id: `rs-${Date.now()}`,
            name: stationName,
            description: stationDescription,
            coordinates: [parseFloat(stationLatitude), parseFloat(stationLongitude)],
            stationCode: stationId.toUpperCase(),
            channel: stationChannel,
            type: 'raspberry-shake',
            createdAt: new Date().toISOString(),
        }

        setCustomStations([...customStations, newStation])
        setStationName("")
        setStationId("")
        setStationDescription("")
        setStationLatitude("")
        setStationLongitude("")
        setStationChannel("EHZ")
        setError("")
        setIsSelectingLocation(false)
    }

    const deleteStation = (id: string) => {
        setCustomStations(customStations.filter(station => station.id !== id))
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">Raspberry Shake Management</h3>
                    <p className="text-sm text-gray-300">
                        Add and manage Raspberry Shake seismometer stations. These provide real-time seismic data from citizen scientists.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-800/50 rounded-md">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="station-name">Station Name</Label>
                        <Input
                            id="station-name"
                            value={stationName}
                            onChange={(e) => setStationName(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Reykjanes Peninsula RS"
                        />
                    </div>

                    <div>
                        <Label htmlFor="station-id">Station ID</Label>
                        <Input
                            id="station-id"
                            value={stationId}
                            onChange={(e) => setStationId(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., R2E05"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <Label htmlFor="station-latitude">Latitude</Label>
                            <Input
                                id="station-latitude"
                                value={stationLatitude}
                                onChange={(e) => setStationLatitude(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                                placeholder="e.g., 63.8500"
                                type="number"
                                step="0.0001"
                            />
                        </div>
                        <div>
                            <Label htmlFor="station-longitude">Longitude</Label>
                            <Input
                                id="station-longitude"
                                value={stationLongitude}
                                onChange={(e) => setStationLongitude(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                                placeholder="e.g., -22.4500"
                                type="number"
                                step="0.0001"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="station-channel">Channel</Label>
                        <Input
                            id="station-channel"
                            value={stationChannel}
                            onChange={(e) => setStationChannel(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., EHZ"
                        />
                    </div>

                    <div>
                        <Label htmlFor="station-description">Description</Label>
                        <Input
                            id="station-description"
                            value={stationDescription}
                            onChange={(e) => setStationDescription(e.target.value)}
                            className="bg-gray-800 border-gray-700 mt-1"
                            placeholder="e.g., Citizen scientist station near eruption site"
                        />
                    </div>

                    <Button
                        onClick={startLocationSelection}
                        disabled={isSelectingLocation}
                        className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        {isSelectingLocation ? "Click on Map to Place Station" : "Select Location on Map"}
                    </Button>

                    <Button
                        onClick={addStation}
                        disabled={!stationName || !stationId || !stationLatitude || !stationLongitude}
                        className="w-full"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Station
                    </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-3">Existing Raspberry Shake Stations</h3>
                    <div className="space-y-3">
                        {customStations.map((station) => (
                            <div key={station.id} className="p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium">{station.name}</div>
                                        <div className="text-sm text-gray-400">ID: {station.stationCode}</div>
                                        <div className="text-xs text-gray-500">
                                            Channel: {station.channel} | Location: {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                                        </div>
                                        {station.description && (
                                            <div className="text-sm text-gray-400 mt-1">{station.description}</div>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => deleteStation(station.id)}
                                        className="text-gray-400 hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {customStations.length === 0 && (
                            <p className="text-sm text-gray-400">No Raspberry Shake stations added yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}