export interface Earthquake {
    id: string
    timestamp: string
    latitude: number
    longitude: number
    depth: number
    size: number
    quality: number
    humanReadableLocation: string
    review?: string // Added to match the Python code
}
