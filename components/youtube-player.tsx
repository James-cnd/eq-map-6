"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2, Move, Play, AlertTriangle, Edit, Check } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Input } from "@/components/ui/input"

interface YoutubePlayerProps {
  defaultVideoId?: string
  onClose?: () => void
}

// Add a QuickEdit component for changing the video ID
function QuickEdit({
  videoId,
  onSave,
  onCancel,
}: {
  videoId: string
  onSave: (newId: string) => void
  onCancel: () => void
}) {
  const [newVideoId, setNewVideoId] = useState(videoId)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newVideoId.trim()) {
      // Extract video ID if a full URL was pasted
      const extractedId = extractVideoId(newVideoId)
      onSave(extractedId || newVideoId)
    }
  }

  // Function to extract YouTube video ID from various URL formats
  const extractVideoId = (input: string): string | null => {
    // Handle YouTube URLs
    const urlRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
    const match = input.match(urlRegex)

    if (match && match[1]) {
      return match[1]
    }

    // Handle direct video IDs (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input
    }

    return null
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2 bg-gray-800 border-t border-gray-700">
      <Input
        value={newVideoId}
        onChange={(e) => setNewVideoId(e.target.value)}
        placeholder="YouTube video ID or URL"
        className="flex-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
      />
      <Button type="submit" size="sm" className="h-8 px-2 bg-green-600 hover:bg-green-700">
        <Check className="h-4 w-4" />
      </Button>
      <Button type="button" size="sm" variant="ghost" className="h-8 px-2" onClick={onCancel}>
        <X className="h-4 w-4" />
      </Button>
    </form>
  )
}

