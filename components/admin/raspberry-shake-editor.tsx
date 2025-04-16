"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Trash2, Save, Edit, ExternalLink, MapPin } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface RaspberryShake {
  id: string
  name: string
  stationCode: string
  url: string
  description?: string
  dateAdded: string
  coordinates?: [number, number] // Add coordinates field
}

export default function RaspberryShakeEditor() {
  const [raspberryShakes, setRaspberryShakes] = useLocalStorage<RaspberryShake[]>("earthquakeRaspberryShakes", [])
  const [selectedShakeId, setSelectedShakeId] = useState<string | null>(null)

  // Form state
  const [shakeName, setShakeName] = useState("")
  const [shakeStationCode, setShakeStationCode] = useState("")
  const [shakeUrl, setShakeUrl] = useState("")
  const [shakeDescription, setShakeDescription] = useState("")
  // Add state for coordinates
  const [shakeLatitude, setShakeLatitude] = useState("")
  const [shakeLongitude, setShakeLongitude] = useState("")

  // Load shake data if editing
  useEffect(() => {
    if (selectedShakeId) {
      const shake = raspberryShakes.find((s) => s.id === selectedShakeId)
      if (shake) {
        setShakeName(shake.name)
        setShakeStationCode(shake.stationCode)
        setShakeUrl(shake.url)
        setShakeDescription(shake.description || "")
        // Set coordinates if they exist
        if (shake.coordinates) {
          setShakeLatitude(shake.coordinates[0].toString())
          setShakeLongitude(shake.coordinates[1].toString())
        } else {
          setShakeLatitude("")
          setShakeLongitude("")
        }
      }
    }
  }, [selectedShakeId, raspberryShakes])

  // Save shake
  const saveShake = () => {
    if (!shakeName || !shakeStationCode || !shakeUrl) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    // Validate URL
    try {
      new URL(shakeUrl)
    } catch (e) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive",
      })
      return
    }

    // Create the shake data object
    const shakeData: RaspberryShake = {
      id: selectedShakeId || `shake-${Date.now()}`,
      name: shakeName,
      stationCode: shakeStationCode,
      url: shakeUrl,
      description: shakeDescription,
      dateAdded: selectedShakeId
        ? raspberryShakes.find((s) => s.id === selectedShakeId)?.dateAdded || new Date().toISOString()
        : new Date().toISOString(),
    }

    // Add coordinates if both latitude and longitude are provided
    if (shakeLatitude && shakeLongitude) {
      const lat = Number.parseFloat(shakeLatitude)
      const lng = Number.parseFloat(shakeLongitude)
      if (!isNaN(lat) && !isNaN(lng)) {
        shakeData.coordinates = [lat, lng]
      }
    }

    if (selectedShakeId) {
      // Update existing shake
      setRaspberryShakes(raspberryShakes.map((s) => (s.id === selectedShakeId ? shakeData : s)))
    } else {
      // Add new shake
      setRaspberryShakes([...raspberryShakes, shakeData])
    }

    // Reset state
    setSelectedShakeId(null)
    setShakeName("")
    setShakeStationCode("")
    setShakeUrl("")
    setShakeDescription("")
    setShakeLatitude("")
    setShakeLongitude("")

    toast({
      title: "Success",
      description: `Raspberry Shake ${selectedShakeId ? "updated" : "added"} successfully!`,
    })
  }

  // Delete shake
  const deleteShake = (id: string) => {
    setRaspberryShakes(raspberryShakes.filter((s) => s.id !== id))

    if (selectedShakeId === id) {
      setSelectedShakeId(null)
      setShakeName("")
      setShakeStationCode("")
      setShakeUrl("")
      setShakeDescription("")
      setShakeLatitude("")
      setShakeLongitude("")
    }

    toast({
      title: "Success",
      description: "Raspberry Shake deleted successfully!",
    })
  }

  // Reset form
  const resetForm = () => {
    setSelectedShakeId(null)
    setShakeName("")
    setShakeStationCode("")
    setShakeUrl("")
    setShakeDescription("")
    setShakeLatitude("")
    setShakeLongitude("")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">
          {selectedShakeId ? "Edit Raspberry Shake" : "Add New Raspberry Shake"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="shake-name">Station Name</Label>
            <Input
              id="shake-name"
              value={shakeName}
              onChange={(e) => setShakeName(e.target.value)}
              placeholder="e.g., Reykjanes Peninsula"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="shake-station-code">Station Code</Label>
            <Input
              id="shake-station-code"
              value={shakeStationCode}
              onChange={(e) => setShakeStationCode(e.target.value)}
              placeholder="e.g., RBDCF"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">The station code used by Raspberry Shake</p>
          </div>

          {/* Add GPS coordinates fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="shake-latitude">Latitude</Label>
              <Input
                id="shake-latitude"
                value={shakeLatitude}
                onChange={(e) => setShakeLatitude(e.target.value)}
                placeholder="e.g., 64.1234"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="shake-longitude">Longitude</Label>
              <Input
                id="shake-longitude"
                onChange={(e) => setShakeLongitude(e.target.value)}
                value={shakeLongitude}
                placeholder="e.g., -21.1234"
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shake-url">Data URL</Label>
            <Input
              id="shake-url"
              value={shakeUrl}
              onChange={(e) => setShakeUrl(e.target.value)}
              placeholder="e.g., https://dataview.raspberryshake.org/#/AM/RBDCF/00/EHZ"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">URL to the station's data page</p>
          </div>

          <div>
            <Label htmlFor="shake-description">Description (Optional)</Label>
            <Textarea
              id="shake-description"
              value={shakeDescription}
              onChange={(e) => setShakeDescription(e.target.value)}
              placeholder="Description of the Raspberry Shake station"
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={resetForm} className="bg-gray-700 hover:bg-gray-600">
              Cancel
            </Button>

            <Button
              onClick={saveShake}
              disabled={!shakeName || !shakeStationCode || !shakeUrl}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {selectedShakeId ? "Update Raspberry Shake" : "Save Raspberry Shake"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Existing Raspberry Shakes</h2>

        {raspberryShakes.length === 0 ? (
          <p className="text-gray-400">No Raspberry Shake stations added yet.</p>
        ) : (
          <div className="space-y-3">
            {raspberryShakes.map((shake) => (
              <div key={shake.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{shake.name}</span>
                    <span className="text-xs bg-purple-800 text-purple-200 px-2 py-0.5 rounded">
                      {shake.stationCode}
                    </span>
                  </div>
                  <a
                    href={shake.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View Data <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                  {shake.coordinates && (
                    <div className="text-xs text-gray-400 mt-1 flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {shake.coordinates[0].toFixed(4)}, {shake.coordinates[1].toFixed(4)}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedShakeId(shake.id)}
                    className="bg-gray-600 hover:bg-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteShake(shake.id)}
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
