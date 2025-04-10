"use client"

import { useState, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEarthquakes } from "@/hooks/use-earthquakes"
import { useEarthquakeNotifications } from "@/hooks/use-earthquake-notifications"
import { EarthquakeDetails } from "@/components/earthquake-details"
import type { Earthquake } from "@/types/earthquake"
import { ICELAND_ZONES } from "@/types/zones"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, X, Settings, Globe, BookOpen, Activity, Coffee, Pencil, Bell, Youtube } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import EarthquakeSidebar from "@/components/earthquake-sidebar"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import type { CustomGpsStation } from "@/types/stations"
import { DraggablePanel } from "@/components/draggable-panel"

// Add the import for MapSettings, FactsPanel, EruptionInfo, and DonationInfo
import MapSettings from "@/components/map-settings"
import FactsPanel from "@/components/facts-panel"
import EruptionInfo from "@/components/eruption-info"
import DonationInfo from "@/components/donation-info"
import GpsStationPopup from "@/components/gps-station-popup"
import NotificationSettings from "@/components/notification-settings"
import RaspberryShakeInfo from "@/components/raspberry-shake-info"
import SeismometerDisplay from "@/components/seismometer-display"
import YoutubePlayer from "@/components/youtube-player"
import type { CustomSeismometer } from "@/components/admin-draw-panel"

// Add import for the volcano icon
import { VolcanoIcon } from "@/components/icons/volcano-icon"

// Import Leaflet CSS
import "leaflet/dist/leaflet.css"
// We'll load Leaflet.Draw CSS dynamically in the AdminDrawPanel component

// Import the AdminDrawPanel component
const AdminDrawPanel = dynamic(() => import("@/components/admin-draw-panel"), {
    ssr: false,
})

// Dynamically import Leaflet with no SSR to avoid window is not defined errors
// Use a key to force remount when needed
const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
    ssr: false,
    loading: () => <Skeleton className="h-full w-full bg-gray-800" />,
})

// Add these imports at the top
import type { GpsStationExtended } from "@/data/gps-stations-extended"
import GpsStationViewer from "@/components/gps-station-viewer"

