"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Trash2, Save, MapPin, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface Berm {
  id: string
  name: string
  color: string // Always brown
  coordinates: [number, number][][]
  constructionDate: string
  completionDate?: string
  description?: string
}

interface BermsEditorProps {
  map: any
  L: any
}

export default function BermsEditor({ map, L }: BermsEditorProps) {
  const [berms, setBerms] = useLocalStorage<Berm[]>("earthquakeBerms", [])
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedBermId, setSelectedBermId] = useState<string | null>(null)

  // Form state
  const [bermName, setBermName] = useState("")
  const [bermConstructionDate, setBermConstructionDate] = useState(new Date().toISOString().split("T")[0])
  const [bermCompletionDate, setBermCompletionDate] = useState("")
  const [bermDescription, setBermDescription] = useState("")
  // Berms are always brown
  const bermColor = "#8B4513"

  // References for Leaflet drawing
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const drawnLinesRef = useRef<any[]>([])

  // Load berm data if editing
  useEffect(() => {
    if (selectedBermId) {
      const berm = berms.find((b) => b.id === selectedBermId)
      if (berm) {
        setBermName(berm.name)
        setBermConstructionDate(berm.constructionDate)
        setBermCompletionDate(berm.completionDate || "")
        setBermDescription(berm.description || "")
      }
    }
  }, [selectedBermId, berms])

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
              color: bermColor,
              weight: 5,
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
  }, [map, L])

  // Start drawing a new berm
  const startDrawing = () => {
    // Clear existing drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnLinesRef.current = []
    }

    // Reset form for new berm
    setSelectedBermId(null)
    setBermName("")
    setBermConstructionDate(new Date().toISOString().split("T")[0])
    setBermCompletionDate("")
    setBermDescription("")

    // Show drawing instructions
    toast({
      title: "Drawing Mode Active",
      description: "Use the drawing tools to draw a berm line on the map",
    })
  }

  // Save berm
  const saveBerm = () => {
    if (!bermName) {
      toast({
        title: "Error",
        description: "Please enter a name for the berm",
        variant: "destructive",
      })
      return
    }

    if (drawnLinesRef.current.length === 0 && !selectedBermId) {
      toast({
        title: "Error",
        description: "Please draw a berm line on the map",
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

    const bermData: Berm = {
      id: selectedBermId || `berm-${Date.now()}`,
      name: bermName,
      color: bermColor,
      coordinates:
        selectedBermId && coordinates.length === 0
          ? berms.find((b) => b.id === selectedBermId)?.coordinates || []
          : coordinates,
      constructionDate: bermConstructionDate,
      description: bermDescription,
    }

    if (bermCompletionDate) {
      bermData.completionDate = bermCompletionDate
    }

    if (selectedBermId) {
      // Update existing berm
      setBerms(berms.map((b) => (b.id === selectedBermId ? bermData : b)))
    } else {
      // Add new berm
      setBerms([...berms, bermData])
    }

    // Reset state
    setIsDrawing(false)
    setSelectedBermId(null)
    setBermName("")
    setBermConstructionDate(new Date().toISOString().split("T")[0])
    setBermCompletionDate("")
    setBermDescription("")

    // Clear drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnLinesRef.current = []
    }

    toast({
      title: "Success",
      description: `Berm ${selectedBermId ? "updated" : "added"} successfully!`,
    })
  }

  // Delete berm
  const deleteBerm = (id: string) => {
    setBerms(berms.filter((b) => b.id !== id))

    if (selectedBermId === id) {
      setSelectedBermId(null)
      setBermName("")
      setBermConstructionDate(new Date().toISOString().split("T")[0])
      setBermCompletionDate("")
      setBermDescription("")
    }

    toast({
      title: "Success",
      description: "Berm deleted successfully!",
    })
  }

  // Edit berm
  const editBerm = (id: string) => {
    setSelectedBermId(id)

    // Clear drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnLinesRef.current = []
    }

    // Draw the berm on the map
    const berm = berms.find((b) => b.id === id)
    if (berm && map && L) {
      berm.coordinates.forEach((coords) => {
        const polyline = L.polyline(coords, {
          color: berm.color,
          weight: 5,
        })
        drawnItemsRef.current.addLayer(polyline)
        drawnLinesRef.current.push(polyline)
      })

      // Zoom to the berm
      const bounds = drawnItemsRef.current.getBounds()
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">{selectedBermId ? "Edit Berm" : "Add New Berm"}</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="berm-name">Berm Name</Label>
            <Input
              id="berm-name"
              value={bermName}
              onChange={(e) => setBermName(e.target.value)}
              placeholder="e.g., Northern Barrier"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded" style={{ backgroundColor: bermColor }}></div>
              <span className="text-sm">Berms are always drawn in brown</span>
            </div>
          </div>

          <div>
            <Label htmlFor="berm-description">Description (Optional)</Label>
            <Textarea
              id="berm-description"
              value={bermDescription}
              onChange={(e) => setBermDescription(e.target.value)}
              placeholder="e.g., Defensive barrier to protect infrastructure"
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="berm-construction-date">Construction Date</Label>
              <Input
                id="berm-construction-date"
                type="date"
                value={bermConstructionDate}
                onChange={(e) => setBermConstructionDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="berm-completion-date">Completion Date (Optional)</Label>
              <Input
                id="berm-completion-date"
                type="date"
                value={bermCompletionDate}
                onChange={(e) => setBermCompletionDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={startDrawing} className="bg-gray-700 hover:bg-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {selectedBermId ? "Redraw Berm" : "Draw New Berm"}
            </Button>

            <Button onClick={saveBerm} disabled={!bermName} className="bg-green-600 hover:bg-green-700 flex-1">
              <Save className="h-4 w-4 mr-2" />
              {selectedBermId ? "Update Berm" : "Save Berm"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Existing Berms</h2>

        {berms.length === 0 ? (
          <p className="text-gray-400">No berms added yet.</p>
        ) : (
          <div className="space-y-3">
            {berms.map((berm) => (
              <div key={berm.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: berm.color }}></div>
                  <div>
                    <span className="font-medium text-white">{berm.name}</span>
                    <p className="text-xs text-gray-400">
                      {new Date(berm.constructionDate).toLocaleDateString()}
                      {berm.completionDate ? ` - ${new Date(berm.completionDate).toLocaleDateString()}` : " - ongoing"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editBerm(berm.id)}
                    className="bg-gray-600 hover:bg-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteBerm(berm.id)}
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
