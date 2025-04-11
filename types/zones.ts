// Define geographic zones of interest in Iceland
export interface Zone {
  id: string
  name: string
  // Bounding box coordinates [minLat, minLng, maxLat, maxLng]
  bounds: [number, number, number, number]
  center: [number, number]
  zoom: number
}

export const ICELAND_ZONES: Zone[] = [
  {
    id: "all",
    name: "All Iceland",
    bounds: [62.0, -24.0, 67.0, -13.0],
    center: [64.9631, -19.0208],
    zoom: 6,
  },
  {
    id: "reykjanes",
    name: "Reykjanes Peninsula",
    bounds: [63.7, -23.0, 64.1, -21.5],
    center: [63.89, -22.35],
    zoom: 9,
  },
  {
    id: "grimsvotn",
    name: "Grímsvötn",
    bounds: [64.3, -17.5, 64.5, -17.0],
    center: [64.42, -17.33],
    zoom: 10,
  },
  {
    id: "bardarbunga",
    name: "Bárðarbunga",
    bounds: [64.6, -17.6, 64.7, -17.2],
    center: [64.64, -17.53],
    zoom: 10,
  },
  {
    id: "hekla",
    name: "Hekla",
    bounds: [63.9, -19.8, 64.1, -19.5],
    center: [64.0, -19.67],
    zoom: 10,
  },
  {
    id: "katla",
    name: "Katla",
    bounds: [63.5, -19.2, 63.7, -18.7],
    center: [63.63, -19.05],
    zoom: 10,
  },
  {
    id: "askja",
    name: "Askja",
    bounds: [65.0, -16.9, 65.1, -16.6],
    center: [65.05, -16.75],
    zoom: 10,
  },
  {
    id: "krafla",
    name: "Krafla",
    bounds: [65.6, -17.0, 65.8, -16.6],
    center: [65.73, -16.78],
    zoom: 10,
  },
  {
    id: "tjornes",
    name: "Tjörnes Fracture Zone",
    bounds: [66.0, -18.5, 66.5, -17.0],
    center: [66.2, -17.8],
    zoom: 9,
  },
]
