"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface YoutubeLink {
  id: string
  title: string
  url: string
}

export default function YoutubeLinksEditor() {
  const [links, setLinks] = useLocalStorage<YoutubeLink[]>("youtubeLinks", [])
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [editingId, setEditingId] = useState<string | null>(null)

  const saveLink = () => {
    if (!title || !url) return

    // Validate YouTube URL
    if (!isValidYoutubeUrl(url)) {
      alert("Please enter a valid YouTube URL")
      return
    }

    if (editingId) {
      // Update existing link
      setLinks(links.map((link) => (link.id === editingId ? { ...link, title, url } : link)))
      setEditingId(null)
    } else {
      // Add new link
      const newLink: YoutubeLink = {
        id: Date.now().toString(),
        title,
        url,
      }
      setLinks([...links, newLink])
    }

    // Reset form
    setTitle("")
    setUrl("")
  }

  const editLink = (link: YoutubeLink) => {
    setTitle(link.title)
    setUrl(link.url)
    setEditingId(link.id)
  }

  const deleteLink = (id: string) => {
    setLinks(links.filter((link) => link.id !== id))
  }

  const cancelEdit = () => {
    setTitle("")
    setUrl("")
    setEditingId(null)
  }

  const isValidYoutubeUrl = (url: string) => {
    const pattern = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    return pattern.test(url)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">YouTube Links Editor</h2>

      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter video title"
            className="bg-gray-700"
            placeholder="Enter video title"
            className="bg-gray-700"
          />
        </div>

        <div>
          <Label htmlFor="url">YouTube URL</Label>
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube video URL"
            className="bg-gray-700"
          />
        </div>

        <div className="flex space-x-2">
          <Button onClick={saveLink} variant="default">
            {editingId ? "Update Link" : "Add Link"}
          </Button>

          {editingId && (
            <Button onClick={cancelEdit} variant="outline">
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Saved YouTube Links</h3>
        {links.length === 0 ? (
          <p className="text-gray-400">No YouTube links added yet.</p>
        ) : (
          <div className="space-y-2">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                <div className="overflow-hidden">
                  <span className="font-medium">{link.title}</span>
                  <div className="text-sm text-gray-400 truncate">{link.url}</div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => editLink(link)} variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button onClick={() => deleteLink(link.id)} variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
