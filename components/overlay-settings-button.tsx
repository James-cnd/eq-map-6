"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Layers } from "lucide-react"
import OverlaySettings from "@/components/overlay-settings"
import { useLocalStorage } from "@/hooks/use-local-storage"

export default function OverlaySettingsButton() {
    const [showOverlaySettings, setShowOverlaySettings] = useState(false)

    // Map display settings with useLocalStorage
    const [showZoneHighlighting, setShowZoneHighlighting] = useLocalStorage("earthquakeShowZoneHighlighting", false)
    const [showHotspotButtons, setShowHotspotButtons] = useLocalStorage("earthquakeShowHotspotButtons", false)
    const [showSeismicStations, setShowSeismicStations] = useLocalStorage("earthquakeShowSeismicStations", false)
    const [showGpsStations, setShowGpsStations] = useLocalStorage("earthquakeShowGpsStations", true)
    const [showLavaFlows, setShowLavaFlows] = useLocalStorage("earthquakeShowLavaFlows", false)
    const [showBerms, setShowBerms] = useLocalStorage("earthquakeShowBerms", false)
    const [showFissures, setShowFissures] = useLocalStorage("earthquakeShowFissures", false)

    return (
        <>
            <Button
                variant="outline"
                size="icon"
                onClick={() => setShowOverlaySettings(true)}
                className="bg-gray-900/90 border-gray-700 hover:bg-gray-800"
                title="Toggle Map Overlays"
            >
                <Layers className="h-[1.2rem] w-[1.2rem]" />
            </Button>

            {showOverlaySettings && (
                <div className="fixed inset-0 bg-black/50 z-[1001] flex items-center justify-center p-4">
                    <OverlaySettings
                        onClose={() => setShowOverlaySettings(false)}
                        showZoneHighlighting={showZoneHighlighting}
                        setShowZoneHighlighting={setShowZoneHighlighting}
                        showHotspotButtons={showHotspotButtons}
                        setShowHotspotButtons={setShowHotspotButtons}
                        showSeismicStations={showSeismicStations}
                        setShowSeismicStations={setShowSeismicStations}
                        showGpsStations={showGpsStations}
                        setShowGpsStations={setShowGpsStations}
                        showLavaFlows={showLavaFlows}
                        setShowLavaFlows={setShowLavaFlows}
                        showBerms={showBerms}
                        setShowBerms={setShowBerms}
                        showFissures={showFissures}
                        setShowFissures={setShowFissures}
                    />
                </div>
            )}
        </>
    )
}