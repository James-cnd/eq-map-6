"use client"
import { Button } from "@/components/ui/button"
import { X, Plus, ExternalLink, Save, Trash2 } from "lucide-react"
import { useState } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ReferencesPopupProps {
  onClose: () => void
}

export interface Reference {
  id: string
  title: string
  url: string
  description: string
  dateAdded: string
  category: string
}

export default function ReferencesPopup({ onClose }: ReferencesPopupProps) {
  // Store references in localStorage with initial values
  const [references, setReferences] = useLocalStorage<Reference[]>("earthquakeReferences", [
    {
      id: "ref-1",
      title: "Icelandic Meteorological Office API",
      url: "https://api.vedur.is/?urls.primaryName=Skjálftalísa",
      description: "Official API for earthquake data from the Icelandic Meteorological Office",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Data Source",
    },
    {
      id: "ref-3",
      title: "Icelandic Meteorological Office",
      url: "https://en.vedur.is/",
      description: "Official source for earthquake and volcanic activity data in Iceland",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Data Source",
    },
    {
      id: "ref-4",
      title: "Leaflet.js",
      url: "https://leafletjs.com/",
      description: "Open-source JavaScript library for interactive maps used in this application",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Technology",
    },
    {
      id: "ref-5",
      title: "Leaflet.markercluster",
      url: "https://github.com/Leaflet/Leaflet.markercluster",
      description: "Plugin for Leaflet that provides beautiful animated marker clustering",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Technology",
    },
    {
      id: "ref-6",
      title: "Raspberry Shake",
      url: "https://raspberryshake.org/",
      description: "Personal seismograph network used for seismic data visualization",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Technology",
    },
    {
      id: "ref-7",
      title: "Icelandic Volcanoes",
      url: "https://icelandicvolcanos.is/",
      description:
        "Comprehensive information about Icelandic volcanic systems, used for identifying which volcanic system earthquakes occur in",
      dateAdded: new Date().toISOString().split("T")[0],
      category: "Data Source",
    },
  ])

  // State for adding new references
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newCategory, setNewCategory] = useState("Data Source")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState("")

  // Categories for references - removed 'Inspiration'
  const categories = ["Data Source", "Technology", "Educational", "Research", "News", "Other"]

  // Add a new reference
  const addReference = () => {
    // Validate inputs
    if (!newTitle.trim()) {
      setError("Please enter a title")
      return
    }

    if (!newUrl.trim()) {
      setError("Please enter a URL")
      return
    }

    // Validate URL format
    try {
      new URL(newUrl)
    } catch (e) {
      setError("Please enter a valid URL (include http:// or https://)")
      return
    }

    // Create new reference
    const newReference: Reference = {
      id: `ref-${Date.now()}`,
      title: newTitle,
      url: newUrl,
      description: newDescription,
      dateAdded: new Date().toISOString().split("T")[0],
      category: newCategory,
    }

    // Add to references
    setReferences([...references, newReference])

    // Reset form
    setNewTitle("")
    setNewUrl("")
    setNewDescription("")
    setNewCategory("Data Source")
    setIsAdding(false)
    setError("")

    // Show success notification
    showNotification("Reference added successfully")
  }

  // Delete a reference
  const deleteReference = (id: string) => {
    setReferences(references.filter((ref) => ref.id !== id))
    showNotification("Reference deleted")
  }

  // Show notification
  const showNotification = (message: string) => {
    const notification = document.createElement("div")
    notification.style.position = "fixed"
    notification.style.top = "20px"
    notification.style.left = "50%"
    notification.style.transform = "translateX(-50%)"
    notification.style.backgroundColor = "rgba(0, 128, 0, 0.8)"
    notification.style.color = "white"
    notification.style.padding = "10px 20px"
    notification.style.borderRadius = "4px"
    notification.style.zIndex = "3000"
    notification.style.boxShadow = "0 2px 10px rgba(0,0,0,0.3)"
    notification.textContent = message

    document.body.appendChild(notification)

    // Remove notification after 3 seconds
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  // Group references by category
  const referencesByCategory = references.reduce(
    (acc, ref) => {
      if (!acc[ref.category]) {
        acc[ref.category] = []
      }
      acc[ref.category].push(ref)
      return acc
    },
    {} as Record<string, Reference[]>,
  )

  return (
    <div className="fixed inset-0 z-[1003] flex items-center justify-center bg-black/50">
      <div
        className="bg-gray-900 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center sticky top-0 bg-gray-900 z-10">
          <h2 className="text-xl font-bold text-white">References & Resources (Admin)</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Add reference button */}
          {!isAdding ? (
            <Button onClick={() => setIsAdding(true)} className="mb-6 w-full bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add New Reference
            </Button>
          ) : (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg">
              <h3 className="text-lg font-medium mb-3 text-white">Add New Reference</h3>

              {error && (
                <div className="mb-3 p-2 bg-red-900/50 border border-red-700 rounded text-red-200 text-sm">{error}</div>
              )}

              <div className="space-y-3">
                <div>
                  <Label htmlFor="ref-title">Title</Label>
                  <Input
                    id="ref-title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., Icelandic Meteorological Office"
                  />
                </div>

                <div>
                  <Label htmlFor="ref-url">URL</Label>
                  <Input
                    id="ref-url"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="e.g., https://en.vedur.is/"
                  />
                </div>

                <div>
                  <Label htmlFor="ref-category">Category</Label>
                  <select
                    id="ref-category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 text-white rounded-md p-2"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="ref-description">Description (Optional)</Label>
                  <Textarea
                    id="ref-description"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white min-h-[80px]"
                    placeholder="Brief description of the resource"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsAdding(false)
                      setError("")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={addReference}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Reference
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* References by category */}
          {Object.keys(referencesByCategory).length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p>No references added yet.</p>
            </div>
          ) : (
            Object.entries(referencesByCategory).map(([category, refs]) => (
              <div key={category} className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-white border-b border-gray-700 pb-2">{category}</h3>
                <div className="space-y-3">
                  {refs.map((ref) => (
                    <div key={ref.id} className="p-3 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-white">{ref.title}</h4>
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 text-sm flex items-center mt-1"
                          >
                            {ref.url}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                          {ref.description && <p className="text-gray-300 text-sm mt-2">{ref.description}</p>}
                          <p className="text-gray-500 text-xs mt-2">Added: {ref.dateAdded}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteReference(ref.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 bg-gray-900">
          <p className="text-sm text-gray-400">
            Total references: {references.length} across {Object.keys(referencesByCategory).length} categories
          </p>
        </div>
      </div>
    </div>
  )
}
