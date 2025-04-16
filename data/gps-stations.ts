export interface GpsStation {
  id: number
  marker: string
  name: string
  information_url: string
  rinex_url: string
  coordinates: {
    lat: number
    lon: number
    altitude: number
  }
  date_from: string
  date_to: string | null
  agency: {
    name: string
  }
  short: string // Add short code
  volc?: string // Add volcanic system reference
}

// Remove all GPS stations from the GPS_STATIONS array
export const GPS_STATIONS: GpsStation[] = []

// Function to fetch GPS stations from a JSON file
// This will be used when you add your own GPS stations data later
export async function getGpsStations(): Promise<GpsStation[]> {
  try {
    // Try to fetch the data from a JSON file
    const response = await fetch("/data/gps-stations.json")

    // If the fetch fails, return the default stations
    if (!response.ok) {
      console.warn("Could not load GPS stations data, using default stations")
      return GPS_STATIONS
    }

    const data = await response.json()
    return data as GpsStation[]
  } catch (error) {
    // If there's an error, return the default stations
    console.warn("Error loading GPS stations data, using default stations:", error)
    return GPS_STATIONS
  }
}
