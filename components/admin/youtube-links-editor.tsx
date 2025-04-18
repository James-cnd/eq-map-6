"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Trash2, Save, Play, Edit, Check, ExternalLink } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface YouTubeFeed {
  id: string
  name: string
  videoId: string
  isDefault?: boolean
}

export default function YouTubeLinksEditor() {
  const [youtubeFeeds, setYoutubeFeeds] = useLocalStorage<YouTubeFeed[]>("earthquakeYoutubeFeeds", [
    { id: "afar", name: "AFAR Multicam", videoId: "xDRWMU9JzKA", isDefault: true },
    { id: "ruv", name: "RÚV Geldingadalir", videoId: "BA-_4pLG8Y0" },
    { id: "reykjanes", name: "Reykjanes Peninsula", videoId: "PnxAoXLfPpY" },
  ])

  const [customVideoName, setCustomVideoName] = useState("")
  const [customVideoId, setCustomVideoId] = useState("")
  const [editingFeedId, setEditingFeedId] = useState<string | null>(null)
  const [editFeedName, setEditFeedName] = useState("")
  const [editFeedVideoId, setEditFeedVideoId] = useState("")
  const [error, setError] = useState("")

  // Add a new YouTube feed
  const addYoutubeFeed = () => {
    // Validate inputs
    if (!customVideoName.trim()) {
      setError("Please enter a name for the feed")
      return
    }

    const videoId = extractVideoId(customVideoId)
    if (!videoId) {
      setError("Please enter a valid YouTube URL or video ID")
      return
    }

    // Create new feed
    const newFeed: YouTubeFeed = {
      id: `feed-${Date.now()}`,
      name: customVideoName,
      videoId: videoId,
    }

    // Add to feeds
    setYoutubeFeeds([...youtubeFeeds, newFeed])

    // Reset form
    setCustomVideoName("")
    setCustomVideoId("")
    setError("")

    // Show success notification
    toast({
      title: "Success",
      description: `YouTube feed "${customVideoName}" added successfully!`,
    })
  }

  // Set a feed as default
  const setDefaultFeed = (id: string) => {
    const updatedFeeds = youtubeFeeds.map((feed) => ({
      ...feed,
      isDefault: feed.id === id,
    }))
    setYoutubeFeeds(updatedFeeds)

    // Update the active video ID in localStorage
    const defaultFeed = updatedFeeds.find((feed) => feed.id === id)
    if (defaultFeed) {
      localStorage.setItem("earthquakeYoutubeVideoId", defaultFeed.videoId)
    }

    // Show success notification
    toast({
      title: "Success",
      description: "Default feed updated successfully!",
    })
  }

  // Delete a YouTube feed
  const deleteYoutubeFeed = (id: string) => {
    // Check if this is the default feed
    const isDefault = youtubeFeeds.find((feed) => feed.id === id)?.isDefault

    // Don't allow deleting the default feed
    if (isDefault) {
      toast({
        title: "Error",
        description: "Cannot delete the default feed. Please set another feed as default first.",
        variant: "destructive",
      })
      return
    }

    setYoutubeFeeds(youtubeFeeds.filter((feed) => feed.id !== id))

    toast({
      title: "Success",
      description: "Feed deleted successfully!",
    })
  }

  // Start editing a feed
  const startEditFeed = (feed: YouTubeFeed) => {
    setEditingFeedId(feed.id)
    setEditFeedName(feed.name)
    setEditFeedVideoId(feed.videoId)
  }

  // Save edited feed
  const saveEditedFeed = () => {
    if (!editingFeedId) return

    // Validate inputs
    if (!editFeedName.trim()) {
      setError("Please enter a name for the feed")
      return
    }

    const videoId = extractVideoId(editFeedVideoId) || editFeedVideoId
    if (!videoId) {
      setError("Please enter a valid YouTube URL or video ID")
      return
    }

    // Update the feed
    const updatedFeeds = youtubeFeeds.map((feed) => {
      if (feed.id === editingFeedId) {
        return {
          ...feed,
          name: editFeedName,
          videoId: videoId,
        }
      }
      return feed
    })

    setYoutubeFeeds(updatedFeeds)

    // If this was the default feed, update the active video ID
    const editedFeed = updatedFeeds.find((feed) => feed.id === editingFeedId)
    if (editedFeed?.isDefault) {
      localStorage.setItem("earthquakeYoutubeVideoId", videoId)
    }

    // Reset editing state
    setEditingFeedId(null)
    setEditFeedName("")
    setEditFeedVideoId("")
    setError("")

    // Show success notification
    toast({
      title: "Success",
      description: "Feed updated successfully!",
    })
  }

  // Extract video ID from URL or ID string
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

  // Preview a YouTube video
  const previewVideo = (videoId: string) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank")
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Add New YouTube Feed</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="feed-name">Feed Name</Label>
            <Input
              id="feed-name"
              value={customVideoName}
              onChange={(e) => setCustomVideoName(e.target.value)}
              placeholder="e.g., Fagradalsfjall Eruption"
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div>
            <Label htmlFor="video-url">YouTube Video URL or ID</Label>
            <Input
              id="video-url"
              value={customVideoId}
              onChange={(e) => setCustomVideoId(e.target.value)}
              placeholder="e.g., https://www.youtube.com/watch?v=xDRWMU9JzKA"
              className="bg-gray-700 border-gray-600 text-white"
            />
            <p className="text-xs text-gray-400 mt-1">Enter a YouTube video ID or full URL</p>
          </div>

          <Button
            onClick={addYoutubeFeed}
            disabled={!customVideoName || !customVideoId}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Add New Feed
          </Button>
        </div>
      </div>

      <div className="bg-white/10 p-4 rounded-lg">
        <h2 className="text-lg font-medium mb-4">Manage YouTube Feeds</h2>

        {youtubeFeeds.length === 0 ? (
          <p className="text-gray-400">No YouTube feeds added yet.</p>
        ) : (
          <div className="space-y-3">
            {youtubeFeeds.map((feed) => (
              <div key={feed.id} className="bg-gray-700 p-3 rounded-lg">
                {editingFeedId === feed.id ? (
                  <div className="space-y-3">
                    <Input
                      value={editFeedName}
                      onChange={(e) => setEditFeedName(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="Feed name"
                    />
                    <Input
                      value={editFeedVideoId}
                      onChange={(e) => setEditFeedVideoId(e.target.value)}
                      className="bg-gray-600 border-gray-500 text-white"
                      placeholder="Video ID or URL"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingFeedId(null)
                          setEditFeedName("")
                          setEditFeedVideoId("")
                        }}
                        className="bg-gray-600 hover:bg-gray-500"
                      >
                        Cancel
                      </Button>
                      <Button size="sm" onClick={saveEditedFeed} className="bg-green-600 hover:bg-green-700">
                        <Check className="h-4 w-4 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{feed.name}</span>
                        {feed.isDefault && (
                          <span className="text-xs bg-green-800 text-green-200 px-2 py-0.5 rounded">Default</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-1">ID: {feed.videoId}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => previewVideo(feed.videoId)}
                        className="text-gray-400 hover:text-white"
                        title="Preview"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => startEditFeed(feed)}
                        className="text-gray-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setDefaultFeed(feed.id)}
                        disabled={feed.isDefault}
                        className={`${feed.isDefault ? "opacity-50" : "text-gray-400 hover:text-green-500"}`}
                        title="Set as default"
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteYoutubeFeed(feed.id)}
                        disabled={feed.isDefault}
                        className={`${feed.isDefault ? "opacity-50" : "text-gray-400 hover:text-red-500"}`}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-gray-800/50 rounded-md">
          <h3 className="text-sm font-medium mb-2">How It Works</h3>
          <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
            <li>The default feed (marked with green) will play automatically when users open the live feed</li>
            <li>Users can switch between feeds using the dropdown in the live feed panel</li>
            <li>Use the play button to set a feed as the default</li>
            <li>You cannot delete the default feed - set another feed as default first</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
