"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Maximize2, Minimize2, Move, Play, Plus, ChevronDown, ChevronUp } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface YouTubeVideo {
  id: string
  name: string
  videoId: string
  isDefault?: boolean
  isUserAdded?: boolean
}

interface YoutubePlayerProps {
  defaultVideoId?: string
  onClose?: () => void
}

export default function YoutubePlayer({ defaultVideoId = "xDRWMU9JzKA", onClose }: YoutubePlayerProps) {
  // Size states: small, medium, large
  const [size, setSize] = useLocalStorage("earthquakeYoutubeSize", "medium")
  const playerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Position state for dragging
  const [position, setPosition] = useLocalStorage("earthquakeYoutubePosition", { x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Video selection and management
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [defaultVideos] = useState<YouTubeVideo[]>([
    { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
    { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0", isDefault: true },
    { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY", isDefault: true },
  ])
  const [userVideos, setUserVideos] = useLocalStorage<YouTubeVideo[]>("userYoutubeVideos", [])
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [newVideoUrl, setNewVideoUrl] = useState("")
  const [newVideoName, setNewVideoName] = useState("")
  const [isAddingVideo, setIsAddingVideo] = useState(false)
  const [error, setError] = useState("")

  // Combine default and user videos
  const allVideos = [...defaultVideos, ...userVideos]

  // Initialize selected video
  useEffect(() => {
    // First try to find the defaultVideoId in all videos
    const initialVideo =
      allVideos.find((v) => v.videoId === defaultVideoId) || (allVideos.length > 0 ? allVideos[0] : null)

    if (initialVideo) {
      setSelectedVideo(initialVideo)
    } else if (defaultVideoId) {
      // If defaultVideoId is not in our list but is provided, create a temporary video
      setSelectedVideo({
        id: "default",
        name: "Live Feed",
        videoId: defaultVideoId,
        isDefault: true,
      })
    }
  }, [defaultVideoId, defaultVideos, userVideos])

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

  // Video selection functions
  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const selectVideo = (video: YouTubeVideo) => {
    setSelectedVideo(video)
    setIsDropdownOpen(false)
    // Store the selected video ID in localStorage for future use
    localStorage.setItem("earthquakeYoutubeVideoId", video.videoId)
    // Reset the player state when changing videos
    setIsPlaying(false)
  }

  const toggleAddVideo = () => {
    setIsAddingVideo(!isAddingVideo)
    setError("")
    setNewVideoUrl("")
    setNewVideoName("")
  }

  const extractVideoId = (url: string): string | null => {
    // Handle youtube.com/watch?v= format
    let match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/)
    if (match && match[1]) {
      return match[1]
    }

    // Handle youtu.be/ format
    match = url.match(/youtu\.be\/([^?&]+)/)
    if (match && match[1]) {
      return match[1]
    }

    // Handle embed format
    match = url.match(/youtube\.com\/embed\/([^?&]+)/)
    if (match && match[1]) {
      return match[1]
    }

    return null
  }

  const addUserVideo = () => {
    if (!newVideoUrl.trim() || !newVideoName.trim()) {
      setError("Please enter both a name and URL")
      return
    }

    const videoId = extractVideoId(newVideoUrl)
    if (!videoId) {
      setError("Invalid YouTube URL")
      return
    }

    const newVideo: YouTubeVideo = {
      id: `user-${Date.now()}`,
      name: newVideoName,
      videoId: videoId,
      isUserAdded: true,
    }

    const updatedUserVideos = [...userVideos, newVideo]
    setUserVideos(updatedUserVideos)
    selectVideo(newVideo)
    setIsAddingVideo(false)
    setNewVideoUrl("")
    setNewVideoName("")
    setError("")
  }

  const removeUserVideo = (videoId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const updatedVideos = userVideos.filter((video) => video.id !== videoId)
    setUserVideos(updatedVideos)

    // If the removed video was selected, select the first available video
    if (selectedVideo && selectedVideo.id === videoId) {
      const allRemainingVideos = [...defaultVideos, ...updatedVideos]
      if (allRemainingVideos.length > 0) {
        selectVideo(allRemainingVideos[0])
      }
    }
  }

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Construct the iframe source URL with proper parameters
  const iframeSrc =
    isPlaying && selectedVideo ? `https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1&mute=1` : ""

  if (!selectedVideo) return null

  return (
    <div
      ref={playerRef}
      className="fixed z-[2000] bg-gray-900 border border-gray-700 rounded-lg shadow-lg overflow-hidden transition-all duration-300"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${getWidthForSize(size)}px`,
        height: `${getHeightForSize(size) + 40}px`, // Add header height
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
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              size="sm"
              className="text-sm font-medium text-white flex items-center gap-1 h-6 px-2"
              onClick={toggleDropdown}
            >
              {selectedVideo.name}
              {isDropdownOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>

            {isDropdownOpen && (
              <div className="absolute left-0 mt-1 w-64 bg-gray-900 border border-gray-700 rounded-md shadow-lg z-20">
                <div className="max-h-60 overflow-y-auto">
                  {allVideos.map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center justify-between px-4 py-2 hover:bg-gray-800 cursor-pointer"
                      onClick={() => selectVideo(video)}
                    >
                      <span className={`${selectedVideo.id === video.id ? "font-bold" : ""} text-sm`}>
                        {video.name}
                      </span>
                      {video.isUserAdded && (
                        <button
                          onClick={(e) => removeUserVideo(video.id, e)}
                          className="text-red-500 hover:text-red-400"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {!isAddingVideo ? (
                  <div
                    className="border-t border-gray-700 px-4 py-2 text-center cursor-pointer hover:bg-gray-800 flex items-center justify-center gap-1 text-sm"
                    onClick={toggleAddVideo}
                  >
                    <Plus className="h-3 w-3" /> Add Custom Feed
                  </div>
                ) : (
                  <div className="border-t border-gray-700 p-3 space-y-2">
                    <Input
                      value={newVideoName}
                      onChange={(e) => setNewVideoName(e.target.value)}
                      placeholder="Enter feed name"
                      className="bg-gray-800 border-gray-700 text-sm h-7"
                    />
                    <Input
                      value={newVideoUrl}
                      onChange={(e) => setNewVideoUrl(e.target.value)}
                      placeholder="YouTube URL"
                      className="bg-gray-800 border-gray-700 text-sm h-7"
                    />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <div className="flex gap-2">
                      <Button onClick={addUserVideo} variant="default" size="sm" className="w-full h-7 text-xs">
                        Add
                      </Button>
                      <Button
                        onClick={toggleAddVideo}
                        variant="outline"
                        size="sm"
                        className="border-gray-700 h-7 text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1">
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

      <div className="relative w-full" style={{ height: `${getHeightForSize(size)}px` }}>
        {!isPlaying ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <Button
              onClick={() => setIsPlaying(true)}
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
          ></iframe>
        )}
      </div>
    </div>
  )
}
