"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Maximize2, Minimize2, Move, ChevronDown } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface YouTubeFeed {
    id: string
    name: string
    videoId: string
    isDefault?: boolean
}

interface YoutubePlayerProps {
    defaultVideoId?: string
    onClose?: () => void
}

export default function YoutubePlayer({ defaultVideoId = "xDRWMU9JzKA", onClose }: YoutubePlayerProps) {
    // Size states: small, medium, large
    const [size, setSize] = useLocalStorage("earthquakeYoutubeSize", "medium")
    const [videoId, setVideoId] = useLocalStorage("earthquakeYoutubeVideoId", defaultVideoId)
    const [customVideoId, setCustomVideoId] = useState("")
    const [showInput, setShowInput] = useState(false)
    const [showFeedSelector, setShowFeedSelector] = useState(false)
    const [feeds] = useLocalStorage<YouTubeFeed[]>("earthquakeYoutubeFeeds", [
        { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
        { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
        { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
    ])

    // Position state for dragging
    const [position, setPosition] = useLocalStorage("earthquakeYoutubePosition", { x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
    const playerRef = useRef<HTMLDivElement>(null)
    const feedSelectorRef = useRef<HTMLDivElement>(null)

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
                const newX = Math.min(position.x, window.innerWidth - rect.width)
                const newY = Math.min(position.y, window.innerHeight - rect.height)

                if (newX !== position.x || newY !== position.y) {
                    setPosition({ x: newX, y: newY })
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

    // Close feed selector when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (feedSelectorRef.current && !feedSelectorRef.current.contains(e.target as Node)) {
                setShowFeedSelector(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    // Extract video ID from URL or ID string
    const extractVideoId = (input: string) => {
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

    const handleSetVideo = () => {
        const newVideoId = extractVideoId(customVideoId)
        if (newVideoId) {
            setVideoId(newVideoId)
            setCustomVideoId("")
            setShowInput(false)
        } else {
            alert("Please enter a valid YouTube video ID or URL")
        }
    }

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

    // Get current feed name
    const getCurrentFeedName = () => {
        const currentFeed = feeds.find((feed) => feed.videoId === videoId)
        return currentFeed?.name || "Custom Feed"
    }

    // Switch to a different feed
    const switchToFeed = (feed: YouTubeFeed) => {
        setVideoId(feed.videoId)
        setShowFeedSelector(false)
    }

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
                    <div className="relative">
                        <button
                            className="text-sm font-medium text-white flex items-center gap-1"
                            onClick={() => setShowFeedSelector(!showFeedSelector)}
                        >
                            {getCurrentFeedName()}
                            <ChevronDown className="h-3 w-3" />
                        </button>

                        {showFeedSelector && (
                            <div
                                ref={feedSelectorRef}
                                className="absolute top-full left-0 mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10 w-48"
                            >
                                {feeds.map((feed) => (
                                    <button
                                        key={feed.id}
                                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-700 flex items-center justify-between"
                                        onClick={() => switchToFeed(feed)}
                                    >
                                        <span>{feed.name}</span>
                                        {feed.videoId === videoId && <span className="h-2 w-2 rounded-full bg-green-500"></span>}
                                    </button>
                                ))}
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
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                ></iframe>
            </div>

            <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                {showInput ? (
                    <div className="flex w-full gap-1">
                        <input
                            type="text"
                            value={customVideoId}
                            onChange={(e) => setCustomVideoId(e.target.value)}
                            placeholder="Enter YouTube URL or ID"
                            className="flex-1 px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded text-white"
                        />
                        <Button size="sm" className="py-1 h-auto text-xs bg-blue-600 hover:bg-blue-700" onClick={handleSetVideo}>
                            Set
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            className="py-1 h-auto text-xs text-gray-300"
                            onClick={() => setShowInput(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                ) : (
                    <Button
                        size="sm"
                        className="text-xs bg-gray-800 hover:bg-gray-700 text-white"
                        onClick={() => setShowInput(true)}
                    >
                        Use Custom URL
                    </Button>
                )}
            </div>
        </div>
    )
}