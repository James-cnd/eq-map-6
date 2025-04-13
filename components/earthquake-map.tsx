"use client"

import { useState, useEffect, useRef } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { useEarthquakes } from "@/hooks/use-earthquakes"
import { useEarthquakeNotifications } from "@/hooks/use-earthquake-notifications"
import { EarthquakeDetails } from "@/components/earthquake-details"
import type { Earthquake } from "@/types/earthquake"
import { ICELAND_ZONES } from "@/types/zones"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Settings, Globe, BookOpen, Activity, Coffee, Pencil, Bell, Youtube, Layers } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import EarthquakeSidebar from "@/components/earthquake-sidebar"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { DraggablePanel } from "@/components/draggable-panel"
import { useMapLayers } from "@/hooks/use-map-layers"
import { useRouter } from "next/navigation"

// Replace static imports with dynamic imports for heavy components

// Dynamically import heavy components
const FactsPanel = dynamic(() => import("@/components/facts-panel"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-900 text-white">Loading facts...</div>,
})

const EruptionInfo = dynamic(() => import("@/components/eruption-info"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-900 text-white">Loading eruption info...</div>,
})

const DonationInfo = dynamic(() => import("@/components/donation-info"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-900 text-white">Loading donation info...</div>,
})

const RaspberryShakeInfo = dynamic(() => import("@/components/raspberry-shake-info"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-900 text-white">Loading seismogram info...</div>,
})

const YoutubePlayer = dynamic(() => import("@/components/youtube-player"), {
  ssr: false,
  loading: () => <div className="p-4 bg-gray-900 text-white">Loading YouTube player...</div>,
})

// The AdminDrawPanel is already dynamically imported
import NotificationSettings from "@/components/notification-settings"
import SeismometerDisplay from "@/components/seismometer-display"

import type { CustomSeismometer } from "@/components/admin-draw-panel"

// Add the import for the volcano icon
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

// Add this import at the top of the file
import WelcomeMessage from "@/components/welcome-message"

// Add import after other imports
import MapSettings from "@/components/map-settings"

