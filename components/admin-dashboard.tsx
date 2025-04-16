"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import {
  Save,
  RefreshCw,
  Globe,
  MessageSquare,
  Bell,
  BookOpen,
  Database,
  ExternalLink,
  AlertTriangle,
} from "lucide-react"
import ReferencesPopup from "@/components/references-popup"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EXTENDED_GPS_STATIONS } from "@/data/gps-stations-extended"

export default function AdminDashboard() {
  // Add this state for managing the References popup
  const [showReferences, setShowReferences] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("welcome")
  const [apiError, setApiError] = useState<string | null>(null)

  // Welcome message state
  const [welcomeMessage, setWelcomeMessage] = useLocalStorage<{
    title: string
    content: string
    version: number
  }>("earthquakeWelcomeMessage", {
    title: "Welcome to Icelandic Earthquake Monitor",
    content:
      "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
    version: 1,
  })

  // Local state for editing
  const [editTitle, setEditTitle] = useState(welcomeMessage.title)
  const [editContent, setEditContent] = useState(welcomeMessage.content)

  // Global settings state
  const [globalSettings, setGlobalSettings] = useLocalStorage<{
    apiEndpoint: string
    refreshInterval: number
    notificationThreshold: number
    version: number
  }>("earthquakeGlobalSettings", {
    apiEndpoint: "https://api.vedur.is/skjalftalisa/v1/quake/array",
    refreshInterval: 10,
    notificationThreshold: 30,
    version: 1,
  })

  // Local state for editing global settings
  const [editApiEndpoint, setEditApiEndpoint] = useState(globalSettings.apiEndpoint)
  const [editRefreshInterval, setEditRefreshInterval] = useState(globalSettings.refreshInterval.toString())
  const [editNotificationThreshold, setEditNotificationThreshold] = useState(
    globalSettings.notificationThreshold.toString(),
  )

  // GPS station links state
  const [gpsStationLinks, setGpsStationLinks] = useState<Record<string, string>>({})
  const [selectedStation, setSelectedStation] = useState("")
  const [stationUrl, setStationUrl] = useState("")

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      setApiError(null)

      try {
        // First check Redis connection
        const redisStatusRes = await fetch("/api/redis-status")
        const redisStatus = await redisStatusRes.json()

        if (!redisStatus.success) {
          setApiError("Redis connection failed. Changes will be saved locally only.")
          console.warn("Redis connection failed:", redisStatus.error)
          // Continue with local data
          setIsLoading(false)
          return
        }

        // Fetch welcome message
        const welcomeRes = await fetch("/api/settings/welcome")
        if (welcomeRes.ok) {
          const { data } = await welcomeRes.json()
          if (data) {
            setWelcomeMessage(data)
            setEditTitle(data.title)
            setEditContent(data.content)
          }
        } else {
          const errorData = await welcomeRes.json()
          console.warn("Welcome message fetch failed:", errorData)
          // Continue with local data
        }

        // Fetch global settings
        const settingsRes = await fetch("/api/settings/global")
        if (settingsRes.ok) {
          const { data } = await settingsRes.json()
          if (data) {
            setGlobalSettings(data)
            setEditApiEndpoint(data.apiEndpoint)
            setEditRefreshInterval(data.refreshInterval.toString())
            setEditNotificationThreshold(data.notificationThreshold.toString())
          }
        } else {
          const errorData = await settingsRes.json()
          console.warn("Global settings fetch failed:", errorData)
          // Continue with local data
        }

        // Fetch GPS station links
        const stationsRes = await fetch("/api/gps-stations")
        if (stationsRes.ok) {
          const { data } = await stationsRes.json()
          if (data) {
            setGpsStationLinks(data)
          }
        } else {
          const errorData = await stationsRes.json()
          console.warn("GPS stations fetch failed:", errorData)
          // Continue with local data
        }
      } catch (error) {
        console.error("Error fetching data:", error)
        setApiError("Failed to connect to the server. Using local data instead.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Save welcome message
  const saveWelcomeMessage = async () => {
    setIsSaving(true)
    setApiError(null)

    try {
      const updatedMessage = {
        title: editTitle,
        content: editContent,
        version: welcomeMessage.version + 1,
      }

      // Always update local storage first
      setWelcomeMessage(updatedMessage)

      try {
        const response = await fetch("/api/settings/welcome", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedMessage),
        })

        if (response.ok) {
          // Show success notification
          toast({
            title: "Success",
            description: "Welcome message updated successfully!",
          })
        } else {
          const errorData = await response.json()
          console.warn("Welcome message update failed:", errorData)
          toast({
            title: "Warning",
            description: "Saved locally but failed to update on server.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error saving welcome message to server:", error)
        toast({
          title: "Warning",
          description: "Saved locally but failed to update on server.",
          variant: "destructive",
        })
      }

      // Dispatch a custom event to notify components to update
      const event = new CustomEvent("welcomeMessageChanged", {
        detail: updatedMessage,
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error saving welcome message:", error)
      setApiError("Failed to save welcome message. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update welcome message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Save global settings
  const saveGlobalSettings = async () => {
    setIsSaving(true)
    setApiError(null)

    try {
      const updatedSettings = {
        apiEndpoint: editApiEndpoint,
        refreshInterval: Number.parseInt(editRefreshInterval, 10) || 10,
        notificationThreshold: Number.parseInt(editNotificationThreshold, 10) || 30,
        version: globalSettings.version + 1,
      }

      // Always update local storage first
      setGlobalSettings(updatedSettings)

      try {
        const response = await fetch("/api/settings/global", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedSettings),
        })

        if (response.ok) {
          // Show success notification
          toast({
            title: "Success",
            description: "Global settings updated successfully!",
          })
        } else {
          const errorData = await response.json()
          console.warn("Global settings update failed:", errorData)
          toast({
            title: "Warning",
            description: "Saved locally but failed to update on server.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error saving global settings to server:", error)
        toast({
          title: "Warning",
          description: "Saved locally but failed to update on server.",
          variant: "destructive",
        })
      }

      // Dispatch a custom event to notify components to update
      const event = new CustomEvent("globalSettingsChanged", {
        detail: updatedSettings,
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error saving global settings:", error)
      setApiError("Failed to save global settings. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update global settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Save GPS station link
  const saveGpsStationLink = async () => {
    if (!selectedStation || !stationUrl) {
      toast({
        title: "Error",
        description: "Please select a station and enter a URL",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    setApiError(null)

    try {
      // Update local state first
      const updatedLinks = {
        ...gpsStationLinks,
        [selectedStation]: stationUrl,
      }
      setGpsStationLinks(updatedLinks)

      try {
        const response = await fetch("/api/gps-stations", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stationId: selectedStation,
            link: stationUrl,
          }),
        })

        if (response.ok) {
          // Show success notification
          toast({
            title: "Success",
            description: "GPS station link updated successfully!",
          })
        } else {
          const errorData = await response.json()
          console.warn("GPS station link update failed:", errorData)
          toast({
            title: "Warning",
            description: "Saved locally but failed to update on server.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Error saving GPS station link to server:", error)
        toast({
          title: "Warning",
          description: "Saved locally but failed to update on server.",
          variant: "destructive",
        })
      }

      // Reset form
      setSelectedStation("")
      setStationUrl("")

      // Dispatch a custom event to notify components to update
      const event = new CustomEvent("gpsStationLinksChanged", {
        detail: updatedLinks,
      })
      window.dispatchEvent(event)
    } catch (error) {
      console.error("Error saving GPS station link:", error)
      setApiError("Failed to save GPS station link. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update GPS station link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle station selection
  const handleStationSelect = (stationId: string) => {
    setSelectedStation(stationId)
    // If we have a saved URL for this station, populate the input
    if (gpsStationLinks[stationId]) {
      setStationUrl(gpsStationLinks[stationId])
    } else {
      setStationUrl("")
    }
  }

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          onClick={() => setShowReferences(true)}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700"
        >
          <BookOpen className="h-4 w-4" />
          <span>References</span>
        </Button>
      </div>

      {apiError && (
        <div className="mb-4 p-4 bg-yellow-900/50 border border-yellow-700 rounded-md flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-yellow-500 font-medium">Connection Warning</p>
            <p className="text-yellow-400/80 text-sm">{apiError}</p>
            <p className="text-yellow-400/80 text-sm mt-1">
              Changes will be saved locally and synchronized when the connection is restored.
            </p>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="welcome" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Welcome Message</span>
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Global Settings</span>
          </TabsTrigger>
          <TabsTrigger value="gps" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span>GPS Stations</span>
          </TabsTrigger>
        </TabsList>

        {/* Welcome Message Tab */}
        <TabsContent value="welcome" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Edit Welcome Message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="welcome-title">Title</Label>
                <Input
                  id="welcome-title"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-content">Message Content</Label>
                <Textarea
                  id="welcome-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  disabled={isLoading || isSaving}
                />
              </div>

              <div className="pt-2">
                <Button onClick={saveWelcomeMessage} className="w-full" disabled={isLoading || isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Welcome Message
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-400 pt-2">
                <p>Current version: {welcomeMessage.version}</p>
                <p>Last updated: {new Date().toLocaleString()}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 p-4 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-white">{editTitle}</h3>
                <p className="text-sm text-gray-300">{editContent}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="global" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Global Application Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-endpoint">API Endpoint</Label>
                <Input
                  id="api-endpoint"
                  value={editApiEndpoint}
                  onChange={(e) => setEditApiEndpoint(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isLoading || isSaving}
                />
                <p className="text-xs text-gray-400">The endpoint for earthquake data</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  min="10"
                  max="60"
                  value={editRefreshInterval}
                  onChange={(e) => setEditRefreshInterval(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isLoading || isSaving}
                />
                <p className="text-xs text-gray-400">
                  How often to fetch new earthquake data (minimum 10 seconds recommended)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-threshold">Notification Threshold</Label>
                <Input
                  id="notification-threshold"
                  type="number"
                  min="5"
                  max="100"
                  value={editNotificationThreshold}
                  onChange={(e) => setEditNotificationThreshold(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  disabled={isLoading || isSaving}
                />
                <p className="text-xs text-gray-400">Number of earthquakes per hour to trigger high activity mode</p>
              </div>

              <div className="pt-2">
                <Button onClick={saveGlobalSettings} className="w-full" disabled={isLoading || isSaving}>
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Update Global Settings
                    </>
                  )}
                </Button>
              </div>

              <div className="text-xs text-gray-400 pt-2">
                <p>Current version: {globalSettings.version}</p>
                <p>Last updated: {new Date().toLocaleString()}</p>
                <p className="mt-2 text-yellow-400">
                  <Bell className="h-3 w-3 inline mr-1" />
                  Changes will be applied to all instances of the application
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* GPS Stations Tab */}
        <TabsContent value="gps" className="space-y-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">GPS Station Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="station-select">Select GPS Station</Label>
                <Select value={selectedStation} onValueChange={handleStationSelect} disabled={isLoading || isSaving}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Select a GPS station" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    {EXTENDED_GPS_STATIONS.map((station) => (
                      <SelectItem key={station.id} value={station.id} className="text-white hover:bg-gray-700">
                        {station.id} - {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="station-url">Data URL</Label>
                <Input
                  id="station-url"
                  value={stationUrl}
                  onChange={(e) => setStationUrl(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="e.g., https://strokkur.raunvis.hi.is/gpsweb/index.php?id=REYK"
                  disabled={isLoading || isSaving || !selectedStation}
                />
                <p className="text-xs text-gray-400">URL to the station's data page or visualization</p>
              </div>

              <div className="pt-2">
                <Button
                  onClick={saveGpsStationLink}
                  className="w-full"
                  disabled={isLoading || isSaving || !selectedStation || !stationUrl}
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save GPS Station Link
                    </>
                  )}
                </Button>
              </div>

              <div className="mt-6 border-t border-gray-700 pt-4">
                <h3 className="font-medium mb-3">Current GPS Station Links</h3>
                {Object.keys(gpsStationLinks).length === 0 ? (
                  <p className="text-gray-400 text-sm">No custom links added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(gpsStationLinks).map(([stationId, url]) => {
                      const station = EXTENDED_GPS_STATIONS.find((s) => s.id === stationId)
                      return (
                        <div key={stationId} className="p-3 bg-gray-700 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-white">
                                {station ? `${station.name} (${stationId})` : stationId}
                              </h4>
                              <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                              >
                                {url}
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </a>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedStation(stationId)
                                setStationUrl(url)
                                // Scroll to the top of the tab
                                document.querySelector(".bg-gray-800")?.scrollIntoView({ behavior: "smooth" })
                              }}
                              className="text-gray-400 hover:text-white"
                            >
                              Edit
                            </Button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* References Popup */}
      {showReferences && <ReferencesPopup onClose={() => setShowReferences(false)} />}
    </div>
  )
}
