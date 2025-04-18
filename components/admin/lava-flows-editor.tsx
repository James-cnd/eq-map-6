"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Trash2, Save, MapPin, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface LavaFlow {
  id: string
  name: string
  color: string
  coordinates: [number, number][][]
  startDate: string
  endDate?: string
  opacity: number
  description?: string
}

interface LavaFlowsEditorProps {
  map: any
  L: any
}

export default function LavaFlowsEditor({ map, L }: LavaFlowsEditorProps) {
  const [lavaFlows, setLavaFlows] = useLocalStorage<LavaFlow[]>("earthquakeLavaFlows", [])
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedFlowId, setSelectedFlowId] = useState<string | null>(null)

  // Form state
  const [flowName, setFlowName] = useState("")
  const [flowColor, setFlowColor] = useState("#FF6600")
  const [flowOpacity, setFlowOpacity] = useState(0.4)
  const [flowStartDate, setFlowStartDate] = useState(new Date().toISOString().split("T")[0])
  const [flowEndDate, setFlowEndDate] = useState("")
  const [flowDescription, setFlowDescription] = useState("")

  // References for Leaflet drawing
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const drawnPolygonsRef = useRef<any[]>([])

  // Load lava flow data if editing
  useEffect(() => {
    if (selectedFlowId) {
      const flow = lavaFlows.find((f) => f.id === selectedFlowId)
      if (flow) {
        setFlowName(flow.name)
        setFlowColor(flow.color)
        setFlowOpacity(flow.opacity)
        setFlowStartDate(flow.startDate)
        setFlowEndDate(flow.endDate || "")
        setFlowDescription(flow.description || "")
      }
    }
  }, [selectedFlowId, lavaFlows])

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
          polyline: false,
          polygon: {
            shapeOptions: {
              color: flowColor,
              fillColor: flowColor,
              fillOpacity: flowOpacity,
              weight: 2,
            },
            allowIntersection: false,
          },
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

        if (e.layerType === "polygon") {
          drawnPolygonsRef.current.push(layer)
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
  }, [map, L, flowColor, flowOpacity])

  // Start drawing a new lava flow
  const startDrawing = () => {
    // Clear existing drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnPolygonsRef.current = []
    }

    // Reset form for new flow
    setSelectedFlowId(null)
    setFlowName("")
    setFlowColor("#FF6600")
    setFlowOpacity(0.4)
    setFlowStartDate(new Date().toISOString().split("T")[0])
    setFlowEndDate("")
    setFlowDescription("")

    // Show drawing instructions
    toast({
      title: "Drawing Mode Active",
      description: "Use the drawing tools to draw a lava flow area on the map",
    })
  }

  // Save lava flow
  const saveLavaFlow = () => {
    if (!flowName) {
      toast({
        title: "Error",
        description: "Please enter a name for the lava flow",
        variant: "destructive",
      })
      return
    }

    if (drawnPolygonsRef.current.length === 0 && !selectedFlowId) {
      toast({
        title: "Error",
        description: "Please draw a lava flow area on the map",
        variant: "destructive",
      })
      return
    }

    // Extract coordinates from drawn polygons
    const coordinates: [number, number][][] = []

    if (drawnPolygonsRef.current.length > 0) {
      drawnPolygonsRef.current.forEach((polygon) => {
        const latLngs = polygon.getLatLngs()[0] // Get the first ring of coordinates
        const coords = latLngs.map((latLng: any) => [latLng.lat, latLng.lng] as [number, number])
        coordinates.push(coords)
      })
    }

    const flowData: LavaFlow = {
      id: selectedFlowId || `lava-${Date.now()}`,
      name: flowName,
      color: flowColor,
      opacity: flowOpacity,
      coordinates:
        selectedFlowId && coordinates.length === 0
          ? lavaFlows.find((f) => f.id === selectedFlowId)?.coordinates || []
          : coordinates,
      startDate: flowStartDate,
      description: flowDescription,
    }

    if (flowEndDate) {
      flowData.endDate = flowEndDate
    }

    if (selectedFlowId) {
      // Update existing flow
      setLavaFlows(lavaFlows.map((f) => (f.id === selectedFlowId ? flowData : f)))
    } else {
      // Add new flow
      setLavaFlows([...lavaFlows, flowData])
    }

    // Reset state
    setIsDrawing(false)
    setSelectedFlowId(null)
    setFlowName("")
    setFlowColor("#FF6600")
    setFlowOpacity(0.4)
    setFlowStartDate(new Date().toISOString().split("T")[0])
    setFlowEndDate("")
    setFlowDescription("")

    // Clear drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnPolygonsRef.current = []
    }

    toast({
      title: "Success",
      description: `Lava flow ${selectedFlowId ? "updated" : "added"} successfully!`,
    })
  }

  // Delete lava flow
  const deleteLavaFlow = (id: string) => {
    setLavaFlows(lavaFlows.filter((f) => f.id !== id))

    if (selectedFlowId === id) {
      setSelectedFlowId(null)
      setFlowName("")
      setFlowColor("#FF6600")
      setFlowOpacity(0.4)
      setFlowStartDate(new Date().toISOString().split("T")[0])
      setFlowEndDate("")
      setFlowDescription("")
    }

    toast({
      title: "Success",
      description: "Lava flow deleted successfully!",
    })
  }

  // Edit lava flow
  const editLavaFlow = (id: string) => {
    setSelectedFlowId(id)

    // Clear drawn items
    if (drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers()
      drawnPolygonsRef.current = []
    }

    // Draw the lava flow on the map
    const flow = lavaFlows.find((f) => f.id === id)
    if (flow && map && L) {
      flow.coordinates.forEach((coords) => {
        const polygon = L.polygon(coords, {
          color: flow.color,
          fillColor: flow.color,
          fillOpacity: flow.opacity,
          weight: 2,
        })
        drawnItemsRef.current.addLayer(polygon)
        drawnPolygonsRef.current.push(polygon)
      })

      // Zoom to the lava flow
      const bounds = drawnItemsRef.current.getBounds()
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">{selectedFlowId ? "Edit Lava Flow" : "Add New Lava Flow"}</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="flow-name">Lava Flow Name</Label>
            <Input
              id="flow-name"
              value={flowName}
              onChange={(e) => setFlowName(e.target.value)}
              placeholder="e.g., January 2024 Flow"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="flow-color">Lava Flow Color</Label>
            <div className="flex items-center gap-2 mt-1">
              <input
                type="color"
                id="flow-color"
                value={flowColor}
                onChange={(e) => setFlowColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <div className="flex-1 h-8 rounded" style={{ backgroundColor: flowColor, opacity: flowOpacity }}></div>
            </div>
          </div>

          <div>
            <Label htmlFor="flow-opacity">Opacity: {flowOpacity}</Label>
            <input
              type="range"
              id="flow-opacity"
              min="0.1"
              max="0.8"
              step="0.1"
              value={flowOpacity}
              onChange={(e) => setFlowOpacity(Number.parseFloat(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="flow-start-date">Start Date</Label>
              <Input
                id="flow-start-date"
                type="date"
                value={flowStartDate}
                onChange={(e) => setFlowStartDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div>
              <Label htmlFor="flow-end-date">End Date (Optional)</Label>
              <Input
                id="flow-end-date"
                type="date"
                value={flowEndDate}
                onChange={(e) => setFlowEndDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="flow-description">Description (Optional)</Label>
            <Textarea
              id="flow-description"
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              placeholder="Description of the lava flow"
              className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={startDrawing} className="bg-gray-700 hover:bg-gray-600">
              <MapPin className="h-4 w-4 mr-2" />
              {selectedFlowId ? "Redraw Flow" : "Draw New Flow"}
            </Button>

            <Button onClick={saveLavaFlow} disabled={!flowName} className="bg-green-600 hover:bg-green-700 flex-1">
              <Save className="h-4 w-4 mr-2" />
              {selectedFlowId ? "Update Flow" : "Save Flow"}
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Existing Lava Flows</h2>

        {lavaFlows.length === 0 ? (
          <p className="text-gray-400">No lava flows added yet.</p>
        ) : (
          <div className="space-y-3">
            {lavaFlows.map((flow) => (
              <div key={flow.id} className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-sm"
                    style={{ backgroundColor: flow.color, opacity: flow.opacity }}
                  ></div>
                  <div>
                    <span className="font-medium text-white">{flow.name}</span>
                    <p className="text-xs text-gray-400">
                      {new Date(flow.startDate).toLocaleDateString()}
                      {flow.endDate ? ` - ${new Date(flow.endDate).toLocaleDateString()}` : " - ongoing"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editLavaFlow(flow.id)}
                    className="bg-gray-600 hover:bg-gray-500"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteLavaFlow(flow.id)}
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