export default function EarthquakeMap() {
    // Rest of the component remains the same
    const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null)
    const [magnitudeRange, setMagnitudeRange] = useLocalStorage<[number, number]>("earthquakeMagnitudeRange", [-2, 8])
    const [depthRange, setDepthRange] = useLocalStorage<[number, number]>("earthquakeDepthRange", [0, 25])
    const [timeFilterRange, setTimeFilterRange] = useLocalStorage<[number, number]>("earthquakeTimeFilterRange", [0, 24])
    const [zoneFilter, setZoneFilter] = useLocalStorage("earthquakeZoneFilter", "all")
    const { earthquakes, isLoading, error, lastUpdated } = useEarthquakes()
    const [selectedGpsStation, setSelectedGpsStation] = useState<CustomGpsStation | null>(null)
    const [selectedSeismometer, setSelectedSeismometer] = useState<CustomSeismometer | null>(null)
    const [mapKey, setMapKey] = useState(0)

    // Use localStorage to remember panel visibility preferences
    const [showSidebar, setShowSidebar] = useLocalStorage("earthquakeShowSidebar", true)
    // Default to "list" panel always
    const [activePanel, setActivePanel] = useLocalStorage<"settings" | "list" | null>("earthquakeActivePanel", "list")

    // Add states for showing map settings, facts panel, eruption info, and donation info
    const [showMapSettings, setShowMapSettings] = useState(false)
    const [showFactsPanel, setShowFactsPanel] = useState(false)
    const [showEruptionInfo, setShowEruptionInfo] = useState(false)
    const [showDonationInfo, setShowDonationInfo] = useState(false)
    const [showAdminPanel, setShowAdminPanel] = useState(false)
    const [showNotificationSettings, setShowNotificationSettings] = useState(false)
    const [showRaspberryShakeInfo, setShowRaspberryShakeInfo] = useState(false)
    const [showYoutubePlayer, setShowYoutubePlayer] = useLocalStorage("earthquakeShowYoutubePlayer", false)

    // Map feature toggles
    const [showSeismicStations] = useLocalStorage("earthquakeShowSeismicStations", false)
    const [showGpsStations] = useLocalStorage("earthquakeShowGpsStations", false)
    const [showSeismometers] = useLocalStorage("earthquakeShowSeismometers", false)
    const [showLavaFlows] = useLocalStorage("earthquakeShowLavaFlows", true)
    const [showBerms] = useLocalStorage("earthquakeShowBerms", true)
    const [showEarthquakes] = useLocalStorage("earthquakeShowEarthquakes", true)

    // Refs for Leaflet map and L
    const leafletMapRef = useRef<{ map: any; L: any } | null>(null)

    // Initialize earthquake notifications
    const {
        notificationsEnabled,
        setNotificationsEnabled,
        notificationVolume,
        setNotificationVolume,
        recentEarthquakeCount,
        highActivityThreshold,
        mlwNotificationsEnabled,
        setMlwNotificationsEnabled,
    } = useEarthquakeNotifications(earthquakes)

    // Check if data is stale (not updated in the last 15 seconds)
    const isDataStale = lastUpdated && Date.now() - lastUpdated > 15000

    // Filter earthquakes based on magnitude range, time range, depth range, and zone
    const filteredEarthquakes = earthquakes.filter((quake) => {
        // Apply magnitude range filter
        if (quake.size < magnitudeRange[0] || quake.size > magnitudeRange[1]) return false

        // Apply depth range filter
        if (quake.depth < depthRange[0] || quake.depth > depthRange[1]) return false

        // Apply time range filter
        const quakeTime = new Date(quake.timestamp).getTime()
        const now = Date.now()
        const olderCutoff = now - timeFilterRange[1] * 60 * 60 * 1000 // Convert hours to milliseconds
        const newerCutoff = now - timeFilterRange[0] * 60 * 60 * 1000 // Convert hours to milliseconds

        if (quakeTime < olderCutoff || quakeTime > newerCutoff) return false

        // Apply zone filter
        if (zoneFilter !== "all") {
            const zone = ICELAND_ZONES.find((z) => z.id === zoneFilter)
            if (zone) {
                const [minLat, minLng, maxLat, maxLng] = zone.bounds
                if (
                    quake.latitude < minLat ||
                    quake.latitude > maxLat ||
                    quake.longitude < minLng ||
                    quake.longitude > maxLng
                ) {
                    return false
                }
            }
        }

        return true
    })

    // Toggle sidebar visibility
    const toggleSidebar = () => {
        setShowSidebar(!showSidebar)
    }

    // Toggle between panels or close if already active
    const togglePanel = (panel: "settings" | "list") => {
        setActivePanel(panel)
        setShowSidebar(true)
    }

    // Handle GPS station selection
    const handleSelectGpsStation = (station: CustomGpsStation) => {
        setSelectedGpsStation(station)
    }

    // Add this function to handle seismometer selection:
    const handleSelectSeismometer = (seismometer: CustomSeismometer) => {
        setSelectedSeismometer(seismometer)
    }

    // Detect mobile view
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        // Check on mount
        checkMobile()

        // Add resize listener
        window.addEventListener("resize", checkMobile)

        // Clean up
        return () => window.removeEventListener("resize", checkMobile)
    }, [])

    // Force remount of map component when window is resized
    useEffect(() => {
        const handleResize = () => { }

        // Add resize listener with debounce
        let resizeTimer: NodeJS.Timeout
        window.addEventListener("resize", () => {
            clearTimeout(resizeTimer)
            resizeTimer = setTimeout(handleResize, 500)
        })

        return () => {
            window.removeEventListener("resize", handleResize)
            clearTimeout(resizeTimer)
        }
    }, [])

    // Add an effect to listen for map settings changes and force a map update
    useEffect(() => {
        const handleMapSettingsChanged = (event: CustomEvent) => {
            // Force a re-render of the map component by updating a state
            // This will cause the map to re-read all settings from localStorage
            setMapKey((prev) => prev + 1)
        }

        window.addEventListener("mapSettingsChanged", handleMapSettingsChanged as EventListener)

        return () => {
            window.removeEventListener("mapSettingsChanged", handleMapSettingsChanged as EventListener)
        }
    }, [])

    // Get the currently selected zone
    const selectedZone = ICELAND_ZONES.find((z) => z.id === zoneFilter)

    // Handle map reference from LeafletMap component
    const handleMapReference = (map: any, L: any) => {
        leafletMapRef.current = { map, L }
    }

    // Add state for official GPS stations
    const [selectedOfficialGpsStations, setSelectedOfficialGpsStations] = useState<GpsStationExtended[]>([])

    // Add this function to handle official GPS station selection
    const handleSelectOfficialGpsStation = (station: GpsStationExtended) => {
        // Check if we already have this station open
        if (selectedOfficialGpsStations.some((s) => s.id === station.id)) {
            return
        }

        // Limit to 3 popups max
        if (selectedOfficialGpsStations.length >= 3) {
            // Remove the oldest one
            setSelectedOfficialGpsStations((prev) => [...prev.slice(1), station])
        } else {
            setSelectedOfficialGpsStations((prev) => [...prev, station])
        }
    }

    // Add this function to close an official GPS station popup
    const closeOfficialGpsStation = (stationId: string) => {
        setSelectedOfficialGpsStations((prev) => prev.filter((s) => s.id !== stationId))
    }

    if (isLoading) {
        return (
            <div className="h-full w-full">
                <Skeleton className="h-full w-full bg-gray-800" />
            </div>
        )
    }

    return (
        <div className="relative h-full w-full">
            {/* Map takes full screen */}
            <div className="h-full w-full">
                <LeafletMap
                    key={mapKey}
                    earthquakes={filteredEarthquakes}
                    onSelectEarthquake={setSelectedEarthquake}
                    selectedEarthquake={selectedEarthquake}
                    selectedZone={selectedZone}
                    showSeismicStations={showSeismicStations}
                    showGpsStations={showGpsStations}
                    showSeismometers={showSeismometers}
                    showLavaFlows={showLavaFlows}
                    showBerms={showBerms}
                    showEarthquakes={showEarthquakes}
                    onMapReference={handleMapReference}
                    onSelectGpsStation={handleSelectGpsStation}
                    onSelectSeismometer={handleSelectSeismometer}
                    onSelectOfficialGpsStation={handleSelectOfficialGpsStation}
                />
            </div>

            {/* Fixed error notification bar at the top */}
            {(error || isDataStale) && (
                <div className="fixed top-4 left-0 right-0 z-[1001] flex justify-center">
                    <Alert variant="destructive" className="bg-red-500/90 text-white border-none max-w-md shadow-lg">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error ? `Error: ${error.message}` : "Site not currently updating"}</AlertDescription>
                    </Alert>
                </div>
            )}

            {/* App title overlay */}
            <div className="fixed top-4 left-4 z-[1001] bg-gray-900/80 text-white p-2 rounded-lg shadow-lg">
                <h1 className="text-lg font-bold">Icelandic Earthquake Monitor</h1>
            </div>

            {/* Admin button - positioned in the top right */}
            <div className="fixed top-4 right-4 z-[1001] flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white flex items-center gap-1"
                    onClick={() => setShowNotificationSettings(true)}
                >
                    <Bell className="h-4 w-4" />
                    {recentEarthquakeCount > highActivityThreshold && (
                        <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs rounded-full w-3 h-3"></span>
                    )}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white flex items-center gap-1"
                    onClick={() => {
                        console.log("Opening admin panel", {
                            mapRef: leafletMapRef.current,
                            hasMap: leafletMapRef.current?.map ? true : false,
                            hasL: leafletMapRef.current?.L ? true : false,
                        })
                        setShowAdminPanel(true)
                    }}
                >
                    <Pencil className="h-4 w-4" />
                    <span>Admin</span>
                </Button>
            </div>

            {/* Raspberry Shake button - positioned in the bottom left */}
            <div className="fixed bottom-24 left-4 z-[1001] flex gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white flex items-center gap-1"
                    onClick={() => setShowRaspberryShakeInfo(true)}
                >
                    <Activity className="h-4 w-4" />
                    <span>Seismograms</span>
                </Button>
            </div>

            {/* Buy Me A Coffee button - positioned in the bottom left, above where earthquake details would appear */}
            <div className="fixed bottom-16 left-4 z-[1001]">
                <Button
                    variant="outline"
                    size="sm"
                    className="bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white flex items-center gap-1"
                    onClick={() => setShowDonationInfo(true)}
                >
                    <Coffee className="h-4 w-4" />
                    <span>Support</span>
                </Button>
            </div>

            {/* Control buttons - with updated icons */}
            <div className="fixed bottom-4 left-4 z-[1001] flex gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showSidebar && activePanel === "list" ? "ring-2 ring-white" : ""}`}
                    onClick={() => togglePanel("list")}
                    title="Recent Earthquakes"
                    aria-label="Recent Earthquakes"
                >
                    <Activity className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showSidebar && activePanel === "settings" ? "ring-2 ring-white" : ""}`}
                    onClick={() => togglePanel("settings")}
                    title="Filter Settings"
                    aria-label="Filter Settings"
                >
                    <Settings className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showMapSettings ? "ring-2 ring-white" : ""}`}
                    onClick={() => setShowMapSettings(!showMapSettings)}
                    title="Map Settings"
                    aria-label="Map Settings"
                >
                    <Globe className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showEruptionInfo ? "ring-2 ring-white" : ""}`}
                    onClick={() => setShowEruptionInfo(!showEruptionInfo)}
                    title="Eruption Information"
                    aria-label="Eruption Information"
                >
                    <VolcanoIcon className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showYoutubePlayer ? "ring-2 ring-white" : ""}`}
                    onClick={() => setShowYoutubePlayer(!showYoutubePlayer)}
                    title="Live Feed"
                    aria-label="Live Feed"
                >
                    <Youtube className="h-5 w-5" />
                </Button>

                <Button
                    variant="outline"
                    size="icon"
                    className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showFactsPanel ? "ring-2 ring-white" : ""}`}
                    onClick={() => setShowFactsPanel(!showFactsPanel)}
                    title="Earthquake Facts"
                    aria-label="Earthquake Facts"
                >
                    <BookOpen className="h-5 w-5" />
                </Button>
            </div>

            {/* Sidebar panel - always shown with list by default, replaced with settings when clicked */}
            {showSidebar && (
                <div
                    className={`fixed z-[1002] bg-gray-900/95 border-gray-700 shadow-lg text-white transition-all duration-300 ease-in-out ${isMobile
                            ? "bottom-16 left-0 right-0 max-h-[70vh] rounded-t-xl border-t"
                            : "top-0 bottom-0 right-0 w-80 border-l"
                        }`}
                    style={{ pointerEvents: "auto" }}
                >
                    <div className="flex justify-between items-center p-3 border-b border-gray-700">
                        <h2 className="font-bold">{activePanel === "settings" ? "Settings" : "Recent Earthquakes"}</h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="text-gray-400 hover:text-white hover:bg-gray-800"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: isMobile ? "calc(70vh - 48px)" : "calc(100vh - 48px)" }}>
                        <EarthquakeSidebar
                            earthquakes={filteredEarthquakes}
                            onSelectEarthquake={setSelectedEarthquake}
                            magnitudeRange={magnitudeRange}
                            setMagnitudeRange={setMagnitudeRange}
                            depthRange={depthRange}
                            setDepthRange={setDepthRange}
                            timeFilterRange={timeFilterRange}
                            setTimeFilterRange={setTimeFilterRange}
                            zoneFilter={zoneFilter}
                            setZoneFilter={setZoneFilter}
                            activePanel={activePanel}
                        />
                    </div>
                </div>
            )}

            {/* Earthquake details popup - positioned differently on mobile */}
            {selectedEarthquake && (
                <div className={`fixed z-[1003] max-w-sm ${isMobile ? "bottom-16 left-4 right-4" : "bottom-4 left-4"}`}>
                    <EarthquakeDetails earthquake={selectedEarthquake} onClose={() => setSelectedEarthquake(null)} />
                </div>
            )}

            {/* GPS Station popup - covers left half of screen */}
            {selectedGpsStation && (
                <GpsStationPopup station={selectedGpsStation} onClose={() => setSelectedGpsStation(null)} />
            )}

            {/* Official GPS Station popups - up to 3 at a time */}
            {selectedOfficialGpsStations.map((station, index) => (
                <GpsStationViewer
                    key={station.id}
                    station={station}
                    onClose={() => closeOfficialGpsStation(station.id)}
                    position={index}
                />
            ))}

            {/* Map Settings panel with modal */}
            {showMapSettings && (
                <Modal onClose={() => setShowMapSettings(false)}>
                    <MapSettings onClose={() => setShowMapSettings(false)} />
                </Modal>
            )}

            {/* Eruption Info panel with modal */}
            {showEruptionInfo && (
                <Modal onClose={() => setShowEruptionInfo(false)}>
                    <EruptionInfo onClose={() => setShowEruptionInfo(false)} />
                </Modal>
            )}

            {/* Facts panel with modal */}
            {showFactsPanel && (
                <Modal onClose={() => setShowFactsPanel(false)}>
                    <FactsPanel onClose={() => setShowFactsPanel(false)} />
                </Modal>
            )}

            {/* Donation Info panel with modal */}
            {showDonationInfo && (
                <Modal onClose={() => setShowDonationInfo(false)}>
                    <DonationInfo onClose={() => setShowDonationInfo(false)} />
                </Modal>
            )}

            {/* Raspberry Shake Info panel with modal */}
            {showRaspberryShakeInfo && (
                <Modal onClose={() => setShowRaspberryShakeInfo(false)}>
                    <RaspberryShakeInfo onClose={() => setShowRaspberryShakeInfo(false)} />
                </Modal>
            )}

            {/* Notification Settings panel with modal */}
            {showNotificationSettings && (
                <Modal onClose={() => setShowNotificationSettings(false)}>
                    <NotificationSettings
                        notificationsEnabled={notificationsEnabled}
                        setNotificationsEnabled={setNotificationsEnabled}
                        notificationVolume={notificationVolume}
                        setNotificationVolume={setNotificationVolume}
                        mlwNotificationsEnabled={mlwNotificationsEnabled}
                        setMlwNotificationsEnabled={setMlwNotificationsEnabled}
                    />
                </Modal>
            )}

            {/* Admin Draw Panel - now as a draggable panel */}
            {showAdminPanel && leafletMapRef.current && leafletMapRef.current.map && leafletMapRef.current.L && (
                <DraggablePanel
                    onClose={() => setShowAdminPanel(false)}
                    title="Admin Panel"
                    initialPosition={{ x: 20, y: 60 }}
                    className="w-[450px] h-[600px] max-w-[90vw] max-h-[90vh] admin-panel resize-panel"
                >
                    <AdminDrawPanel
                        map={leafletMapRef.current.map}
                        L={leafletMapRef.current.L}
                        onClose={() => setShowAdminPanel(false)}
                    />
                </DraggablePanel>
            )}

            {/* Seismometer Display - draggable panel */}
            {selectedSeismometer && (
                <DraggablePanel title={`${selectedSeismometer.name} Seismometer`} onClose={() => setSelectedSeismometer(null)}>
                    <SeismometerDisplay seismometer={selectedSeismometer} />
                </DraggablePanel>
            )}

            {/* Youtube Player - centered initially */}
            {showYoutubePlayer && (
                <YoutubePlayer
                    onClose={() => setShowYoutubePlayer(false)}
                    defaultVideoId={localStorage.getItem("earthquakeYoutubeVideoId") || "xDRWMU9JzKA"}
                />
            )}
        </div>
    )
}