// Define seismic and GPS monitoring stations in Iceland
export interface Station {
    id: string
    name: string
    type: "seismic" | "gps"
    coordinates: [number, number] // [latitude, longitude]
    description?: string
    url?: string // Added URL field for GPS station data link
}

// Custom GPS station interface with additional fields
export interface CustomGpsStation {
    id: string
    name: string
    coordinates: [number, number]
    description: string
    url: string
    dateAdded: string
}

// Import the official GPS stations
import { GPS_STATIONS as OFFICIAL_GPS_STATIONS } from "@/data/gps-stations"

// Seismic stations (SIL network)
export const SEISMIC_STATIONS: Station[] = [
    {
        id: "RBDCF",
        name: "RBDCF",
        type: "seismic",
        coordinates: [63.8721, -22.1833],
        description: "Seismic station near Reykjanes",
    },
    {
        id: "R135F",
        name: "R135F",
        type: "seismic",
        coordinates: [63.895, -22.4167],
        description: "Seismic station in Reykjanes Peninsula",
    },
    {
        id: "R977A",
        name: "R977A",
        type: "seismic",
        coordinates: [63.9167, -22.3333],
        description: "Seismic station monitoring Svartsengi area",
    },
    // Additional stations
    {
        id: "REYK",
        name: "REYK",
        type: "seismic",
        coordinates: [64.1383, -21.9033],
        description: "Reykjavík station",
    },
    {
        id: "GRIV",
        name: "GRIV",
        type: "seismic",
        coordinates: [64.5483, -17.38],
        description: "Grímsfjall station",
    },
]

// Convert official GPS stations to our Station format
export const GPS_STATIONS: Station[] = OFFICIAL_GPS_STATIONS.map((station) => ({
    id: station.marker,
    name: station.name,
    type: "gps",
    coordinates: [station.coordinates.lat, station.coordinates.lon],
    description: `${station.marker} - ${station.name} (${station.agency.name})`,
    url: station.information_url,
}))