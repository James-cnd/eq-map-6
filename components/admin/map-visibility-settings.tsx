"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { useGlobalData } from "@/hooks/use-global-data"

interface MapSettings {
  showSeismicStations: boolean
  showGpsStations: boolean
  showSeismometers: boolean
  showLavaFlows: boolean
  showBerms: boolean
  showFissures: boolean
  showEarthquakes: boolean
  showZoneHighlighting: boolean
  enableZoneTransitions: boolean
  showHotspotButtons: boolean
}

export default function MapVisibilitySettings() {
  const {
    data: settings,
    setData: setSettings,
    isLoading,
  } = useGlobalData<MapSettings>("map_settings", "earthquakeMapSettings", {
    showSeismicStations: false,
    showGpsStations: true,
    showSeismometers: false,
    showLavaFlows: true,
    showBerms: true,
    showFissures: true,
    showEarthquakes: true,
    showZoneHighlighting: true,
    enableZoneTransitions: true,
    showHotspotButtons: true,
  })

  // Local state for form
  const [localSettings, setLocalSettings] = useState<MapSettings>({
    showSeismicStations: false,
    showGpsStations: true,
    showSeismometers: false,
    showLavaFlows: true,
    showBerms: true,
    showFissures: true,
    showEarthquakes: true,
    showZoneHighlighting: true,
    enableZoneTransitions: true,
    showHotspotButtons: true,
  })

  // Update local state when settings change
  useEffect(() => {
    if (settings) {
      setLocalSettings(settings)
    }
  }, [settings])

  // Save settings
  const saveSettings = async () => {
    const success = await setSettings(localSettings)

    if (success) {
      toast({
        title: "Success",
        description: "Map settings saved successfully! Changes are now visible to all users.",
      })

      // Dispatch event to update map
      window.dispatchEvent(
        new CustomEvent("mapSettingsChanged", {
          detail: localSettings,
        }),
      )
    } else {
      toast({
        title: "Error",
        description: "Failed to save map settings. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Handle toggle change
  const handleToggle = (key: keyof MapSettings) => {
    setLocalSettings({
      ...localSettings,
      [key]: !localSettings[key],
    })
  }

  if (isLoading) {
    return <div className="p-4 text-center">Loading map settings...</div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Map Visibility Settings</h2>
        <p className="text-sm text-gray-400 mb-4">
          These settings control what elements are visible on the map for all users.
        </p>

        <div className="space-y-4">
          <div className="space-y-4">
            <h3 className="font-medium">Data Layers</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-earthquakes" className="cursor-pointer">
                  Show Earthquakes
                </Label>
                <Switch
                  id="show-earthquakes"
                  checked={localSettings.showEarthquakes}
                  onCheckedChange={() => handleToggle("showEarthquakes")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-seismic-stations" className="cursor-pointer">
                  Show Seismic Stations
                </Label>
                <Switch
                  id="show-seismic-stations"
                  checked={localSettings.showSeismicStations}
                  onCheckedChange={() => handleToggle("showSeismicStations")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-gps-stations" className="cursor-pointer">
                  Show GPS Stations
                </Label>
                <Switch
                  id="show-gps-stations"
                  checked={localSettings.showGpsStations}
                  onCheckedChange={() => handleToggle("showGpsStations")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-seismometers" className="cursor-pointer">
                  Show Seismometers
                </Label>
                <Switch
                  id="show-seismometers"
                  checked={localSettings.showSeismometers}
                  onCheckedChange={() => handleToggle("showSeismometers")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Volcanic Features</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-lava-flows" className="cursor-pointer">
                  Show Lava Flows
                </Label>
                <Switch
                  id="show-lava-flows"
                  checked={localSettings.showLavaFlows}
                  onCheckedChange={() => handleToggle("showLavaFlows")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-berms" className="cursor-pointer">
                  Show Berms
                </Label>
                <Switch
                  id="show-berms"
                  checked={localSettings.showBerms}
                  onCheckedChange={() => handleToggle("showBerms")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-fissures" className="cursor-pointer">
                  Show Fissures
                </Label>
                <Switch
                  id="show-fissures"
                  checked={localSettings.showFissures}
                  onCheckedChange={() => handleToggle("showFissures")}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium">Interface Settings</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-zone-highlighting" className="cursor-pointer">
                  Zone Highlighting
                </Label>
                <Switch
                  id="show-zone-highlighting"
                  checked={localSettings.showZoneHighlighting}
                  onCheckedChange={() => handleToggle("showZoneHighlighting")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="enable-zone-transitions" className="cursor-pointer">
                  Smooth Zone Transitions
                </Label>
                <Switch
                  id="enable-zone-transitions"
                  checked={localSettings.enableZoneTransitions}
                  onCheckedChange={() => handleToggle("enableZoneTransitions")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="show-hotspot-buttons" className="cursor-pointer">
                  Show Hotspot Buttons
                </Label>
                <Switch
                  id="show-hotspot-buttons"
                  checked={localSettings.showHotspotButtons}
                  onCheckedChange={() => handleToggle("showHotspotButtons")}
                />
              </div>
            </div>
          </div>

          <Button onClick={saveSettings} className="w-full bg-green-600 hover:bg-green-700 mt-4">
            Save Settings
          </Button>

          <p className="text-xs text-gray-400 mt-2">
            Changes will be applied to all users globally when they refresh or open the site.
          </p>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Current Settings</h2>
        <div className="space-y-2 text-sm">
          <p>
            <span className="text-gray-400">Earthquakes:</span>{" "}
            <span className={settings.showEarthquakes ? "text-green-400" : "text-red-400"}>
              {settings.showEarthquakes ? "Visible" : "Hidden"}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Seismic Stations:</span>{" "}
            <span className={settings.showSeismicStations ? "text-green-400" : "text-red-400"}>
              {settings.showSeismicStations ? "Visible" : "Hidden"}
            </span>
          </p>
          <p>
            <span className="text-gray-400">GPS Stations:</span>{" "}
            <span className={settings.showGpsStations ? "text-green-400" : "text-red-400"}>
              {settings.showGpsStations ? "Visible" : "Hidden"}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Seismometers:</span>{" "}
            <span className={settings.showSeismometers ? "text-green-400" : "text-red-400"}>
              {settings.showSeismometers ? "Visible" : "Hidden"}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Lava Flows:</span>{" "}
            <span className={settings.showLavaFlows ? "text-green-400" : "text-red-400"}>
              {settings.showLavaFlows ? "Visible" : "Hidden"}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Berms:</span>{" "}
            <span className={settings.showBerms ? "text-green-400" : "text-red-400"}>
              {settings.showBerms ? "Visible" : "Hidden"}
            </span>
          </p>
          <p>
            <span className="text-gray-400">Fissures:</span>{" "}
            <span className={settings.showFissures ? "text-green-400" : "text-red-400"}>
              {settings.showFissures ? "Visible" : "Hidden"}
            </span>
          </p>
        </div>
      </div>
    </div>
  )
}
