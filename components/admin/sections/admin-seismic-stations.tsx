"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { Seismometer } from "@/types/seismometer"
import { SEISMOMETERS } from "@/data/seismometers"
import Link from "next/link"

export function AdminSeismicStations() {
    const [seismometers, setSeismometers] = useState<Seismometer[]>([])
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [stationName, setStationName] = useState("")
    const [stationCode, setStationCode] = useState("")
    const [channel, setChannel] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [description, setDescription] = useState("")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Load initial data
    useEffect(() => {
        setSeismometers(SEISMOMETERS)
    }, [])

    const addStation = () => {
        if (!stationName.trim()) {
            setError("Please enter a station name")
            return
        }
        if (!stationCode.trim()) {
            setError("Please enter a station code")
            return
        }
        if (!channel.trim()) {
            setError("Please enter a channel")
            return
        }
        if (!latitude || !longitude) {
            setError("Please enter valid coordinates")
            return
        }

        const lat = parseFloat(latitude)
        const lng = parseFloat(longitude)
        if (isNaN(lat) || isNaN(lng)) {
            setError("Please enter valid coordinates")
            return
        }

        const newStation: Seismometer = {
            id: `station-${Date.now()}`,
            name: stationName,
            stationCode,
            channel,
            coordinates: [lat, lng],
            description: description || undefined,
            dateAdded: new Date().toISOString()
        }

        setSeismometers(prev => [...prev, newStation])
        setHasUnsavedChanges(true)

        // Reset form
        setStationName("")
        setStationCode("")
        setChannel("")
        setLatitude("")
        setLongitude("")
        setDescription("")
        setError("")
    }

    const deleteStation = (id: string) => {
        setSeismometers(prev => prev.filter(station => station.id !== id))
        setHasUnsavedChanges(true)
    }

    const saveChanges = async () => {
        try {
            // In a real app, this would make an API call to save the data
            // For now, we'll just show a success message
            setMessage("Changes saved successfully! (Note: In development, changes are not persisted)")
            setHasUnsavedChanges(false)

            setTimeout(() => {
                setMessage("")
            }, 3000)
        } catch (err) {
            setError("Failed to save changes")
        }
    }

    return (
        <main className="min-h-screen bg-gray-950 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <Link href="/admin" className="text-white hover:text-gray-300 inline-flex items-center">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Admin Dashboard
                    </Link>

                    {hasUnsavedChanges && (
                        <Button
                            onClick={saveChanges}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Save className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    )}
                </div>

                <Card className="bg-gray-900 border-gray-800 p-6 mb-6">
                    <h1 className="text-2xl font-bold text-white mb-6">Seismic Stations Management</h1>

                    {error && (
                        <div className="p-3 bg-red-800/50 rounded-md mb-4">
                            <p className="text-red-300 text-sm">{error}</p>
                        </div>
                    )}

                    {message && (
                        <div className="p-3 bg-blue-800/50 rounded-md mb-4">
                            <p className="text-blue-300 text-sm">{message}</p>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="station-name">Station Name</Label>
                            <Input
                                id="station-name"
                                value={stationName}
                                onChange={(e) => setStationName(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                                placeholder="e.g., Fagradalsfjall Station 1"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="station-code">Station Code</Label>
                                <Input
                                    id="station-code"
                                    value={stationCode}
                                    onChange={(e) => setStationCode(e.target.value)}
                                    className="bg-gray-800 border-gray-700 mt-1"
                                    placeholder="e.g., FAG01"
                                />
                            </div>
                            <div>
                                <Label htmlFor="channel">Channel</Label>
                                <Input
                                    id="channel"
                                    value={channel}
                                    onChange={(e) => setChannel(e.target.value)}
                                    className="bg-gray-800 border-gray-700 mt-1"
                                    placeholder="e.g., EHZ"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="latitude">Latitude</Label>
                                <Input
                                    id="latitude"
                                    type="number"
                                    step="0.000001"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    className="bg-gray-800 border-gray-700 mt-1"
                                    placeholder="e.g., 63.912345"
                                />
                            </div>
                            <div>
                                <Label htmlFor="longitude">Longitude</Label>
                                <Input
                                    id="longitude"
                                    type="number"
                                    step="0.000001"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    className="bg-gray-800 border-gray-700 mt-1"
                                    placeholder="e.g., -22.123456"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description (Optional)</Label>
                            <Input
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="bg-gray-800 border-gray-700 mt-1"
                                placeholder="e.g., Located near the main crater"
                            />
                        </div>

                        <Button
                            onClick={addStation}
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Station
                        </Button>
                    </div>
                </Card>

                <Card className="bg-gray-900 border-gray-800 p-6">
                    <h2 className="font-medium mb-4">Existing Stations ({seismometers.length})</h2>
                    <div className="space-y-3">
                        {seismometers.map((station) => (
                            <div key={station.id} className="p-3 bg-gray-800 rounded-md">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="font-medium text-white">{station.name}</div>
                                        <div className="text-sm text-gray-400">
                                            {station.stationCode} - {station.channel}
                                        </div>
                                        {station.description && (
                                            <div className="text-sm text-gray-400 mt-1">
                                                {station.description}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-500 mt-1">
                                            Coordinates: {station.coordinates[0]}, {station.coordinates[1]}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Added: {new Date(station.dateAdded).toLocaleDateString()}
                                        </div>
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

                        {seismometers.length === 0 && (
                            <div className="text-center text-gray-400 py-4">
                                No seismic stations added yet
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </main>
    )
}