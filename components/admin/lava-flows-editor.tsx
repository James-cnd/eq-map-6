"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { LavaFlow } from "@/types/lava-flow"

interface LavaFlowsEditorProps {
  map: any
  L: any
}

export default function LavaFlowsEditor({ map, L }: LavaFlowsEditorProps) {
  const [lavaFlows, setLavaFlows] = useLocalStorage<LavaFlow[]>("lavaFlows", [])
  const [drawingMode, setDrawingMode] = useState(false)
  const [currentLavaFlow, setCurrentLavaFlow] = useState<LavaFlow | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#ff0000")
  const [opacity, setOpacity] = useState(0.5)
  const [date, setDate] = useState("")

  // Drawing state
  const [drawingLayer, setDrawingLayer] = useState<any>(null)
  const [points, setPoints] = useState<[number, number][]>([])

  useEffect(() => {
    if (!map) return

    // Initialize drawing layer
    const layer = new L.FeatureGroup()
    map.addLayer(layer)
    setDrawingLayer(layer)

    // Cleanup
    return () => {
      if (map && layer) {
        map.removeLayer(layer)
      }
    }
  }, [map, L])

  const startDrawing = () => {
    if (!map || !drawingLayer) return

    setDrawingMode(true)
    setPoints([])
    drawingLayer.clearLayers()

    // Add click handler to map
    map.on("click", handleMapClick)
  }

  const handleMapClick = (e: any) => {
    const { lat, lng } = e.latlng
    setPoints((prev) => [...prev, [lat, lng]])

    // Visualize the point
    new L.CircleMarker([lat, lng], {
      radius: 5,
      color: color,
      fillColor: color,
      fillOpacity: 1,
    }).addTo(drawingLayer)

    // If we have at least 2 points, draw a line
    if (points.length > 0) {
      const lastPoint = points[points.length - 1]
      new L.Polyline([lastPoint, [lat, lng]], {
        color: color,
        weight: 3,
      }).addTo(drawingLayer)
    }
  }

  const finishDrawing = () => {
    if (!map || points.length < 3) return

    setDrawingMode(false)
    map.off("click", handleMapClick)

    // Close the polygon
    if (drawingLayer) {
      drawingLayer.clearLayers()
      new L.Polygon(points, {
        color: color,
        fillColor: color,
        fillOpacity: opacity,
        weight: 2,
      }).addTo(drawingLayer)
    }
  }

  const saveLavaFlow = () => {
    if (points.length < 3 || !name || !date) return

    const newLavaFlow: LavaFlow = {
      id: Date.now().toString(),
      name,
      color,
      opacity,
      date,
      points,
    }

    setLavaFlows([...lavaFlows, newLavaFlow])
    resetForm()
  }

  const resetForm = () => {
    setCurrentLavaFlow(null)
    setName("")
    setColor("#ff0000")
    setOpacity(0.5)
    setDate("")
    setPoints([])
    if (drawingLayer) {
      drawingLayer.clearLayers()
    }
    setDrawingMode(false)
    if (map) {
      map.off("click", handleMapClick)
    }
  }

  const deleteLavaFlow = (id: string) => {
    setLavaFlows(lavaFlows.filter((flow) => flow.id !== id))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Lava Flows Editor</h2>

      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter lava flow name"
              className="bg-gray-700"
            />
          </div>
          <div>
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-gray-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex space-x-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-12 h-10 p-1 bg-gray-700"
              />
              <Input value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 bg-gray-700" />
            </div>
          </div>
          <div>
            <Label htmlFor="opacity">Opacity: {opacity}</Label>
            <Input
              id="opacity"
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(Number.parseFloat(e.target.value))}
              className="bg-gray-700"
            />
          </div>
        </div>

        <div className="flex space-x-2">
          {!drawingMode ? (
            <Button onClick={startDrawing} variant="outline">
              Start Drawing
            </Button>
          ) : (
            <>
              <Button onClick={finishDrawing} variant="outline">
                Finish Drawing
              </Button>
              <Button onClick={resetForm} variant="destructive">
                Cancel
              </Button>
            </>
          )}

          {!drawingMode && points.length > 2 && (
            <Button onClick={saveLavaFlow} variant="default">
              Save Lava Flow
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Saved Lava Flows</h3>
        {lavaFlows.length === 0 ? (
          <p className="text-gray-400">No lava flows added yet.</p>
        ) : (
          <div className="space-y-2">
            {lavaFlows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div>
                  <span className="font-medium">{flow.name}</span>
                  <span className="ml-2 text-sm text-gray-400">{flow.date}</span>
                  <div
                    className="inline-block w-4 h-4 ml-2 rounded-full"
                    style={{ backgroundColor: flow.color, opacity: flow.opacity }}
                  />
                </div>
                <Button onClick={() => deleteLavaFlow(flow.id)} variant="destructive" size="sm">
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
