// Define the GPS station interface
export interface GpsStationExtended {
  id: string
  name: string
  coordinates: [number, number] // [latitude, longitude]
  source: string
  type: "official" | "research" | "monitoring"
  url?: string
}

// Define a small default set of GPS stations
export const EXTENDED_GPS_STATIONS: GpsStationExtended[] = [
  {
    id: "REYK",
    name: "Reykjavík",
    coordinates: [64.1383, -21.9033],
    source: "Research",
    type: "research",
  },
  {
    id: "AKUR",
    name: "Akureyri",
    coordinates: [65.6854, -18.1225],
    source: "IMO",
    type: "official",
    url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=AKUR",
  },
  {
    id: "GRIM",
    name: "Grímsvötn",
    coordinates: [64.4167, -17.2667],
    source: "Research",
    type: "research",
  },
  {
    id: "BARD",
    name: "Bárðarbunga",
    coordinates: [64.64, -17.53],
    source: "Research",
    type: "research",
  },
  {
    id: "KRAC",
    name: "Krafla",
    coordinates: [65.6945, -16.7749],
    source: "IMO",
    type: "official",
    url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=KRAC",
  },
]

// Function to fetch extended GPS stations from a JSON file
// This will be used when you add your own GPS stations data later
export async function getExtendedGpsStations(): Promise<GpsStationExtended[]> {
  try {
    // Try to fetch the extended data from a JSON file
    const response = await fetch("/data/gps-stations-extended.json")

    // If the fetch fails, return the default stations
    if (!response.ok) {
      console.warn("Could not load extended GPS stations data, using default stations")
      return EXTENDED_GPS_STATIONS
    }

    const data = await response.json()
    return data as GpsStationExtended[]
  } catch (error) {
    // If there's an error, return the default stations
    console.warn("Error loading extended GPS stations data, using default stations:", error)
    return EXTENDED_GPS_STATIONS
  }
}
