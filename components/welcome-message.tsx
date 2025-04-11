"use client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { useEffect, useState } from "react"

interface WelcomeMessageProps {
  onClose: () => void
}

export default function WelcomeMessage({ onClose }: WelcomeMessageProps) {
  const [storedMessage, setStoredMessage] = useLocalStorage<{
    title: string
    content: string
    version: number
  }>("earthquakeWelcomeMessage", {
    title: "Welcome to Icelandic Earthquake Monitor",
    content:
      "Track real-time seismic activity across Iceland. Use the controls at the bottom of the screen to filter earthquakes and access additional information.",
    version: 1,
  })

  // Create a local state to ensure re-rendering when the message changes
  const [welcomeMessage, setWelcomeMessage] = useState(storedMessage)

  // Listen for welcome message changes
  useEffect(() => {
    const handleWelcomeMessageChange = (event: CustomEvent) => {
      setWelcomeMessage(event.detail)
    }

    // Add event listener
    window.addEventListener("welcomeMessageChanged", handleWelcomeMessageChange as EventListener)

    // Clean up
    return () => {
      window.removeEventListener("welcomeMessageChanged", handleWelcomeMessageChange as EventListener)
    }
  }, [])

  // Update local state when stored message changes
  useEffect(() => {
    setWelcomeMessage(storedMessage)
  }, [storedMessage])

  return (
    <div className="fixed top-16 right-4 z-[1003] max-w-sm">
      <Card className="bg-gray-900/95 border-gray-700 text-white shadow-lg">
        <div className="absolute top-2 right-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-6 w-6 text-gray-400 hover:text-white hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardContent className="pt-6 pb-4">
          <h3 className="font-bold text-lg mb-2">{welcomeMessage.title}</h3>
          <p className="text-sm text-gray-300">{welcomeMessage.content}</p>
        </CardContent>
      </Card>
    </div>
  )
}
