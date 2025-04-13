"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Modal } from "@/components/ui/modal"
import { DraggablePanel } from "@/components/draggable-panel"

import { useEarthquakes } from "@/hooks/use-earthquakes"
import { useEarthquakeNotifications } from "@/hooks/use-earthquake-notifications"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useMapLayers } from "@/hooks/use-map-layers"

import { EarthquakeDetails } from "@/components/earthquake-details"
import EarthquakeSidebar from "@/components/earthquake-sidebar"
import MapSettings from "@/components/map-settings"
import WelcomeMessage from "@/components/welcome-message"

import { VolcanoIcon } from "@/components/icons/volcano-icon"
import {
  Activity,
  Bell,
  Layers,
  Settings,
  Info,
  Youtube,
  Coffee,
  BookOpen,
  Globe,
  Pencil,
  AlertCircle,
  X
} from "lucide-react"

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

const NotificationSettings = dynamic(() => import("@/components/notification-settings"), {
  ssr: false,
})

const SeismometerDisplay = dynamic(() => import("@/components/seismometer-display"), {
  ssr: false,
})

const AdminDrawPanel = dynamic(() => import("@/components/admin-draw-panel"), {
  ssr: false,
})

const LeafletMap = dynamic(() => import("@/components/leaflet-map"), {
  ssr: false,
  loading: () => <Skeleton className="h-full w-full bg-gray-800" />,
})

import type { Earthquake } from "@/types/earthquake"
import type { CustomSeismometer } from "@/components/admin-draw-panel"
import { ICELAND_ZONES } from "@/types/zones"

