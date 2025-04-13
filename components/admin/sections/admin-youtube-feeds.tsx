import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Plus, Trash2, Edit, Play, Check } from "lucide-react"

interface YouTubeFeed {
    id: string
    name: string
    videoId: string
    isDefault?: boolean
}

export function AdminYoutubeFeeds() {
    const [error, setError] = useState("")
    const [customVideoName, setCustomVideoName] = useState("")
    const [customVideoId, setCustomVideoId] = useState("")
    const [editingFeedId, setEditingFeedId] = useState<string | null>(null)
    const [editFeedName, setEditFeedName] = useState("")
    const [editFeedVideoId, setEditFeedVideoId] = useState("")
    const [youtubeFeeds, setYoutubeFeeds] = useState<YouTubeFeed[]>([])

    // Extract video ID from URL or ID string
    const extractVideoId = (input: string) => {
        const urlRegex = /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?/\s]{11})/i
        const match = input.match(urlRegex)

        if (match && match[1]) {
            return match[1]
        }

        if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
            return input
        }

        return null
    }

    const addYoutubeFeed = () => {
        if (!customVideoName.trim()) {
            setError("Please enter a name for the feed")
            return
        }

        const videoId = extractVideoId(customVideoId)
        if (!videoId) {
            setError("Please enter a valid YouTube URL or video ID")
            return
        }

        const newFeed: YouTubeFeed = {
            id: `feed-${Date.now()}`,
            name: customVideoName,
            videoId: videoId,
        }

        setYoutubeFeeds([...youtubeFeeds, newFeed])
        setCustomVideoName("")
        setCustomVideoId("")
        setError("")
    }

    const setDefaultFeed = (id: string) => {
        const updatedFeeds = youtubeFeeds.map((feed) => ({
            ...feed,
            isDefault: feed.id === id,
        }))
        setYoutubeFeeds(updatedFeeds)

        const defaultFeed = updatedFeeds.find((feed) => feed.id === id)
        if (defaultFeed) {
            localStorage.setItem("earthquakeYoutubeVideoId", defaultFeed.videoId)
        }
    }

    const deleteYoutubeFeed = (id: string) => {
        const isDefault = youtubeFeeds.find((feed) => feed.id === id)?.isDefault
        if (isDefault) {
            setError("Cannot delete the default feed. Please set another feed as default first.")
            return
        }
        setYoutubeFeeds(youtubeFeeds.filter((feed) => feed.id !== id))
    }

    const startEditFeed = (feed: YouTubeFeed) => {
        setEditingFeedId(feed.id)
        setEditFeedName(feed.name)
        setEditFeedVideoId(feed.videoId)
    }

    const saveEditedFeed = () => {
        if (!editingFeedId) return

        if (!editFeedName.trim()) {
            setError("Please enter a name for the feed")
            return
        }

        const videoId = extractVideoId(editFeedVideoId) || editFeedVideoId
        if (!videoId) {
            setError("Please enter a valid YouTube URL or video ID")
            return
        }

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

        const editedFeed = updatedFeeds.find((feed) => feed.id === editingFeedId)
        if (editedFeed?.isDefault) {
            localStorage.setItem("earthquakeYoutubeVideoId", videoId)
        }

        setEditingFeedId(null)
        setEditFeedName("")
        setEditFeedVideoId("")
        setError("")
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">Live Feed Management</h3>
                    <p className="text-sm text-gray-300">
                        Configure the YouTube live feeds that will be displayed to users. The default feed will play
                        automatically.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-800/50 rounded-md">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-3">
                    <div>
                        <Label htmlFor="youtube-name">Feed Name</Label>
                        <Input
                            id="youtube-name"
                            value={customVideoName}
                            onChange={(e) => setCustomVideoName(e.target.value)}
                            placeholder="e.g., Fagradalsfjall Eruption"
                            className="bg-gray-800 border-gray-700 mt-1"
                        />
                    </div>

                    <div>
                        <Label htmlFor="youtube-url">YouTube Video URL or ID</Label>
                        <Input
                            id="youtube-url"
                            value={customVideoId}
                            onChange={(e) => setCustomVideoId(e.target.value)}
                            placeholder="e.g., https://www.youtube.com/watch?v=xDRWMU9JzKA"
                            className="bg-gray-800 border-gray-700 mt-1"
                        />
                        <p className="text-xs text-gray-400 mt-1">Enter a YouTube video ID or full URL to add a new feed</p>
                    </div>

                    <Button onClick={addYoutubeFeed} disabled={!customVideoName || !customVideoId} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Feed
                    </Button>
                </div>

                <div className="border-t border-gray-700 pt-4">
                    <h3 className="font-medium mb-3">Managed Live Feeds</h3>
                    <div className="space-y-3">
                        {youtubeFeeds.map((feed) => (
                            <div key={feed.id} className="p-3 bg-gray-800 rounded-md">
                                {editingFeedId === feed.id ? (
                                    <div className="space-y-3">
                                        <Input
                                            value={editFeedName}
                                            onChange={(e) => setEditFeedName(e.target.value)}
                                            className="bg-gray-700 border-gray-600"
                                            placeholder="Feed name"
                                        />
                                        <Input
                                            value={editFeedVideoId}
                                            onChange={(e) => setEditFeedVideoId(e.target.value)}
                                            className="bg-gray-700 border-gray-600"
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
                                            >
                                                Cancel
                                            </Button>
                                            <Button size="sm" onClick={saveEditedFeed}>
                                                <Check className="h-4 w-4 mr-1" />
                                                Save
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">{feed.name}</span>
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
                                                onClick={() => startEditFeed(feed)}
                                                className="text-gray-400 hover:text-white"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => setDefaultFeed(feed.id)}
                                                disabled={feed.isDefault}
                                                className={`${feed.isDefault ? "opacity-50" : "text-gray-400 hover:text-green-500"}`}
                                            >
                                                <Play className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => deleteYoutubeFeed(feed.id)}
                                                disabled={feed.isDefault}
                                                className={`${feed.isDefault ? "opacity-50" : "text-gray-400 hover:text-red-500"}`}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-3 bg-gray-800/50 rounded-md mt-4">
                    <h4 className="font-medium text-sm mb-2">How It Works</h4>
                    <ul className="text-sm text-gray-300 space-y-2 list-disc pl-4">
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