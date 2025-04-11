"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"

interface FactsPanelProps {
  onClose: () => void
}

export default function FactsPanel({ onClose }: FactsPanelProps) {
  return (
    <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-md">
      <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-white">Earthquake Facts</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="max-h-[60vh] overflow-y-auto pr-6">
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Magnitude Color Legend</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#3498DB]"></div>
                <span className="text-sm">Negative (Micro)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#2ECC71]"></div>
                <span className="text-sm">0-0.99 (Minor)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#F1C40F]"></div>
                <span className="text-sm">1-1.99 (Light)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E67E22]"></div>
                <span className="text-sm">2-2.99 (Moderate)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#E74C3C]"></div>
                <span className="text-sm">3-3.99 (Strong)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-[#8E44AD]"></div>
                <span className="text-sm">4+ (Major)</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-gray-700">
            <h3 className="font-medium mb-3 mt-4">About Icelandic Earthquakes</h3>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                Iceland sits on the Mid-Atlantic Ridge where the North American and Eurasian tectonic plates are moving
                apart.
              </p>
              <p>The country experiences thousands of earthquakes each year, most of them too small to be felt.</p>
              <p>
                Major volcanic systems like Bárðarbunga, Grímsvötn, and those on the Reykjanes Peninsula frequently
                produce earthquake swarms.
              </p>
              <p>
                The Icelandic Meteorological Office (IMO) monitors seismic activity across the country with a network of
                sensors.
              </p>
              <p>
                Earthquake swarms often precede volcanic eruptions in Iceland, as magma pushes through the crust and
                creates fractures in the rock.
              </p>
              <p>
                The largest earthquake in recent Icelandic history was a magnitude 6.6 event in the South Iceland
                Seismic Zone in June 2000.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
