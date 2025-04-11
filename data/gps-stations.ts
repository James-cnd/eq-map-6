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

// Define a comprehensive set of GPS stations across Iceland
export const GPS_STATIONS: GpsStation[] = [
  // Northern Iceland
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 20,
    marker: "AKUR",
    name: "Akureyri",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=AKUR",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=AKUR",
    coordinates: {
      altitude: 134.21,
      lon: -18.1225,
      lat: 65.6854,
    },
    date_to: null,
    date_from: "2001-07-31T00:00:00Z",
    short: "AKUR",
    volc: "",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 21,
    marker: "THEY",
    name: "Þeistareykir",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=THEY",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=THEY",
    coordinates: {
      altitude: 320.7,
      lon: -16.9611,
      lat: 65.8806,
    },
    date_to: null,
    date_from: "2001-08-01T00:00:00Z",
    short: "THEY",
    volc: "krafla",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 22,
    marker: "KRAC",
    name: "Krafla",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=KRAC",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=KRAC",
    coordinates: {
      altitude: 590.12,
      lon: -16.7749,
      lat: 65.6945,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "KRAC",
    volc: "krafla",
  },

  // Eastern Iceland
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 40,
    marker: "RHOF",
    name: "Höfn í Hornafirði",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=RHOF",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=RHOF",
    coordinates: {
      altitude: 82.56,
      lon: -15.1981,
      lat: 64.3073,
    },
    date_to: null,
    date_from: "2001-07-31T00:00:00Z",
    short: "RHOF",
    volc: "",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 41,
    marker: "HOFN",
    name: "Höfn",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HOFN",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HOFN",
    coordinates: {
      altitude: 82.56,
      lon: -15.2481,
      lat: 64.2673,
    },
    date_to: null,
    date_from: "2001-07-31T00:00:00Z",
    short: "HOFN",
    volc: "",
  },

  // Central Iceland - Vatnajökull area
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 30,
    marker: "GRIM",
    name: "Grímsvötn",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=GRIM",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=GRIM",
    coordinates: {
      altitude: 1722.0,
      lon: -17.2667,
      lat: 64.4167,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "GRIM",
    volc: "grimsvotn",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 31,
    marker: "BARD",
    name: "Bárðarbunga",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=BARD",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=BARD",
    coordinates: {
      altitude: 2000.0,
      lon: -17.53,
      lat: 64.64,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "BARD",
    volc: "bardarbunga",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 32,
    marker: "HAUC",
    name: "Haukadalur",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HAUC",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HAUC",
    coordinates: {
      altitude: 83.0,
      lon: -20.3,
      lat: 64.2,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "HAUC",
    volc: "",
  },

  // Western Iceland
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 35,
    marker: "REYK",
    name: "Reykjavík",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=REYK",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=REYK",
    coordinates: {
      altitude: 93.04,
      lon: -21.9558,
      lat: 64.1392,
    },
    date_to: null,
    date_from: "1999-08-01T00:00:00Z",
    short: "REYK",
    volc: "",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 36,
    marker: "OLKE",
    name: "Ölkelduháls",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=OLKE",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=OLKE",
    coordinates: {
      altitude: 410.0,
      lon: -21.2,
      lat: 64.0,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "OLKE",
    volc: "",
  },

  // Southern Iceland
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 25,
    marker: "STOR",
    name: "Stórólfshvoll",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=STOR",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=STOR",
    coordinates: {
      altitude: 124.84,
      lon: -20.2121,
      lat: 63.7527,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "STOR",
    volc: "katla",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 26,
    marker: "HAMR",
    name: "Hamragarðaheiði",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HAMR",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HAMR",
    coordinates: {
      altitude: 590.12,
      lon: -19.9857,
      lat: 63.6224,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "HAMR",
    volc: "katla",
  },

  // Reykjanes Peninsula
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 50,
    marker: "ISAK",
    name: "Ísakot",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=ISAK",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=ISAK",
    coordinates: {
      altitude: 247.12,
      lon: -20.6867,
      lat: 64.1193,
    },
    date_to: null,
    date_from: "2001-08-01T00:00:00Z",
    short: "ISAK",
    volc: "hekla",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 51,
    marker: "ELDH",
    name: "Eldhamrar",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=ELDH",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=ELDH",
    coordinates: {
      altitude: 120.0,
      lon: -22.3,
      lat: 63.8,
    },
    date_to: null,
    date_from: "2001-08-01T00:00:00Z",
    short: "ELDH",
    volc: "reykjanes",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 52,
    marker: "GRIF",
    name: "Grindavík",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=GRIF",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=GRIF",
    coordinates: {
      altitude: 60.0,
      lon: -22.45,
      lat: 63.85,
    },
    date_to: null,
    date_from: "2001-08-01T00:00:00Z",
    short: "GRIF",
    volc: "reykjanes",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 53,
    marker: "FAGR",
    name: "Fagradalsfjall",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=FAGR",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=FAGR",
    coordinates: {
      altitude: 350.0,
      lon: -22.3,
      lat: 63.9,
    },
    date_to: null,
    date_from: "2021-03-19T00:00:00Z",
    short: "FAGR",
    volc: "fagradalsfjall",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 54,
    marker: "SUND",
    name: "Sundhnúkur",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=SUND",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=SUND",
    coordinates: {
      altitude: 200.0,
      lon: -22.38,
      lat: 63.89,
    },
    date_to: null,
    date_from: "2023-12-18T00:00:00Z",
    short: "SUND",
    volc: "reykjanes",
  },

  // Northwestern Iceland
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 60,
    marker: "HVOL",
    name: "Hvolsvöllur",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=HVOL",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=HVOL",
    coordinates: {
      altitude: 106.0,
      lon: -20.22,
      lat: 63.75,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "HVOL",
    volc: "",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 61,
    marker: "VOGS",
    name: "Vogsósar",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=VOGS",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=VOGS",
    coordinates: {
      altitude: 10.0,
      lon: -21.7,
      lat: 63.85,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "VOGS",
    volc: "",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 62,
    marker: "SELF",
    name: "Selfoss",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=SELF",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=SELF",
    coordinates: {
      altitude: 20.0,
      lon: -21.0,
      lat: 63.93,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "SELF",
    volc: "",
  },

  // Northeastern Iceland
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 70,
    marker: "MYVA",
    name: "Mývatn",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=MYVA",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=MYVA",
    coordinates: {
      altitude: 300.0,
      lon: -16.9,
      lat: 65.6,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "MYVA",
    volc: "",
  },
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 71,
    marker: "ASBJ",
    name: "Ásbjarnarstaðir",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=ASBJ",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=ASBJ",
    coordinates: {
      altitude: 187.0,
      lon: -17.7,
      lat: 65.7,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "ASBJ",
    volc: "",
  },

  // Western Fjords
  {
    agency: { name: "Icelandic Meteorological Office" },
    id: 80,
    marker: "ISAF",
    name: "Ísafjörður",
    information_url: "https://api.epos-iceland.is/v1/gps/sitelog?station_marker=ISAF",
    rinex_url: "https://api.epos-iceland.is/v1/gps/data/rinex?station_marker=ISAF",
    coordinates: {
      altitude: 8.0,
      lon: -23.13,
      lat: 66.07,
    },
    date_to: null,
    date_from: "2001-06-09T00:00:00Z",
    short: "ISAF",
    volc: "",
  },
]

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
