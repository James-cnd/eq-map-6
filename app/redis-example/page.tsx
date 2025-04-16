"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RedisExample() {
  const [key, setKey] = useState("test-key")
  const [value, setValue] = useState("")
  const [storedValue, setStoredValue] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch data from Redis
  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/redis?key=${encodeURIComponent(key)}`)
      const result = await response.json()

      if (response.ok) {
        setStoredValue(result.data)
      } else {
        setError(result.error || "Failed to fetch data")
        setStoredValue(null)
      }
    } catch (err) {
      setError("An error occurred while fetching data")
      setStoredValue(null)
    } finally {
      setLoading(false)
    }
  }

  // Store data in Redis
  const storeData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      })

      const result = await response.json()

      if (response.ok) {
        setValue("")
        fetchData() // Refresh data after storing
      } else {
        setError(result.error || "Failed to store data")
      }
    } catch (err) {
      setError("An error occurred while storing data")
    } finally {
      setLoading(false)
    }
  }

  // Delete data from Redis
  const deleteData = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/redis?key=${encodeURIComponent(key)}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (response.ok) {
        setStoredValue(null)
      } else {
        setError(result.error || "Failed to delete data")
      }
    } catch (err) {
      setError("An error occurred while deleting data")
    } finally {
      setLoading(false)
    }
  }

  // Fetch data on initial load
  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle>Redis Edge API Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Key</label>
              <Input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Enter key" disabled={loading} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Value</label>
              <Input
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="Enter value to store"
                disabled={loading}
              />
            </div>

            <div className="flex space-x-2">
              <Button onClick={storeData} disabled={loading || !key || !value}>
                Store
              </Button>
              <Button onClick={fetchData} disabled={loading || !key} variant="outline">
                Fetch
              </Button>
              <Button onClick={deleteData} disabled={loading || !key} variant="destructive">
                Delete
              </Button>
            </div>

            {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}

            {storedValue !== null && (
              <div className="p-2 bg-green-100 text-green-700 rounded">
                <p className="font-medium">Stored Value:</p>
                <p className="break-all">{JSON.stringify(storedValue)}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
