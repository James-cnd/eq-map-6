"use client"

import { useState } from "react"
import { X, Bell, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { VOLCANIC_FISSURES } from "@/types/fissures"

interface MapSettingsProps {
  onClose: () => void
}

export default function MapSettings({ onClose }: MapSettingsProps) {
  // Map display settings
  const [showZoneHighlighting, setShowZoneHighlighting] = useLocalStorage("earthquakeShowZoneHighlighting", false)
  const [enableZoneTransitions, setEnableZoneTransitions] = useLocalStorage("earthquakeEnableZoneTransitions", false)
  const [showHotspotButtons, setShowHotspotButtons] = useLocalStorage("earthquakeShowHotspotButtons", false)
  const [showSeismicStations, setShowSeismicStations] = useLocalStorage("earthquakeShowSeismicStations", false)
  const [showGpsStations, setShowGpsStations] = useLocalStorage("earthquakeShowGpsStations", true)
  const [showSeismometers, setShowSeismometers] = useLocalStorage("earthquakeShowSeismometers", false)
  const [showLavaFlows, setShowLavaFlows] = useLocalStorage("earthquakeShowLavaFlows", false)
  const [showBerms, setShowBerms] = useLocalStorage("earthquakeShowBerms", false)
  const [showFissures, setShowFissures] = useLocalStorage("earthquakeShowFissures", true) // Default to true
  const [showEarthquakes, setShowEarthquakes] = useLocalStorage("earthquakeShowEarthquakes", true)
  const [enabledFissures, setEnabledFissures] = useLocalStorage<string[]>("earthquakeEnabledFissures", [])

  // Handle immediate toggle updates
  const handleSettingChange = (setting: string, value: boolean) => {
    // Update the appropriate state based on the setting
    switch (setting) {
      case "zoneHighlighting":
        setShowZoneHighlighting(value)
        break
      case "zoneTransitions":
        setEnableZoneTransitions(value)
        break
      case "hotspotButtons":
        setShowHotspotButtons(value)
        break
      case "seismicStations":
        setShowSeismicStations(value)
        break
      case "gpsStations":
        setShowGpsStations(value)
        break
      case "seismometers":
        setShowSeismometers(value)
        break
      case "lavaFlows":
        setShowLavaFlows(value)
        break
      case "berms":
        setShowBerms(value)
        break
      case "fissures":
        setShowFissures(value)
        break
      case "earthquakes":
        setShowEarthquakes(value)
        break
    }

    // Dispatch event to update map immediately
    const event = new CustomEvent("mapSettingsChanged", {
      detail: {
        showZoneHighlighting,
        enableZoneTransitions,
        showHotspotButtons,
        showSeismicStations,
        showGpsStations,
        showSeismometers,
        showLavaFlows,
        showBerms,
        showFissures,
        showEarthquakes,
        enabledFissures,
        [setting]: value
      }
    })
    window.dispatchEvent(event)
  }

  // Toggle a fissure on/off with immediate update
  const toggleFissure = (fissureId: string) => {
    const newEnabledFissures = enabledFissures.includes(fissureId)
      ? enabledFissures.filter(id => id !== fissureId)
      : [...enabledFissures, fissureId]

    setEnabledFissures(newEnabledFissures)

    // Dispatch event to update map immediately
    const event = new CustomEvent("mapSettingsChanged", {
      detail: {
        showZoneHighlighting,
        enableZoneTransitions,
        showHotspotButtons,
        showSeismicStations,
        showGpsStations,
        showSeismometers,
        showLavaFlows,
        showBerms,
        showFissures,
        showEarthquakes,
        enabledFissures: newEnabledFissures
      }
    })
    window.dispatchEvent(event)
  }

  return (
    <div className="bg-gray-900 text-white rounded-lg shadow-lg overflow-hidden max-w-md w-full max-h-[90vh]">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold">Map Settings</h2>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="p-4 overflow-y-auto max-h-[calc(90vh-60px)]">
        <div className="space-y-6">
          {/* Map Display Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Map Display</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="zone-highlighting" className="cursor-pointer">
                  Zone Highlighting
                </Label>
                <Switch
                  id="zone-highlighting"
                  checked={showZoneHighlighting}
                  onCheckedChange={(value) => handleSettingChange("zoneHighlighting", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="zone-transitions" className="cursor-pointer">
                  Smooth Zone Transitions
                </Label>
                <Switch
                  id="zone-transitions"
                  checked={enableZoneTransitions}
                  onCheckedChange={(value) => handleSettingChange("zoneTransitions", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="hotspot-buttons" className="cursor-pointer">
                  Show Hotspot Buttons
                </Label>
                <Switch
                  id="hotspot-buttons"
                  checked={showHotspotButtons}
                  onCheckedChange={(value) => handleSettingChange("hotspotButtons", value)}
                />
              </div>
            </div>
          </div>

          {/* Station Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Stations & Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="earthquakes" className="cursor-pointer">
                  Show Earthquakes
                </Label>
                <Switch
                  id="earthquakes"
                  checked={showEarthquakes}
                  onCheckedChange={(value) => handleSettingChange("earthquakes", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="seismic-stations" className="cursor-pointer">
                  Show Seismic Stations
                </Label>
                <Switch
                  id="seismic-stations"
                  checked={showSeismicStations}
                  onCheckedChange={(value) => handleSettingChange("seismicStations", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="gps-stations" className="cursor-pointer">
                  Show GPS Stations
                </Label>
                <Switch
                  id="gps-stations"
                  checked={showGpsStations}
                  onCheckedChange={(value) => handleSettingChange("gpsStations", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="seismometers" className="cursor-pointer">
                  Show Seismometers
                </Label>
                <Switch
                  id="seismometers"
                  checked={showSeismometers}
                  onCheckedChange={(value) => handleSettingChange("seismometers", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="lava-flows" className="cursor-pointer">
                  Show Lava Flows
                </Label>
                <Switch
                  id="lava-flows"
                  checked={showLavaFlows}
                  onCheckedChange={(value) => handleSettingChange("lavaFlows", value)}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="berms" className="cursor-pointer">
                  Show Berms
                </Label>
                <Switch
                  id="berms"
                  checked={showBerms}
                  onCheckedChange={(value) => handleSettingChange("berms", value)}
                />
              </div>
            </div>
          </div>

          {/* Fissure Settings */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Eruption Fissures</h3>
              <Switch
                id="show-fissures"
                checked={showFissures}
                onCheckedChange={(value) => handleSettingChange("fissures", value)}
              />
            </div>

            {showFissures && (
              <div className="space-y-2 pl-2 border-l-2 border-gray-700">
                {[...VOLCANIC_FISSURES].map((fissure) => (
                  <div key={fissure.id} className="flex items-center justify-between">
                    <Label htmlFor={`fissure-${fissure.id}`} className="cursor-pointer flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fissure.color }}></div>
                      <span>{fissure.name}</span>
                    </Label>
                    <Switch
                      id={`fissure-${fissure.id}`}
                      checked={enabledFissures.includes(fissure.id)}
                      onCheckedChange={() => toggleFissure(fissure.id)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
