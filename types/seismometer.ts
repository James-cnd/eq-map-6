// Define seismometer display types
export interface Seismometer {
  id: string
  name: string
  stationCode: string
  channel: string
  coordinates: [number, number] // [latitude, longitude]
  description?: string
  dateAdded: string
}
