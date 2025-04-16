"use client"

import { useRef } from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Save, MapPin, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { useGlobalData } from "@/hooks/use-global-data"

interface FissureLine {
  id: string
  name: string
  color: string
  coordinates: [number, number][][]
  startDate: string
  endDate?: string
  eruption: string
}

interface FissureLinesEditorProps {
  map: any
  L: any
}

export default function FissureLinesEditor({ map, L }: FissureLinesEditorProps) {
  const {
    data: fissures,
    setData: setFissures,
    isLoading,
  } = useGlobalData<FissureLine[]>("fissures", "earthquakeCustomFissures", [])

  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedFissureId, setSelectedFissureId] = useState<string | null>(null)

  // Form state
  const [fissureName, setFissureName] = useState("")
  const [fissureColor, setFissureColor] = useState("#FF0000")
  const [fissureStartDate, setFissureStartDate] = useState(new Date().toISOString().split("T")[0])
  const [fissureEndDate, setFissureEndDate] = useState("")
  const [fissureEruption, setFissureEruption] = useState("Sundhnúkur 2023-2024")

  // References for Leaflet drawing
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const drawnLinesRef = useRef<any[]>([])

  // Load fissure data if editing
  useEffect(() => {
    if (selectedFissureId) {
      const fissure = fissures.find((f) => f.id === selectedFissureId)
      if (fissure) {
        setFissureName(fissure.name)
        setFissureColor(fissure.color)
        setFissureStartDate(fissure.startDate)
        setFissureEndDate(fissure.endDate || "")
        setFissureEruption(fissure.eruption)
      }
    }
  }, [selectedFissureId, fissures])

  // Initialize drawing tools
  useEffect(() => {
    if (!map || !L) return

    // Create a feature group for drawn items
    drawnItemsRef.current = new L.FeatureGroup()
    map.addLayer(drawnItemsRef.current)

    // Initialize draw control
    if (window.L && window.L.Control && window.L.Control.Draw) {
      drawControlRef.current = new window.L.Control.Draw({
        draw: {
          polyline: {
            shapeOptions: {
              color: fissureColor,
              weight: 8,
            },
          },
          polygon: false,
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
        },
      })

      map.addControl(drawControlRef.current)

      // Handle created items
      map.on(window.L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer
        drawnItemsRef.current.addLayer(layer)

        if (e.layerType === "polyline") {
          drawnLinesRef.current.push(layer)
          setIsDrawing(true)
        }
      })
    }

    return () => {
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }
      if (drawnItemsRef.current) {
        map.removeLayer(drawnItemsRef.current)
      }
    }
  }, [map, L, fissureColor])

  // Start drawing a new fissure
  const startDrawing = () => {
    // Clear existing drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnLinesRef.current = []
    }

    // Reset form for new fissure
    setSelectedFissureId(null)
    setFissureName("")
    setFissureColor("#FF0000")
    setFissureStartDate(new Date().toISOString().split("T")[0])
    setFissureEndDate("")
    setFissureEruption("Sundhnúkur 2023-2024")

    // Show drawing instructions
    toast({
      title: "Drawing Mode Active",
      description: "Use the drawing tools to draw a fissure line on the map",
    })
  }

  // Save fissure
  const saveFissure = async () => {
    if (!fissureName) {
      toast({
        title: "Error",
        description: "Please enter a name for the fissure",
        variant: "destructive",
      })
      return
    }

    if (drawnLinesRef.current.length === 0 && !selectedFissureId) {
      toast({
        title: "Error",
        description: "Please draw a fissure line on the map",
        variant: "destructive",
      })
      return
    }

    // Extract coordinates from drawn lines
    const coordinates: [number, number][][] = []

    if (drawnLinesRef.current.length > 0) {
      drawnLinesRef.current.forEach((line) => {
        const latLngs = line.getLatLngs()
        const coords = latLngs.map((latLng: any) => [latLng.lat, latLng.lng] as [number, number])
        coordinates.push(coords)
      })
    }

    const fissureData: FissureLine = {
      id: selectedFissureId || `fissure-${Date.now()}`,
      name: fissureName,
      color: fissureColor,
      coordinates:
        selectedFissureId && coordinates.length === 0
          ? fissures.find((f) => f.id === selectedFissureId)?.coordinates || []
          : coordinates,
      startDate: fissureStartDate,
      eruption: fissureEruption,
    }

    if (fissureEndDate) {
      fissureData.endDate = fissureEndDate
    }

    let updatedFissures: FissureLine[]

    if (selectedFissureId) {
      // Update existing fissure
      updatedFissures = fissures.map((f) => (f.id === selectedFissureId ? fissureData : f))
    } else {
      // Add new fissure
      updatedFissures = [...fissures, fissureData]
    }

    // Save to server
    const success = await setFissures(updatedFissures)

    if (success) {
      // Reset state
      setIsDrawing(false)
      setSelectedFissureId(null)
      setFissureName("")
      setFissureColor("#FF0000")
      setFissureStartDate(new Date().toISOString().split("T")[0])
      setFissureEndDate("")
      setFissureEruption("Sundhnúkur 2023-2024")

      // Clear drawn items
      if (drawnItemsRef.current) {
        drawnItemsRef.current.clearLayers()
        drawnLinesRef.current = []
      }

      toast({
        title: "Success",
        description: `Fissure ${selectedFissureId ? "updated" : "added"} successfully! Changes are now visible to all users.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to save fissure. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete fissure
  const deleteFissure = async (id: string) => {
    const updatedFissures = fissures.filter((f) => f.id !== id)
    const success = await setFissures(updatedFissures)

    if (success) {
      if (selectedFissureId === id) {
        setSelectedFissureId(null)
        setFissureName("")
        setFissureColor("#FF0000")
        setFissureStartDate(new Date().toISOString().split("T")[0])
        setFissureEndDate("")
        setFissureEruption("Sundhnúkur 2023-2024")
      }

      toast({
        title: "Success",
        description: "Fissure deleted successfully! Changes are now visible to all users.",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete fissure. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Edit fissure
  const editFissure = (id: string) => {
    setSelectedFissureId(id)

    // Clear drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnLinesRef.current = []
    }

    // Draw the fissure on the map
    const fissure = fissures.find((f) => f.id === id)
    if (fissure && map && L) {
      fissure.coordinates.forEach((coords) => {
        const polyline = L.polyline(coords, {
          color: fissure.color,
          weight: 8,
        })
        drawnItemsRef.current.addLayer(polyline)
        drawnLinesRef.current.push(polyline)
      })

      // Zoom to the fissure
      const bounds = drawnItemsRef.current.getBounds()
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading fissure data...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">{selectedFissureId ? "Edit Fissure" : "Add New Fissure"}</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="fissure-name">Fissure Name</Label>
            <Input
              id="fissure-name"
              value={fissureName}
              onChange={(e) => setFissureName(e.target.value)}
              placeholder="e.g., December 2023 Fissure"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="fissure-color">Fissure Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                id="fissure-color"
                value={fissureColor}
                onChange={(e) => setFissureColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="flex-1 h-8 rounded" style={{ backgroundColor: fissureColor }}></div>
            </div>
          </div>

          <div>
            <Label htmlFor="eruption-name">Eruption Group</Label>
            <Input
              id="eruption-name"
              value={fissureEruption}
              onChange={(e) => setFissureEruption(e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
              placeholder="e.g., Sundhnúkur 2023-2024"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="start-date">Start Date</Label>
              <Input
                id="start-date"
                type="date"
                value={fissureStartDate}
                onChange={(e) => setFissureStartDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="end-date">End Date (Optional)</Label>
              <Input
                id="end-date"
                type="date"
                value={fissureEndDate}
                onChange={(e) => setFissureEndDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={startDrawing} className="bg-gray-700 hover:bg-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {selectedFissureId ? "Redraw Fissure" : "Draw New Fissure"}
            </Button>

            <Button onClick={saveFissure} disabled={!fissureName} className="bg-green-600 hover:bg-green-700 flex-1">
              <Save className="h-4 w-4 mr-2" />
              {selectedFissureId ? "Update Fissure" : "Save Fissure"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Existing Fissures</h2>

        {fissures.length === 0 ? (
          <p className="text-gray-400">No fissures added yet.</p>
        ) : (
          <div className="space-y-3">
            {fissures.map((fissure) => (
              <div key={fissure.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: fissure.color }}></div>
                  <div>
                    <span className="font-medium text-white">{fissure.name}</span>
                    <p className="text-xs text-gray-400">
                      {fissure.eruption} • {new Date(fissure.startDate).toLocaleDateString()}
                      {fissure.endDate ? ` - ${new Date(fissure.endDate).toLocaleDateString()}` : " - ongoing"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editFissure(fissure.id)}
                    className="bg-gray-600 hover:bg-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteFissure(fissure.id)}
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
