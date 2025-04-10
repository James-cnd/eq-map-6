// Fallback sound utility using Web Audio API
// This creates a higher-pitched ping sound

// Function to create a ping sound using Web Audio API
export function playBeep(volume = 0.7, frequency = 1200, duration = 150): void {
    try {
        // Create audio context
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioContext) {
            console.error("Web Audio API is not supported in this browser")
            return
        }

        const audioContext = new AudioContext()

        // Create oscillator for the main tone
        const oscillator = audioContext.createOscillator()
        oscillator.type = "sine"
        oscillator.frequency.value = frequency // Higher frequency for a ping sound

        // Create gain node for volume control and envelope
        const gainNode = audioContext.createGain()
        gainNode.gain.value = 0 // Start silent

        // Connect nodes
        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        // Create a ping envelope (quick attack, short decay)
        const now = audioContext.currentTime
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(volume, now + 0.01) // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000) // Decay

        // Start and stop the tone
        oscillator.start(now)
        oscillator.stop(now + duration / 1000 + 0.05) // Add a small buffer after the decay

        // Close the audio context after the sound is done
        setTimeout(() => {
            if (audioContext.state !== "closed") {
                audioContext.close()
            }
        }, duration + 100)
    } catch (error) {
        console.error("Failed to play beep:", error)
    }
}
