"use client"

import type React from "react"

import { useState } from "react"
import { APP_VERSION } from "@/lib/version"

export default function ManageVersions() {
  const [currentVersion, setCurrentVersion] = useState(APP_VERSION)
  const [newVersion, setNewVersion] = useState("")
  const [updateMessage, setUpdateMessage] = useState("")
  const [isCritical, setIsCritical] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/version/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newVersion,
          updateMessage,
          isCritical,
        }),
      })

      const data = await response.json()
      setResult(data)

      if (data.success) {
        setNewVersion("")
        setUpdateMessage("")
        setIsCritical(false)
      }
    } catch (error) {
      setResult({ success: false, message: "Failed to update version" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Manage Versions</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">Current Version</h2>
        <p className="text-gray-600 mb-2">
          The current deployed version is: <span className="font-medium">{currentVersion}</span>
        </p>
        <p className="text-sm text-gray-500">
          Note: Updating the version here will only affect the notification system. You still need to deploy your
          application with the new version.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Release New Version</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="newVersion" className="block text-sm font-medium text-gray-700 mb-1">
              New Version Number
            </label>
            <input
              type="text"
              id="newVersion"
              value={newVersion}
              onChange={(e) => setNewVersion(e.target.value)}
              placeholder="e.g., 1.0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label htmlFor="updateMessage" className="block text-sm font-medium text-gray-700 mb-1">
              Update Message
            </label>
            <textarea
              id="updateMessage"
              value={updateMessage}
              onChange={(e) => setUpdateMessage(e.target.value)}
              placeholder="What's new in this version?"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              rows={3}
              required
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isCritical"
              checked={isCritical}
              onChange={(e) => setIsCritical(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label htmlFor="isCritical" className="ml-2 block text-sm text-gray-700">
              Critical Update (Forces users to update)
            </label>
          </div>

          {result && (
            <div
              className={`p-3 rounded ${result.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
            >
              {result.message}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Release New Version"}
          </button>
        </form>
      </div>
    </div>
  )
}
