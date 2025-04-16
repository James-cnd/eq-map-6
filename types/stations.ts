// Define seismic and GPS monitoring stations in Iceland
export interface Station {
  id: string
  name: string
  type: "seismic" | "gps"
  coordinates: [number, number] // [latitude, longitude]
  description?: string
  url?: string // URL field for GPS station data link
  value?: number // Optional value to display
  short?: string // Short code for the station
  volc?: string // Volcanic system reference
  alt?: number // Altitude
}

// Custom GPS station interface with additional fields
export interface CustomGpsStation {
  id: string
  name: string
  coordinates: [number, number]
  description: string
  url: string
  dateAdded: string
  value?: number // Optional value to display
  short?: string // Short code
  volc?: string // Volcanic system reference
  alt?: number // Altitude
}

// Remove all seismic stations from the SEISMIC_STATIONS array
export const SEISMIC_STATIONS: Station[] = []

// GPS stations based on the provided data
export const GPS_STATIONS: Station[] = [
  // Reykjavik area
  {
    id: "REYK",
    name: "Reykjavík",
    type: "gps",
    coordinates: [64.1392, -21.9558],
    description: "GPS station in Reykjavík",
    short: "REYK",
    alt: 93.04,
    volc: "",
  },
  // Akureyri
  {
    id: "AKUR",
    name: "Akureyri",
    type: "gps",
    coordinates: [65.6854, -18.1225],
    description: "GPS station in Akureyri",
    short: "AKUR",
    alt: 134.21,
    volc: "",
  },
  // Stórólfshvoll
  {
    id: "STOR",
    name: "Stórólfshvoll",
    type: "gps",
    coordinates: [63.7527, -20.2121],
    description: "GPS station at Stórólfshvoll",
    short: "STOR",
    alt: 124.84,
    volc: "katla",
  },
  // Hamragarðaheiði
  {
    id: "HAMR",
    name: "Hamragarðaheiði",
    type: "gps",
    coordinates: [63.6224, -19.9857],
    description: "GPS station at Hamragarðaheiði",
    short: "HAMR",
    alt: 160.39,
    volc: "katla",
  },
  // Krafla
  {
    id: "KRAC",
    name: "Krafla",
    type: "gps",
    coordinates: [65.6945, -16.7749],
    description: "GPS station at Krafla volcano",
    short: "KRAC",
    alt: 521.92,
    volc: "krafla",
  },
  // Grímsvötn
  {
    id: "GFUM",
    name: "Grímsfjall",
    type: "gps",
    coordinates: [64.4068, -17.2666],
    description: "GPS station at Grímsvötn volcano",
    short: "GFUM",
    alt: 1790.8,
    volc: "grimsvotn",
  },
  // Ísakot (near Hekla)
  {
    id: "ISAK",
    name: "Ísakot",
    type: "gps",
    coordinates: [64.1193, -19.7472],
    description: "GPS station near Hekla volcano",
    short: "ISAK",
    alt: 319.48,
    volc: "hekla",
  },
  // Reykjanes Peninsula
  {
    id: "GONH",
    name: "Gónhóll",
    type: "gps",
    coordinates: [63.8855, -22.2703],
    description: "GPS station on Reykjanes Peninsula",
    short: "GONH",
    alt: 347.5,
    volc: "reykjanes",
  },
  // Add more stations from the provided data as needed
  {
    id: "VONC",
    name: "Vonarskarð",
    type: "gps",
    coordinates: [64.6736, -17.7544],
    description: "GPS station at Vonarskarð",
    short: "VONC",
    alt: 1082.24,
    volc: "bardarbunga",
  },
  {
    id: "DYNC",
    name: "Dyngjuháls",
    type: "gps",
    coordinates: [64.7906, -17.3663],
    description: "GPS station at Dyngjuháls",
    short: "DYNC",
    alt: 1208.53,
    volc: "bardarbunga",
  },
  {
    id: "KIDC",
    name: "Kiðagilsdrög",
    type: "gps",
    coordinates: [65.0192, -17.9424],
    description: "GPS station at Kiðagilsdrög",
    short: "KIDC",
    alt: 935.16,
    volc: "",
  },
  {
    id: "THOC",
    name: "Þorvaldshraun",
    type: "gps",
    coordinates: [64.9337, -16.6756],
    description: "GPS station at Þorvaldshraun",
    short: "THOC",
    alt: 749.99,
    volc: "askja",
  },
]
