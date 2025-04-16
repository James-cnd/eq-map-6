"use client"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface MapVisibility {
  earthquakes: boolean
  lavaFlows: boolean
  berms: boolean
  gpsStations: boolean
  seismicStations: boolean
}

export default function MapVisibilitySettings() {
  const [visibility, setVisibility] = useLocalStorage<MapVisibility>("mapVisibility", {
    earthquakes: true,
    lavaFlows: true,
    berms: true,
    gpsStations: true,
    seismicStations: true,
  })

  const updateVisibility = (key: keyof MapVisibility, value: boolean) => {
    setVisibility({
      ...visibility,
      [key]: value,
    })
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Map Visibility Settings</h2>

      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <div className="flex items-center justify-between">
          <Label htmlFor="earthquakes" className="cursor-pointer">
            Show Earthquakes
          </Label>
          <Switch
            id="earthquakes"
            checked={visibility.earthquakes}
            onCheckedChange={(checked) => updateVisibility("earthquakes", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="lavaFlows" className="cursor-pointer">
            Show Lava Flows
          </Label>
          <Switch
            id="lavaFlows"
            checked={visibility.lavaFlows}
            onCheckedChange={(checked) => updateVisibility("lavaFlows", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="berms" className="cursor-pointer">
            Show Berms
          </Label>
          <Switch
            id="berms"
            checked={visibility.berms}
            onCheckedChange={(checked) => updateVisibility("berms", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="gpsStations" className="cursor-pointer">
            Show GPS Stations
          </Label>
          <Switch
            id="gpsStations"
            checked={visibility.gpsStations}
            onCheckedChange={(checked) => updateVisibility("gpsStations", checked)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="seismicStations" className="cursor-pointer">
            Show Seismic Stations
          </Label>
          <Switch
            id="seismicStations"
            checked={visibility.seismicStations}
            onCheckedChange={(checked) => updateVisibility("seismicStations", checked)}
          />
        </div>
      </div>
    </div>
  )
}
