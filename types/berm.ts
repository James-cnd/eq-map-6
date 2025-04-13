// Define berm types (defensive barriers)
export interface Berm {
  id: string
  name: string
  description?: string
  coordinates: [number, number][][] // Array of coordinate pairs forming the line
  constructionDate: string
  completionDate?: string
  color: string // Always brown
  createdAt: string
}

// Empty array for berms - will be populated by admin
export const BERMS: Berm[] = []
