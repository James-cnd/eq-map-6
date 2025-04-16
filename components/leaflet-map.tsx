"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Earthquake } from "@/types/earthquake"
import type { Zone } from "@/types/zones"
import { VOLCANIC_FISSURES } from "@/types/fissures"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { CustomGpsStation } from "@/types/stations"
import type { CustomSeismometer, LavaFlow, Berm } from "@/components/admin-draw-panel"
import "leaflet/dist/leaflet.css"
import { useGlobalSettings } from "@/hooks/use-global-settings"

// Update the interface to include showEarthquakes and showGpsStations
interface LeafletMapProps {
  earthquakes: Earthquake[]
  onSelectEarthquake: (earthquake: Earthquake) => void
  selectedEarthquake: Earthquake | null
  selectedZone?: Zone
  showSeismicStations?: boolean
  showGpsStations?: boolean
  showSeismometers?: boolean
  showLavaFlows?: boolean
  showBerms?: boolean
  showEarthquakes?: boolean
  onMapReference?: (map: any, L: any) => void
  onSelectSeismometer?: (seismometer: CustomSeismometer) => void
}

// Define hotspots
const HOTSPOTS = {
  iceland: { name: "Iceland", coords: [64.9631, -19.0208], zoom: 6 },
  reykjavik: { name: "Reykjavik", coords: [64.1466, -21.9426], zoom: 10 },
  akureyri: { name: "Akureyri", coords: [65.6835, -18.1002], zoom: 10 },
  krafla: { name: "Krafla", coords: [65.717, -16.78], zoom: 11 },
  grimsvotn: { name: "Grímsvötn", coords: [64.4163, -17.3157], zoom: 11 },
  sundhnukur: { name: "Sundhnúkur", coords: [63.89, -22.38], zoom: 12 },
}

// Additional GPS stations visible in the image
const ADDITIONAL_GPS_STATIONS = [
  {
    id: "VOGS",
    name: "Vogsósar",
    coordinates: [63.85, -21.7],
    source: "IMO",
    type: "official",
  },
  {
    id: "ELDH",
    name: "Eldhamrar",
    coordinates: [63.8, -22.3],
    source: "IMO",
    type: "official",
  },
  {
    id: "HEKL",
    name: "Hekla",
    coordinates: [64.0, -19.67],
    source: "IMO",
    type: "official",
  },
  {
    id: "AUST",
    name: "Austmannsbunga",
    coordinates: [64.52, -17.25],
    source: "IMO",
    type: "official",
  },
  {
    id: "SKRO",
    name: "Skrokkalda",
    coordinates: [64.55, -18.38],
    source: "IMO",
    type: "official",
  },
  {
    id: "HOFN",
    name: "Höfn",
    coordinates: [64.27, -15.2],
    source: "IMO",
    type: "official",
  },
  {
    id: "SAUD",
    name: "Sauðárkrókur",
    coordinates: [65.75, -19.4],
    source: "IMO",
    type: "official",
  },
  {
    id: "ARHO",
    name: "Árholt",
    coordinates: [65.7, -18.2],
    source: "IMO",
    type: "official",
  },
  {
    id: "MYVA",
    name: "Mývatn",
    coordinates: [65.6, -16.9],
    source: "IMO",
    type: "official",
  },
  {
    id: "GJAC",
    name: "Gjallandi",
    coordinates: [65.0, -16.4],
    source: "IMO",
    type: "official",
  },
  {
    id: "SKJA",
    name: "Skjaldbreið",
    coordinates: [64.43, -20.77],
    source: "IMO",
    type: "official",
  },
  {
    id: "VMEY",
    name: "Vestmannaeyjar",
    coordinates: [63.43, -20.28],
    source: "IMO",
    type: "official",
  },
  {
    id: "UXAV",
    name: "Úxavatnsdalur",
    coordinates: [64.8, -21.1],
    source: "IMO",
    type: "official",
  },
  {
    id: "SNAE",
    name: "Snæfellsnes",
    coordinates: [64.8, -23.7],
    source: "IMO",
    type: "official",
  },
  {
    id: "ISAF",
    name: "Ísafjörður",
    coordinates: [66.07, -23.13],
    source: "IMO",
    type: "official",
  },
]