export default function EarthquakeMap() {
  const { earthquakes, isLoading, error, lastUpdated } = useEarthquakes()

  // Selected quake & seismometer states
  const [selectedEarthquake, setSelectedEarthquake] = useState<Earthquake | null>(null)
  const [selectedSeismometer, setSelectedSeismometer] = useState<CustomSeismometer | null>(null)

  // Ranges & filters
  const [magnitudeRange, setMagnitudeRange] = useLocalStorage<[number, number]>("earthquakeMagnitudeRange", [-2, 8])
  const [depthRange, setDepthRange] = useLocalStorage<[number, number]>("earthquakeDepthRange", [0, 25])
  const [timeFilterRange, setTimeFilterRange] = useLocalStorage<[number, number]>("earthquakeTimeFilterRange", [0, 24])
  const [zoneFilter, setZoneFilter] = useLocalStorage("earthquakeZoneFilter", "all")
  const [selectedZone, setSelectedZone] = useState("all")

  // Map layers
  const {
    showSeismicStations,
    showGpsStations,
    showSeismometers,
    showLavaFlows,
    showBerms,
    showEarthquakes
  } = useMapLayers()

  // Local storage for sidebar & panel states
  const [showSidebar, setShowSidebar] = useLocalStorage("earthquakeShowSidebar", true)
  const [activePanel, setActivePanel] = useLocalStorage<"settings" | "list" | null>("earthquakeActivePanel", "list")

  // Additional toggles for modals
  const [showFactsPanel, setShowFactsPanel] = useState(false)
  const [showEruptionInfo, setShowEruptionInfo] = useState(false)
  const [showDonationInfo, setShowDonationInfo] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showRaspberryShakeInfo, setShowRaspberryShakeInfo] = useState(false)
  const [showYoutubePlayer, setShowYoutubePlayer] = useLocalStorage("earthquakeShowYoutubePlayer", false)
  const [showMapSettings, setShowMapSettings] = useState(false)

  // “Welcome message” version checking
  const [showWelcomeMessage, setShowWelcomeMessage] = useLocalStorage("earthquakeWelcomeMessageSeen", true)
  const [welcomeMessageVersion, setWelcomeMessageVersion] = useLocalStorage("earthquakeWelcomeMessageVersion", 0)

  // Map reference
  const leafletMapRef = useRef<{ map: any; L: any } | null>(null)

  // Earthquake notifications
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

  // Mobile detection
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Remount map on resize (debounced)
  useEffect(() => {
    const handleResize = () => { /* your logic if needed */ }
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

  // Global settings changes
  useEffect(() => {
    const handleGlobalSettingsChanged = (event: CustomEvent) => {
      if (event.detail.notificationThreshold) {
        localStorage.setItem("earthquakeHighActivityThreshold", event.detail.notificationThreshold.toString())
      }
    }
    window.addEventListener("globalSettingsChanged", handleGlobalSettingsChanged as EventListener)
    return () => {
      window.removeEventListener("globalSettingsChanged", handleGlobalSettingsChanged as EventListener)
    }
  }, [])

  // Listen for welcome message changes
  useEffect(() => {
    const storedMessage = localStorage.getItem("earthquakeWelcomeMessage")
    if (storedMessage) {
      try {
        const parsed = JSON.parse(storedMessage)
        if (parsed.version > welcomeMessageVersion) {
          setShowWelcomeMessage(true)
          setWelcomeMessageVersion(parsed.version)
        }
      } catch (e) {
        console.error("Error parsing welcome message:", e)
      }
    }
  }, [welcomeMessageVersion, setWelcomeMessageVersion, setShowWelcomeMessage])

  // Filter quake data
  const filteredEarthquakes = earthquakes.filter((quake) => {
    if (quake.size < magnitudeRange[0] || quake.size > magnitudeRange[1]) return false
    if (quake.depth < depthRange[0] || quake.depth > depthRange[1]) return false

    const quakeTime = new Date(quake.timestamp).getTime()
    const now = Date.now()
    const olderCutoff = now - timeFilterRange[1] * 60 * 60 * 1000
    const newerCutoff = now - timeFilterRange[0] * 60 * 60 * 1000
    if (quakeTime < olderCutoff || quakeTime > newerCutoff) return false

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

  // Map reference setter
  const handleMapReference = (map: any, L: any) => {
    leafletMapRef.current = { map, L }
  }

  // Seismometer selection
  const handleSelectSeismometer = (seismometer: CustomSeismometer) => {
    setSelectedSeismometer(seismometer)
  }

  // Is data stale?
  const isDataStale = lastUpdated && Date.now() - lastUpdated > 15000

  // Helper to style top-right icons
  const topRightButtonClasses = (isActive: boolean) =>
    isActive
      ? "bg-white text-black shadow-md hover:bg-white"
      : "bg-slate-900 text-white shadow-md hover:bg-slate-800"

  // --------------- LAYOUT ---------------

  if (isLoading) {
    return (
      <div className="h-full w-full">
        <Skeleton className="h-full w-full bg-gray-800" />
      </div>
    )
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900 text-white">
      {/* MAP */}
      <LeafletMap
        key={Date.now()}
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

      {/* ERROR bar if stale or error */}
      {(error || isDataStale) && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[1001]">
          <Alert variant="destructive" className="bg-red-500/90 text-white border-none shadow-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error ? `Error: ${error.message}` : "Site not currently updating"}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* TOP-LEFT: Gosvörður button */}
      <div className="absolute top-4 left-4 z-[1001]">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 rounded-full shadow hover:bg-slate-800 cursor-pointer">
          <VolcanoIcon className="sidebar-icon h-5 w-5" />
          <span className="font-semibold">Gosvörður</span>
        </div>
      </div>

      {/* TOP-RIGHT: toggles for side panel + admin, with custom dark vs. white logic */}
      <div className="absolute top-4 right-4 z-[1001] flex gap-2">
        {/* Quakes => sets activePanel='list' & showSidebar=true */}
        <button
          className={`rounded-full sidebar-toggle p-2 ${topRightButtonClasses(activePanel === "list" && showSidebar)}`}
          onClick={() => {
            setActivePanel("list")
            setShowSidebar(true)
          }}
          title="Recent Earthquakes"
        >
          <Activity className="sidebar-icon h-5 w-5" />
        </button>

        {/* Filter => sets activePanel='settings' & showSidebar=true */}
        <button
          className={`rounded-full sidebar-toggle p-2 ${topRightButtonClasses(activePanel === "settings" && showSidebar)}`}
          onClick={() => {
            setActivePanel("settings")
            setShowSidebar(true)
          }}
          title="Filter Settings"
        >
          <Settings className="sidebar-icon h-5 w-5" />
        </button>

        {/* Layers => open map settings modal */}
        <button
          className={`rounded-full sidebar-toggle p-2 ${topRightButtonClasses(showMapSettings)}`}
          onClick={() => setShowMapSettings(true)}
          title="Map Layers"
        >
          <Layers className="sidebar-icon h-5 w-5" />
        </button>

        {/* Notifications => open notification settings */}
        <button
          className={`relative rounded-full sidebar-toggle p-2 ${topRightButtonClasses(showNotificationSettings)}`}
          onClick={() => setShowNotificationSettings(true)}
          title="Notifications"
        >
          <Bell className="sidebar-icon h-5 w-5" />
          {recentEarthquakeCount > highActivityThreshold && (
            <span className="absolute sidebar-toggle -top-1 -right-1 bg-yellow-500 text-xs rounded-full w-3 h-3" />
          )}
        </button>

        {/* Admin => show admin panel in DraggablePanel */}
        <button
          className={`rounded-full sidebar-toggle p-2 ${topRightButtonClasses(showAdminPanel)}`}
          onClick={() => setShowAdminPanel(true)}
          title="Admin Panel"
        >
          <Pencil className="sidebar-icon h-5 w-5" />
        </button>
      </div>

      {/* RIGHT SIDEBAR (only if showSidebar = true) */}
      {showSidebar && (
        <div
          className={`sidebar fixed top-0 bottom-0 right-0 w-80 z-[1002] bg-slate-950 border-l border-slate-700 shadow-lg text-white
          transition-all duration-300 ease-in-out ${isMobile ? "max-h-[70vh] bottom-16" : ""}`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-3 border-b border-slate-700">
            <h2 className="font-bold">
              {activePanel === "settings" ? "Filter Settings" : "Recent Earthquakes"}
            </h2>
            <Button variant="ghost" size="icon" onClick={() => setShowSidebar(false)}>
              <X className="h-4 w-4 text-slate-400" />
            </Button>
          </div>

          {/* Sidebar body */}
          <div
            className="overflow-auto"
            style={{
              maxHeight: isMobile ? "calc(70vh - 48px)" : "calc(100vh - 48px)",
            }}
          >
            {/* EarthquakeSidebar if panel = list */}
            {activePanel === "list" && (
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
            )}
            {/* Show filter UI if panel = settings */}
            {activePanel === "settings" && (
              <div className="p-4 text-sm">
                <p>Your custom Filter UI here, or reuse EarthquakeSidebar with a different mode!</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOTTOM-RIGHT: 5 modals => about/facts, eruption, youtube, rshake, coffee */}
      <div className="absolute bottom-4 right-4 z-[1001] flex flex-col gap-2">
        <button
          className="rounded-full p-2 bg-slate-900 text-white shadow-md hover:bg-slate-800"
          onClick={() => setShowFactsPanel(true)}
          title="Facts/About"
        >
          <Info className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 bg-slate-900 text-white shadow-md hover:bg-slate-800"
          onClick={() => setShowEruptionInfo(true)}
          title="Eruption Info"
        >
          <VolcanoIcon className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 bg-slate-900 text-white shadow-md hover:bg-slate-800"
          onClick={() => setShowYoutubePlayer(!showYoutubePlayer)}
          title="YouTube Feed"
        >
          <Youtube className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 bg-slate-900 text-white shadow-md hover:bg-slate-800"
          onClick={() => setShowRaspberryShakeInfo(true)}
          title="Raspberry Shake"
        >
          <Activity className="h-5 w-5" />
        </button>
        <button
          className="rounded-full p-2 bg-slate-900 text-white shadow-md hover:bg-slate-800"
          onClick={() => setShowDonationInfo(true)}
          title="Buy Me a Coffee"
        >
          <Coffee className="h-5 w-5" />
        </button>
      </div>

      {/* Earthquake details pop-up (mobile vs. desktop) */}
      {selectedEarthquake && (
        <div className={`fixed z-[1003] max-w-sm ${isMobile ? "bottom-16 left-4 right-4" : "bottom-4 left-4"}`}>
          <EarthquakeDetails
            earthquake={selectedEarthquake}
            onClose={() => setSelectedEarthquake(null)}
          />
        </div>
      )}

      {/* Eruption Info panel */}
      {showEruptionInfo && (
        <Modal onClose={() => setShowEruptionInfo(false)}>
          <EruptionInfo onClose={() => setShowEruptionInfo(false)} />
        </Modal>
      )}

      {/* Facts panel */}
      {showFactsPanel && (
        <Modal onClose={() => setShowFactsPanel(false)}>
          <FactsPanel onClose={() => setShowFactsPanel(false)} />
        </Modal>
      )}

      {/* Donation Info panel */}
      {showDonationInfo && (
        <Modal onClose={() => setShowDonationInfo(false)}>
          <DonationInfo onClose={() => setShowDonationInfo(false)} />
        </Modal>
      )}

      {/* Raspberry Shake Info panel */}
      {showRaspberryShakeInfo && (
        <Modal onClose={() => setShowRaspberryShakeInfo(false)}>
          <RaspberryShakeInfo onClose={() => setShowRaspberryShakeInfo(false)} />
        </Modal>
      )}

      {/* Notification Settings panel */}
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

      {/* Map settings */}
      {showMapSettings && (
        <Modal onClose={() => setShowMapSettings(false)}>
          <MapSettings onClose={() => setShowMapSettings(false)} />
        </Modal>
      )}

      {/* Admin panel */}
      {showAdminPanel && leafletMapRef.current?.map && leafletMapRef.current?.L && (
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

      {/* Seismometer Display */}
      {selectedSeismometer && (
        <DraggablePanel
          title={`${selectedSeismometer.name} Seismometer`}
          onClose={() => setSelectedSeismometer(null)}
        >
          <SeismometerDisplay
            seismometer={selectedSeismometer}
            onClose={() => setSelectedSeismometer(null)}
          />
        </DraggablePanel>
      )}

      {/* Welcome Message */}
      {showWelcomeMessage && (
        <WelcomeMessage onClose={() => setShowWelcomeMessage(false)} />
      )}

      {/* YouTube Player */}
      {showYoutubePlayer && (
        <YoutubePlayer
          defaultVideoId={localStorage.getItem("earthquakeYoutubeVideoId") || "xDRWMU9JzKA"}
          onClose={() => setShowYoutubePlayer(false)}
        />
      )}
    </div>
  )
}
