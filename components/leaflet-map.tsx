"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Earthquake } from "@/types/earthquake"
import type { Zone } from "@/types/zones"
import { SEISMIC_STATIONS } from "@/types/stations"
import { VOLCANIC_FISSURES } from "@/types/fissures"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { CustomGpsStation } from "@/types/stations"
import type { CustomSeismometer, LavaFlow, Berm } from "@/components/admin-draw-panel"
import "leaflet/dist/leaflet.css"
// Import the extended GPS stations
import { EXTENDED_GPS_STATIONS } from "@/data/gps-stations-extended"

// Update the interface to include showEarthquakes
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
    onSelectGpsStation?: (station: CustomGpsStation) => void
    onSelectSeismometer?: (seismometer: CustomSeismometer) => void
    onSelectOfficialGpsStation?: (station: any) => void
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

// Update the default props in the function signature
export default function LeafletMap({
    earthquakes,
    onSelectEarthquake,
    selectedEarthquake,
    selectedZone,
    showSeismicStations = false,
    showGpsStations = false,
    showSeismometers = false,
    showLavaFlows = false,
    showBerms = false,
    showEarthquakes = false,
    onMapReference,
    onSelectGpsStation,
    onSelectSeismometer,
    onSelectOfficialGpsStation,
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
    const gpsMarkersRef = useRef<any[]>([])
    const seismometerMarkersRef = useRef<any[]>([])
    const lavaFlowsRef = useRef<any[]>([])
    const bermsRef = useRef<any[]>([])

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
        if (!mapRef.current) return

        let isMounted = true

        // Import Leaflet dynamically to avoid SSR issues
        const loadLeaflet = async () => {
            const L = (await import("leaflet")).default

            // Clean up any existing map instance first
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove()
                mapInstanceRef.current = null
            }

            if (isMounted && mapRef.current) {
                // Initialize the map with saved position
                const map = L.map(mapRef.current).setView(mapPosition.center as [number, number], mapPosition.zoom)

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

                setLeaflet({ L, map })

                // Pass map and L to parent component if callback exists
                if (onMapReference) {
                    onMapReference(map, L)
                }
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
        if (!leaflet) return

        const { L, map } = leaflet

        // Remove existing arrow marker if it exists
        if (arrowMarkerRef.current) {
            map.removeLayer(arrowMarkerRef.current)
            arrowMarkerRef.current = null
        }

        if (selectedEarthquake) {
            // Fly to the selected earthquake
            flyTo(
                [selectedEarthquake.latitude, selectedEarthquake.longitude],
                11, // Zoom level for earthquake focus
            )

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
        }
    }, [leaflet, selectedEarthquake, flyTo])

    // Update zone rectangle when selected zone changes
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Remove existing zone rectangle
        if (zoneRectRef.current) {
            map.removeLayer(zoneRectRef.current)
            zoneRectRef.current = null
        }

        // Add new zone rectangle if a zone is selected and highlighting is enabled
        if (selectedZone && selectedZone.id !== "all" && showZoneHighlighting) {
            const [minLat, minLng, maxLat, maxLng] = selectedZone.bounds
            const bounds = [
                [minLat, minLng],
                [maxLat, maxLng],
            ]

            // Create rectangle
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
        }
    }, [leaflet, selectedZone, showZoneHighlighting, enableZoneTransitions])

    // Modify the earthquake markers effect to respect showEarthquakes
    useEffect(() => {
        if (!leaflet || !earthquakes.length) return

        const { L, map } = leaflet

        // Create a custom pane for the newest earthquake marker with highest z-index
        if (!map.getPane("newestEarthquakePane")) {
            map.createPane("newestEarthquakePane")
            map.getPane("newestEarthquakePane").style.zIndex = "1000" // Very high z-index
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => map.removeLayer(marker))
        markersRef.current = []

        // Clear the newest marker reference
        if (newestMarkerRef.current) {
            map.removeLayer(newestMarkerRef.current)
            newestMarkerRef.current = null
        }

        // Only add markers if showEarthquakes is true
        if (showEarthquakes) {
            // Add new markers
            earthquakes.forEach((quake, index) => {
                const magnitude = Number.parseFloat(quake.size.toFixed(1))

                // Create a pin-style marker with magnitude displayed inside
                const markerIcon = L.divIcon({
                    html: `
          <div style="
            position: relative;
            width: 20px;
            height: 25px;
          ">
            <div style="
              position: absolute;
              top: 0;
              left: 0;
              width: 20px;
              height: 20px;
              background-color: ${getColorForMagnitude(magnitude)};
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 0 5px rgba(0,0,0,0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-weight: bold;
              font-size: 10px;
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
                    iconSize: [20, 25],
                    iconAnchor: [10, 25], // Bottom center of the pin
                    popupAnchor: [0, -20], // Center above the pin
                })

                // Create marker with the custom icon
                const marker = L.marker([quake.latitude, quake.longitude], {
                    icon: markerIcon,
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

                // If this is the newest earthquake (index 0), create a much more visible pulsating dot
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
              box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
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
            })
        }
    }, [leaflet, earthquakes, onSelectEarthquake, showEarthquakes])

    // Add/remove seismic station markers
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Clear existing station markers
        stationMarkersRef.current.forEach((marker) => map.removeLayer(marker))
        stationMarkersRef.current = []

        // Add seismic station markers if enabled
        if (showSeismicStations) {
            SEISMIC_STATIONS.forEach((station) => {
                // Create custom icon for seismic station
                const seismicIcon = L.divIcon({
                    html: `
            <div style="
              background-color: rgba(255, 0, 0, 0.9); 
              width: 18px; 
              height: 18px; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 0 6px rgba(0,0,0,0.7);
            "></div>
          `,
                    className: "",
                    iconSize: [18, 18],
                    iconAnchor: [9, 9],
                })

                const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
                    icon: seismicIcon,
                    zIndexOffset: 2000, // Ensure stations appear above earthquake markers
                }).addTo(map)

                // Add tooltip
                marker.bindTooltip(
                    `
          <div>
            <div class="font-bold">${station.name}</div>
            <div>Seismic Station</div>
            <div>${station.description || ""}</div>
          </div>
        `,
                    {
                        className: "leaflet-tooltip-custom",
                        direction: "top",
                    },
                )

                stationMarkersRef.current.push(marker)
            })
        }
    }, [leaflet, showSeismicStations])

    // Add GPS station markers from extended dataset
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Clear existing GPS markers
        gpsMarkersRef.current.forEach((marker) => map.removeLayer(marker))
        gpsMarkersRef.current = []

        // Add GPS station markers if enabled
        if (showGpsStations) {
            // Add custom GPS stations
            if (customGpsStations.length > 0) {
                customGpsStations.forEach((station) => {
                    // Create custom icon for GPS station
                    const gpsIcon = L.divIcon({
                        html: `
              <div style="
                background-color: rgba(0, 0, 0, 0.6); 
                width: 7px; 
                height: 7px; 
                border: 1px solid white;
                box-shadow: 0 0 4px rgba(0,0,0,0.7);
              "></div>
            `,
                        className: "gps-station-marker", // Add a class for easier selection
                        iconSize: [7, 7],
                        iconAnchor: [3.5, 3.5],
                    })

                    const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
                        icon: gpsIcon,
                        zIndexOffset: 900, // Lower z-index so popups appear above
                    }).addTo(map)

                    // Add tooltip
                    marker.bindTooltip(
                        `
          <div>
            <div class="font-bold">${station.name}</div>
            <div>GPS Station</div>
            <div>${station.description || ""}</div>
          </div>
        `,
                        {
                            className: "leaflet-tooltip-custom",
                            direction: "top",
                        },
                    )

                    // Add click event to open the station data
                    marker.on("click", () => {
                        if (onSelectGpsStation) {
                            onSelectGpsStation(station)
                        }
                    })

                    gpsMarkersRef.current.push(marker)
                })
            }

            // Add extended GPS stations
            EXTENDED_GPS_STATIONS.forEach((station) => {
                // Create custom icon for GPS station - red dot for all stations
                const gpsIcon = L.divIcon({
                    html: `
            <div style="
              background-color: rgba(255, 0, 0, 0.8); 
              width: 6px; 
              height: 6px; 
              border-radius: 50%;
              border: 1px solid white;
              box-shadow: 0 0 3px rgba(0,0,0,0.5);
            "></div>
          `,
                    className: "gps-station-marker", // Add a class for easier selection
                    iconSize: [6, 6],
                    iconAnchor: [3, 3],
                })

                const marker = L.marker([station.coordinates[0], station.coordinates[1]], {
                    icon: gpsIcon,
                    zIndexOffset: 950, // Higher than custom GPS stations
                }).addTo(map)

                // Add tooltip
                marker.bindTooltip(
                    `
        <div>
          <div class="font-bold">${station.name} (${station.id})</div>
          <div>GPS Station - ${station.source}</div>
          <div>Type: ${station.type}</div>
        </div>
      `,
                    {
                        className: "leaflet-tooltip-custom",
                        direction: "top",
                    },
                )

                // Add click event to open the station data if URL exists
                if (station.url) {
                    marker.on("click", () => {
                        if (onSelectOfficialGpsStation) {
                            onSelectOfficialGpsStation(station)
                        }
                    })
                }

                gpsMarkersRef.current.push(marker)
            })
        }
    }, [leaflet, showGpsStations, customGpsStations, onSelectGpsStation, onSelectOfficialGpsStation])

    // Add/remove fissure lines based on enabled fissures
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Clear existing fissure lines
        fissureLinesRef.current.forEach((line) => map.removeLayer(line))
        fissureLinesRef.current = []

        // Clear eruption markers
        eruptionMarkersRef.current.forEach((marker) => map.removeLayer(marker))
        eruptionMarkersRef.current = []

        // Add fissure lines for enabled fissures - ensure they're on top of the map
        if (enabledFissures.length > 0 && showFissures) {
            // Create a custom pane with very high z-index if it doesn't exist
            if (!map.getPane("fissuresPane")) {
                map.createPane("fissuresPane")
                map.getPane("fissuresPane").style.zIndex = "900" // Very high z-index, but below newest earthquake
            }

            VOLCANIC_FISSURES.forEach((fissure) => {
                if (enabledFissures.includes(fissure.id)) {
                    fissure.coordinates.forEach((lineCoords) => {
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
                    })
                }
            })
        }
    }, [leaflet, enabledFissures, showFissures])

    // Add custom seismometer markers
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Clear existing seismometer markers
        seismometerMarkersRef.current.forEach((marker) => map.removeLayer(marker))
        seismometerMarkersRef.current = []

        // Add seismometer markers if enabled
        if (showSeismometers && customSeismometers.length > 0) {
            customSeismometers.forEach((seismometer) => {
                // Create custom icon for seismometer
                const seismometerIcon = L.divIcon({
                    html: `
            <div style="
              background-color: rgba(128, 0, 128, 0.7);
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
            })
        }
    }, [leaflet, showSeismometers, customSeismometers, onSelectSeismometer])

    // Add lava flow polygons
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Clear existing lava flow polygons
        lavaFlowsRef.current.forEach((polygon) => map.removeLayer(polygon))
        lavaFlowsRef.current = []

        // Add lava flow polygons if enabled
        if (showLavaFlows && lavaFlows.length > 0) {
            lavaFlows.forEach((flow) => {
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
            })
        }
    }, [leaflet, showLavaFlows, lavaFlows])

    // Add berm polygons
    useEffect(() => {
        if (!leaflet) return

        const { L, map } = leaflet

        // Clear existing berm polygons
        bermsRef.current.forEach((polygon) => map.removeLayer(polygon))
        bermsRef.current = []

        // Add berm polygons if enabled
        if (showBerms && berms.length > 0) {
            berms.forEach((berm) => {
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
            })
        }
    }, [leaflet, showBerms, berms])

    // Add an event listener for map settings changes
    useEffect(() => {
        const handleMapSettingsChanged = () => {
            // Force update of map layers based on new settings
            if (leaflet) {
                // Update GPS markers
                gpsMarkersRef.current.forEach((marker) => leaflet.map.removeLayer(marker))
                gpsMarkersRef.current = []

                // Update seismic station markers
                stationMarkersRef.current.forEach((marker) => leaflet.map.removeLayer(marker))
                stationMarkersRef.current = []

                // Update seismometer markers
                seismometerMarkersRef.current.forEach((marker) => leaflet.map.removeLayer(marker))
                seismometerMarkersRef.current = []

                // Update fissure lines
                fissureLinesRef.current.forEach((line) => leaflet.map.removeLayer(line))
                fissureLinesRef.current = []

                // Update eruption markers
                eruptionMarkersRef.current.forEach((marker) => leaflet.map.removeLayer(marker))
                eruptionMarkersRef.current = []

                // Update lava flows
                lavaFlowsRef.current.forEach((polygon) => leaflet.map.removeLayer(polygon))
                lavaFlowsRef.current = []

                // Update berms
                bermsRef.current.forEach((polygon) => leaflet.map.removeLayer(polygon))
                bermsRef.current = []
            }
        }

        window.addEventListener("mapSettingsChanged", handleMapSettingsChanged)

        return () => {
            window.removeEventListener("mapSettingsChanged", handleMapSettingsChanged)
        }
    }, [leaflet])

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

    // Add this function inside the component, before the return statement
    // Remove any updateLayerVisibility function and related code that was trying to directly manipulate layers
    // The direct prop-based approach is simpler and more reliable

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
                                <div className="w-3 h-3 rounded-full bg-red-500 border border-white opacity-80"></div>
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