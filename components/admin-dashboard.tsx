"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Save, RefreshCw, Globe, MessageSquare, Bell, BookOpen } from "lucide-react"
import ReferencesPopup from "@/components/references-popup"

export default function AdminDashboard() {
  // Add this state for managing the References popup
  const [showReferences, setShowReferences] = useState(false)

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

  // Save welcome message
  const saveWelcomeMessage = () => {
    const updatedMessage = {
      title: editTitle,
      content: editContent,
      version: welcomeMessage.version + 1,
    }

    setWelcomeMessage(updatedMessage)

    // Show success notification
    showSuccessNotification("Welcome message updated successfully!")

    // Dispatch a custom event to notify components to update
    const event = new CustomEvent("welcomeMessageChanged", {
      detail: updatedMessage,
    })
    window.dispatchEvent(event)
  }

  // Save global settings
  const saveGlobalSettings = () => {
    setGlobalSettings({
      apiEndpoint: editApiEndpoint,
      refreshInterval: Number.parseInt(editRefreshInterval, 10) || 10,
      notificationThreshold: Number.parseInt(editNotificationThreshold, 10) || 30,
      version: globalSettings.version + 1,
    })

    // Show success notification
    showSuccessNotification("Global settings updated successfully!")

    // Dispatch a custom event to notify components to update
    const event = new CustomEvent("globalSettingsChanged", {
      detail: {
        apiEndpoint: editApiEndpoint,
        refreshInterval: Number.parseInt(editRefreshInterval, 10) || 10,
        notificationThreshold: Number.parseInt(editNotificationThreshold, 10) || 30,
        version: globalSettings.version + 1,
      },
    })
    window.dispatchEvent(event)
  }

  // Show success notification
  const showSuccessNotification = (message: string) => {
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
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
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

      <Tabs defaultValue="welcome" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="welcome" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Welcome Message</span>
          </TabsTrigger>
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Global Settings</span>
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
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcome-content">Message Content</Label>
                <Textarea
                  id="welcome-content"
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                />
              </div>

              <div className="pt-2">
                <Button onClick={saveWelcomeMessage} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Save Welcome Message
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
                />
                <p className="text-xs text-gray-400">The endpoint for earthquake data</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refresh-interval">Refresh Interval (seconds)</Label>
                <Input
                  id="refresh-interval"
                  type="number"
                  min="5"
                  max="60"
                  value={editRefreshInterval}
                  onChange={(e) => setEditRefreshInterval(e.target.value)}
                  className="bg-gray-700 border-gray-600 text-white"
                />
                <p className="text-xs text-gray-400">How often to fetch new earthquake data</p>
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
                />
                <p className="text-xs text-gray-400">Number of earthquakes per hour to trigger high activity mode</p>
              </div>

              <div className="pt-2">
                <Button onClick={saveGlobalSettings} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Update Global Settings
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
      </Tabs>

      {/* References Popup */}
      {showReferences && <ReferencesPopup onClose={() => setShowReferences(false)} />}
    </div>
  )
}
