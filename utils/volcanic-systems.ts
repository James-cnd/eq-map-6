// Simplified volcanic system boundaries based on data from icelandicvolcanos.is
// These are approximate polygon coordinates for major volcanic systems in Iceland

export interface VolcanicSystem {
  id: string
  name: string
  // Simplified polygon boundaries as [longitude, latitude] pairs
  boundaries: [number, number][]
  // Center point for simple radius-based checks
  center: [number, number]
  // Approximate radius in kilometers
  radiusKm: number
  type: "central volcano" | "fissure swarm" | "volcanic system"
  lastEruption?: string
  color: string
}

export const VOLCANIC_SYSTEMS: VolcanicSystem[] = [
  {
    id: "reykjanes",
    name: "Reykjanes",
    boundaries: [
      [-22.7, 63.8],
      [-22.0, 63.9],
      [-21.8, 63.8],
      [-22.5, 63.7],
    ],
    center: [-22.2, 63.8],
    radiusKm: 15,
    type: "volcanic system",
    lastEruption: "2023",
    color: "#FF5733",
  },
  {
    id: "krysuvik",
    name: "Krýsuvík",
    boundaries: [
      [-22.1, 63.9],
      [-21.7, 64.0],
      [-21.5, 63.9],
      [-21.9, 63.8],
    ],
    center: [-21.9, 63.9],
    radiusKm: 10,
    type: "volcanic system",
    lastEruption: "2021",
    color: "#FFC300",
  },
  {
    id: "fagradalsfjall",
    name: "Fagradalsfjall",
    boundaries: [
      [-22.3, 63.9],
      [-22.0, 64.0],
      [-21.8, 63.9],
      [-22.1, 63.8],
    ],
    center: [-22.2, 63.9],
    radiusKm: 8,
    type: "central volcano",
    lastEruption: "2022",
    color: "#FF5733",
  },
  {
    id: "katla",
    name: "Katla",
    boundaries: [
      [-19.2, 63.6],
      [-18.7, 63.7],
      [-18.5, 63.5],
      [-19.0, 63.4],
    ],
    center: [-19.0, 63.6],
    radiusKm: 20,
    type: "central volcano",
    lastEruption: "1918",
    color: "#C70039",
  },
  {
    id: "eyjafjallajokull",
    name: "Eyjafjallajökull",
    boundaries: [
      [-19.8, 63.6],
      [-19.4, 63.7],
      [-19.2, 63.5],
      [-19.6, 63.4],
    ],
    center: [-19.6, 63.6],
    radiusKm: 15,
    type: "central volcano",
    lastEruption: "2010",
    color: "#900C3F",
  },
  {
    id: "grimsvotn",
    name: "Grímsvötn",
    boundaries: [
      [-17.5, 64.5],
      [-17.0, 64.6],
      [-16.8, 64.3],
      [-17.3, 64.2],
    ],
    center: [-17.3, 64.4],
    radiusKm: 25,
    type: "central volcano",
    lastEruption: "2011",
    color: "#581845",
  },
  {
    id: "bardarbunga",
    name: "Bárðarbunga",
    boundaries: [
      [-18.0, 64.7],
      [-17.5, 64.8],
      [-17.3, 64.5],
      [-17.8, 64.4],
    ],
    center: [-17.7, 64.6],
    radiusKm: 25,
    type: "central volcano",
    lastEruption: "2014-2015",
    color: "#C70039",
  },
  {
    id: "askja",
    name: "Askja",
    boundaries: [
      [-16.8, 65.1],
      [-16.3, 65.2],
      [-16.1, 64.9],
      [-16.6, 64.8],
    ],
    center: [-16.5, 65.0],
    radiusKm: 20,
    type: "central volcano",
    lastEruption: "1961",
    color: "#900C3F",
  },
  {
    id: "krafla",
    name: "Krafla",
    boundaries: [
      [-16.9, 65.8],
      [-16.5, 65.9],
      [-16.3, 65.6],
      [-16.7, 65.5],
    ],
    center: [-16.7, 65.7],
    radiusKm: 15,
    type: "central volcano",
    lastEruption: "1984",
    color: "#581845",
  },
  {
    id: "hekla",
    name: "Hekla",
    boundaries: [
      [-19.8, 64.0],
      [-19.4, 64.1],
      [-19.2, 63.9],
      [-19.6, 63.8],
    ],
    center: [-19.6, 64.0],
    radiusKm: 15,
    type: "central volcano",
    lastEruption: "2000",
    color: "#FF5733",
  },
]

// Function to calculate distance between two points in km using the Haversine formula
export function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1)
  const dLon = deg2rad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c // Distance in km
  return d
}

function deg2rad(deg: number): number {
  return deg * (Math.PI / 180)
}

// Function to determine which volcanic system an earthquake belongs to
export function getVolcanicSystem(latitude: number, longitude: number): VolcanicSystem | null {
  // First, check if the point is within any of the volcanic systems using a simple radius check
  for (const system of VOLCANIC_SYSTEMS) {
    const distance = getDistanceFromLatLonInKm(latitude, longitude, system.center[1], system.center[0])

    if (distance <= system.radiusKm) {
      return system
    }
  }

  return null
}

// Function to get a link to the volcanic system page on icelandicvolcanos.is
export function getVolcanicSystemLink(systemId: string): string {
  return `https://icelandicvolcanos.is/?volcano=${systemId}`
}
