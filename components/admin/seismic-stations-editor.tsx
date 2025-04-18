"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Trash2, Save, MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface SeismicStationsEditorProps {
  map: any
  L: any
}

export default function SeismicStationsEditor({ map, L }: SeismicStationsEditorProps) {
  const [stations, setStations] = useLocalStorage<any[]>("earthquakeCustomSeismometers", [])
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)

  // Form state
  const [stationName, setStationName] = useState("")
  const [stationCode, setStationCode] = useState("")
  const [stationChannel, setStationChannel] = useState("EHZ")
  const [stationLatitude, setStationLatitude] = useState("")
  const [stationLongitude, setStationLongitude] = useState("")
  const [stationDescription, setStationDescription] = useState("")

  // Reference for the location marker
  const locationMarkerRef = React.useRef<any>(null)

  // Load station data if editing
  useEffect(() => {
    if (selectedStationId) {
      const station = stations.find((s) => s.id === selectedStationId)
      if (station) {
        setStationName(station.name)
        setStationCode(station.stationCode)
        setStationChannel(station.channel)
        setStationLatitude(station.coordinates[0].toString())
        setStationLongitude(station.coordinates[1].toString())
        setStationDescription(station.description || "")
      }
    }
  }, [selectedStationId, stations])

  // Handle map click for location selection
  useEffect(() => {
    if (!map) return

    const handleMapClick = (e: any) => {
      if (!isSelectingLocation) return

      const { lat, lng } = e.latlng
      setStationLatitude(lat.toFixed(6))
      setStationLongitude(lng.toFixed(6))

      // Update marker
      if (locationMarkerRef.current) {
        map.removeLayer(locationMarkerRef.current)
      }

      locationMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `
            <div style="
              background-color: #FF3B30; 
              width: 16px; 
              height: 16px; 
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 0 10px rgba(0,0,0,0.7);
              animation: pulse 1.5s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
                100% { transform: scale(1); opacity: 1; }
              }
            </style>
          `,
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
        zIndexOffset: 2000,
      }).addTo(map)

      setIsSelectingLocation(false)
    }

    map.on("click", handleMapClick)

    return () => {
      map.off("click", handleMapClick)
    }
  }, [map, L, isSelectingLocation])

  // Start location selection
  const startLocationSelection = () => {
    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current)
      locationMarkerRef.current = null
    }

    setIsSelectingLocation(true)
    toast({
      title: "Location Selection Active",
      description: "Click on the map to select the seismic station location",
    })
  }

  // Save station
  const saveStation = () => {
    if (!stationName || !stationCode || !stationLatitude || !stationLongitude) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newStation = {
      id: selectedStationId || `seismometer-${Date.now()}`,
      name: stationName,
      stationCode: stationCode,
      channel: stationChannel,
      coordinates: [Number(stationLatitude), Number(stationLongitude)],
      description: stationDescription,
      dateAdded: selectedStationId
        ? stations.find((s) => s.id === selectedStationId)?.dateAdded || new Date().toISOString()
        : new Date().toISOString(),
    }

    if (selectedStationId) {
      // Update existing station
      setStations(stations.map((s) => (s.id === selectedStationId ? newStation : s)))
    } else {
      // Add new station
      setStations([...stations, newStation])
    }

    toast({
      title: "Success",
      description: `Seismic station ${selectedStationId ? "updated" : "added"} successfully!`,
    })

    // Reset form
    resetForm()
  }

  // Delete station
  const deleteStation = (id: string) => {
    setStations(stations.filter((s) => s.id !== id))

    if (selectedStationId === id) {
      resetForm()
    }

    toast({
      title: "Success",
      description: "Seismic station deleted successfully!",
    })
  }

  // Reset form
  const resetForm = () => {
    setSelectedStationId(null)
    setStationName("")
    setStationCode("")
    setStationChannel("EHZ")
    setStationLatitude("")
    setStationLongitude("")
    setStationDescription("")

    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current)
      locationMarkerRef.current = null
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">
          {selectedStationId ? "Edit Seismic Station" : "Add New Seismic Station"}
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="station-name">Station Name</Label>
              <Input
                id="station-name"
                value={stationName}
                onChange={(e) => setStationName(e.target.value)}
                placeholder="e.g., Reykjanes Station"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="station-code">Station Code</Label>
              <Input
                id="station-code"
                value={stationCode}
                onChange={(e) => setStationCode(e.target.value)}
                placeholder="e.g., RBDCF"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="station-channel">Channel</Label>
              <Input
                id="station-channel"
                value={stationChannel}
                onChange={(e) => setStationChannel(e.target.value)}
                placeholder="e.g., EHZ"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="station-latitude">Latitude</Label>
              <Input
                id="station-latitude"
                value={stationLatitude}
                onChange={(e) => setStationLatitude(e.target.value)}
                placeholder="e.g., 64.1234"
                className="bg-gray-700 border-gray-600"
              />
            </div>

            <div>
              <Label htmlFor="station-longitude">Longitude</Label>
              <Input
                id="station-longitude"
                onChange={(e) => setStationLongitude(e.target.value)}
                value={stationLongitude}
                placeholder="e.g., -21.1234"
                className="bg-gray-700 border-gray-600"
              />
            </div>
          </div>

          <div>
            <Button variant="outline" onClick={startLocationSelection} className="w-full bg-gray-700 hover:bg-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              Select Location on Map
            </Button>
          </div>

          <div>
            <Label htmlFor="station-description">Description</Label>
            <Textarea
              id="station-description"
              value={stationDescription}
              onChange={(e) => setStationDescription(e.target.value)}
              placeholder="Description of the seismic station"
              className="bg-gray-700 border-gray-600 min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600">
              Cancel
            </Button>

            <Button onClick={saveStation} className="bg-green-600 hover:bg-green-700 flex-1">
              <Save className="h-4 w-4 mr-2" />
              {selectedStationId ? "Update Station" : "Add Station"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Existing Seismic Stations</h2>

        {stations.length === 0 ? (
          <p className="text-gray-400">No seismic stations added yet.</p>
        ) : (
          <div className="space-y-3">
            {stations.map((station) => (
              <div key={station.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{station.name}</h3>
                  <p className="text-sm text-gray-400">
                    {station.stationCode} - {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedStationId(station.id)}
                    className="bg-gray-600 hover:bg-gray-500"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteStation(station.id)}
                    className="bg-red-900/50 hover:bg-red-900 text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
