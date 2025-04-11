"use client"

import React, { useState, useEffect, useRef, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Save, Trash2, Lock, MapPin, Plus, Play, Edit, Check } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { CustomGpsStation } from "@/types/stations"
import type { Seismometer } from "@/types/seismometer"
import type { LavaFlow as LavaFlowType } from "@/types/lava-flow"
import type { Berm as BermType } from "@/types/berm"
import { GPS_STATIONS as OFFICIAL_GPS_STATIONS } from "@/data/gps-stations"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { EXTENDED_GPS_STATIONS } from "@/data/gps-stations-extended"
import AdminDashboard from "@/components/admin-dashboard"

// Declare window.L type
declare global {
  interface Window {
    L: any;
  }
}

interface AdminDrawPanelProps {
  onClose: () => void
  map: any
  L: any
}

// Define the custom fissure type
export interface CustomFissure {
  id: string
  name: string
  color: string
  coordinates: [number, number][][]
  startDate: string
  endDate?: string
  eruption: string
}

// Define the lava flow type
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

// Define the berm type
export interface Berm {
  id: string
  name: string
  color: string // Always brown
  coordinates: [number, number][][]
  constructionDate: string
  completionDate?: string
  description?: string
}

// Define the custom seismometer type for export
export interface CustomSeismometer extends Seismometer { }

// Define the YouTube feed type
interface YouTubeFeed {
  id: string
  name: string
  videoId: string
  isDefault?: boolean
}

