"use client"

import { useState } from "react"
import { X } from "lucide-react"
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
    const [showGpsStations, setShowGpsStations] = useLocalStorage("earthquakeShowGpsStations", false)
    const [showSeismometers, setShowSeismometers] = useLocalStorage("earthquakeShowSeismometers", false)
    const [showLavaFlows, setShowLavaFlows] = useLocalStorage("earthquakeShowLavaFlows", false)
    const [showBerms, setShowBerms] = useLocalStorage("earthquakeShowBerms", false)
    const [showFissures, setShowFissures] = useLocalStorage("earthquakeShowFissures", false)
    const [showEarthquakes, setShowEarthquakes] = useLocalStorage("earthquakeShowEarthquakes", true)
    const [enabledFissures, setEnabledFissures] = useLocalStorage<string[]>("earthquakeEnabledFissures", [])

    // Local state to track changes before saving
    const [localShowZoneHighlighting, setLocalShowZoneHighlighting] = useState(showZoneHighlighting)
    const [localEnableZoneTransitions, setLocalEnableZoneTransitions] = useState(enableZoneTransitions)
    const [localShowHotspotButtons, setLocalShowHotspotButtons] = useState(showHotspotButtons)
    const [localShowSeismicStations, setLocalShowSeismicStations] = useState(showSeismicStations)
    const [localShowGpsStations, setLocalShowGpsStations] = useState(showGpsStations)
    const [localShowSeismometers, setLocalShowSeismometers] = useState(showSeismometers)
    const [localShowLavaFlows, setLocalShowLavaFlows] = useState(showLavaFlows)
    const [localShowBerms, setLocalShowBerms] = useState(showBerms)
    const [localShowFissures, setLocalShowFissures] = useState(showFissures)
    const [localEnabledFissures, setLocalEnabledFissures] = useState<string[]>(enabledFissures)

    // Toggle a fissure on/off
    const toggleFissure = (fissureId: string) => {
        if (localEnabledFissures.includes(fissureId)) {
            setLocalEnabledFissures(localEnabledFissures.filter((id) => id !== fissureId))
        } else {
            setLocalEnabledFissures([...localEnabledFissures, fissureId])
        }
    }

    // Modify the saveSettings function to ensure all settings are saved to localStorage before reload
    const saveSettings = () => {
        // Update the localStorage values directly
        setShowZoneHighlighting(localShowZoneHighlighting)
        setEnableZoneTransitions(localEnableZoneTransitions)
        setShowHotspotButtons(localShowHotspotButtons)
        setShowSeismicStations(localShowSeismicStations)
        setShowGpsStations(localShowGpsStations)
        setShowSeismometers(localShowSeismometers)
        setShowLavaFlows(localShowLavaFlows)
        setShowBerms(localShowBerms)
        setShowFissures(localShowFissures)
        setEnabledFissures(localEnabledFissures)

        // Show success notification
        const notification = document.createElement("div")
        notification.style.position = "fixed"
        notification.style.top = "20px"
        notification.style.left = "50%"
        notification.style.transform = "translateX(-50%)"
        notification.style.backgroundColor = "rgba(0, 128, 0, 0.8)"
        notification.style.color = "white"
        notification.style.padding = "10px 20px"
        notification.style.borderRadius = "4px"
        notification.style.zIndex = "3000"
        notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)"
        notification.textContent = "Settings saved successfully!"

        document.body.appendChild(notification)

        // Remove notification after 3 seconds
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification)
            }
        }, 3000)

        // Dispatch a custom event to notify the map component to update
        const event = new CustomEvent("mapSettingsChanged", {
            detail: {
                showZoneHighlighting: localShowZoneHighlighting,
                enableZoneTransitions: localEnableZoneTransitions,
                showHotspotButtons: localShowHotspotButtons,
                showSeismicStations: localShowSeismicStations,
                showGpsStations: localShowGpsStations,
                showSeismometers: localShowSeismometers,
                showLavaFlows: localShowLavaFlows,
                showBerms: localShowBerms,
                showFissures: localShowFissures,
                enabledFissures: localEnabledFissures,
            },
        })
        window.dispatchEvent(event)

        // Close the settings panel after saving
        onClose()
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
                    {/* Earthquakes Settings */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Earthquakes</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="show-earthquakes" className="cursor-pointer">
                                    Show Earthquakes
                                </Label>
                                <Switch id="show-earthquakes" checked={showEarthquakes} onCheckedChange={setShowEarthquakes} />
                            </div>
                        </div>
                    </div>

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
                                    checked={localShowZoneHighlighting}
                                    onCheckedChange={setLocalShowZoneHighlighting}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="zone-transitions" className="cursor-pointer">
                                    Smooth Zone Transitions
                                </Label>
                                <Switch
                                    id="zone-transitions"
                                    checked={localEnableZoneTransitions}
                                    onCheckedChange={setLocalEnableZoneTransitions}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="hotspot-buttons" className="cursor-pointer">
                                    Show Hotspot Buttons
                                </Label>
                                <Switch
                                    id="hotspot-buttons"
                                    checked={localShowHotspotButtons}
                                    onCheckedChange={setLocalShowHotspotButtons}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Station Settings */}
                    <div>
                        <h3 className="text-lg font-semibold mb-3">Stations & Features</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="seismic-stations" className="cursor-pointer">
                                    Show Seismic Stations
                                </Label>
                                <Switch
                                    id="seismic-stations"
                                    checked={localShowSeismicStations}
                                    onCheckedChange={setLocalShowSeismicStations}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="gps-stations" className="cursor-pointer">
                                    Show GPS Stations
                                </Label>
                                <Switch id="gps-stations" checked={localShowGpsStations} onCheckedChange={setLocalShowGpsStations} />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="seismometers" className="cursor-pointer">
                                    Show Seismometers
                                </Label>
                                <Switch id="seismometers" checked={localShowSeismometers} onCheckedChange={setLocalShowSeismometers} />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="lava-flows" className="cursor-pointer">
                                    Show Lava Flows
                                </Label>
                                <Switch id="lava-flows" checked={localShowLavaFlows} onCheckedChange={setLocalShowLavaFlows} />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label htmlFor="berms" className="cursor-pointer">
                                    Show Berms
                                </Label>
                                <Switch id="berms" checked={localShowBerms} onCheckedChange={setLocalShowBerms} />
                            </div>
                        </div>
                    </div>

                    {/* Fissure Settings */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-lg font-semibold">Eruption Fissures</h3>
                            <Switch id="show-fissures" checked={localShowFissures} onCheckedChange={setLocalShowFissures} />
                        </div>

                        {localShowFissures && (
                            <div className="space-y-2 pl-2 border-l-2 border-gray-700">
                                {VOLCANIC_FISSURES.map((fissure) => (
                                    <div key={fissure.id} className="flex items-center justify-between">
                                        <Label htmlFor={`fissure-${fissure.id}`} className="cursor-pointer flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: fissure.color }}></div>
                                            <span>{fissure.name}</span>
                                        </Label>
                                        <Switch
                                            id={`fissure-${fissure.id}`}
                                            checked={localEnabledFissures.includes(fissure.id)}
                                            onCheckedChange={() => toggleFissure(fissure.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Save Button */}
                    <Button onClick={saveSettings} className="w-full bg-green-600 hover:bg-green-700 mt-4">
                        Save Choices
                    </Button>
                </div>
            </div>
        </div>
    )
}