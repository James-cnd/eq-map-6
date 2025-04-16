"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { SeismicStation } from "@/types/stations"

interface SeismicStationsEditorProps {
  map: any
  L: any
}

export default function SeismicStationsEditor({ map, L }: SeismicStationsEditorProps) {
  const [stations, setStations] = useLocalStorage<SeismicStation[]>("seismicStations", [])
  const [placingMode, setPlacingMode] = useState(false)
  const [currentStation, setCurrentStation] = useState<SeismicStation | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [position, setPosition] = useState<[number, number] | null>(null)

  // Marker state
  const [marker, setMarker] = useState<any>(null)

  useEffect(() => {
    if (!map) return

    // Cleanup
    return () => {
      if (map && marker) {
        map.removeLayer(marker)
      }
    }
  }, [map, marker])

  const startPlacing = () => {
    if (!map) return

    setPlacingMode(true)
    setPosition(null)
    if (marker) {
      map.removeLayer(marker)
      setMarker(null)
    }

    // Add click handler to map
    map.on("click", handleMapClick)
  }

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng
    setPosition([lat, lng])

    // Remove existing marker if any
    if (marker) {
      map.removeLayer(marker)
    }

    // Create new marker
    const newMarker = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "seismic-station-marker",
        html: '<div class="w-4 h-4 bg-yellow-500 rounded-full border-2 border-white"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      }),
    }).addTo(map)
    setMarker(newMarker)

    // Remove click handler
    map.off("click", handleMapClick)
    setPlacingMode(false)
  }

  const saveStation = () => {
    if (!position || !name) return

    const newStation: SeismicStation = {
      id: Date.now().toString(),
      name,
      description,
      position,
      data: [],
    }

    setStations([...stations, newStation])
    resetForm()
  }

  const resetForm = () => {
    setCurrentStation(null)
    setName("")
    setDescription("")
    setPosition(null)
    if (marker) {
      map.removeLayer(marker)
      setMarker(null)
    }
    setPlacingMode(false)
    if (map) {
      map.off("click", handleMapClick)
    }
  }

  const deleteStation = (id: string) => {
    setStations(stations.filter((station) => station.id !== id))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Seismic Stations Editor</h2>

      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <div>
          <Label htmlFor="name">Station Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter station name"
            className="bg-gray-700"
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter station description"
            className="bg-gray-700"
          />
        </div>

        <div>
          <Label>Position</Label>
          {position ? (
            <div className="p-2 bg-gray-700 rounded text-sm">
              Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
            </div>
          ) : (
            <p className="text-sm text-gray-400">Click "Place on Map" to set the position</p>
          )}
        </div>

        <div className="flex space-x-2">
          {!placingMode ? (
            <Button onClick={startPlacing} variant="outline">
              Place on Map
            </Button>
          ) : (
            <Button
              onClick={() => {
                setPlacingMode(false)
                map.off("click", handleMapClick)
              }}
              variant="destructive"
            >
              Cancel Placement
            </Button>
          )}

          {position && (
            <Button onClick={saveStation} variant="default">
              Save Station
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Saved Seismic Stations</h3>
        {stations.length === 0 ? (
          <p className="text-gray-400">No seismic stations added yet.</p>
        ) : (
          <div className="space-y-2">
            {stations.map((station) => (
              <div key={station.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div>
                  <span className="font-medium">{station.name}</span>
                  {station.description && <span className="ml-2 text-sm text-gray-400">{station.description}</span>}
                </div>
                <Button onClick={() => deleteStation(station.id)} variant="destructive" size="sm">
                  Delete
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