// Make sure the component is exported as default
export default function EarthquakeMap() {
  const router = useRouter()
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null)
  const [magnitudeRange, setMagnitudeRange] = useLocalStorage<[number, number]>("earthquakeMagnitudeRange", [-2, 8])
  const [depthRange, setDepthRange] = useLocalStorage<[number, number]>("earthquakeDepthRange", [0, 25])
  const [timeFilterRange, setTimeFilterRange] = useLocalStorage<[number, number]>("earthquakeTimeFilterRange", [0, 24])
  const [zoneFilter, setZoneFilter] = useLocalStorage("earthquakeZoneFilter", "all")
  const { earthquakes, isLoading, error, lastUpdated } = useEarthquakes()
  const [selectedSeismometer, setSelectedSeismometer] = useState<CustomSeismometer | null>(null)
  const [mapKey, setMapKey] = useState(0)

  // Use our map layers hook for all layer visibility states
  const {
    showSeismicStations,
    showGpsStations,
    showSeismometers,
    showLavaFlows,
    showBerms,
    showEarthquakes
  } = useMapLayers()

  // Use localStorage to remember panel visibility preferences
  const [showSidebar, setShowSidebar] = useLocalStorage("earthquakeShowSidebar", true)
  // Default to "list" panel always
  const [activePanel, setActivePanel] = useLocalStorage<"settings" | "list" | null>("earthquakeActivePanel", "list")

  // Add states for showing facts panel, eruption info, and donation info
  const [showFactsPanel, setShowFactsPanel] = useState(false)
  const [showEruptionInfo, setShowEruptionInfo] = useState(false)
  const [showDonationInfo, setShowDonationInfo] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showRaspberryShakeInfo, setShowRaspberryShakeInfo] = useState(false)
  const [showYoutubePlayer, setShowYoutubePlayer] = useLocalStorage("earthquakeShowYoutubePlayer", false)
  const [showMapSettings, setShowMapSettings] = useState(false)

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

  // Handle map reference from LeafletMap component
  const handleMapReference = (map: any, L: any) => {
    leafletMapRef.current = { map, L }
  }

  // Add this state inside the component
  const [showWelcomeMessage, setShowWelcomeMessage] = useLocalStorage("earthquakeWelcomeMessageSeen", true)
  const [welcomeMessageVersion, setWelcomeMessageVersion] = useLocalStorage("earthquakeWelcomeMessageVersion", 0)

  // Add this effect to check for welcome message updates
  useEffect(() => {
    // Check if the welcome message has been updated
    const storedMessage = localStorage.getItem("earthquakeWelcomeMessage")
    if (storedMessage) {
      try {
        const parsedMessage = JSON.parse(storedMessage)
        if (parsedMessage.version > welcomeMessageVersion) {
          // New version of welcome message, show it again
          setShowWelcomeMessage(true)
          setWelcomeMessageVersion(parsedMessage.version)
        }
      } catch (e) {
        console.error("Error parsing welcome message:", e)
      }
    }
  }, [setShowWelcomeMessage, welcomeMessageVersion, setWelcomeMessageVersion])

  // Add this effect to listen for global settings changes
  useEffect(() => {
    const handleGlobalSettingsChanged = (event: CustomEvent) => {
      // Update application settings based on global changes
      console.log("Global settings changed:", event.detail)

      // Force refresh data or update UI as needed
      // This could trigger a refresh of earthquake data, update notification thresholds, etc.

      // For example, to update the notification threshold:
      if (event.detail.notificationThreshold) {
        // Update the local notification threshold
        localStorage.setItem("earthquakeHighActivityThreshold", event.detail.notificationThreshold.toString())
      }

      // To update the refresh interval:
      if (event.detail.refreshInterval) {
        // This would require a restart of the polling mechanism
        // You could dispatch another event that the useEarthquakes hook listens for
      }
    }

    window.addEventListener("globalSettingsChanged", handleGlobalSettingsChanged as EventListener)

    return () => {
      window.removeEventListener("globalSettingsChanged", handleGlobalSettingsChanged as EventListener)
    }
  }, [])

  // Declare selectedZone with a default value (e.g., "all")
  const [selectedZone, setSelectedZone] = useState("all")

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
          selectedZone={ICELAND_ZONES.find((z) => z.id === selectedZone)}
          showSeismicStations={showSeismicStations}
          showGpsStations={showGpsStations}
          showSeismometers={showSeismometers}
          showLavaFlows={showLavaFlows}
          showBerms={showBerms}
          showEarthquakes={showEarthquakes}
          onMapReference={handleMapReference}
          onSelectSeismometer={handleSelectSeismometer}
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
        {/* Notification button removed from here */}
        <Button
          variant="outline"
          size="sm"
          className="bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white flex items-center gap-1"
          onClick={() => router.push('/admin')}
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
        {/* Map Settings button */}
        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showMapSettings ? "ring-2 ring-white" : ""}`}
          onClick={() => setShowMapSettings(true)}
          title="Map Layer Settings"
          aria-label="Map Layer Settings"
        >
          <Layers className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showSidebar && activePanel === "list" ? "ring-2 ring-white" : ""
            }`}
          onClick={() => togglePanel("list")}
          title="Recent Earthquakes"
          aria-label="Recent Earthquakes"
        >
          <Activity className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showSidebar && activePanel === "settings" ? "ring-2 ring-white" : ""
            }`}
          onClick={() => togglePanel("settings")}
          title="Filter Settings"
          aria-label="Filter Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showEruptionInfo ? "ring-2 ring-white" : ""
            }`}
          onClick={() => setShowEruptionInfo(!showEruptionInfo)}
          title="Eruption Information"
          aria-label="Eruption Information"
        >
          <VolcanoIcon className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showYoutubePlayer ? "ring-2 ring-white" : ""
            }`}
          onClick={() => setShowYoutubePlayer(!showYoutubePlayer)}
          title="Live Feed"
          aria-label="Live Feed"
        >
          <Youtube className="h-5 w-5" />
        </Button>

        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showFactsPanel ? "ring-2 ring-white" : ""
            }`}
          onClick={() => setShowFactsPanel(!showFactsPanel)}
          title="Earthquake Facts"
          aria-label="Earthquake Facts"
        >
          <BookOpen className="h-5 w-5" />
        </Button>

        {/* Notification button added here */}
        <Button
          variant="outline"
          size="icon"
          className={`bg-gray-900/80 border-gray-700 hover:bg-gray-800 text-white ${showNotificationSettings ? "ring-2 ring-white" : ""
            }`}
          onClick={() => setShowNotificationSettings(true)}
          title="Notification Settings"
          aria-label="Notification Settings"
        >
          <Bell className="h-5 w-5" />
          {recentEarthquakeCount > highActivityThreshold && (
            <span className="absolute -top-1 -right-1 bg-yellow-500 text-xs rounded-full w-3 h-3"></span>
          )}
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
              <Globe className="h-4 w-4" />
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
            onClose={() => setShowNotificationSettings(false)}
            notificationsEnabled={notificationsEnabled}
            setNotificationsEnabled={setNotificationsEnabled}
            notificationVolume={notificationVolume}
            setNotificationVolume={setNotificationVolume}
            recentEarthquakeCount={recentEarthquakeCount}
            highActivityThreshold={highActivityThreshold}
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
          <SeismometerDisplay
            seismometer={selectedSeismometer}
            onClose={() => setSelectedSeismometer(null)}
          />
        </DraggablePanel>
      )}

      {showWelcomeMessage && <WelcomeMessage onClose={() => setShowWelcomeMessage(false)} />}

      {/* Add the welcome message component to the JSX, right before the closing </div> of the main component */}
      {showYoutubePlayer && (
        <YoutubePlayer
          defaultVideoId={localStorage.getItem("earthquakeYoutubeVideoId") || "xDRWMU9JzKA"}
          onClose={() => setShowYoutubePlayer(false)}
        />
      )}

      {/* Add MapSettings modal */}
      {showMapSettings && (
        <Modal onClose={() => setShowMapSettings(false)}>
          <MapSettings onClose={() => setShowMapSettings(false)} />
        </Modal>
      )}
    </div>
  )
}