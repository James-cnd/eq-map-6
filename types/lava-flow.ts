// Define lava flow types
export interface LavaFlow {
  id: string
  name: string
  coordinates: [number, number][][] // Array of coordinate pairs forming the polygon
  startDate: string
  endDate?: string
  color: string
  opacity: number
}

// Empty array for lava flows - will be populated by admin
export const LAVA_FLOWS: LavaFlow[] = []
