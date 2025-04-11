"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Lock } from "lucide-react"

// Import AdminDashboard - this one exists
import AdminDashboard from "@/components/admin-dashboard"

// Comment out imports for components that don't exist yet
// import FissurePanel from "@/components/fissure-panel"
// import LavaFlowPanel from "@/components/lava-flow-panel"
// import BermPanel from "@/components/berm-panel"
// import GpsPanel from "@/components/gps-panel"
// import SeismometerPanel from "@/components/seismometer-panel"
// import YoutubePanel from "@/components/youtube-panel"

// Export types that were previously defined in this file
export interface CustomFissure {
  id: string
  name: string
  color: string
  coordinates: [number, number][][]
  startDate: string
  endDate?: string
  eruption: string
}

export interface LavaFlow {
  id: string
  name: string
  color: string
  coordinates: [number, number][][]
  startDate: string
  endDate?: string
  opacity: number
  description?: string
}

export interface Berm {
  id: string
  name: string
  color: string // Always brown
  coordinates: [number, number][][]
  constructionDate: string
  completionDate?: string
  description?: string
}

export interface CustomSeismometer {
  id: string
  name: string
  stationCode: string
  channel: string
  coordinates: [number, number]
  description?: string
  dateAdded: string
}

interface AdminDrawPanelProps {
  onClose: () => void
  map: any
  L: any
}

