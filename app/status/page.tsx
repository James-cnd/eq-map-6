"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

export default function StatusPage() {
  const [redisStatus, setRedisStatus] = useState<"loading" | "success" | "error">("loading")
  const [redisDetails, setRedisDetails] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<"loading" | "success" | "error">("loading")
  const [apiDetails, setApiDetails] = useState<any>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const checkStatus = async () => {
    setIsRefreshing(true)
    setRedisStatus("loading")
    setApiStatus("loading")

    // Check Redis status
    try {
      const redisResponse = await fetch("/api/redis-status")
      const redisData = await redisResponse.json()

      if (redisData.success) {
        setRedisStatus("success")
      } else {
        setRedisStatus("error")
      }

      setRedisDetails(redisData)
    } catch (error) {
      console.error("Error checking Redis status:", error)
      setRedisStatus("error")
      setRedisDetails({ error: error instanceof Error ? error.message : "Unknown error" })
    }

    // Check API status
    try {
      const apiResponse = await fetch("/api/earthquakes")
      const apiData = await apiResponse.json()

      if (apiData.success) {
        setApiStatus("success")
      } else {
        setApiStatus("error")
      }

      setApiDetails(apiData)
    } catch (error) {
      console.error("Error checking API status:", error)
      setApiStatus("error")
      setApiDetails({ error: error instanceof Error ? error.message : "Unknown error" })
    }

    setIsRefreshing(false)
  }

  useEffect(() => {
    checkStatus()
  }, [])

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">System Status</h1>
          <Button onClick={checkStatus} disabled={isRefreshing} className="bg-blue-600 hover:bg-blue-700">
            {isRefreshing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Status
              </>
            )}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Redis Status Card */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Redis Connection</span>
                {redisStatus === "loading" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {redisStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {redisStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {redisStatus === "loading" ? (
                <div className="animate-pulse h-20 bg-gray-800 rounded"></div>
              ) : redisStatus === "success" ? (
                <div className="space-y-2">
                  <div className="p-2 bg-green-900/30 border border-green-800 rounded">
                    <p className="text-green-400">Connection successful</p>
                    <p className="text-sm text-green-300">Ping response: {redisDetails?.ping}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Environment Variables</h3>
                    <div className="bg-gray-800 p-3 rounded text-xs font-mono">
                      {redisDetails?.env &&
                        Object.entries(redisDetails.env).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className={value === "Set" ? "text-green-400" : "text-red-400"}>{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-red-900/30 border border-red-800 rounded">
                    <p className="text-red-400">Connection failed</p>
                    <p className="text-sm text-red-300">{redisDetails?.error || "Unknown error"}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Environment Variables</h3>
                    <div className="bg-gray-800 p-3 rounded text-xs font-mono">
                      {redisDetails?.env &&
                        Object.entries(redisDetails.env).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span>{key}:</span>
                            <span className={value === "Set" ? "text-green-400" : "text-red-400"}>{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* API Status Card */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Earthquake API</span>
                {apiStatus === "loading" && <AlertTriangle className="h-5 w-5 text-yellow-500" />}
                {apiStatus === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
                {apiStatus === "error" && <XCircle className="h-5 w-5 text-red-500" />}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {apiStatus === "loading" ? (
                <div className="animate-pulse h-20 bg-gray-800 rounded"></div>
              ) : apiStatus === "success" ? (
                <div className="space-y-2">
                  <div className="p-2 bg-green-900/30 border border-green-800 rounded">
                    <p className="text-green-400">API connection successful</p>
                    <p className="text-sm text-green-300">Retrieved {apiDetails?.count || 0} earthquakes</p>
                    <p className="text-xs text-green-300/70">
                      Last updated:{" "}
                      {apiDetails?.timestamp ? new Date(apiDetails.timestamp).toLocaleString() : "Unknown"}
                    </p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Sample Data</h3>
                    <div className="bg-gray-800 p-3 rounded text-xs font-mono max-h-40 overflow-auto">
                      {apiDetails?.data && apiDetails.data.length > 0 ? (
                        <pre>{JSON.stringify(apiDetails.data[0], null, 2)}</pre>
                      ) : (
                        <p className="text-gray-400">No data available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 bg-red-900/30 border border-red-800 rounded">
                    <p className="text-red-400">API connection failed</p>
                    <p className="text-sm text-red-300">{apiDetails?.error || "Unknown error"}</p>
                  </div>
                  <div className="mt-4">
                    <h3 className="text-sm font-medium mb-2">Troubleshooting</h3>
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      <li>Check if the API endpoint is correct in global settings</li>
                      <li>Verify that the API is accessible from your server</li>
                      <li>Check for any CORS issues or network restrictions</li>
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Application</h3>
                  <div className="bg-gray-800 p-3 rounded">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <span className="text-gray-400">Environment:</span>
                      <span>{process.env.NODE_ENV}</span>
                      <span className="text-gray-400">Version:</span>
                      <span>1.0.0</span>
                      <span className="text-gray-400">Status Check:</span>
                      <span>{new Date().toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-2">Next Steps</h3>
                  <div className="bg-gray-800 p-3 rounded">
                    <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                      <li>If Redis is not connecting, check your environment variables</li>
                      <li>If the API is failing, try accessing it directly to verify it's available</li>
                      <li>Check the server logs for more detailed error information</li>
                      <li>Note: The application requires a working API connection to display earthquake data</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