export default function YoutubePlayer({ defaultVideoId = "faH3xrKyP_o", onClose }: YoutubePlayerProps) {
  // Size states: small, medium, large
  const [size, setSize] = useLocalStorage("earthquakeYoutubeSize", "medium")
  const [storedVideoId, setStoredVideoId] = useLocalStorage("earthquakeYoutubeVideoId", defaultVideoId)
  const [videoId, setVideoId] = useState<string>(storedVideoId)
  const playerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [showQuickEdit, setShowQuickEdit] = useState(false)

  // Position state for dragging
  const [position, setPosition] = useLocalStorage("earthquakeYoutubePosition", { x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Initialize position to center of screen on first load
  useEffect(() => {
    if (position.x === 0 && position.y === 0 && typeof window !== "undefined") {
      const centerX = Math.max(0, (window.innerWidth - getWidthForSize(size)) / 2)
      const centerY = Math.max(0, (window.innerHeight - getHeightForSize(size)) / 2)
      setPosition({ x: centerX, y: centerY })
    }
  }, [position, size, setPosition])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768 && size === "large") {
        setSize("medium")
      }

      // Ensure player stays within viewport after resize
      if (playerRef.current) {
        const rect = playerRef.current.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const newX = position.x
        const newY = position.y

        const newXBounded = Math.max(0, Math.min(newX, viewportWidth - rect.width))
        const newYBounded = Math.max(0, Math.min(newY, viewportHeight - rect.height))

        if (newXBounded !== position.x || newYBounded !== position.y) {
          setPosition({ x: newXBounded, y: newYBounded })
        }
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [position, size, setPosition, setSize])

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (playerRef.current) {
      const rect = playerRef.current.getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
      setIsDragging(true)
    }
  }

  // Handle mouse move for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && playerRef.current) {
        // Calculate new position
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Get viewport dimensions
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // Get player dimensions
        const playerWidth = playerRef.current.offsetWidth
        const playerHeight = playerRef.current.offsetHeight

        // Ensure player stays within viewport bounds
        const boundedX = Math.max(0, Math.min(newX, viewportWidth - playerWidth))
        const boundedY = Math.max(0, Math.min(newY, viewportHeight - playerHeight))

        setPosition({ x: boundedX, y: boundedY })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, dragOffset, setPosition])

  // Helper function to get width based on size
  const getWidthForSize = (size: string): number => {
    switch (size) {
      case "small":
        return 320
      case "large":
        return Math.min(window.innerWidth * 0.8, 1200)
      case "medium":
      default:
        return 640
    }
  }

  // Helper function to get height based on size
  const getHeightForSize = (size: string): number => {
    switch (size) {
      case "small":
        return 180
      case "large":
        return Math.min(window.innerHeight * 0.7, 675)
      case "medium":
      default:
        return 360
    }
  }

  // Cycle through sizes
  const cycleSize = () => {
    if (size === "small") setSize("medium")
    else if (size === "medium") setSize("large")
    else setSize("small")
  }

  // Handle video ID change
  const handleVideoIdChange = (newId: string) => {
    // Validate the new video ID
    if (!isValidYoutubeId(newId)) {
      setVideoError("Invalid YouTube video ID. Please check the ID and try again.")
      return
    }

    setVideoId(newId)
    setStoredVideoId(newId)
    setIsPlaying(true)
    setVideoError(null)
    setShowQuickEdit(false)
  }

  // Function to validate YouTube video ID
  const isValidYoutubeId = (id: string): boolean => {
    return /^[a-zA-Z0-9_-]{11}$/.test(id)
  }

  // Construct the iframe source URL with proper parameters
  const iframeSrc = isPlaying ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1` : ""
  console.log("YouTube iframe src:", iframeSrc)

  // Function to handle video load error
  const handleVideoError = (event: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    const iframe = event.target as HTMLIFrameElement
    const src = iframe.src

    if (src.includes("error=150")) {
      setVideoError("This video is unavailable. Please try a different feed or check your browser settings.")
    } else if (src.includes("sign-in")) {
      setVideoError("This live stream requires you to sign in to YouTube to watch.")
    } else {
      setVideoError("This video is unavailable to play.")
    }
    setIsPlaying(false)
  }

  // Calculate extra height for my ability to quickly edit
  const extraHeight = showQuickEdit ? 44 : 0

  return (
    <div
      ref={playerRef}
      className="fixed z-[2000] bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${getWidthForSize(size)}px`,
        height: `${getHeightForSize(size) + 40 + extraHeight}px`, // Add header height + QuickEdit height if visible
        cursor: isDragging ? "grabbing" : "auto",
        pointerEvents: "auto",
      }}
    >
      <div
        className="flex items-center justify-between p-2 bg-gray-800 border-b border-gray-700 cursor-grab"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4 text-gray-400" />
          <div className="text-sm font-medium text-white">Live Feed</div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={() => setShowQuickEdit(!showQuickEdit)}
            title="Change video"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-gray-400 hover:text-white"
            onClick={cycleSize}
            title={`Current size: ${size}. Click to change size.`}
          >
            {size === "large" ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-7 w-7 text-gray-400 hover:text-white" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {showQuickEdit && (
        <QuickEdit videoId={videoId} onSave={handleVideoIdChange} onCancel={() => setShowQuickEdit(false)} />
      )}

      <div className="relative w-full" style={{ height: `${getHeightForSize(size)}px` }}>
        {videoError ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black text-white text-center p-4">
            <div className="space-y-2">
              <AlertTriangle className="h-6 w-6 mx-auto text-red-500" />
              <p className="font-bold">Video Unavailable</p>
              <p className="text-sm">{videoError}</p>
              {videoError.includes("sign in") && (
                <p className="text-sm">You may need to sign in to YouTube in a separate tab.</p>
              )}
              <Button
                onClick={() => setShowQuickEdit(true)}
                className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm"
              >
                <Edit className="h-4 w-4 mr-2" />
                Change Video
              </Button>
            </div>
          </div>
        ) : !isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Button
              onClick={() => {
                setIsPlaying(true)
                setVideoError(null) // Clear any previous errors
              }}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center"
            >
              <Play className="h-8 w-8" />
            </Button>
            <div className="absolute bottom-4 text-white text-sm">Click to play YouTube live feed</div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            src={iframeSrc}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            onError={handleVideoError}
          ></iframe>
        )}
      </div>
    </div>
  )
}