export default function AdminDrawPanel({ onClose, map, L }: AdminDrawPanelProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [authAttempts, setAuthAttempts] = useState(0)
  const [activeTab, setActiveTab] = useState("dashboard") // Changed default to dashboard
  const [drawControlLoaded, setDrawControlLoaded] = useState(false)
  const [isLoadingDrawTools, setIsLoadingDrawTools] = useState(false)
  const [showLogoutButton, setShowLogoutButton] = useState(false)

  // Refs for Leaflet draw control and drawn items
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const customDrawControlRef = useRef<HTMLDivElement | null>(null)
  const saveButtonRef = useRef<HTMLDivElement | null>(null)

  // Authentication handler
  const handleAuthenticate = () => {
    // Check for correct credentials
    if (username === "jameshowell.wr@gmail.com" && password === "Climate1!") {
      setIsAuthenticated(true)
      setError("")

      // Simulate sending an email alert
      console.log(`ALERT: Admin login detected from ${window.location.hostname} at ${new Date().toISOString()}`)

      // Show alert notification
      alert(`Login successful. An alert has been sent to ${username}`)

      // Load Leaflet.Draw after authentication
      loadLeafletDraw()
    } else {
      setAuthAttempts((prev) => prev + 1)
      setError(`Invalid credentials. Attempt ${authAttempts + 1}`)
    }
  }

  // Load Leaflet.Draw plugin
  const loadLeafletDraw = async () => {
    if (!map || !L) {
      setError("Map not available. Please refresh and try again.")
      return
    }

    setIsLoadingDrawTools(true)
    setError("")

    try {
      // Create a feature group to store editable layers
      drawnItemsRef.current = new L.FeatureGroup()
      map.addLayer(drawnItemsRef.current)

      // Dynamically load the Leaflet.Draw CSS
      const linkElement = document.createElement("link")
      linkElement.rel = "stylesheet"
      linkElement.href = "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.css"
      document.head.appendChild(linkElement)

      // Dynamically load the Leaflet.Draw script
      const script = document.createElement("script")
      script.src = "https://unpkg.com/leaflet-draw@1.0.4/dist/leaflet.draw.js"
      script.async = true

      script.onload = () => {
        // Now that the script is loaded, initialize the drawing tools
        initializeDrawingTools()
        setDrawControlLoaded(true)
        setIsLoadingDrawTools(false)

        // Create our custom drawing control
        createCustomDrawControl()
      }

      script.onerror = (e) => {
        console.error("Failed to load Leaflet.Draw script:", e)
        setError("Failed to load drawing tools. Please refresh and try again.")
        setIsLoadingDrawTools(false)
      }

      document.body.appendChild(script)
    } catch (error) {
      console.error("Error loading Leaflet.Draw:", error)
      setError("Failed to load drawing tools. Please refresh and try again.")
      setIsLoadingDrawTools(false)
    }
  }

  // Initialize Leaflet.Draw plugin
  const initializeDrawingTools = () => {
    if (!map || !L || !window.L.drawVersion) {
      console.error("Leaflet.Draw not properly loaded")
      setError("Drawing tools not available. Please refresh and try again.")
      return
    }

    try {
      // If we already have drawing tools, remove them first
      if (drawControlRef.current) {
        map.removeControl(drawControlRef.current)
      }

      // Initialize the draw control and pass it the feature group
      drawControlRef.current = new window.L.Control.Draw({
        position: "topleft", // This will be hidden but we need it for the functionality
        draw: {
          polyline: {
            shapeOptions: {
              color: "#FF0000",
              weight: 8,
            },
            repeatMode: true, // Allow drawing multiple lines without having to click the draw button again
          },
          polygon: {
            shapeOptions: {
              color: "#FF6600",
              weight: 2,
              fillColor: "#FF6600",
              fillOpacity: 0.4,
            },
            allowIntersection: false,
            drawError: {
              color: "#e1e100",
              message: "<strong>Error:</strong> Polygon edges cannot cross!",
            },
            showArea: true,
            repeatMode: true,
          },
          circle: false,
          rectangle: false,
          marker: false,
          circlemarker: false,
        },
        edit: {
          featureGroup: drawnItemsRef.current,
        },
      })

      map.addControl(drawControlRef.current)

      // Hide the default Leaflet.Draw control
      setTimeout(() => {
        const defaultDrawControl = document.querySelector(".leaflet-draw.leaflet-control")
        if (defaultDrawControl) {
          ; (defaultDrawControl as HTMLElement).style.display = "none"
        }
      }, 100)

      // Set up map click handler
      map.off("click", handleMapClick)
      map.on("click", handleMapClick)

      // Load existing custom items
      loadCustomItems()
    } catch (error) {
      console.error("Error initializing drawing tools:", error)
      setError("Failed to initialize drawing tools. Please refresh and try again.")
    }
  }

  // Create a custom drawing control
  const createCustomDrawControl = () => {
    if (!map || !L || !window.L.drawVersion) return

    // Remove existing custom control if it exists
    if (customDrawControlRef.current) {
      customDrawControlRef.current.remove()
    }

    // Create a custom div for our drawing tools
    const customControl = document.createElement("div")
    customControl.className = "custom-draw-control"
    customControl.style.position = "absolute"
    customControl.style.left = "10px"
    customControl.style.top = "120px" // Position below the website name
    customControl.style.zIndex = "2000"
    customControl.style.backgroundColor = "rgba(40, 40, 40, 0.9)"
    customControl.style.padding = "8px"
    customControl.style.borderRadius = "4px"
    customControl.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)"

    // Create a button for drawing lines
    const drawLineButton = document.createElement("button")
    drawLineButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3l18 18"/></svg>'
    drawLineButton.title = "Draw Line"
    drawLineButton.style.display = "block"
    drawLineButton.style.width = "30px"
    drawLineButton.style.height = "30px"
    drawLineButton.style.backgroundColor = "#333"
    drawLineButton.style.border = "1px solid #555"
    drawLineButton.style.borderRadius = "4px"
    drawLineButton.style.color = "white"
    drawLineButton.style.cursor = "pointer"
    drawLineButton.style.marginBottom = "5px"

    drawLineButton.addEventListener("click", () => {
      // Trigger the draw polyline action
      if (drawControlRef.current) {
        const drawPolylineButton = document.querySelector(".leaflet-draw-draw-polyline")
        if (drawPolylineButton) {
          ; (drawPolylineButton as HTMLElement).click()
        }
      }
    })

    // Create a button for drawing polygons
    const drawPolygonButton = document.createElement("button")
    drawPolygonButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/></svg>'
    drawPolygonButton.title = "Draw Polygon"
    drawPolygonButton.style.display = "block"
    drawPolygonButton.style.width = "30px"
    drawPolygonButton.style.height = "30px"
    drawPolygonButton.style.backgroundColor = "#333"
    drawPolygonButton.style.border = "1px solid #555"
    drawPolygonButton.style.borderRadius = "4px"
    drawPolygonButton.style.color = "white"
    drawPolygonButton.style.cursor = "pointer"
    drawPolygonButton.style.marginBottom = "5px"

    drawPolygonButton.addEventListener("click", () => {
      // Trigger the draw polygon action
      if (drawControlRef.current) {
        const drawPolygonButton = document.querySelector(".leaflet-draw-draw-polygon")
        if (drawPolygonButton) {
          ; (drawPolygonButton as HTMLElement).click()
        }
      }
    })

    // Create a button for editing
    const editButton = document.createElement("button")
    editButton.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>'
    editButton.title = "Edit Shapes"
    editButton.style.display = "block"
    editButton.style.width = "30px"
    editButton.style.height = "30px"
    editButton.style.backgroundColor = "#333"
    editButton.style.border = "1px solid #555"
    editButton.style.borderRadius = "4px"
    editButton.style.color = "white"
    editButton.style.cursor = "pointer"

    editButton.addEventListener("click", () => {
      // Trigger the edit action
      if (drawControlRef.current) {
        const editButton = document.querySelector(".leaflet-draw-edit-edit")
        if (editButton) {
          ; (editButton as HTMLElement).click()
        }
      }
    })

    // Add buttons to the control
    customControl.appendChild(drawLineButton)
    customControl.appendChild(drawPolygonButton)
    customControl.appendChild(editButton)

    // Add the control to the map
    document.querySelector(".leaflet-container")?.appendChild(customControl)

    // Store reference to the custom control
    customDrawControlRef.current = customControl
  }

  // Load existing custom items onto the map
  const loadCustomItems = () => {
    if (!drawnItemsRef.current || !L) return

    // This function will be implemented in the child components
    // Each component will handle loading its own items
  }

  // Handle map click for location selection
  const handleMapClick = (e: any) => {
    // This will be handled by the child components
    // We just need to set up the event listener here
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (drawControlRef.current && map) {
        map.removeControl(drawControlRef.current)
      }
      if (map) {
        map.off("click", handleMapClick)
      }
      if (customDrawControlRef.current) {
        customDrawControlRef.current.remove()
      }
      if (saveButtonRef.current) {
        saveButtonRef.current.remove()
      }
    }
  }, [map])

  // Update draw control when active tab changes
  useEffect(() => {
    if (isAuthenticated && drawControlLoaded) {
      initializeDrawingTools()
    }
  }, [activeTab, isAuthenticated, drawControlLoaded])

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUsername("")
    setPassword("")
    if (drawControlRef.current) {
      map.removeControl(drawControlRef.current)
    }
    // Clean up any admin-specific UI elements
    setDrawControlLoaded(false)
  }

  // Login form
  if (!isAuthenticated) {
    return (
      <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-md">
        <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg text-white">Admin Access</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-center mb-4">
              <Lock className="h-12 w-12 text-gray-400" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <Input
                id="username"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter your email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-800 border-gray-700"
                placeholder="Enter password"
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button className="w-full" onClick={handleAuthenticate}>
              Authenticate
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Admin drawing panel with tabs
  return (
    <div className="w-full h-full overflow-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-7 mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="fissures">Fissures</TabsTrigger>
          <TabsTrigger value="lavaFlows">Lava Flows</TabsTrigger>
          <TabsTrigger value="berms">Berms</TabsTrigger>
          <TabsTrigger value="gps">GPS</TabsTrigger>
          <TabsTrigger value="seismometers">Seismometers</TabsTrigger>
          <TabsTrigger value="youtube">Live Feed</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>

        {/* Fissure Drawing Tab */}
        <TabsContent value="fissures">
          <div className="p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-medium mb-4">Fissure Management</h3>
            <p className="text-gray-400 mb-4">
              This feature is currently under development. You will be able to draw and manage fissures on the map.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </TabsContent>

        {/* Lava Flows Tab */}
        <TabsContent value="lavaFlows">
          <div className="p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-medium mb-4">Lava Flow Management</h3>
            <p className="text-gray-400 mb-4">
              This feature is currently under development. You will be able to draw and manage lava flows on the map.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </TabsContent>

        {/* Berms Tab */}
        <TabsContent value="berms">
          <div className="p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-medium mb-4">Berm Management</h3>
            <p className="text-gray-400 mb-4">
              This feature is currently under development. You will be able to draw and manage berms on the map.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </TabsContent>

        {/* GPS Stations Tab */}
        <TabsContent value="gps">
          <div className="p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-medium mb-4">GPS Station Management</h3>
            <p className="text-gray-400 mb-4">
              This feature is currently under development. You will be able to add and manage GPS stations on the map.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </TabsContent>

        {/* Seismometers Tab */}
        <TabsContent value="seismometers">
          <div className="p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-medium mb-4">Seismometer Management</h3>
            <p className="text-gray-400 mb-4">
              This feature is currently under development. You will be able to add and manage seismometers on the map.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </TabsContent>

        {/* YouTube Management Tab */}
        <TabsContent value="youtube">
          <div className="p-4 bg-gray-800 rounded-md">
            <h3 className="text-lg font-medium mb-4">Live Feed Management</h3>
            <p className="text-gray-400 mb-4">
              This feature is currently under development. You will be able to manage YouTube live feeds.
            </p>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </TabsContent>
      </Tabs>
      {isAuthenticated && (
        <Button
          onClick={handleLogout}
          className="absolute top-4 right-4 bg-red-600 hover:bg-red-700"
        >
          Logout
        </Button>
      )}
    </div>
  )
}
