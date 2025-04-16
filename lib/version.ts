// Default version if environment variable is not available
export const APP_VERSION = process.env.NEXT_PUBLIC_BUILD_ID || "1.0.0"

// Function to check if a version is newer
export function isNewerVersion(current: string, comparing: string): boolean {
  if (!current || !comparing) return false

  const currentParts = current.split(".").map(Number)
  const comparingParts = comparing.split(".").map(Number)

  for (let i = 0; i < Math.max(currentParts.length, comparingParts.length); i++) {
    const currentPart = currentParts[i] || 0
    const comparingPart = comparingParts[i] || 0

    if (comparingPart > currentPart) return true
    if (comparingPart < currentPart) return false
  }

  return false
}

// Generate a timestamp for this build
export const BUILD_TIMESTAMP = Date.now()