// Update the default props in the function signature
export default function LeafletMap({
  earthquakes,
  onSelectEarthquake,
  selectedEarthquake,
  selectedZone,
  showSeismicStations = false,
  showGpsStations = true, // Default to true
  showSeismometers = false,
  showLavaFlows = false,
  showBerms = false,
  showEarthquakes = true,
  onMapReference,
  onSelectSeismometer,
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [leaflet, setLeaflet] = useState<any>(null)
  const markersRef = useRef<any[]>([])
  const zoneRectRef = useRef<any>(null)
  const stationMarkersRef = useRef<any[]>([])
  const fissureLinesRef = useRef<any[]>([])
  const newestMarkerRef = useRef<any>(null)
  const eruptionMarkersRef = useRef<any[]>([])
  const arrowMarkerRef = useRef<any>(null)
  const seismometerMarkersRef = useRef<any[]>([])
  const lavaFlowsRef = useRef<any[]>([])
  const bermsRef = useRef<any[]>([])
  const earthquakeClusterGroupRef = useRef<any>(null)
  const stationClusterGroupRef = useRef<any>(null)
  const [isMapReady, setIsMapReady] = useState(false)
  const gpsMarkersRef = useRef<any[]>([])
  const gpsLayerGroupRef = useRef<any>(null)

  const { gpsStationLinks } = useGlobalSettings()

  // Get custom GPS stations from localStorage
  const [customGpsStations] = useLocalStorage<CustomGpsStation[]>("earthquakeCustomGpsStations", [])

  // Get custom seismometers from localStorage
  const [customSeismometers] = useLocalStorage<CustomSeismometer[]>("earthquakeCustomSeismometers", [])

  // Get enabled fissures from localStorage
  const [enabledFissures] = useLocalStorage<string[]>("earthquakeEnabledFissures", [])

  // Get lava flows and berms from localStorage
  const [lavaFlows] = useLocalStorage<LavaFlow[]>("earthquakeLavaFlows", [])
  const [berms] = useLocalStorage<Berm[]>("earthquakeBerms", [])

  // Flag to prevent circular updates
  const isUserInteraction = useRef(true)

  // Use localStorage to remember map position
  const [mapPosition, setMapPosition] = useLocalStorage("earthquakeMapPosition", {
    center: HOTSPOTS.iceland.coords,
    zoom: HOTSPOTS.iceland.zoom,
  })

  const [showZoneHighlighting] = useLocalStorage("earthquakeShowZoneHighlighting", true)
  const [enableZoneTransitions] = useLocalStorage("earthquakeEnableZoneTransitions", true)
  const [showHotspotButtons] = useLocalStorage("earthquakeShowHotspotButtons", true)
  const [showFissures] = useLocalStorage("earthquakeShowFissures", true)

  // Initialize Leaflet map
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === "undefined" || !mapRef.current) return

    let isMounted = true

    // Import Leaflet dynamically to avoid SSR issues
    const loadLeaflet = async () => {
      try {
        // First, import Leaflet
        const L = (await import("leaflet")).default

        // Clean up any existing map instance first
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
          mapInstanceRef.current = null
        }

        if (isMounted && mapRef.current) {
          // Initialize the map with saved position
          const map = L.map(mapRef.current, {
            tap: true, // Enable tap for touch devices
            tapTolerance: 15, // Increase tap tolerance for better touch experience
            bounceAtZoomLimits: false, // Prevent bouncing at zoom limits which can be disorienting on mobile
            wheelDebounceTime: 100, // Debounce wheel events for smoother zooming
          }).setView(mapPosition.center as [number, number], mapPosition.zoom)

          // Store the map instance in the ref
          mapInstanceRef.current = map

          // Add OpenTopoMap tiles (topographic)
          L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution: "Map data: © OpenStreetMap contributors, SRTM | Map style: © OpenTopoMap (CC-BY-SA)",
            maxZoom: 17,
          }).addTo(map)

          // Move zoom control down to avoid overlap with title
          map.zoomControl.setPosition("bottomright")

          // Save map position when it changes due to user interaction
          map.on("moveend", () => {
            if (isUserInteraction.current) {
              const center = map.getCenter()
              const newPosition = {
                center: [center.lat, center.lng],
                zoom: map.getZoom(),
              }

              // Only update if position actually changed
              if (JSON.stringify(newPosition) !== JSON.stringify(mapPosition)) {
                setMapPosition(newPosition)
              }
            }
            // Reset the flag after handling the event
            isUserInteraction.current = true
          })

          // Create a special pane for the newest earthquake
          if (!map.getPane("newestEarthquakePane")) {
            map.createPane("newestEarthquakePane")
            map.getPane("newestEarthquakePane").style.zIndex = "1000" // Very high z-index
          }

          // Create a special pane for GPS stations with very high z-index
          if (!map.getPane("gpsStationsPane")) {
            map.createPane("gpsStationsPane")
            map.getPane("gpsStationsPane").style.zIndex = "2000" // Increased z-index to be above everything
          }

          // Create a layer group for GPS stations if it doesn't exist
          gpsLayerGroupRef.current = L.layerGroup()
          // Always add the layer to the map
          map.addLayer(gpsLayerGroupRef.current)

          setLeaflet({ L, map })
          setIsMapReady(true)

          // Pass map and L to parent component if callback exists
          if (onMapReference) {
            onMapReference(map, L)
          }
        }
      } catch (error) {
        console.error("Error loading Leaflet:", error)
      }
    }

    loadLeaflet()

    // Clean up function
    return () => {
      isMounted = false
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, []) // Empty dependency array to run only once

  // Function to fly to a location
  const flyTo = useCallback(
    (coords: [number, number], zoom: number) => {
      if (mapInstanceRef.current) {
        // Set flag to indicate programmatic change
        isUserInteraction.current = false

        if (enableZoneTransitions) {
          mapInstanceRef.current.flyTo(coords, zoom, {
            duration: 1.5, // Animation duration in seconds
            easeLinearity: 0.25,
          })
        } else {
          // Just set the view without animation
          mapInstanceRef.current.setView(coords, zoom, {
            animate: false,
          })
        }
      }
    },
    [enableZoneTransitions],
  )

  // Fly to selected earthquake and add arrow marker
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Remove existing arrow marker if it exists
    if (arrowMarkerRef.current) {
      try {
        map.removeLayer(arrowMarkerRef.current)
      } catch (error) {
        console.error("Error removing arrow marker:", error)
      }
      arrowMarkerRef.current = null
    }

    if (selectedEarthquake) {
      // Fly to the selected earthquake
      flyTo(
        [selectedEarthquake.latitude, selectedEarthquake.longitude],
        11, // Zoom level for earthquake focus
      )

      try {
        // Create a custom arrow icon
        const arrowIcon = L.divIcon({
          html: `
<div style="
position: relative;
width: 0;
height: 0;
">
<div style="
  position: absolute;
  top: -30px;
  left: -12px;
  width: 24px;
  height: 30px;
  background-color: rgba(255, 0, 0, 0.9);
  clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
  animation: bounce 1s infinite alternate;
"></div>
</div>
<style>
@keyframes bounce {
  from { transform: translateY(0); }
  to { transform: translateY(-8px); }
}
</style>
`,
          className: "",
          iconSize: [24, 30],
          iconAnchor: [12, 0], // Position the tip of the arrow at the marker location
        })

        // Create the arrow marker and add it to the map
        arrowMarkerRef.current = L.marker(
          [selectedEarthquake.latitude, selectedEarthquake.longitude],
          { icon: arrowIcon, zIndexOffset: 1500 }, // High z-index to appear above other markers
        ).addTo(map)
      } catch (error) {
        console.error("Error creating arrow marker:", error)
      }
    }
  }, [leaflet, selectedEarthquake, flyTo, isMapReady])

  // Update zone rectangle when selected zone changes
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Remove existing zone rectangle
    if (zoneRectRef.current) {
      try {
        map.removeLayer(zoneRectRef.current)
      } catch (error) {
        console.error("Error removing zone rectangle:", error)
      }
      zoneRectRef.current = null
    }

    // Add new zone rectangle if a zone is selected and highlighting is enabled
    if (selectedZone && selectedZone.id !== "all" && showZoneHighlighting) {
      try {
        // Check if bounds exists and is an array with at least 4 elements
        if (selectedZone.bounds && Array.isArray(selectedZone.bounds) && selectedZone.bounds.length >= 4) {
          const [minLat, minLng, maxLat, maxLng] = selectedZone.bounds

          // Additional check to ensure all bounds values are numbers
          if (
            typeof minLat === "number" &&
            typeof minLng === "number" &&
            typeof maxLat === "number" &&
            typeof maxLng === "number"
          ) {
            const bounds = [
              [minLat, minLng],
              [maxLat, maxLng],
            ]

            // Create rectangle with a blue color and semi-transparent fill
            zoneRectRef.current = L.rectangle(bounds, {
              color: "#3498DB",
              weight: 2,
              opacity: 0.8,
              fillColor: "#3498DB",
              fillOpacity: 0.1,
            }).addTo(map)

            // Fly to the zone if transitions are enabled
            if (enableZoneTransitions) {
              isUserInteraction.current = false
              map.flyToBounds(bounds, {
                padding: [50, 50],
                duration: 1.5,
              })
            } else {
              // Just set the view without animation
              isUserInteraction.current = false
              map.fitBounds(bounds, {
                padding: [50, 50],
              })
            }
          } else {
            console.warn("Invalid zone bounds values:", selectedZone.bounds)
          }
        } else {
          console.warn("Invalid zone bounds:", selectedZone.bounds)
        }
      } catch (error) {
        console.error("Error creating zone rectangle:", error)
      }
    }
  }, [leaflet, selectedZone, showZoneHighlighting, enableZoneTransitions, isMapReady])

  // Add earthquake markers
  useEffect(() => {
    if (!leaflet || !isMapReady || !earthquakes.length) return

    const { L, map } = leaflet

    // Clear existing markers
    markersRef.current.forEach((marker) => {
      try {
        map.removeLayer(marker)
      } catch (error) {
        console.error("Error removing earthquake marker:", error)
      }
    })
    markersRef.current = []

    // Remove newest marker if it exists
    if (newestMarkerRef.current) {
      try {
        map.removeLayer(newestMarkerRef.current)
      } catch (error) {
        console.error("Error removing newest marker:", error)
      }
      newestMarkerRef.current = null
    }

    // Only add markers if showEarthquakes is true
    if (showEarthquakes) {
      // Add new markers
      earthquakes.forEach((quake, index) => {
        try {
          const magnitude = Number.parseFloat(quake.size.toFixed(1))

          // Create marker with the custom icon
          const marker = L.marker([quake.latitude, quake.longitude], {
            icon: createEarthquakeIcon(L, magnitude, quake.review === "mlw"),
            zIndexOffset: Math.floor(magnitude * 100), // Higher magnitudes appear on top
          }).addTo(map)

          // Format tooltip content
          const tooltipContent = `
        <div class="earthquake-tooltip">
          <div class="font-bold">M${magnitude.toFixed(1)} ${quake.review ? `(${quake.review})` : ""}</div>
          <div>Location: ${quake.humanReadableLocation}</div>
          <div>Depth: ${quake.depth.toFixed(1)} km</div>
          <div>Coordinates: ${quake.latitude.toFixed(2)}°, ${quake.longitude.toFixed(2)}°</div>
          <div class="text-xs mt-1">${new Date(quake.timestamp).toLocaleString()}</div>
        </div>
      `

          // Add tooltip with improved formatting
          marker.bindTooltip(tooltipContent, {
            className: "leaflet-tooltip-custom",
            direction: "top",
          })

          // Add click event
          marker.on("click", () => {
            onSelectEarthquake(quake)
          })

          markersRef.current.push(marker)

          // If this is the newest earthquake (index 0), create a special marker
          if (index === 0) {
            // Create a black circle icon for the newest earthquake
            const newestIcon = L.divIcon({
              html: `
            <div style="
              background-color: black; 
              width: 30px; 
              height: 30px; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0  0 10px rgba(255, 255, 255, 0.8);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 12px;
            ">NEW</div>
          `,
              className: "",
              iconSize: [30, 30],
              iconAnchor: [15, 15],
            })

            // Create a marker with the black circle icon in the special pane
            const newestMarker = L.marker([quake.latitude, quake.longitude], {
              icon: newestIcon,
              pane: "newestEarthquakePane", // Use the special high z-index pane
            }).addTo(map)

            // Add a tooltip to the newest marker
            newestMarker.bindTooltip("NEWEST EARTHQUAKE", {
              permanent: false,
              direction: "top",
              className: "leaflet-tooltip-custom",
            })

            // Add click event to the newest marker
            newestMarker.on("click", () => {
              onSelectEarthquake(quake)
            })

            // Store reference to the newest marker
            newestMarkerRef.current = newestMarker
          }
        } catch (error) {
          console.error("Error creating earthquake marker:", error)
        }
      })
    }
  }, [leaflet, earthquakes, onSelectEarthquake, showEarthquakes, isMapReady])

  // Add/remove seismic station markers
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Clear existing station markers
    stationMarkersRef.current.forEach((marker) => {
      try {
        map.removeLayer(marker)
      } catch (error) {
        console.error("Error removing station marker:", error)
      }
    })
    stationMarkersRef.current = []

    // Add seismic station markers if enabled
    if (showSeismicStations) {
      // SEISMIC_STATIONS.forEach((station) => { // REMOVE THIS LINE
      //   try {
      //     // Create custom icon for seismic station
      //     const seismicIcon = L.divIcon({
      //       html: `
      //       <div style="
      //         background-color: rgba(255, 0, 0, 0.9);
      //         width: 18px;
      //         height: 18px;
      //         border-radius: 50%;
      //         border: 3px solid white;
      //         box-shadow: 0 0 6px rgba(0,0,0,0.7);
      //       "></div>
      //     `,
      //       className: "",
      //       iconSize: [18, 18],
      //       iconAnchor: [9, 9],
      //     })
      //     const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
      //       icon: seismicIcon,
      //       zIndexOffset: 2000, // Ensure stations appear above earthquake markers
      //     }).addTo(map)
      //     // Add tooltip
      //     marker.bindTooltip(
      //       `
      //     <div>
      //       <div class="font-bold">${station.name}</div>
      //       <div>Seismic Station</div>
      //       <div>${station.description || ""}</div>
      //     </div>
      //   `,
      //       {
      //         className: "leaflet-tooltip-custom",
      //         direction: "top",
      //       },
      //     )
      //     stationMarkersRef.current.push(marker)
      //   } catch (error) {
      //     console.error("Error creating seismic station marker:", error)
      //   }
      // }) // REMOVE THIS LINE
    }
  }, [leaflet, showSeismicStations, isMapReady])

  // Add GPS station markers - UPDATED to match the requested style
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Clear existing GPS markers
    gpsMarkersRef.current.forEach((marker) => {
      try {
        map.removeLayer(marker)
      } catch (error) {
        console.error("Error removing GPS marker:", error)
      }
    })
    gpsMarkersRef.current = []

    // Clear the GPS layer group
    if (gpsLayerGroupRef.current) {
      gpsLayerGroupRef.current.clearLayers()
    } else {
      // Create a layer group for GPS stations if it doesn't exist
      gpsLayerGroupRef.current = L.layerGroup()
      map.addLayer(gpsLayerGroupRef.current)
    }

    // Add a function to determine marker size based on screen width
    const getMarkerSize = () => {
      if (typeof window === "undefined") return 8 // Default size

      const width = window.innerWidth
      if (width < 768) {
        return 12 // Larger size for mobile phones
      } else if (width < 1024) {
        return 10 // Medium size for tablets/iPads
      } else {
        return 8 // Original size for desktops
      }
    }

    // Add all GPS stations from all sources

    // 1. Add official GPS stations
    // GPS_STATIONS.forEach((station) => { // REMOVE THIS LINE
    //   try {
    //     // Update the marker creation for all GPS station types to use responsive sizing
    //     const markerSize = getMarkerSize()
    //     const gpsIcon = L.divIcon({
    //       html: `
    // <div style="
    //  position: relative;
    //  width: 0;
    //  height: 0;
    // ">
    //  <div style="
    //    position: absolute;
    //    top: -${markerSize / 2}px;
    //    left: -${markerSize / 2}px;
    //    width: ${markerSize}px;
    //    height: ${markerSize}px;
    //    background-color: #FF1493;
    //    transform: rotate(45deg);
    //    border: 1px solid white;
    //    box-shadow: 0 0 3px rgba(0,0,0,0.7);
    //  "></div>
    // </div>
    // `,
    //       className: "gps-station-marker",
    //       iconSize: [markerSize, markerSize],
    //       iconAnchor: [markerSize / 2, markerSize / 2],
    //     })

    //     const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
    //       icon: gpsIcon,
    //       pane: "gpsStationsPane", // Use the special high z-index pane
    //       zIndexOffset: 2000, // Ensure high z-index
    //     })

    //     // Add tooltip with station information
    //     marker.bindTooltip(`GPS: <b>${station.id}</b> ${station.name}`, {
    //       className: "leaflet-tooltip-custom",
    //       direction: "top",
    //     })

    //     // Add click handler for GPS stations
    //     marker.on("click", () => {
    //       // Get the volcanic system reference if available
    //       const volc = station.description?.includes("volc:") ? station.description.split("volc:")[1].trim() : ""

    //       // Determine which URL to use based on whether there's a volcanic system reference
    //       let imageUrl
    //       if (volc) {
    //         imageUrl = `http://brunnur.vedur.is/gps/eldfjoll/${volc}/${station.id}-plate-90d.png`
    //       } else {
    //         imageUrl = `http://brunnur.vedur.is/gps/timeseries/${station.id}-plate-90d.png`
    //       }

    //       marker.on("click", () => {
    //         // Check if we have a custom link for this station
    //         const customLink = gpsStationLinks[station.id]

    //         // Use the custom link if available, otherwise use the default
    //         const dataUrl = customLink || imageUrl

    //         // Create a popup with the station information
    //         const popupContent = `
    // <div class="station-popup">
    //  <h3>${station.name} (${station.id})</h3>
    //  <p>Click to view GPS data</p>
    //  <button class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs mt-2"
    //    onclick="window.open('${dataUrl}', '_blank')">
    //    View Data
    //  </button>
    // </div>
    // `

    //         marker
    //           .bindPopup(popupContent, {
    //             closeButton: true,
    //             closeOnClick: false, // Don't close when clicking elsewhere on mobile
    //             className: "mobile-friendly-popup",
    //           })
    //           .openPopup()
    //       })
    //     })

    //     // Add marker to the layer group
    //     gpsLayerGroupRef.current.addLayer(marker)
    //     gpsMarkersRef.current.push(marker)
    //   } catch (error) {
    //     console.error("Error creating GPS station marker:", error)
    //   }
    // }) // REMOVE THIS LINE

    // 2. Add extended GPS stations
    // EXTENDED_GPS_STATIONS.forEach((station) => { // REMOVE THIS LINE
    //   try {
    //     // Update the marker creation for all GPS station types to use responsive sizing
    //     const markerSize = getMarkerSize()
    //     // Create a diamond-shaped marker for extended GPS stations with a different color
    //     const extendedGpsIcon = L.divIcon({
    //       html: `
    // <div style="
    //  position: relative;
    //  width: 0;
    //  height: 0;
    // ">
    //  <div style="
    //    position: absolute;
    //    top: -${markerSize / 2}px;
    //    left: -${markerSize / 2}px;
    //    width: ${markerSize}px;
    //    height: ${markerSize}px;
    //    background-color: #FF1493;
    //    transform: rotate(45deg);
    //    border: 1px solid white;
    //    box-shadow: 0 0 3px rgba(0,0,0,0.7);
    //  "></div>
    // </div>
    // `,
    //       className: "gps-station-marker",
    //       iconSize: [markerSize, markerSize],
    //       iconAnchor: [markerSize / 2, markerSize / 2],
    //     })

    //     const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
    //       icon: extendedGpsIcon,
    //       pane: "gpsStationsPane", // Use the special high z-index pane
    //       zIndexOffset: 2000, // Ensure high z-index
    //     })

    //     // Add tooltip with station information
    //     marker.bindTooltip(`GPS: <b>${station.id}</b> ${station.name}`, {
    //       className: "leaflet-tooltip-custom",
    //       direction: "top",
    //     })

    //     // Add click handler for extended GPS stations
    //     marker.on("click", () => {
    //       // Create a popup with the station information
    //       const popupContent = `
    // <div class="station-popup">
    //  <h3>${station.name} (${station.id})</h3>
    //  <p>Source: ${station.source}</p>
    //  <p>Type: ${station.type}</p>
    // </div>
    // `

    //       marker
    //         .bindPopup(popupContent, {
    //           closeButton: true,
    //           closeOnClick: false, // Don't close when clicking elsewhere on mobile
    //           className: "mobile-friendly-popup",
    //         })
    //         .openPopup()
    //     })

    //     // Add marker to the layer group
    //     gpsLayerGroupRef.current.addLayer(marker)
    //     gpsMarkersRef.current.push(marker)
    //   } catch (error) {
    //     console.error("Error creating extended GPS station marker:", error)
    //   }
    // }) // REMOVE THIS LINE

    // 3. Add additional GPS stations from the image
    // ADDITIONAL_GPS_STATIONS.forEach((station) => {
    //   try {
    //     // Update the marker creation for all GPS station types to use responsive sizing
    //     const markerSize = getMarkerSize()
    //     // Create a diamond-shaped marker for additional GPS stations
    //     const additionalGpsIcon = L.divIcon({
    //       html: `
    // <div style="
    //  position: relative;
    //  width: 0;
    //  height: 0;
    // ">
    //  <div style="
    //    position: absolute;
    //    top: -${markerSize / 2}px;
    //    left: -${markerSize / 2}px;
    //    width: ${markerSize}px;
    //    height: ${markerSize}px;
    //    background-color: #32CD32;
    //    transform: rotate(45deg);
    //    border: 1px solid white;
    //    box-shadow: 0 0 3px rgba(0,0,0,0.7);
    //  "></div>
    // </div>
    // `,
    //       className: "gps-station-marker",
    //       iconSize: [markerSize, markerSize],
    //       iconAnchor: [markerSize / 2, markerSize / 2],
    //     })

    //     const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
    //       icon: additionalGpsIcon,
    //       pane: "gpsStationsPane", // Use the special high z-index pane
    //       zIndexOffset: 2000, // Ensure high z-index
    //     })

    //     // Add tooltip with station information
    //     marker.bindTooltip(`GPS: <b>${station.id}</b> ${station.name}`, {
    //       className: "leaflet-tooltip-custom",
    //       direction: "top",
    //     })

    //     // Add click handler for additional GPS stations
    //     marker.on("click", () => {
    //       // Create a popup with the station information
    //       const popupContent = `
    // <div class="station-popup">
    //  <h3>${station.name} (${station.id})</h3>
    //  <p>Source: ${station.source}</p>
    //  <p>Type: ${station.type}</p>
    // </div>
    // `

    //       marker
    //         .bindPopup(popupContent, {
    //           closeButton: true,
    //           closeOnClick: false, // Don't close when clicking elsewhere on mobile
    //           className: "mobile-friendly-popup",
    //         })
    //         .openPopup()
    //     })

    //     // Add marker to the layer group
    //     gpsLayerGroupRef.current.addLayer(marker)
    //     gpsMarkersRef.current.push(marker)
    //   } catch (error) {
    //     console.error("Error creating additional GPS station marker:", error)
    //   }
    // }) // REMOVE THIS LINE

    // 4. Add custom GPS stations
    customGpsStations.forEach((station) => {
      try {
        // Update the marker creation for all GPS station types to use responsive sizing
        const markerSize = getMarkerSize()
        // Create a diamond-shaped marker for custom GPS stations with a different color
        const customGpsIcon = L.divIcon({
          html: `
<div style="
 position: relative;
 width: 0;
 height: 0;
">
 <div style="
   position: absolute;
   top: -${markerSize / 2}px;
   left: -${markerSize / 2}px;
   width: ${markerSize}px;
   height: ${markerSize}px;
   background-color: #A52A2A;
   transform: rotate(45deg);
   border: 1px solid white;
   box-shadow: 0 0 3px rgba(0,0,0,0.7);
 "></div>
</div>
`,
          className: "gps-station-marker",
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        })

        const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
          icon: customGpsIcon,
          pane: "gpsStationsPane", // Use the special high z-index pane
          zIndexOffset: 2000, // Ensure high z-index
        })

        // Add tooltip with station information
        marker.bindTooltip(`GPS: <b>${station.name}</b>`, {
          className: "leaflet-tooltip-custom",
          direction: "top",
        })

        // Add click handler for custom GPS stations
        marker.on("click", () => {
          // Determine if there's a volcanic system reference
          const volc = station.description?.includes("volc:") ? station.description.split("volc:")[1].trim() : ""

          // Create a popup with the station information
          const popupContent = `
<div class="station-popup">
 <h3>${station.name}</h3>
 <p>Custom GPS Station</p>
 <p>${station.description || ""}</p>
</div>
`

          marker
            .bindPopup(popupContent, {
              closeButton: true,
              closeOnClick: false, // Don't close when clicking elsewhere on mobile
              className: "mobile-friendly-popup",
            })
            .openPopup()
        })

        // Add marker to the layer group
        gpsLayerGroupRef.current.addLayer(marker)
        gpsMarkersRef.current.push(marker)
      } catch (error) {
        console.error("Error creating custom GPS station marker:", error)
      }
    })

    // Add a style tag to ensure GPS markers are always on top
    if (!document.getElementById("gps-station-style")) {
      const style = document.createElement("style")
      style.id = "gps-station-style"
      style.innerHTML = `
.gps-station-marker {
z-index: 2000 !important;
}
.leaflet-pane.gpsStationsPane {
z-index: 2000 !important;
}
`
      document.head.appendChild(style)
    }
  }, [leaflet, customGpsStations, isMapReady, gpsStationLinks]) // Removed showGpsStations from dependencies since we always show them

  // Add/remove fissure lines based on enabled fissures
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Clear existing fissure lines
    fissureLinesRef.current.forEach((line) => {
      try {
        map.removeLayer(line)
      } catch (error) {
        console.error("Error removing fissure line:", error)
      }
    })
    fissureLinesRef.current = []

    // Clear eruption markers
    eruptionMarkersRef.current.forEach((marker) => {
      try {
        map.removeLayer(marker)
      } catch (error) {
        console.error("Error removing eruption marker:", error)
      }
    })
    eruptionMarkersRef.current = []

    // Add fissure lines for enabled fissures - ensure they're on top of the map
    if (enabledFissures.length > 0 && showFissures) {
      try {
        // Create a custom pane with very high z-index if it doesn't exist
        if (!map.getPane("fissuresPane")) {
          map.createPane("fissuresPane")
          map.getPane("fissuresPane").style.zIndex = "900" // Very high z-index, but below newest earthquake
        }

        VOLCANIC_FISSURES.forEach((fissure) => {
          if (enabledFissures.includes(fissure.id)) {
            fissure.coordinates.forEach((lineCoords) => {
              try {
                // Create polyline with higher z-index using the custom pane
                const line = L.polyline(lineCoords, {
                  color: fissure.color,
                  weight: 8, // Increased weight for better visibility
                  opacity: 1.0, // Full opacity
                  pane: "fissuresPane", // Use custom pane with higher z-index
                }).addTo(map)

                // Add tooltip
                line.bindTooltip(
                  `
                <div>
                  <div class="font-bold">${fissure.name}</div>
                  <div>${fissure.eruption}</div>
                  <div>Started: ${new Date(fissure.startDate).toLocaleDateString()}</div>
                  ${fissure.endDate ? `<div>Ended: ${new Date(fissure.endDate).toLocaleDateString()}</div>` : "<div>Ongoing</div>"}
                </div>
              `,
                  {
                    className: "leaflet-tooltip-custom",
                    sticky: true,
                  },
                )

                fissureLinesRef.current.push(line)

                // Add a star marker at the start of each fissure (like in the IMO map)
                // Get the first coordinate of the line (northern end)
                const startCoord = lineCoords[0]

                // Create a star icon
                const starIcon = L.divIcon({
                  html: `
                  <div class="eruption-star" style="color: ${fissure.color};">★</div>
                `,
                  className: "",
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })

                // Add the star marker
                const starMarker = L.marker(startCoord, {
                  icon: starIcon,
                  pane: "fissuresPane",
                }).addTo(map)

                // Add tooltip to the star
                starMarker.bindTooltip(`Initial opening: ${fissure.name}`, {
                  className: "leaflet-tooltip-custom",
                  direction: "top",
                })

                eruptionMarkersRef.current.push(starMarker)
              } catch (error) {
                console.error("Error creating fissure line:", error)
              }
            })
          }
        })
      } catch (error) {
        console.error("Error creating fissures pane:", error)
      }
    }
  }, [leaflet, enabledFissures, showFissures, isMapReady])

  // Add custom seismometer markers
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Clear existing seismometer markers
    seismometerMarkersRef.current.forEach((marker) => {
      try {
        map.removeLayer(marker)
      } catch (error) {
        console.error("Error removing seismometer marker:", error)
      }
    })
    seismometerMarkersRef.current = []

    // Add seismometer markers if enabled
    if (showSeismometers && customSeismometers.length > 0) {
      customSeismometers.forEach((seismometer) => {
        try {
          // Create custom icon for seismometer
          const seismometerIcon = L.divIcon({
            html: `
            <div style="
              background-color: rgba(128,0,128,0.7);
              width: 9px;
              height: 9px;
              border: 1px solid white;
              box-shadow: 0 0 4px rgba(0,0,0,0.7);
              border-radius: 50%;
            "></div>
          `,
            className: "",
            iconSize: [9, 9],
            iconAnchor: [4.5, 4.5],
          })

          const marker = L.marker([seismometer.coordinates[0], seismometer.coordinates[1]], {
            icon: seismometerIcon,
            zIndexOffset: 800, // Lower z-index so popups appear above
          }).addTo(map)

          // Add tooltip
          marker.bindTooltip(
            `
          <div>
            <div class="font-bold">${seismometer.name}</div>
            <div>Seismometer</div>
            <div>${seismometer.description || ""}</div>
          </div>
        `,
            {
              className: "leaflet-tooltip-custom",
              direction: "top",
            },
          )

          // Add click event to open the seismometer data
          marker.on("click", () => {
            if (onSelectSeismometer) {
              onSelectSeismometer(seismometer)
            }
          })

          seismometerMarkersRef.current.push(marker)
        } catch (error) {
          console.error("Error creating seismometer marker:", error)
        }
      })
    }
  }, [leaflet, showSeismometers, customSeismometers, onSelectSeismometer, isMapReady])

  // Add lava flow polygons
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Clear existing lava flow polygons
    lavaFlowsRef.current.forEach((polygon) => {
      try {
        map.removeLayer(polygon)
      } catch (error) {
        console.error("Error removing lava flow polygon:", error)
      }
    })
    lavaFlowsRef.current = []

    // Add lava flow polygons if enabled
    if (showLavaFlows && lavaFlows.length > 0) {
      lavaFlows.forEach((flow) => {
        try {
          const polygon = L.polygon(flow.coordinates, {
            color: flow.color,
            weight: 2,
            opacity: 0.7,
            fillColor: flow.color,
            fillOpacity: 0.4,
          }).addTo(map)

          // Add tooltip
          polygon.bindTooltip(
            `
          <div>
            <div class="font-bold">${flow.name}</div>
            <div>Lava Flow</div>
            <div>${flow.description || ""}</div>
          </div>
        `,
            {
              className: "leaflet-tooltip-custom",
              direction: "top",
            },
          )

          lavaFlowsRef.current.push(polygon)
        } catch (error) {
          console.error("Error creating lava flow polygon:", error)
        }
      })
    }
  }, [leaflet, showLavaFlows, lavaFlows, isMapReady])

  // Add berm polygons
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const { L, map } = leaflet

    // Clear existing berm polygons
    bermsRef.current.forEach((polygon) => {
      try {
        map.removeLayer(polygon)
      } catch (error) {
        console.error("Error removing berm polygon:", error)
      }
    })
    bermsRef.current = []

    // Add berm polygons if enabled
    if (showBerms && berms.length > 0) {
      berms.forEach((berm) => {
        try {
          const polygon = L.polygon(berm.coordinates, {
            color: berm.color,
            weight: 2,
            opacity: 0.7,
            fillColor: berm.color,
            fillOpacity: 0.4,
          }).addTo(map)

          // Add tooltip
          polygon.bindTooltip(
            `
          <div>
            <div class="font-bold">${berm.name}</div>
            <div>Berm</div>
            <div>${berm.description || ""}</div>
          </div>
        `,
            {
              className: "leaflet-tooltip-custom",
              direction: "top",
            },
          )

          bermsRef.current.push(polygon)
        } catch (error) {
          console.error("Error creating berm polygon:", error)
        }
      })
    }
  }, [leaflet, showBerms, berms, isMapReady])

  // Listen for map settings changes
  useEffect(() => {
    const handleMapSettingsChanged = (event: CustomEvent) => {
      // Check if GPS stations setting has changed
      if (event.detail && typeof event.detail.showGpsStations !== "undefined") {
        // Force update of GPS stations
        if (leaflet && isMapReady) {
          const { map } = leaflet

          // Clear the GPS layer group
          if (gpsLayerGroupRef.current) {
            gpsLayerGroupRef.current.clearLayers()
          }

          // If GPS stations should be shown, re-add them
          if (event.detail.showGpsStations) {
            // This will trigger the useEffect that adds GPS stations
            // We don't need to do anything here as the state change will trigger the effect
          }
        }
      }
    }

    window.addEventListener("mapSettingsChanged", handleMapSettingsChanged as EventListener)

    return () => {
      window.removeEventListener("mapSettingsChanged", handleMapSettingsChanged as EventListener)
    }
  }, [leaflet, isMapReady])

  // Add a useEffect to handle window resize events and update marker sizes
  useEffect(() => {
    if (!leaflet || !isMapReady) return

    const handleResize = () => {
      // Force refresh of GPS markers when window size changes significantly
      if (gpsLayerGroupRef.current) {
        gpsLayerGroupRef.current.clearLayers()

        // This will trigger the useEffect that adds GPS stations with the new size
        const event = new CustomEvent("mapSettingsChanged", {
          detail: { showGpsStations: true },
        })
        window.dispatchEvent(event)
      }
    }

    // Debounce the resize event to avoid excessive updates
    let resizeTimer: NodeJS.Timeout
    const debouncedResize = () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(handleResize, 500)
    }

    window.addEventListener("resize", debouncedResize)

    return () => {
      window.removeEventListener("resize", debouncedResize)
      clearTimeout(resizeTimer)
    }
  }, [leaflet, isMapReady])

  // Enhance the map position saving to ensure it happens on all map movements
  useEffect(() => {
    if (!leaflet || !leaflet.map) return

    const saveMapPosition = () => {
      if (isUserInteraction.current) {
        const center = leaflet.map.getCenter()
        const zoom = leaflet.map.getZoom()

        // Save position to localStorage
        const newPosition = {
          center: [center.lat, center.lng],
          zoom: zoom,
        }

        // Only update if position actually changed
        if (JSON.stringify(newPosition) !== JSON.stringify(mapPosition)) {
          setMapPosition(newPosition)
        }
      }
      // Reset the flag after handling the event
      isUserInteraction.current = true
    }

    // Add event listeners for all map movement events
    leaflet.map.on("moveend", saveMapPosition)
    leaflet.map.on("zoomend", saveMapPosition)

    return () => {
      if (leaflet && leaflet.map) {
        leaflet.map.off("moveend", saveMapPosition)
        leaflet.map.off("zoomend", saveMapPosition)
      }
    }
  }, [leaflet, mapPosition, setMapPosition])

  // Helper function to create earthquake icons
  const createEarthquakeIcon = (L: any, magnitude: number, isManuallyReviewed = false) => {
    // Calculate size based on magnitude
    // Base size for magnitude 0 is 20px, and we scale up by 5px per magnitude unit
    const baseSize = 20
    const sizeMultiplier = 5
    const size = Math.max(baseSize + magnitude * sizeMultiplier, 12) // Minimum size of 12px

    // Choose border color based on review status
    const borderColor = isManuallyReviewed ? "black" : "white"

    // Update this to add border only for manually reviewed earthquakes
    const borderStyle = isManuallyReviewed ? "2px solid black" : "none"

    return L.divIcon({
      html: `
      <div style="
        position: relative;
        width: ${size}px;
        height: ${size + 5}px;
      ">
        <div style="
          position: absolute;
          top: 0;
          left: 0;
          width: ${size}px;
          height: ${size}px;
          background-color: ${getColorForMagnitude(magnitude)};
          border-radius: 50%;
          border: ${borderStyle};
          box-shadow: 0 0 5px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: ${Math.max(10, Math.min(14, 8 + magnitude))}px;
        ">${magnitude.toFixed(1)}</div>
        <div style="
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 4px solid transparent;
          border-right: 4px solid transparent;
          border-top: 6px solid ${getColorForMagnitude(magnitude)};
        "></div>
      </div>
    `,
      className: "",
      iconSize: [size, size + 5],
      iconAnchor: [size / 2, size + 5], // Bottom center of the pin
      popupAnchor: [0, -size], // Center above the pin
    })
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Hotspot quick zoom buttons - moved down to avoid overlap with title */}
      {showHotspotButtons && (
        <div className="absolute top-16 right-4 z-20 flex flex-col gap-2">
          {Object.entries(HOTSPOTS).map(([key, spot]) => (
            <button
              key={key}
              onClick={() => flyTo(spot.coords as [number, number], spot.zoom)}
              className="bg-gray-900/80 hover:bg-gray-800 text-white text-sm py-1 px-3 rounded shadow-md transition-colors"
            >
              {spot.name}
            </button>
          ))}
        </div>
      )}

      {/* Legend for stations and fissures */}
      {(showSeismicStations ||
        showGpsStations ||
        (enabledFissures.length > 0 && showFissures) ||
        showLavaFlows ||
        showBerms ||
        showEarthquakes) && (
        <div className="absolute bottom-20 right-4 z-20 bg-gray-900/80 p-2 rounded shadow-md text-white text-xs">
          <div className="font-bold mb-1">Map Legend</div>
          {showEarthquakes && (
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
              <span>Earthquakes</span>
            </div>
          )}
          {showSeismicStations && (
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-white"></div>
              <span>Seismic Station</span>
            </div>
          )}
          {showGpsStations && (
            <div className="flex items-center gap-1 mb-1">
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  backgroundColor: "pink",
                  transform: "rotate(45deg)",
                  opacity: 0.5,
                }}
              ></div>
              <span>GPS Station</span>
            </div>
          )}
          {showSeismometers && customSeismometers.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="w-2 h-2 rounded-full bg-purple-700 border border-white opacity-70"></div>
              <span>Seismometer</span>
            </div>
          )}
          {showLavaFlows && lavaFlows.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-orange-500 border border-white opacity-70"></div>
              <span>Lava Flow</span>
            </div>
          )}
          {showBerms && berms.length > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="w-3 h-3 rounded-full bg-green-500 border border-white opacity-70"></div>
              <span>Berm</span>
            </div>
          )}
          {enabledFissures.length > 0 && showFissures && (
            <>
              <div className="font-bold mt-2 mb-1">Eruption Fissures</div>
              <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#0066CC" }}></div>

                  <span>Dec 2023</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#66CCFF" }}></div>
                  <span>Jan 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#00CC66" }}></div>
                  <span>Feb 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#FF9900" }}></div>
                  <span>Mar 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#FF0000" }}></div>
                  <span>May 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#9933CC" }}></div>
                  <span>Aug 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-1" style={{ backgroundColor: "#FFCC00" }}></div>
                  <span>Nov 2024</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-300">★</span>
                  <span>Initial opening</span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

function getColorForMagnitude(magnitude: number): string {
  if (magnitude < 0) return "#3498DB" // Blue for negative magnitudes
  if (magnitude < 1) return "#2ECC71" // Green
  if (magnitude < 2) return "#F1C40F" // Yellow
  if (magnitude < 3) return "#E67E22" // Orange
  if (magnitude < 4) return "#E74C3C" // Red
  return "#8E44AD" // Purple for 4+
}
