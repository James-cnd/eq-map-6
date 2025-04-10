"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { X, Bell, AlertTriangle } from "lucide-react"
import { playSound } from "@/utils/sound"

interface NotificationSettingsProps {
    onClose: () => void
    notificationsEnabled: boolean
    setNotificationsEnabled: (enabled: boolean) => void
    notificationVolume: number
    setNotificationVolume: (volume: number) => void
    recentEarthquakeCount: number
    highActivityThreshold: number
    mlwNotificationsEnabled: boolean
    setMlwNotificationsEnabled: (enabled: boolean) => void
}

export default function NotificationSettings({
    onClose,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationVolume,
    setNotificationVolume,
    recentEarthquakeCount,
    highActivityThreshold,
    mlwNotificationsEnabled,
    setMlwNotificationsEnabled,
}: NotificationSettingsProps) {
    const [testError, setTestError] = useState<string | null>(null)

    // Function to test the notification sound
    const testSound = () => {
        try {
            setTestError(null)
            playSound(notificationVolume)
        } catch (error) {
            setTestError("Failed to play sound. Your browser may not support audio playback.")
            console.error("Test sound error:", error)
        }
    }

    return (
        <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-md">
            <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">Notification Settings</CardTitle>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-gray-400 hover:text-white hover:bg-gray-800"
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="max-h-[60vh] overflow-y-auto pr-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label htmlFor="notifications-toggle">Earthquake Notifications</Label>
                            <p className="text-sm text-gray-400">Play a sound when new earthquakes are detected</p>
                        </div>
                        <Switch
                            id="notifications-toggle"
                            checked={notificationsEnabled}
                            onCheckedChange={setNotificationsEnabled}
                        />
                    </div>

                    {notificationsEnabled && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="mlw-notifications-toggle">Review Status Notifications</Label>
                                    <p className="text-sm text-gray-400">
                                        Play a sound when an earthquake's review status changes to manually reviewed (MLW)
                                    </p>
                                </div>
                                <Switch
                                    id="mlw-notifications-toggle"
                                    checked={mlwNotificationsEnabled}
                                    onCheckedChange={setMlwNotificationsEnabled}
                                />
                            </div>

                            <div className="space-y-3">
                                <Label htmlFor="volume-slider">Notification Volume</Label>
                                <Slider
                                    id="volume-slider"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={[notificationVolume]}
                                    onValueChange={(value) => setNotificationVolume(value[0])}
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>Off</span>
                                    <span>Max</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Button variant="outline" className="w-full bg-gray-800 hover:bg-gray-700" onClick={testSound}>
                                    Test Notification Sound
                                </Button>

                                {testError && (
                                    <div className="flex items-center gap-2 text-yellow-400 text-sm p-2 bg-yellow-400/10 rounded">
                                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                                        <p>{testError}</p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="font-medium mb-3">Current Notification Rules</h3>
                        <div className="p-3 bg-gray-800 rounded-md text-sm">
                            <p className="mb-2">
                                <span className="font-medium">Earthquakes in the last hour:</span> {recentEarthquakeCount}
                            </p>

                            {recentEarthquakeCount > highActivityThreshold ? (
                                <div className="flex items-start gap-2">
                                    <div className="text-yellow-400 mt-0.5">
                                        <Bell className="h-4 w-4" />
                                    </div>
                                    <p>
                                        High activity detected! Notifications will only play for earthquakes with magnitude greater than
                                        1.0.
                                    </p>
                                </div>
                            ) : (
                                <div className="flex items-start gap-2">
                                    <div className="text-green-400 mt-0.5">
                                        <Bell className="h-4 w-4" />
                                    </div>
                                    <p>Normal activity level. Notifications will play for all new earthquakes.</p>
                                </div>
                            )}

                            <div className="mt-2 flex items-start gap-2">
                                <div className={mlwNotificationsEnabled ? "text-blue-400 mt-0.5" : "text-gray-500 mt-0.5"}>
                                    <Bell className="h-4 w-4" />
                                </div>
                                <p className={mlwNotificationsEnabled ? "" : "text-gray-500"}>
                                    {mlwNotificationsEnabled
                                        ? "Notifications will play when an earthquake's review status changes from automatic to manually reviewed."
                                        : "Review status change notifications are disabled."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}