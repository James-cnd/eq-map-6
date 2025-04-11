// Define volcanic fissures in Iceland
export interface Fissure {
  id: string
  name: string
  eruption: string
  coordinates: [number, number][][] // Array of coordinate pairs forming the fissure line
  startDate: string
  endDate?: string
  color: string
}

// Empty array for volcanic fissures - removed predefined fissures as requested
export const VOLCANIC_FISSURES: Fissure[] = []
