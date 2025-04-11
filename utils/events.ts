/**
 * Safely dispatches a custom event
 * @param eventName The name of the event to dispatch
 * @param detail Optional detail object to include with the event
 */
export function dispatchCustomEvent(eventName: string, detail?: any): void {
  if (typeof window !== "undefined") {
    try {
      const event = new CustomEvent(eventName, { detail })
      window.dispatchEvent(event)
    } catch (error) {
      console.error(`Error dispatching ${eventName} event:`, error)
    }
  }
}
