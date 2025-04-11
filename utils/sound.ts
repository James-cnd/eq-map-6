// Sound utility functions
import { playBeep } from "./sound-fallback"

// Function to play a sound
export function playSound(volume = 0.7): void {
  try {
    // Use the Web Audio API to create a ping sound
    // This is more reliable than loading audio files
    playBeep(volume)
  } catch (error) {
    console.error("Failed to play sound:", error)
    // Try a simpler beep as last resort
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (AudioContext) {
        const audioContext = new AudioContext()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.type = "sine"
        oscillator.frequency.value = 1200 // Higher pitch
        gainNode.gain.value = volume

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.start()
        setTimeout(() => oscillator.stop(), 150)
      }
    } catch (fallbackError) {
      console.error("Even fallback sound failed:", fallbackError)
    }
  }
}

// No need to preload when using Web Audio API
export function preloadSound(): void {
  // Nothing to preload
}
