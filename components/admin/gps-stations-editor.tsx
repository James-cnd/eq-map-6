"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Trash2, Save, MapPin, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { EXTENDED_GPS_STATIONS } from "@/data/gps-stations-extended"

interface GpsStationsEditorProps {
  map: any
  L: any
}

export default function GpsStationsEditor({ map, L }: GpsStationsEditorProps) {
  const [customStations, setCustomStations] = useLocalStorage<any[]>("earthquakeCustomGpsStations", [])
  const [gpsStationLinks, setGpsStationLinks] = useLocalStorage<Record<string, string>>("earthquakeGpsStationLinks", {})
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [selectedExistingStation, setSelectedExistingStation] = useState("")

  // Form state
  const [stationName, setStationName] = useState("")
  const [stationLatitude, setStationLatitude] = useState("")
  const [stationLongitude, setStationLongitude] = useState("")
  const [stationDescription, setStationDescription] = useState("")
  const [stationUrl, setStationUrl] = useState("")

  // Reference for the location marker
  const locationMarkerRef = React.useRef<any>(null)

  // Load station data if editing
  useEffect(() => {
    if (selectedStationId) {
      const station = customStations.find((s) => s.id === selectedStationId)
      if (station) {
        setStationName(station.name)
        setStationLatitude(station.coordinates[0].toString())
        setStationLongitude(station.coordinates[1].toString())
        setStationDescription(station.description || "")
        setStationUrl(station.url || "")
      }
    }
  }, [selectedStationId, customStations])

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
              background-color: #1E90FF; 
              width: 16px; 
              height: 16px; 
              transform: rotate(45deg);
              border: 2px solid white;
              box-shadow: 0 0 10px rgba(0,0,0,0.7);
              animation: pulse 1.5s infinite;
            "></div>
            <style>
              @keyframes pulse {
                0% { transform: scale(1) rotate(45deg); opacity: 1; }
                50% { transform: scale(1.3) rotate(45deg); opacity: 0.7; }
                100% { transform: scale(1) rotate(45deg); opacity: 1; }
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
      description: "Click on the map to select the GPS station location",
    })
  }

  // Save station
  const saveStation = () => {
    if (!stationName || !stationLatitude || !stationLongitude || !stationUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    const newStation = {
      id: selectedStationId || `gps-${Date.now()}`,
      name: stationName,
      coordinates: [Number(stationLatitude), Number(stationLongitude)],
      description: stationDescription,
      url: stationUrl,
      dateAdded: selectedStationId
        ? customStations.find((s) => s.id === selectedStationId)?.dateAdded || new Date().toISOString()
        : new Date().toISOString(),
    }

    if (selectedStationId) {
      // Update existing station
      setCustomStations(customStations.map((s) => (s.id === selectedStationId ? newStation : s)))
    } else {
      // Add new station
      setCustomStations([...customStations, newStation])
    }

    toast({
      title: "Success",
      description: `GPS station ${selectedStationId ? "updated" : "added"} successfully!`,
    })

    // Reset form
    resetForm()
  }

  // Delete station
  const deleteStation = (id: string) => {
    setCustomStations(customStations.filter((s) => s.id !== id))

    if (selectedStationId === id) {
      resetForm()
    }

    toast({
      title: "Success",
      description: "GPS station deleted successfully!",
    })
  }

  // Reset form
  const resetForm = () => {
    setSelectedStationId(null)
    setStationName("")
    setStationLatitude("")
    setStationLongitude("")
    setStationDescription("")
    setStationUrl("")

    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current)
      locationMarkerRef.current = null
    }
  }

  // Handle existing station selection
  const handleExistingStationSelect = (stationId: string) => {
    setSelectedExistingStation(stationId)

    // Find the station in the extended list
    const station = EXTENDED_GPS_STATIONS.find((s) => s.id === stationId)
    if (station) {
      // Pre-fill the URL if we have it in our links
      setStationUrl(gpsStationLinks[stationId] || "")
    }
  }

  // Save link for existing station
  const saveExistingStationLink = () => {
    if (!selectedExistingStation || !stationUrl) {
      toast({
        title: "Error",
        description: "Please select a station and enter a URL",
        variant: "destructive",
      })
      return
    }

    // Update the links
    const updatedLinks = {
      ...gpsStationLinks,
      [selectedExistingStation]: stationUrl,
    }

    setGpsStationLinks(updatedLinks)

    toast({
      title: "Success",
      description: "GPS station link updated successfully!",
    })

    // Reset form
    setSelectedExistingStation("")
    setStationUrl("")

    // Dispatch event to notify components to update
    const event = new CustomEvent("gpsStationLinksChanged", {
      detail: updatedLinks,
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Edit Existing GPS Station Links</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="existing-station">Select GPS Station</Label>
            <Select value={selectedExistingStation} onValueChange={handleExistingStationSelect}>
              <SelectTrigger className="bg-gray-700 border-gray-600">
                <SelectValue placeholder="Select a GPS station" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-white">
                {EXTENDED_GPS_STATIONS.map((station) => (
                  <SelectItem key={station.id} value={station.id} className="text-white hover:bg-gray-700">
                    {station.id} - {station.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="station-url">Data URL</Label>
            <Input
              id="station-url"
              value={stationUrl}
              onChange={(e) => setStationUrl(e.target.value)}
              placeholder="e.g., https://strokkur.raunvis.hi.is/gpsweb/index.php?id=REYK"
              className="bg-gray-700 border-gray-600"
              disabled={!selectedExistingStation}
            />
            <p className="text-xs text-gray-400 mt-1">URL to the station's data page or visualization</p>
          </div>

          <Button
            onClick={saveExistingStationLink}
            disabled={!selectedExistingStation || !stationUrl}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Save GPS Station Link
          </Button>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">
          {selectedStationId ? "Edit Custom GPS Station" : "Add New GPS Station"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="station-name">Station Name</Label>
            <Input
              id="station-name"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              placeholder="e.g., Reykjavík Station"
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="station-url">Data URL</Label>
            <Input
              id="station-url"
              value={stationUrl}
              onChange={(e) => setStationUrl(e.target.value)}
              placeholder="e.g., https://strokkur.raunvis.hi.is/gpsweb/index.php?id=REYK"
              className="bg-gray-700 border-gray-600"
            />
          </div>

          <div>
            <Label htmlFor="station-description">Description</Label>
            <Textarea
              id="station-description"
              value={stationDescription}
              onChange={(e) => setStationDescription(e.target.value)}
              placeholder="Description of the GPS station"
              className="bg-gray-700 border-gray-600 min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600">
              Cancel
            </Button>

            <Button onClick={saveStation} className="bg-blue-600 hover:bg-blue-700 flex-1">
              <Save className="h-4 w-4 mr-2" />
              {selectedStationId ? "Update Station" : "Add Station"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Custom GPS Stations</h2>

        {customStations.length === 0 ? (
          <p className="text-gray-400">No custom GPS stations added yet.</p>
        ) : (
          <div className="space-y-3">
            {customStations.map((station) => (
              <div key={station.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{station.name}</h3>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">
                      {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                    </span>
                    {station.url && (
                      <a
                        href={station.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    )}
                  </div>
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

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Existing GPS Station Links</h2>

        {Object.keys(gpsStationLinks).length === 0 ? (
          <p className="text-gray-400">No custom links added yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(gpsStationLinks).map(([stationId, url]) => {
              const station = EXTENDED_GPS_STATIONS.find((s) => s.id === stationId)
              return (
                <div key={stationId} className="bg-gray-700 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-white">
                        {station ? `${station.name} (${stationId})` : stationId}
                      </h4>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                      >
                        {url}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </a>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedExistingStation(stationId)
                        setStationUrl(url)
                        // Scroll to the top of the tab
                        document.querySelector(".bg-white\\/10")?.scrollIntoView({ behavior: "smooth" })
                      }}
                      className="bg-gray-600 hover:bg-gray-500"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
