"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { Berm } from "@/types/berm"

interface BermsEditorProps {
  map: any
  L: any
}

export default function BermsEditor({ map, L }: BermsEditorProps) {
  const [berms, setBerms] = useLocalStorage<Berm[]>("berms", [])
  const [drawingMode, setDrawingMode] = useState(false)
  const [currentBerm, setCurrentBerm] = useState<Berm | null>(null)
  const [name, setName] = useState("")
  const [color, setColor] = useState("#0000ff")
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
    if (!map || points.length < 2) return

    setDrawingMode(false)
    map.off("click", handleMapClick)

    // Draw the polyline
    if (drawingLayer) {
      drawingLayer.clearLayers()
      new L.Polyline(points, {
        color: color,
        weight: 4,
      }).addTo(drawingLayer)
    }
  }

  const saveBerm = () => {
    if (points.length < 2 || !name || !date) return

    const newBerm: Berm = {
      id: Date.now().toString(),
      name,
      color,
      date,
      points,
    }

    setBerms([...berms, newBerm])
    resetForm()
  }

  const resetForm = () => {
    setCurrentBerm(null)
    setName("")
    setColor("#0000ff")
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

  const deleteBerm = (id: string) => {
    setBerms(berms.filter((berm) => berm.id !== id))
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Berms Editor</h2>

      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter berm name"
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

          {!drawingMode && points.length > 1 && (
            <Button onClick={saveBerm} variant="default">
              Save Berm
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Saved Berms</h3>
        {berms.length === 0 ? (
          <p className="text-gray-400">No berms added yet.</p>
        ) : (
          <div className="space-y-2">
            {berms.map((berm) => (
              <div key={berm.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div>
                  <span className="font-medium">{berm.name}</span>
                  <span className="ml-2 text-sm text-gray-400">{berm.date}</span>
                  <div className="inline-block w-4 h-4 ml-2 rounded-full" style={{ backgroundColor: berm.color }} />
                </div>
                <Button onClick={() => deleteBerm(berm.id)} variant="destructive" size="sm">
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
