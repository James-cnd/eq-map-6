"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Trash2, ArrowLeft, Save } from "lucide-react"
import { GpsStation } from "@/data/gps-stations"
import { GPS_STATIONS } from "@/data/gps-stations"
import Link from "next/link"

export function AdminGpsStations() {
    const [stations, setStations] = useState<GpsStation[]>([])
    const [error, setError] = useState("")
    const [message, setMessage] = useState("")
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

    // Form fields
    const [marker, setMarker] = useState("")
    const [name, setName] = useState("")
    const [informationUrl, setInformationUrl] = useState("")
    const [rinexUrl, setRinexUrl] = useState("")
    const [latitude, setLatitude] = useState("")
    const [longitude, setLongitude] = useState("")
    const [altitude, setAltitude] = useState("")
    const [dateFrom, setDateFrom] = useState("")
    const [agencyName, setAgencyName] = useState("Icelandic Meteorological Office")
    const [shortCode, setShortCode] = useState("")
    const [volc, setVolc] = useState("")

    // Load initial data
    useEffect(() => {
        setStations(GPS_STATIONS)
    }, [])

    const addStation = () => {
        // Validate required fields
        if (!marker || !name || !latitude || !longitude) {
            setError("Marker, name, latitude, and longitude are required")
            return
        }

        // Validate coordinates
        const lat = parseFloat(latitude)
        const lon = parseFloat(longitude)
        const alt = parseFloat(altitude)

        if (isNaN(lat) || isNaN(lon) || isNaN(alt)) {
            setError("Invalid coordinates")
            return
        }

        const newStation: GpsStation = {
            id: Math.max(...stations.map(s => s.id), 0) + 1,
            marker,
            name,
            information_url: informationUrl,
            rinex_url: rinexUrl,
            coordinates: {
                lat,
                lon,
                altitude: alt
            },
            date_from: dateFrom || new Date().toISOString(),
            date_to: null,
            agency: {
                name: agencyName
            },
            short: shortCode || marker,
            volc: volc || undefined
        }

        setStations(prev => [...prev, newStation])
        setHasUnsavedChanges(true)

        // Reset form
        setMarker("")
        setName("")
        setInformationUrl("")
        setRinexUrl("")
        setLatitude("")
        setLongitude("")
        setAltitude("")
        setDateFrom("")
        setShortCode("")
        setVolc("")
        setError("")
    }

    const deleteStation = (id: number) => {
        setStations(prev => prev.filter(station => station.id !== id))
        setHasUnsavedChanges(true)
    }

    const saveChanges = async () => {
        try {
            const fileContent = `// filepath: k:\\1 - CODE\\James-map\\eq-map-6\\data\\gps-stations.ts
export interface GpsStation {
    id: number
    marker: string
    name: string
    information_url: string
    rinex_url: string
    coordinates: {
        lat: number
        lon: number
        altitude: number
    }
    date_from: string
    date_to: string | null
    agency: {
        name: string
    }
    short: string
    volc?: string
}

// Define a comprehensive set of GPS stations across Iceland
export const GPS_STATIONS: GpsStation[] = ${JSON.stringify(stations, null, 2)}`

            // Make an API call to save the file
            const response = await fetch('/api/save-file', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: 'data/gps-stations.ts',
                    content: fileContent
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to save file')
            }

            setMessage("Changes saved successfully!")
            setHasUnsavedChanges(false)

            setTimeout(() => {
                setMessage("")
            }, 3000)
        } catch (err) {
            setError("Failed to save changes: " + (err instanceof Error ? err.message : String(err)))
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
                    <h1 className="text-2xl font-bold text-white mb-6">GPS Stations Management</h1>

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
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="marker">Marker Code *</Label>
                                <Input
                                    id="marker"
                                    value={marker}
                                    onChange={(e) => setMarker(e.target.value)}
                                    placeholder="e.g., REYK"
                                />
                            </div>
                            <div>
                                <Label htmlFor="name">Station Name *</Label>
                                <Input
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Reykjavík"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="latitude">Latitude *</Label>
                                <Input
                                    id="latitude"
                                    value={latitude}
                                    onChange={(e) => setLatitude(e.target.value)}
                                    placeholder="e.g., 64.1392"
                                />
                            </div>
                            <div>
                                <Label htmlFor="longitude">Longitude *</Label>
                                <Input
                                    id="longitude"
                                    value={longitude}
                                    onChange={(e) => setLongitude(e.target.value)}
                                    placeholder="e.g., -21.9558"
                                />
                            </div>
                            <div>
                                <Label htmlFor="altitude">Altitude (m)</Label>
                                <Input
                                    id="altitude"
                                    value={altitude}
                                    onChange={(e) => setAltitude(e.target.value)}
                                    placeholder="e.g., 93.04"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="informationUrl">Information URL</Label>
                                <Input
                                    id="informationUrl"
                                    value={informationUrl}
                                    onChange={(e) => setInformationUrl(e.target.value)}
                                    placeholder="https://api.epos-iceland.is/..."
                                />
                            </div>
                            <div>
                                <Label htmlFor="rinexUrl">RINEX URL</Label>
                                <Input
                                    id="rinexUrl"
                                    value={rinexUrl}
                                    onChange={(e) => setRinexUrl(e.target.value)}
                                    placeholder="https://api.epos-iceland.is/..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="dateFrom">Date From</Label>
                                <Input
                                    id="dateFrom"
                                    type="date"
                                    value={dateFrom.split('T')[0]}
                                    onChange={(e) => setDateFrom(e.target.value + 'T00:00:00Z')}
                                />
                            </div>
                            <div>
                                <Label htmlFor="shortCode">Short Code</Label>
                                <Input
                                    id="shortCode"
                                    value={shortCode}
                                    onChange={(e) => setShortCode(e.target.value)}
                                    placeholder="e.g., REYK"
                                />
                            </div>
                            <div>
                                <Label htmlFor="volc">Volcanic System</Label>
                                <Input
                                    id="volc"
                                    value={volc}
                                    onChange={(e) => setVolc(e.target.value)}
                                    placeholder="e.g., krafla"
                                />
                            </div>
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
                    <h2 className="font-medium mb-4">Existing Stations ({stations.length})</h2>
                    <div className="space-y-3">
                        {stations.map((station) => (
                            <div key={station.id} className="flex items-center justify-between p-3 bg-gray-800 rounded-md">
                                <div>
                                    <h3 className="font-medium">{station.name}</h3>
                                    <p className="text-sm text-gray-400">
                                        {station.marker} • {station.coordinates.lat}, {station.coordinates.lon}
                                        {station.volc && ` • ${station.volc}`}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteStation(station.id)}
                                    className="text-red-500 hover:text-red-600 hover:bg-red-950"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}

                        {stations.length === 0 && (
                            <div className="text-center text-gray-400 py-4">
                                No GPS stations added yet
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </main>
    )
}