export default function AdminDrawPanel({ onClose, map, L }: AdminDrawPanelProps) {
  // Update the state to include username
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [authAttempts, setAuthAttempts] = useState(0)
  const [customFissures, setCustomFissures] = useLocalStorage<CustomFissure[]>("earthquakeCustomFissures", [])
  const [customGpsStations, setCustomGpsStations] = useLocalStorage<CustomGpsStation[]>(
    "earthquakeCustomGpsStations",
    [],
  )
  const [customSeismometers, setCustomSeismometers] = useLocalStorage<CustomSeismometer[]>(
    "earthquakeCustomSeismometers",
    [],
  )
  const [lavaFlows, setLavaFlows] = useLocalStorage<LavaFlowType[]>("earthquakeLavaFlows", [])
  const [berms, setBerms] = useLocalStorage<BermType[]>("earthquakeBerms", [])
  const [activeTab, setActiveTab] = useState("fissures")
  const [drawControlLoaded, setDrawControlLoaded] = useState(false)
  const [isLoadingDrawTools, setIsLoadingDrawTools] = useState(false)
  // Then, add a new state for the selected GPS station from the dropdown
  // Add this with the other state declarations
  const [selectedExistingGpsStation, setSelectedExistingGpsStation] = useState("")

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentColor, setCurrentColor] = useState("#FF0000")
  const [currentName, setCurrentName] = useState("")
  const [currentStartDate, setCurrentStartDate] = useState(new Date().toISOString().split("T")[0])
  const [currentEndDate, setCurrentEndDate] = useState("")
  const [currentEruption, setCurrentEruption] = useState("Sundhnúkur 2023-2024")
  const [drawnLines, setDrawnLines] = useState<any[]>([])
  const [drawnPolygons, setDrawnPolygons] = useState<any[]>([])
  const [saveButtonVisible, setSaveButtonVisible] = useState(false)
  const [drawingMode, setDrawingMode] = useState<"fissure" | "lavaFlow" | "berm">("fissure")

  // Lava flow state
  const [lavaFlowName, setLavaFlowName] = useState("")
  const [lavaFlowStartDate, setLavaFlowStartDate] = useState(new Date().toISOString().split("T")[0])
  const [lavaFlowEndDate, setLavaFlowEndDate] = useState("")
  const [lavaFlowColor, setLavaFlowColor] = useState("#FF6600")
  const [lavaFlowOpacity, setLavaFlowOpacity] = useState(0.4)
  const [lavaFlowDescription, setLavaFlowDescription] = useState("")

  // Berm state
  const [bermName, setBermName] = useState("")
  const [bermConstructionDate, setBermConstructionDate] = useState(new Date().toISOString().split("T")[0])
  const [bermCompletionDate, setBermCompletionDate] = useState("")
  const [bermDescription, setBermDescription] = useState("")
  // Berms are always brown
  const bermColor = "#8B4513"

  // GPS station state
  const [stationName, setStationName] = useState("")
  const [stationLatitude, setStationLatitude] = useState("")
  const [stationLongitude, setStationLongitude] = useState("")
  const [stationDescription, setStationDescription] = useState("")
  const [stationUrl, setStationUrl] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [isSelectingLocation, setIsSelectingLocation] = useState(false)
  const locationMarkerRef = useRef<any>(null)

  // Seismometer state
  const [seismometerName, setSeismometerName] = useState("")
  const [seismometerLatitude, setSeismometerLatitude] = useState("")
  const [seismometerLongitude, setSeismometerLongitude] = useState("")
  const [seismometerDescription, setSeismometerDescription] = useState("")
  const [seismometerStationCode, setSeismometerStationCode] = useState("")
  const [seismometerChannel, setSeismometerChannel] = useState("EHZ")
  const [isSelectingSeismometerLocation, setIsSelectingSeismometerLocation] = useState(false)
  const seismometerLocationMarkerRef = useRef<any>(null)

  // YouTube feed state
  const [customVideoId, setCustomVideoId] = useState("")
  const [customVideoName, setCustomVideoName] = useState("")
  const [youtubeFeeds, setYoutubeFeeds] = useLocalStorage<YouTubeFeed[]>("earthquakeYoutubeFeeds", [
    { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
    { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
    { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
  ])
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null)
  const [editFeedName, setEditFeedName] = useState("")
  const [editFeedVideoId, setEditFeedVideoId] = useState("")

  // Refs for Leaflet draw control and drawn items
  const drawControlRef = useRef<any>(null)
  const drawnItemsRef = useRef<any>(null)
  const customDrawControlRef = useRef<HTMLDivElement | null>(null)
  const saveButtonRef = useRef<HTMLDivElement | null>(null)

  // Add a new state for the official GPS station selection
  const [selectedOfficialGpsStation, setSelectedOfficialGpsStation] = useState("")

  // Update the authentication check function
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

  // Create a save button on the map
  const createSaveButton = () => {
    if (!map) return

    // Remove existing save button if it exists
    if (saveButtonRef.current) {
      saveButtonRef.current.remove()
      saveButtonRef.current = null
    }

    if (!saveButtonVisible) return

    // Create a custom div for our save button
    const saveButtonDiv = document.createElement("div")
    saveButtonDiv.className = "save-fissure-button"
    saveButtonDiv.style.position = "absolute"
    saveButtonDiv.style.right = "10px"
    saveButtonDiv.style.bottom = "120px"
    saveButtonDiv.style.zIndex = "2000"
    saveButtonDiv.style.backgroundColor = "rgba(0, 128, 0, 0.9)"
    saveButtonDiv.style.padding = "10px 15px"
    saveButtonDiv.style.borderRadius = "4px"
    saveButtonDiv.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)"
    saveButtonDiv.style.color = "white"
    saveButtonDiv.style.fontWeight = "bold"
    saveButtonDiv.style.cursor = "pointer"
    saveButtonDiv.style.display = "flex"
    saveButtonDiv.style.alignItems = "center"
    saveButtonDiv.style.gap = "5px"

    // Set the button text based on the drawing mode
    let buttonText = "Save Fissure"
    if (drawingMode === "lavaFlow") {
      buttonText = "Save Lava Flow"
    } else if (drawingMode === "berm") {
      buttonText = "Save Berm"
    }

    saveButtonDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      ${buttonText}
    `

    // Set the click handler based on the drawing mode
    if (drawingMode === "fissure") {
      saveButtonDiv.addEventListener("click", saveFissure)
    } else if (drawingMode === "lavaFlow") {
      saveButtonDiv.addEventListener("click", saveLavaFlow)
    } else if (drawingMode === "berm") {
      saveButtonDiv.addEventListener("click", saveBerm)
    }

    // Add the button to the map
    document.querySelector(".leaflet-container")?.appendChild(saveButtonDiv)

    // Store reference to the save button
    saveButtonRef.current = saveButtonDiv
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
              color: activeTab === "berms" ? bermColor : currentColor,
              weight: 8,
            },
            repeatMode: true, // Allow drawing multiple lines without having to click the draw button again
          },
          polygon: {
            shapeOptions: {
              color: lavaFlowColor,
              weight: 2,
              fillColor: lavaFlowColor,
              fillOpacity: lavaFlowOpacity,
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

      // Handle created items
      map.on(window.L.Draw.Event.CREATED, (e: any) => {
        const layer = e.layer
        drawnItemsRef.current.addLayer(layer)

        // Handle different layer types
        if (e.layerType === "polyline") {
          // Add the new line to our collection
          setDrawnLines((prev) => [...prev, layer])

          // Set drawing mode based on active tab
          if (activeTab === "fissures") {
            setDrawingMode("fissure")
          } else if (activeTab === "berms") {
            setDrawingMode("berm")
          }
        } else if (e.layerType === "polygon") {
          // Add the new polygon to our collection
          setDrawnPolygons((prev) => [...prev, layer])
          setDrawingMode("lavaFlow")
        }

        // Show the save button
        setSaveButtonVisible(true)

        // Set drawing mode
        setIsDrawing(true)

        // Auto-generate a name for the item based on the date if not already set
        if (!currentName && drawingMode === "fissure") {
          const today = new Date()
          const formattedDate = today.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          setCurrentName(`Fissure ${formattedDate}`)
        } else if (!lavaFlowName && drawingMode === "lavaFlow") {
          const today = new Date()
          const formattedDate = today.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          setLavaFlowName(`Lava Flow ${formattedDate}`)
        } else if (!bermName && drawingMode === "berm") {
          const today = new Date()
          const formattedDate = today.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })
          setBermName(`Berm ${formattedDate}`)
        }
      })

      // Load existing custom items
      loadCustomItems()

      // Set up click handler for GPS station location selection
      map.on("click", handleMapClick)

      setDrawControlLoaded(true)
    } catch (error) {
      console.error("Error initializing drawing tools:", error)
      setError("Failed to initialize drawing tools. Please refresh and try again.")
    }

    // Make sure we remove any existing click handlers first
    map.off("click", handleMapClick)
    // Then add our click handler
    map.on("click", handleMapClick)
  }

  // Load existing custom items onto the map
  const loadCustomItems = () => {
    if (!drawnItemsRef.current || !L) return

    // Clear existing layers
    drawnItemsRef.current.clearLayers()

    // Add each custom fissure to the map
    customFissures.forEach((fissure) => {
      fissure.coordinates.forEach((coords) => {
        const polyline = L.polyline(coords, {
          color: fissure.color,
          weight: 8,
        })
        drawnItemsRef.current.addLayer(polyline)
      })
    })

    // Add each custom lava flow to the map
    lavaFlows.forEach((lavaFlow) => {
      lavaFlow.coordinates.forEach((coords) => {
        const polygon = L.polygon(coords, {
          color: lavaFlow.color,
          weight: 2,
          fillColor: lavaFlow.color,
          fillOpacity: lavaFlow.opacity,
        })
        drawnItemsRef.current.addLayer(polygon)
      })
    })

    // Add each custom berm to the map
    berms.forEach((berm) => {
      berm.coordinates.forEach((coords) => {
        const polyline = L.polyline(coords, {
          color: bermColor, // Brown color for berms
          weight: 5,
        })
        drawnItemsRef.current.addLayer(polyline)
      })
    })
  }

  // Handle map click for GPS station location selection
  const handleMapClick = (e: any) => {
    // Check if we're in selection mode
    if (!isSelectingLocation && !isSelectingSeismometerLocation) return

    const { lat, lng } = e.latlng
    console.log("Map clicked at:", lat, lng)
    console.log(
      "Selection mode:",
      isSelectingLocation ? "GPS" : isSelectingSeismometerLocation ? "Seismometer" : "None",
    )

    if (isSelectingLocation) {
      // GPS station selection
      setSelectedLocation([lat, lng])
      setStationLatitude(lat.toFixed(6))
      setStationLongitude(lng.toFixed(6))

      // Update or add marker with a more visible icon
      if (locationMarkerRef.current) {
        map.removeLayer(locationMarkerRef.current)
      }

      // Create a more visible marker
      locationMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `
          <div style="
            background-color: #FF3B30; 
            width: 16px; 
            height: 16px; 
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.7);
            animation: pulse 1.5s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
        zIndexOffset: 2000, // Ensure it's above other markers
      }).addTo(map)

      // Add a popup to confirm the selection
      locationMarkerRef.current
        .bindPopup(`
        <div style="text-align: center;">
          <strong>Selected Location</strong><br>
          ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </div>
      `)
        .openPopup()

      // Exit selection mode
      setIsSelectingLocation(false)

      // Show confirmation message
      alert(`GPS Station location selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    } else if (isSelectingSeismometerLocation) {
      // Seismometer selection
      setSeismometerLatitude(lat.toFixed(6))
      setSeismometerLongitude(lng.toFixed(6))

      // Update or add marker with a more visible icon
      if (seismometerLocationMarkerRef.current) {
        map.removeLayer(seismometerLocationMarkerRef.current)
      }

      // Create a more visible marker
      seismometerLocationMarkerRef.current = L.marker([lat, lng], {
        icon: L.divIcon({
          html: `
          <div style="
            background-color: #3498DB; 
            width: 16px; 
            height: 16px; 
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 0 10px rgba(0,0,0,0.7);
            animation: pulse 1.5s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.3); opacity: 0.7; }
              100% { transform: scale(1); opacity: 1; }
            }
          </style>
        `,
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        }),
        zIndexOffset: 2000, // Ensure it's above other markers
      }).addTo(map)

      // Add a popup to confirm the selection
      seismometerLocationMarkerRef.current
        .bindPopup(`
        <div style="text-align: center;">
          <strong>Selected Seismometer Location</strong><br>
          ${lat.toFixed(6)}, ${lng.toFixed(6)}
        </div>
      `)
        .openPopup()

      // Exit selection mode
      setIsSelectingSeismometerLocation(false)

      // Show confirmation message
      alert(`Seismometer location selected: ${lat.toFixed(6)}, ${lng.toFixed(6)}`)
    }
  }

  // Replace the startLocationSelection function with this improved version:
  const startLocationSelection = () => {
    // Clear any existing marker first
    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current)
      locationMarkerRef.current = null
    }

    // Set selection mode flag
    setIsSelectingLocation(true)

    // Add a class to the map container to change the cursor
    const mapContainer = document.querySelector(".leaflet-container")
    if (mapContainer) {
      mapContainer.classList.add("selecting-location")
    }

    // Create a temporary helper marker that follows the mouse
    const helperDiv = document.createElement("div")
    helperDiv.className = "location-selection-helper"
    helperDiv.style.position = "fixed"
    helperDiv.style.zIndex = "3000"
    helperDiv.style.pointerEvents = "none"
    helperDiv.style.backgroundColor = "rgba(255, 59, 48, 0.8)"
    helperDiv.style.color = "white"
    helperDiv.style.padding = "8px 12px"
    helperDiv.style.borderRadius = "4px"
    helperDiv.style.fontWeight = "bold"
    helperDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)"
    helperDiv.textContent = "Click on the map to select GPS station location"
    document.body.appendChild(helperDiv)

    // Update helper position on mouse move
    const updateHelperPosition = (e: MouseEvent) => {
      helperDiv.style.left = `${e.clientX + 15}px`
      helperDiv.style.top = `${e.clientY + 15}px`
    }

    document.addEventListener("mousemove", updateHelperPosition)

    // Show a more prominent alert
    const alertBox = document.createElement("div")
    alertBox.className = "selection-alert"
    alertBox.style.position = "fixed"
    alertBox.style.top = "50%"
    alertBox.style.left = "50%"
    alertBox.style.transform = "translate(-50%, -50%)"
    alertBox.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
    alertBox.style.color = "white"
    alertBox.style.padding = "20px"
    alertBox.style.borderRadius = "8px"
    alertBox.style.zIndex = "3000"
    alertBox.style.textAlign = "center"
    alertBox.style.maxWidth = "80%"
    alertBox.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)"
    alertBox.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 18px;">GPS Station Selection Mode Active</h3>
      <p style="margin-bottom: 15px;">Click anywhere on the map to select the GPS station location.</p>
      <button id="cancel-selection" style="background-color: #444; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
    `
    document.body.appendChild(alertBox)

    // Handle cancel button
    document.getElementById("cancel-selection")?.addEventListener("click", () => {
      setIsSelectingLocation(false)
      document.body.removeChild(alertBox)
      document.body.removeChild(helperDiv)
      document.removeEventListener("mousemove", updateHelperPosition)

      // Remove the selecting-location class
      if (mapContainer) {
        mapContainer.classList.remove("selecting-location")
      }
    })

    // Clean up when selection is made
    const cleanupSelectionMode = () => {
      if (document.body.contains(alertBox)) {
        document.body.removeChild(alertBox)
      }
      if (document.body.contains(helperDiv)) {
        document.body.removeChild(helperDiv)
      }
      document.removeEventListener("mousemove", updateHelperPosition)

      // Remove the selecting-location class
      if (mapContainer) {
        mapContainer.classList.remove("selecting-location")
      }
    }

    // Set up a listener to clean up when selection is made
    const checkSelectionStatus = setInterval(() => {
      if (!isSelectingLocation) {
        cleanupSelectionMode()
        clearInterval(checkSelectionStatus)
      }
    }, 500)
  }

  // Replace the startSeismometerLocationSelection function with this improved version:
  const startSeismometerLocationSelection = () => {
    // Clear any existing marker first
    if (seismometerLocationMarkerRef.current) {
      map.removeLayer(seismometerLocationMarkerRef.current)
      seismometerLocationMarkerRef.current = null
    }

    // Set selection mode flag
    setIsSelectingSeismometerLocation(true)

    // Add a class to the map container to change the cursor
    const mapContainer = document.querySelector(".leaflet-container")
    if (mapContainer) {
      mapContainer.classList.add("selecting-location")
    }

    // Create a temporary helper marker that follows the mouse
    const helperDiv = document.createElement("div")
    helperDiv.className = "location-selection-helper"
    helperDiv.style.position = "fixed"
    helperDiv.style.zIndex = "3000"
    helperDiv.style.pointerEvents = "none"
    helperDiv.style.backgroundColor = "rgba(52, 152, 219, 0.8)"
    helperDiv.style.color = "white"
    helperDiv.style.padding = "8px 12px"
    helperDiv.style.borderRadius = "4px"
    helperDiv.style.fontWeight = "bold"
    helperDiv.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)"
    helperDiv.textContent = "Click on the map to select seismometer location"
    document.body.appendChild(helperDiv)

    // Update helper position on mouse move
    const updateHelperPosition = (e: MouseEvent) => {
      helperDiv.style.left = `${e.clientX + 15}px`
      helperDiv.style.top = `${e.clientY + 15}px`
    }

    document.addEventListener("mousemove", updateHelperPosition)

    // Show a more prominent alert
    const alertBox = document.createElement("div")
    alertBox.className = "selection-alert"
    alertBox.style.position = "fixed"
    alertBox.style.top = "50%"
    alertBox.style.left = "50%"
    alertBox.style.transform = "translate(-50%, -50%)"
    alertBox.style.backgroundColor = "rgba(0, 0, 0, 0.8)"
    alertBox.style.color = "white"
    alertBox.style.padding = "20px"
    alertBox.style.borderRadius = "8px"
    alertBox.style.zIndex = "3000"
    alertBox.style.textAlign = "center"
    alertBox.style.maxWidth = "80%"
    alertBox.style.boxShadow = "0 4px 20px rgba(0,0,0,0.5)"
    alertBox.innerHTML = `
      <h3 style="margin-top: 0; margin-bottom: 10px; font-size: 18px;">Seismometer Selection Mode Active</h3>
      <p style="margin-bottom: 15px;">Click anywhere on the map to select the seismometer location.</p>
      <button id="cancel-selection" style="background-color: #444; border: none; color: white; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
    `
    document.body.appendChild(alertBox)

    // Handle cancel button
    document.getElementById("cancel-selection")?.addEventListener("click", () => {
      setIsSelectingSeismometerLocation(false)
      document.body.removeChild(alertBox)
      document.body.removeChild(helperDiv)
      document.removeEventListener("mousemove", updateHelperPosition)

      // Remove the selecting-location class
      if (mapContainer) {
        mapContainer.classList.remove("selecting-location")
      }
    })

    // Clean up when selection is made
    const cleanupSelectionMode = () => {
      if (document.body.contains(alertBox)) {
        document.body.removeChild(alertBox)
      }
      if (document.body.contains(helperDiv)) {
        document.body.removeChild(helperDiv)
      }
      document.removeEventListener("mousemove", updateHelperPosition)

      // Remove the selecting-location class
      if (mapContainer) {
        mapContainer.classList.remove("selecting-location")
      }
    }

    // Set up a listener to clean up when selection is made
    const checkSelectionStatus = setInterval(() => {
      if (!isSelectingSeismometerLocation) {
        cleanupSelectionMode()
        clearInterval(checkSelectionStatus)
      }
    }, 500)
  }

  // Save the current drawn fissure
  const saveFissure = () => {
    if (!drawnItemsRef.current || drawnLines.length === 0) {
      setError("No fissure drawn. Please draw a line on the map.")
      return
    }

    // Validate inputs
    if (!currentName.trim()) {
      setError("Please enter a name for the fissure")
      return
    }

    // Extract coordinates from drawn layers
    const newCoordinates: [number, number][][] = []

    drawnLines.forEach((layer) => {
      if (layer instanceof L.Polyline) {
        const latLngs = layer.getLatLngs()
        const coords = latLngs.map((latLng: any) => [latLng.lat, latLng.lng] as [number, number])
        newCoordinates.push(coords)
      }
    })

    if (newCoordinates.length === 0) {
      setError("No fissure drawn. Please draw a line on the map.")
      return
    }

    // Create new fissure object
    const newFissure: CustomFissure = {
      id: `custom-${Date.now()}`,
      name: currentName,
      color: currentColor,
      coordinates: newCoordinates,
      startDate: currentStartDate,
      eruption: currentEruption,
    }

    if (currentEndDate) {
      newFissure.endDate = currentEndDate
    }

    // Add to custom fissures
    setCustomFissures([...customFissures, newFissure])

    // Enable the new fissure automatically
    const currentEnabled = JSON.parse(localStorage.getItem("earthquakeEnabledFissures") || "[]")
    localStorage.setItem("earthquakeEnabledFissures", JSON.stringify([...currentEnabled, newFissure.id]))

    // Dispatch event to update map immediately
    const event = new CustomEvent("mapSettingsChanged", {
      detail: {
        showFissures: true,
        enabledFissures: [...currentEnabled, newFissure.id]
      }
    })
    window.dispatchEvent(event)

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
    notification.textContent = `Fissure "${currentName}" saved successfully!`

    document.body.appendChild(notification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)

    // Reset form
    setCurrentName("")
    setIsDrawing(false)
    setSaveButtonVisible(false)
    setDrawnLines([])
    drawnItemsRef.current.clearLayers()
    setError("")
  }

  // Save a lava flow
  const saveLavaFlow = () => {
    if (!drawnItemsRef.current || drawnPolygons.length === 0) {
      setError("No lava flow drawn. Please draw a polygon on the map.")
      return
    }

    // Validate inputs
    if (!lavaFlowName.trim()) {
      setError("Please enter a name for the lava flow")
      return
    }

    // Extract coordinates from drawn layers
    const newCoordinates: [number, number][][] = []

    drawnPolygons.forEach((layer) => {
      if (layer instanceof L.Polygon) {
        const latLngs = layer.getLatLngs()[0] // Get the first ring of coordinates
        const coords = latLngs.map((latLng: any) => [latLng.lat, latLng.lng] as [number, number])
        newCoordinates.push(coords)
      }
    })

    if (newCoordinates.length === 0) {
      setError("No lava flow drawn. Please draw a polygon on the map.")
      return
    }

    // Create new lava flow object
    const newLavaFlow: LavaFlowType = {
      id: `lava-${Date.now()}`,
      name: lavaFlowName,
      color: lavaFlowColor,
      coordinates: newCoordinates,
      startDate: lavaFlowStartDate,
      opacity: lavaFlowOpacity,
      description: lavaFlowDescription,
    }

    if (lavaFlowEndDate) {
      newLavaFlow.endDate = lavaFlowEndDate
    }

    // Add to lava flows
    setLavaFlows([...lavaFlows, newLavaFlow])

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
    notification.textContent = `Lava Flow "${lavaFlowName}" saved successfully!`

    document.body.appendChild(notification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)

    // Reset form
    setLavaFlowName("")
    setLavaFlowDescription("")
    setIsDrawing(false)
    setSaveButtonVisible(false)
    setDrawnPolygons([])
    drawnItemsRef.current.clearLayers()
    setError("")
  }

  // Save a berm
  const saveBerm = () => {
    if (!drawnItemsRef.current || drawnLines.length === 0) {
      setError("No berm drawn. Please draw a line on the map.")
      return
    }

    // Validate inputs
    if (!bermName.trim()) {
      setError("Please enter a name for the berm")
      return
    }

    // Extract coordinates from drawn layers
    const newCoordinates: [number, number][][] = []

    drawnLines.forEach((layer) => {
      if (layer instanceof L.Polyline) {
        const latLngs = layer.getLatLngs()
        const coords = latLngs.map((latLng: any) => [latLng.lat, latLng.lng] as [number, number])
        newCoordinates.push(coords)
      }
    })

    if (newCoordinates.length === 0) {
      setError("No berm drawn. Please draw a line on the map.")
      return
    }

    // Create new berm object
    const newBerm: BermType = {
      id: `berm-${Date.now()}`,
      name: bermName,
      color: bermColor,
      coordinates: newCoordinates,
      constructionDate: bermConstructionDate,
      description: bermDescription,
    }

    if (bermCompletionDate) {
      newBerm.completionDate = bermCompletionDate
    }

    // Add to berms
    setBerms([...berms, newBerm])

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
    notification.textContent = `Berm "${bermName}" saved successfully!`

    document.body.appendChild(notification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)

    // Reset form
    setBermName("")
    setBermDescription("")
    setIsDrawing(false)
    setSaveButtonVisible(false)
    setDrawnLines([])
    drawnItemsRef.current.clearLayers()
    setError("")
  }

  // Save a new GPS station
  const saveGpsStation = () => {
    // Validate inputs
    if (!stationName.trim()) {
      setError("Please enter a name for the GPS station")
      return
    }

    if (!stationLatitude || !stationLongitude) {
      setError("Please select a location for the GPS station")
      return
    }

    if (!stationUrl.trim()) {
      setError("Please enter a URL for the GPS station data")
      return
    }

    // Create new GPS station object
    const newStation: CustomGpsStation = {
      id: `gps-${Date.now()}`,
      name: stationName,
      coordinates: [Number.parseFloat(stationLatitude), Number.parseFloat(stationLongitude)],
      description: stationDescription,
      url: stationUrl,
      dateAdded: new Date().toISOString(),
    }

    // Add to custom GPS stations
    setCustomGpsStations([...customGpsStations, newStation])

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
    notification.textContent = `GPS Station "${stationName}" saved successfully!`

    document.body.appendChild(notification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)

    // Reset form
    setStationName("")
    setStationLatitude("")
    setStationLongitude("")
    setStationDescription("")
    setStationUrl("")
    setSelectedLocation(null)
    setError("")

    // Remove temporary marker
    if (locationMarkerRef.current) {
      map.removeLayer(locationMarkerRef.current)
      locationMarkerRef.current = null
    }
  }

  // Save a new seismometer
  const saveSeismometer = () => {
    // Validate inputs
    if (!seismometerName.trim()) {
      setError("Please enter a name for the seismometer")
      return
    }

    if (!seismometerLatitude || !seismometerLongitude) {
      setError("Please select a location for the seismometer")
      return
    }

    if (!seismometerStationCode.trim()) {
      setError("Please enter a station code for the seismometer")
      return
    }

    // Create new seismometer object
    const newSeismometer: Seismometer = {
      id: `seismometer-${Date.now()}`,
      name: seismometerName,
      stationCode: seismometerStationCode,
      channel: seismometerChannel,
      coordinates: [Number.parseFloat(seismometerLatitude), Number.parseFloat(seismometerLongitude)],
      description: seismometerDescription,
      dateAdded: new Date().toISOString(),
    }

    // Add to custom seismometers
    setCustomSeismometers([...customSeismometers, newSeismometer])

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
    notification.textContent = `Seismometer "${seismometerName}" saved successfully!`

    document.body.appendChild(notification)

    // Remove the notification after 3 seconds
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 3000)

    // Reset form
    setSeismometerName("")
    setSeismometerLatitude("")
    setSeismometerLongitude("")
    setSeismometerDescription("")
    setSeismometerStationCode("")
    setSeismometerChannel("EHZ")
    setError("")

    // Remove temporary marker
    if (seismometerLocationMarkerRef.current) {
      map.removeLayer(seismometerLocationMarkerRef.current)
      seismometerLocationMarkerRef.current = null
    }
  }

  // Delete a custom fissure
  const deleteFissure = (id: string) => {
    setCustomFissures(customFissures.filter((f) => f.id !== id))
  }

  // Delete a custom GPS station
  const deleteGpsStation = (id: string) => {
    setCustomGpsStations(customGpsStations.filter((s) => s.id !== id))
  }

  // Delete a custom seismometer
  const deleteSeismometer = (id: string) => {
    setCustomSeismometers(customSeismometers.filter((s) => s.id !== id))
  }

  // Delete a lava flow
  const deleteLavaFlow = (id: string) => {
    setLavaFlows(lavaFlows.filter((f) => f.id !== id))
  }

  // Delete a berm
  const deleteBerm = (id: string) => {
    setBerms(berms.filter((b) => b.id !== id))
  }

  // Add a new YouTube feed
  const addYoutubeFeed = () => {
    // Validate inputs
    if (!customVideoName.trim()) {
      setError("Please enter a name for the feed")
      return
    }

    const videoId = extractVideoId(customVideoId)
    if (!videoId) {
      setError("Please enter a valid YouTube URL or video ID")
      return
    }

    // Create new feed
    const newFeed: YouTubeFeed = {
      id: `feed-${Date.now()}`,
      name: customVideoName,
      videoId: videoId,
    }

    // Add to feeds
    setYoutubeFeeds([...youtubeFeeds, newFeed])

    // Reset form
    setCustomVideoName("")
    setCustomVideoId("")
    setError("")

    // Show success notification
    alert(`YouTube feed "${customVideoName}" added successfully!`)
  }

  // Set a feed as default
  const setDefaultFeed = (id: string) => {
    const updatedFeeds = youtubeFeeds.map((feed) => ({
      ...feed,
      isDefault: feed.id === id,
    }))
    setYoutubeFeeds(updatedFeeds)

    // Update the active video ID in localStorage
    const defaultFeed = updatedFeeds.find((feed) => feed.id === id)
    if (defaultFeed) {
      localStorage.setItem("earthquakeYoutubeVideoId", defaultFeed.videoId)
    }

    // Show success notification
    alert(`Default feed updated successfully!`)
  }

  // Delete a YouTube feed
  const deleteYoutubeFeed = (id: string) => {
    // Check if this is the default feed
    const isDefault = youtubeFeeds.find((feed) => feed.id === id)?.isDefault

    // Don't allow deleting the default feed
    if (isDefault) {
      alert("Cannot delete the default feed. Please set another feed as default first.")
      return
    }

    setYoutubeFeeds(youtubeFeeds.filter((feed) => feed.id !== id))
  }

  // Start editing a feed
  const startEditFeed = (feed: YouTubeFeed) => {
    setEditingFeedId(feed.id)
    setEditFeedName(feed.name)
    setEditFeedVideoId(feed.videoId)
  }

  // Save edited feed
  const saveEditedFeed = () => {
    if (!editingFeedId) return

    // Validate inputs
    if (!editFeedName.trim()) {
      setError("Please enter a name for the feed")
      return
    }

    const videoId = extractVideoId(editFeedVideoId) || editFeedVideoId
    if (!videoId) {
      setError("Please enter a valid YouTube URL or video ID")
      return
    }

    // Update the feed
    const updatedFeeds = youtubeFeeds.map((feed) => {
      if (feed.id === editingFeedId) {
        return {
          ...feed,
          name: editFeedName,
          videoId: videoId,
        }
      }
      return feed
    })

    setYoutubeFeeds(updatedFeeds)

    // If this was the default feed, update the active video ID
    const editedFeed = updatedFeeds.find((feed) => feed.id === editingFeedId)
    if (editedFeed?.isDefault) {
      localStorage.setItem("earthquakeYoutubeVideoId", videoId)
    }

    // Reset editing state
    setEditingFeedId(null)
    setEditFeedName("")
    setEditFeedVideoId("")
    setError("")

    // Show success notification
    alert(`Feed updated successfully!`)
  }

  // Extract video ID from URL or ID string
  const extractVideoId = (input: string) => {
    // Handle YouTube URLs
    const urlRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    const match = input.match(urlRegex)

    if (match && match[1]) {
      return match[1]
    }

    // Handle direct video IDs (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input
    }

    return null
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
      if (locationMarkerRef.current) {
        map.removeLayer(locationMarkerRef.current)
      }
      if (seismometerLocationMarkerRef.current) {
        map.removeLayer(seismometerLocationMarkerRef.current)
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

  // Update the login form to include username field
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
        <TabsContent value="fissures" className="space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-gray-800 rounded-md">
              <h3 className="font-medium mb-2">Drawing Instructions</h3>
              <ol className="text-sm space-y-2 text-gray-300 list-decimal pl-4">
                <li>Use the drawing tools on the left side of the map to draw fissure lines</li>
                <li>You can draw multiple line segments for a single fissure system</li>
                <li>Select a color and fill in the details below</li>
                <li>Click the "Save Fissure" button that appears on the map to save your drawing</li>
              </ol>
            </div>

            {isLoadingDrawTools && (
              <div className="p-3 bg-yellow-800/50 rounded-md">
                <p className="text-yellow-300 text-sm">Loading drawing tools...</p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-800/50 rounded-md">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="fissure-color">Fissure Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="fissure-color"
                    value={currentColor}
                    onChange={(e) => setCurrentColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <div className="flex-1 h-8 rounded" style={{ backgroundColor: currentColor }}></div>
                </div>
              </div>

              <div>
                <Label htmlFor="fissure-name">Fissure Name</Label>
                <Input
                  id="fissure-name"
                  value={currentName}
                  onChange={(e) => setCurrentName(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., 18 December 2023"
                />
              </div>

              <div>
                <Label htmlFor="eruption-name">Eruption Group</Label>
                <Input
                  id="eruption-name"
                  value={currentEruption}
                  onChange={(e) => setCurrentEruption(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Sundhnúkur 2023-2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={currentStartDate}
                    onChange={(e) => setCurrentStartDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="end-date">End Date (Optional)</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={currentEndDate}
                    onChange={(e) => setCurrentEndDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (drawnItemsRef.current) {
                    drawnItemsRef.current.clearLayers()
                    setIsDrawing(false)
                    setDrawnLines([])
                    setSaveButtonVisible(false)
                  }
                }}
                className="bg-gray-800"
              >
                Clear Drawing
              </Button>

              <Button
                onClick={saveFissure}
                disabled={!isDrawing || drawnLines.length === 0}
                className={!isDrawing || drawnLines.length === 0 ? "opacity-50" : ""}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Fissure
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">Saved Fissures</h3>

            {customFissures.length === 0 ? (
              <p className="text-gray-400 text-sm">No custom fissures created yet.</p>
            ) : (
              <div className="space-y-3">
                {customFissures.map((fissure) => (
                  <div key={fissure.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: fissure.color }}></div>
                      <span>{fissure.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteFissure(fissure.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Lava Flows Tab */}
        <TabsContent value="lavaFlows" className="space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-gray-800 rounded-md">
              <h3 className="font-medium mb-2">Lava Flow Instructions</h3>
              <ol className="text-sm space-y-2 text-gray-300 list-decimal pl-4">
                <li>Use the polygon tool on the left side of the map to draw lava flow areas</li>
                <li>Select a color and opacity for the lava flow</li>
                <li>Fill in the details below</li>
                <li>Click the "Save Lava Flow" button that appears on the map to save your drawing</li>
              </ol>
            </div>

            {error && (
              <div className="p-3 bg-red-800/50 rounded-md">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="lava-flow-color">Lava Flow Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    id="lava-flow-color"
                    value={lavaFlowColor}
                    onChange={(e) => setLavaFlowColor(e.target.value)}
                    className="w-10 h-10 rounded cursor-pointer"
                  />
                  <div className="flex-1 h-8 rounded" style={{ backgroundColor: lavaFlowColor }}></div>
                </div>
              </div>

              <div>
                <Label htmlFor="lava-flow-opacity">Opacity</Label>
                <input
                  type="range"
                  id="lava-flow-opacity"
                  min="0.1"
                  max="0.8"
                  step="0.1"
                  value={lavaFlowOpacity}
                  onChange={(e) => setLavaFlowOpacity(Number.parseFloat(e.target.value))}
                  className="w-full"
                />
                <div className="text-xs text-right">{lavaFlowOpacity}</div>
              </div>

              <div>
                <Label htmlFor="lava-flow-name">Lava Flow Name</Label>
                <Input
                  id="lava-flow-name"
                  value={lavaFlowName}
                  onChange={(e) => setLavaFlowName(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., January 2024 Flow"
                />
              </div>

              <div>
                <Label htmlFor="lava-flow-description">Description (Optional)</Label>
                <Input
                  id="lava-flow-description"
                  value={lavaFlowDescription}
                  onChange={(e) => setLavaFlowDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Flow from the January eruption"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="lava-flow-start-date">Start Date</Label>
                  <Input
                    id="lava-flow-start-date"
                    type="date"
                    value={lavaFlowStartDate}
                    onChange={(e) => setLavaFlowStartDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="lava-flow-end-date">End Date (Optional)</Label>
                  <Input
                    id="lava-flow-end-date"
                    type="date"
                    value={lavaFlowEndDate}
                    onChange={(e) => setLavaFlowEndDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (drawnItemsRef.current) {
                    drawnItemsRef.current.clearLayers()
                    setIsDrawing(false)
                    setDrawnPolygons([])
                    setSaveButtonVisible(false)
                  }
                }}
                className="bg-gray-800"
              >
                Clear Drawing
              </Button>

              <Button
                onClick={saveLavaFlow}
                disabled={!isDrawing || drawnPolygons.length === 0}
                className={!isDrawing || drawnPolygons.length === 0 ? "opacity-50" : ""}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Lava Flow
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">Saved Lava Flows</h3>

            {lavaFlows.length === 0 ? (
              <p className="text-gray-400 text-sm">No lava flows created yet.</p>
            ) : (
              <div className="space-y-3">
                {lavaFlows.map((flow) => (
                  <div key={flow.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-sm"
                        style={{
                          backgroundColor: flow.color,
                          opacity: flow.opacity,
                        }}
                      ></div>
                      <span>{flow.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteLavaFlow(flow.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Berms Tab */}
        <TabsContent value="berms" className="space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-gray-800 rounded-md">
              <h3 className="font-medium mb-2">Berm Instructions</h3>
              <ol className="text-sm space-y-2 text-gray-300 list-decimal pl-4">
                <li>Use the line tool on the left side of the map to draw berms (defensive barriers)</li>
                <li>Berms are always drawn in brown color</li>
                <li>Fill in the details below</li>
                <li>Click the "Save Berm" button that appears on the map to save your drawing</li>
              </ol>
            </div>

            {error && (
              <div className="p-3 bg-red-800/50 rounded-md">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-10 h-10 rounded" style={{ backgroundColor: bermColor }}></div>
                  <span className="text-sm">Berms are always drawn in brown</span>
                </div>
              </div>

              <div>
                <Label htmlFor="berm-name">Berm Name</Label>
                <Input
                  id="berm-name"
                  value={bermName}
                  onChange={(e) => setBermName(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Northern Barrier"
                />
              </div>

              <div>
                <Label htmlFor="berm-description">Description (Optional)</Label>
                <Input
                  id="berm-description"
                  value={bermDescription}
                  onChange={(e) => setBermDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Defensive barrier to protect infrastructure"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="berm-construction-date">Construction Date</Label>
                  <Input
                    id="berm-construction-date"
                    type="date"
                    value={bermConstructionDate}
                    onChange={(e) => setBermConstructionDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="berm-completion-date">Completion Date (Optional)</Label>
                  <Input
                    id="berm-completion-date"
                    type="date"
                    value={bermCompletionDate}
                    onChange={(e) => setBermCompletionDate(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  if (drawnItemsRef.current) {
                    drawnItemsRef.current.clearLayers()
                    setIsDrawing(false)
                    setDrawnLines([])
                    setSaveButtonVisible(false)
                  }
                }}
                className="bg-gray-800"
              >
                Clear Drawing
              </Button>

              <Button
                onClick={saveBerm}
                disabled={!isDrawing || drawnLines.length === 0}
                className={!isDrawing || drawnLines.length === 0 ? "opacity-50" : ""}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Berm
              </Button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">Saved Berms</h3>

            {berms.length === 0 ? (
              <p className="text-gray-400 text-sm">No berms created yet.</p>
            ) : (
              <div className="space-y-3">
                {berms.map((berm) => (
                  <div key={berm.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-sm" style={{ backgroundColor: bermColor }}></div>
                      <span>{berm.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteBerm(berm.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* GPS Stations Tab */}
        <TabsContent value="gps" className="space-y-6">
          {/* Add a prominent "Insert GPS Station" button */}
          {/* Now, find the GPS Stations Tab section and add the dropdown menu */}
          {/* Look for the TabsContent with value="gps" and add this before the existing form: */}
          <div className="space-y-4 mb-6 border-b border-gray-700 pb-6">
            <h3 className="font-medium mb-2">Edit Existing GPS Station</h3>
            <div className="p-3 bg-gray-800 rounded-md">
              <p className="text-sm text-gray-300 mb-4">
                Select an existing GPS station to add custom information or links.
              </p>
            </div>

            <div>
              <Label htmlFor="existing-station">Select GPS Station</Label>
              <Select value={selectedExistingGpsStation} onValueChange={setSelectedExistingGpsStation}>
                <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                  <SelectValue placeholder="Select a station" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white z-[2000]">
                  {EXTENDED_GPS_STATIONS.map((station) => (
                    <SelectItem
                      key={station.id}
                      value={station.id}
                      className="text-white hover:bg-gray-700 focus:bg-gray-700"
                    >
                      {station.id} - {station.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedExistingGpsStation && (
              <>
                <div>
                  <Label htmlFor="station-url">Data URL</Label>
                  <Input
                    id="station-url"
                    value={stationUrl}
                    onChange={(e) => setStationUrl(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., https://strokkur.raunvis.hi.is/gpsweb/index.php?id=REYK"
                  />
                  <p className="text-xs text-gray-400 mt-1">Add a URL to the station's data page or visualization</p>
                </div>

                <div>
                  <Label htmlFor="station-description">Custom Description</Label>
                  <Input
                    id="station-description"
                    value={stationDescription}
                    onChange={(e) => setStationDescription(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., GPS station monitoring Reykjanes inflation"
                  />
                </div>

                <Button
                  onClick={() => {
                    // Find the selected station
                    const station = EXTENDED_GPS_STATIONS.find((s) => s.id === selectedExistingGpsStation)
                    if (!station) return

                    // Create a custom GPS station from the selected one
                    const customStation: CustomGpsStation = {
                      id: `custom-${Date.now()}`,
                      name: station.name,
                      coordinates: station.coordinates,
                      description: stationDescription || `Enhanced station ${station.id}`,
                      url: stationUrl,
                      dateAdded: new Date().toISOString(),
                    }

                    // Add to custom GPS stations
                    setCustomGpsStations([...customGpsStations, customStation])

                    // Reset form
                    setSelectedExistingGpsStation("")
                    setStationDescription("")
                    setStationUrl("")

                    // Show success notification
                    alert(`GPS Station "${station.name}" enhanced with custom data!`)
                  }}
                  className="w-full"
                  disabled={!selectedExistingGpsStation || (!stationUrl && !stationDescription)}
                >
                  Save Custom Information
                </Button>
              </>
            )}
          </div>
          <div className="space-y-4">
            <div className="p-3 bg-gray-800 rounded-md">
              <h3 className="font-medium mb-2">GPS Station Instructions</h3>
              <ol className="text-sm space-y-2 text-gray-300 list-decimal pl-4">
                <li>Click "Select Location" and then click on the map to place the station</li>
                <li>Fill in the station details including name and data URL</li>
                <li>Click "Save Station" to add it to the collection</li>
              </ol>
            </div>

            {/* Add a prominent "Insert GPS Station" button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={startLocationSelection}
              disabled={isSelectingLocation}
            >
              <Plus className="h-4 w-4 mr-2" />
              Insert GPS Station
            </Button>

            <div className="space-y-3">
              <div>
                <Label htmlFor="station-name">Station Name</Label>
                <Input
                  id="station-name"
                  value={stationName}
                  onChange={(e) => setStationName(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., REYK"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="station-latitude">Latitude</Label>
                  <Input
                    id="station-latitude"
                    value={stationLatitude}
                    onChange={(e) => setStationLatitude(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., 64.1392"
                  />
                </div>

                <div>
                  <Label htmlFor="station-longitude">Longitude</Label>
                  <Input
                    id="station-longitude"
                    value={stationLongitude}
                    onChange={(e) => setStationLongitude(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., -21.9558"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={startLocationSelection}
                className={`w-full mt-1 ${isSelectingLocation ? "bg-red-800 text-white" : "bg-gray-800"}`}
                disabled={isSelectingLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isSelectingLocation ? "Selection Mode Active..." : "Select Location on Map"}
              </Button>

              <div>
                <Label htmlFor="station-description">Description</Label>
                <Input
                  id="station-description"
                  value={stationDescription}
                  onChange={(e) => setStationDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Reykjavík GPS station"
                />
              </div>

              <div>
                <Label htmlFor="station-url">Data URL</Label>
                <Input
                  id="station-url"
                  value={stationUrl}
                  onChange={(e) => setStationUrl(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., https://strokkur.raunvis.hi.is/gpsweb/index.php?id=REYK"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={saveGpsStation}
              disabled={!stationName || !stationLatitude || !stationLongitude || !stationUrl}
              className={
                !stationName || !stationLatitude || !stationLongitude || !stationUrl ? "opacity-50 w-full" : "w-full"
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Save GPS Station
            </Button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">Saved GPS Stations</h3>

            {customGpsStations.length === 0 ? (
              <p className="text-gray-400 text-sm">No GPS stations added yet.</p>
            ) : (
              <div className="space-y-3">
                {customGpsStations.map((station) => (
                  <div key={station.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium">{station.name}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {station.coordinates[0].toFixed(4)}, {station.coordinates[1].toFixed(4)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteGpsStation(station.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Also, update the "Import Official GPS Station" section to be more consistent */}
          {/* Find the section with the heading "Import Official GPS Station" and replace it with: */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h3 className="font-medium mb-3">Import Official GPS Station</h3>
            <div className="space-y-3">
              <div>
                <Label htmlFor="official-station">Select Official Station</Label>
                <Select value={selectedOfficialGpsStation} onValueChange={setSelectedOfficialGpsStation}>
                  <SelectTrigger className="w-full bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select a station" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white z-[2000]">
                    {OFFICIAL_GPS_STATIONS.map((station) => (
                      <SelectItem
                        key={station.marker}
                        value={station.marker}
                        className="text-white hover:bg-gray-700 focus:bg-gray-700"
                      >
                        {station.marker} - {station.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  if (!selectedOfficialGpsStation) {
                    setError("Please select an official GPS station")
                    return
                  }

                  const station = OFFICIAL_GPS_STATIONS.find((s) => s.marker === selectedOfficialGpsStation)
                  if (!station) return

                  // Create a custom GPS station from the official one
                  const newStation: CustomGpsStation = {
                    id: `custom-${Date.now()}`,
                    name: `${station.marker} - ${station.name}`,
                    coordinates: [station.coordinates.lat, station.coordinates.lon],
                    description: `Imported from official station ${station.marker}`,
                    url: station.information_url,
                    dateAdded: new Date().toISOString(),
                  }

                  // Add to custom GPS stations
                  setCustomGpsStations([...customGpsStations, newStation])
                  setSelectedOfficialGpsStation("")

                  // Show success notification
                  alert(`GPS Station "${station.name}" imported successfully!`)
                }}
                className="w-full"
                disabled={!selectedOfficialGpsStation}
              >
                <Plus className="h-4 w-4 mr-2" />
                Import Selected Station
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Seismometers Tab */}
        <TabsContent value="seismometers" className="space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-gray-800 rounded-md">
              <h3 className="font-medium mb-2">Seismometer Instructions</h3>
              <ol className="text-sm space-y-2 text-gray-300 list-decimal pl-4">
                <li>Click "Select Location" and then click on the map to place the seismometer</li>
                <li>Fill in the seismometer details including name and station code</li>
                <li>Click "Save Seismometer" to add it to the collection</li>
              </ol>
            </div>

            {/* Add a prominent "Insert Seismometer Station" button */}
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={startSeismometerLocationSelection}
              disabled={isSelectingSeismometerLocation}
            >
              <Plus className="h-4 w-4 mr-2" />
              Insert Seismometer Station
            </Button>

            <div className="space-y-3">
              <div>
                <Label htmlFor="seismometer-name">Seismometer Name</Label>
                <Input
                  id="seismometer-name"
                  value={seismometerName}
                  onChange={(e) => setSeismometerName(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Reykjanes Peninsula"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="seismometer-latitude">Latitude</Label>
                  <Input
                    id="seismometer-latitude"
                    value={seismometerLatitude}
                    onChange={(e) => setSeismometerLatitude(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., 63.8500"
                  />
                </div>

                <div>
                  <Label htmlFor="seismometer-longitude">Longitude</Label>
                  <Input
                    id="seismometer-longitude"
                    value={seismometerLongitude}
                    onChange={(e) => setSeismometerLongitude(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., -22.4500"
                  />
                </div>
              </div>

              <Button
                variant="outline"
                onClick={startSeismometerLocationSelection}
                className={`w-full mt-1 ${isSelectingSeismometerLocation ? "bg-blue-800 text-white" : "bg-gray-800"}`}
                disabled={isSelectingSeismometerLocation}
              >
                <MapPin className="h-4 w-4 mr-2" />
                {isSelectingSeismometerLocation ? "Selection Mode Active..." : "Select Location on Map"}
              </Button>

              <div>
                <Label htmlFor="seismometer-description">Description</Label>
                <Input
                  id="seismometer-description"
                  value={seismometerDescription}
                  onChange={(e) => setSeismometerDescription(e.target.value)}
                  className="bg-gray-800 border-gray-700 mt-1"
                  placeholder="e.g., Raspberry Shake seismometer near eruption site"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="seismometer-station-code">Station Code</Label>
                  <Input
                    id="seismometer-station-code"
                    value={seismometerStationCode}
                    onChange={(e) => setSeismometerStationCode(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., RBDCF"
                  />
                </div>

                <div>
                  <Label htmlFor="seismometer-channel">Channel</Label>
                  <Input
                    id="seismometer-channel"
                    value={seismometerChannel}
                    onChange={(e) => setSeismometerChannel(e.target.value)}
                    className="bg-gray-800 border-gray-700 mt-1"
                    placeholder="e.g., EHZ"
                  />
                </div>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              onClick={saveSeismometer}
              disabled={!seismometerName || !seismometerLatitude || !seismometerLongitude || !seismometerStationCode}
              className={
                !seismometerName || !seismometerLatitude || !seismometerLongitude || !seismometerStationCode
                  ? "opacity-50 w-full"
                  : "w-full"
              }
            >
              <Save className="h-4 w-4 mr-2" />
              Save Seismometer
            </Button>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <h3 className="font-medium mb-3">Saved Seismometers</h3>

            {customSeismometers.length === 0 ? (
              <p className="text-gray-400 text-sm">No seismometers added yet.</p>
            ) : (
              <div className="space-y-3">
                {customSeismometers.map((seismometer) => (
                  <div key={seismometer.id} className="flex items-center justify-between p-2 bg-gray-800 rounded-md">
                    <div className="flex-1 overflow-hidden">
                      <div className="font-medium">{seismometer.name}</div>
                      <div className="text-xs text-gray-400">Station: {seismometer.stationCode}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {seismometer.coordinates[0].toFixed(4)}, {seismometer.coordinates[1].toFixed(4)}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteSeismometer(seismometer.id)}
                      className="text-gray-400 hover:text-red-500 ml-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* YouTube Management Tab */}
        <TabsContent value="youtube" className="space-y-6">
          <div className="space-y-4">
            <div className="p-3 bg-gray-800 rounded-md">
              <h3 className="font-medium mb-2">Live Feed Management</h3>
              <p className="text-sm text-gray-300 mb-4">
                Configure the YouTube live feeds that will be displayed to users. The default feed will play
                automatically.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-800/50 rounded-md">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <Label htmlFor="youtube-name">Feed Name</Label>
                <Input
                  id="youtube-name"
                  value={customVideoName}
                  onChange={(e) => setCustomVideoName(e.target.value)}
                  placeholder="e.g., Fagradalsfjall Eruption"
                  className="bg-gray-800 border-gray-700 mt-1"
                />
              </div>

              <div>
                <Label htmlFor="youtube-url">YouTube Video URL or ID</Label>
                <Input
                  id="youtube-url"
                  value={customVideoId}
                  onChange={(e) => setCustomVideoId(e.target.value)}
                  placeholder="e.g., https://www.youtube.com/watch?v=xDRWMU9JzKA"
                  className="bg-gray-800 border-gray-700 mt-1"
                />
                <p className="text-xs text-gray-400 mt-1">Enter a YouTube video ID or full URL to add a new feed</p>
              </div>

              <Button onClick={addYoutubeFeed} disabled={!customVideoName || !customVideoId} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add New Feed
              </Button>
            </div>

            <div className="border-t border-gray-700 pt-4">
              <h3 className="font-medium mb-3">Managed Live Feeds</h3>
              <div className="space-y-3">
                {youtubeFeeds.map((feed) => (
                  <div key={feed.id} className="p-3 bg-gray-800 rounded-md">
                    {editingFeedId === feed.id ? (
                      <div className="space-y-3">
                        <Input
                          value={editFeedName}
                          onChange={(e) => setEditFeedName(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                          placeholder="Feed name"
                        />
                        <Input
                          value={editFeedVideoId}
                          onChange={(e) => setEditFeedVideoId(e.target.value)}
                          className="bg-gray-700 border-gray-600"
                          placeholder="Video ID or URL"
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingFeedId(null)
                              setEditFeedName("")
                              setEditFeedVideoId("")
                            }}
                          >
                            Cancel
                          </Button>
                          <Button size="sm" onClick={saveEditedFeed}>
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{feed.name}</span>
                            {feed.isDefault && (
                              <span className="text-xs bg-green-800 text-green-200 px-2 py-0.5 rounded">Default</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-400 mt-1">ID: {feed.videoId}</div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditFeed(feed)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDefaultFeed(feed.id)}
                            disabled={feed.isDefault}
                            className={`${feed.isDefault ? "opacity-50" : "text-gray-400 hover:text-green-500"}`}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteYoutubeFeed(feed.id)}
                            disabled={feed.isDefault}
                            className={`${feed.isDefault ? "opacity-50" : "text-gray-400 hover:text-red-500"}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-gray-800/50 rounded-md mt-4">
              <h4 className="font-medium text-sm mb-2">How It Works</h4>
              <ul className="text-sm text-gray-300 space-y-2 list-disc pl-4">
                <li>The default feed (marked with green) will play automatically when users open the live feed</li>
                <li>Users can switch between feeds using the dropdown in the live feed panel</li>
                <li>Use the play button to set a feed as the default</li>
                <li>You cannot delete the default feed - set another feed as default first</li>
              </ul>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
