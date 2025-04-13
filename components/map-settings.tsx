"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useMapLayers } from "@/hooks/use-map-layers"
import { VOLCANIC_FISSURES } from "@/types/fissures"

interface MapSettingsProps {
  onClose: () => void
}

export default function MapSettings({ onClose }: MapSettingsProps) {
  const {
    showBerms,
    showLavaFlows,
    showSeismicStations,
    showGpsStations,
    showSeismometers,
    showFissures,
    showEarthquakes,
    enabledFissures,
    setEnabledFissures,
    toggleLayer
  } = useMapLayers()

  // Toggle a fissure on/off with immediate update
  const toggleFissure = (fissureId: string) => {
    const newEnabledFissures = enabledFissures.includes(fissureId)
      ? enabledFissures.filter(id => id !== fissureId)
      : [...enabledFissures, fissureId]

    setEnabledFissures(newEnabledFissures)
  }

  // Group fissures by eruption
  const eruptionGroups = VOLCANIC_FISSURES.reduce((groups: { [key: string]: typeof VOLCANIC_FISSURES }, fissure) => {
    const eruption = fissure.eruption || "Unknown"
    if (!groups[eruption]) {
      groups[eruption] = []
    }
    groups[eruption].push(fissure)
    return groups
  }, {})

  return (
    <div className="p-4 text-gray-200">
      <div className="space-y-6">
        {/* Map Display Settings */}
        <div>
          <h3 className="font-medium mb-2">Map Features</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="earthquakes" className="cursor-pointer">
                Show Earthquakes
              </Label>
              <Switch
                id="earthquakes"
                checked={showEarthquakes}
                onCheckedChange={() => toggleLayer('earthquakes')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="seismicStations" className="cursor-pointer">
                Show Seismic Stations
              </Label>
              <Switch
                id="seismicStations"
                checked={showSeismicStations}
                onCheckedChange={() => toggleLayer('seismicStations')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gpsStations" className="cursor-pointer">
                Show GPS Stations
              </Label>
              <Switch
                id="gpsStations"
                checked={showGpsStations}
                onCheckedChange={() => toggleLayer('gpsStations')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="seismometers" className="cursor-pointer">
                Show Seismometers
              </Label>
              <Switch
                id="seismometers"
                checked={showSeismometers}
                onCheckedChange={() => toggleLayer('seismometers')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="lavaFlows" className="cursor-pointer">
                Show Lava Flows
              </Label>
              <Switch
                id="lavaFlows"
                checked={showLavaFlows}
                onCheckedChange={() => toggleLayer('lavaFlows')}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="berms" className="cursor-pointer">
                Show Berms
              </Label>
              <Switch
                id="berms"
                checked={showBerms}
                onCheckedChange={() => toggleLayer('berms')}
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
              onCheckedChange={() => toggleLayer('fissures')}
            />
          </div>

          {showFissures && (
            <div className="space-y-4">
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const allFissureIds = VOLCANIC_FISSURES.map(f => f.id)
                    setEnabledFissures(allFissureIds)
                  }}
                  className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700"
                >
                  Enable All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEnabledFissures([])}
                  className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700"
                >
                  Disable All
                </Button>
              </div>

              {Object.entries(eruptionGroups).map(([eruption, fissures]) => (
                <div key={eruption} className="space-y-2">
                  <h4 className="font-medium text-sm border-b border-gray-700 pb-1">{eruption}</h4>
                  <div className="space-y-2">
                    {fissures.map((fissure) => (
                      <div key={fissure.id} className="flex items-center justify-between">
                        <Label htmlFor={fissure.id} className="cursor-pointer text-sm">
                          {fissure.name}
                        </Label>
                        <Switch
                          id={fissure.id}
                          checked={enabledFissures.includes(fissure.id)}
                          onCheckedChange={() => toggleFissure(fissure.id)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
