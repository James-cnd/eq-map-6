"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { X, Layers } from "lucide-react"

interface OverlaySettingsProps {
    onClose: () => void
    showZoneHighlighting: boolean
    setShowZoneHighlighting: (value: boolean) => void
    showHotspotButtons: boolean
    setShowHotspotButtons: (value: boolean) => void
    showSeismicStations: boolean
    setShowSeismicStations: (value: boolean) => void
    showGpsStations: boolean
    setShowGpsStations: (value: boolean) => void
    showLavaFlows: boolean
    setShowLavaFlows: (value: boolean) => void
    showBerms: boolean
    setShowBerms: (value: boolean) => void
    showFissures: boolean
    setShowFissures: (value: boolean) => void
}

export default function OverlaySettings({
    onClose,
    showZoneHighlighting,
    setShowZoneHighlighting,
    showHotspotButtons,
    setShowHotspotButtons,
    showSeismicStations,
    setShowSeismicStations,
    showGpsStations,
    setShowGpsStations,
    showLavaFlows,
    setShowLavaFlows,
    showBerms,
    setShowBerms,
    showFissures,
    setShowFissures
}: OverlaySettingsProps) {
    return (
        <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-md">
            <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">Overlay Settings</CardTitle>
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
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="zone-highlighting">Zone Highlighting</Label>
                        <p className="text-sm text-gray-400">Show colored zones on the map</p>
                    </div>
                    <Switch
                        id="zone-highlighting"
                        checked={showZoneHighlighting}
                        onCheckedChange={setShowZoneHighlighting}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="hotspot-buttons">Hotspot Buttons</Label>
                        <p className="text-sm text-gray-400">Show quick navigation buttons</p>
                    </div>
                    <Switch
                        id="hotspot-buttons"
                        checked={showHotspotButtons}
                        onCheckedChange={setShowHotspotButtons}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="seismic-stations">Seismic Stations</Label>
                        <p className="text-sm text-gray-400">Show seismic monitoring stations</p>
                    </div>
                    <Switch
                        id="seismic-stations"
                        checked={showSeismicStations}
                        onCheckedChange={setShowSeismicStations}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="gps-stations">GPS Stations</Label>
                        <p className="text-sm text-gray-400">Show GPS monitoring stations</p>
                    </div>
                    <Switch
                        id="gps-stations"
                        checked={showGpsStations}
                        onCheckedChange={setShowGpsStations}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="lava-flows">Lava Flows</Label>
                        <p className="text-sm text-gray-400">Show historical lava flows</p>
                    </div>
                    <Switch
                        id="lava-flows"
                        checked={showLavaFlows}
                        onCheckedChange={setShowLavaFlows}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="berms">Defensive Berms</Label>
                        <p className="text-sm text-gray-400">Show defensive barriers</p>
                    </div>
                    <Switch
                        id="berms"
                        checked={showBerms}
                        onCheckedChange={setShowBerms}
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="fissures">Fissures</Label>
                        <p className="text-sm text-gray-400">Show eruption fissures</p>
                    </div>
                    <Switch
                        id="fissures"
                        checked={showFissures}
                        onCheckedChange={setShowFissures}
                    />
                </div>
            </CardContent>
        </Card>
    )
}