import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MapSettings {
    defaultZoom: number
    defaultCenter: [number, number]
    maxZoom: number
    minZoom: number
    enableClustering: boolean
    clusterRadius: number
    theme: 'light' | 'dark' | 'satellite'
    earthquakeTimeWindow: number // in hours
    autoRefreshInterval: number // in seconds
}

export function AdminSettings() {
    const [settings, setSettings] = useState<MapSettings>({
        defaultZoom: 10,
        defaultCenter: [63.8, -22.4],
        maxZoom: 18,
        minZoom: 5,
        enableClustering: true,
        clusterRadius: 50,
        theme: 'dark',
        earthquakeTimeWindow: 24,
        autoRefreshInterval: 30,
    })

    const [error, setError] = useState("")

    const updateSetting = <K extends keyof MapSettings>(key: K, value: MapSettings[K]) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const saveSettings = () => {
        try {
            localStorage.setItem('mapSettings', JSON.stringify(settings))
            setError("")
        } catch (err) {
            setError("Failed to save settings")
        }
    }

    return (
        <div className="space-y-6">
            <div className="space-y-4">
                <div className="p-3 bg-gray-800 rounded-md">
                    <h3 className="font-medium mb-2">General Map Settings</h3>
                    <p className="text-sm text-gray-300">
                        Configure global settings for the earthquake map and data display.
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-red-800/50 rounded-md">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="space-y-4">
                        <h4 className="font-medium">Map View Settings</h4>

                        <div className="space-y-2">
                            <Label>Default Center</Label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <Label className="text-xs">Latitude</Label>
                                    <Input
                                        type="number"
                                        value={settings.defaultCenter[0]}
                                        onChange={(e) => {
                                            const lat = parseFloat(e.target.value)
                                            updateSetting('defaultCenter', [lat, settings.defaultCenter[1]])
                                        }}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Longitude</Label>
                                    <Input
                                        type="number"
                                        value={settings.defaultCenter[1]}
                                        onChange={(e) => {
                                            const lng = parseFloat(e.target.value)
                                            updateSetting('defaultCenter', [settings.defaultCenter[0], lng])
                                        }}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Zoom Levels</Label>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-xs">Default</Label>
                                    <Input
                                        type="number"
                                        value={settings.defaultZoom}
                                        onChange={(e) => updateSetting('defaultZoom', parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Minimum</Label>
                                    <Input
                                        type="number"
                                        value={settings.minZoom}
                                        onChange={(e) => updateSetting('minZoom', parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <div>
                                    <Label className="text-xs">Maximum</Label>
                                    <Input
                                        type="number"
                                        value={settings.maxZoom}
                                        onChange={(e) => updateSetting('maxZoom', parseInt(e.target.value))}
                                        className="bg-gray-800 border-gray-700"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Map Theme</Label>
                            <Select
                                value={settings.theme}
                                onValueChange={(value) => updateSetting('theme', value as 'light' | 'dark' | 'satellite')}
                            >
                                <SelectTrigger className="bg-gray-800 border-gray-700">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="light">Light</SelectItem>
                                    <SelectItem value="dark">Dark</SelectItem>
                                    <SelectItem value="satellite">Satellite</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Earthquake Data Settings</h4>

                        <div className="space-y-2">
                            <Label>Time Window (hours)</Label>
                            <div className="flex gap-4">
                                <Slider
                                    min={1}
                                    max={168}
                                    step={1}
                                    value={[settings.earthquakeTimeWindow]}
                                    onValueChange={([value]) => updateSetting('earthquakeTimeWindow', value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    value={settings.earthquakeTimeWindow}
                                    onChange={(e) => updateSetting('earthquakeTimeWindow', parseInt(e.target.value))}
                                    className="w-20 bg-gray-800 border-gray-700"
                                />
                            </div>
                            <p className="text-xs text-gray-400">Show earthquakes from the last X hours</p>
                        </div>

                        <div className="space-y-2">
                            <Label>Auto-refresh Interval (seconds)</Label>
                            <div className="flex gap-4">
                                <Slider
                                    min={5}
                                    max={300}
                                    step={5}
                                    value={[settings.autoRefreshInterval]}
                                    onValueChange={([value]) => updateSetting('autoRefreshInterval', value)}
                                    className="flex-1"
                                />
                                <Input
                                    type="number"
                                    value={settings.autoRefreshInterval}
                                    onChange={(e) => updateSetting('autoRefreshInterval', parseInt(e.target.value))}
                                    className="w-20 bg-gray-800 border-gray-700"
                                />
                            </div>
                            <p className="text-xs text-gray-400">How often to fetch new earthquake data</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h4 className="font-medium">Marker Settings</h4>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label>Enable Clustering</Label>
                                <p className="text-xs text-gray-400">Group nearby markers together</p>
                            </div>
                            <Switch
                                checked={settings.enableClustering}
                                onCheckedChange={(checked) => updateSetting('enableClustering', checked)}
                            />
                        </div>

                        {settings.enableClustering && (
                            <div className="space-y-2">
                                <Label>Cluster Radius (pixels)</Label>
                                <div className="flex gap-4">
                                    <Slider
                                        min={10}
                                        max={200}
                                        step={5}
                                        value={[settings.clusterRadius]}
                                        onValueChange={([value]) => updateSetting('clusterRadius', value)}
                                        className="flex-1"
                                    />
                                    <Input
                                        type="number"
                                        value={settings.clusterRadius}
                                        onChange={(e) => updateSetting('clusterRadius', parseInt(e.target.value))}
                                        className="w-20 bg-gray-800 border-gray-700"
                                    />
                                </div>
                                <p className="text-xs text-gray-400">Distance within which markers will be clustered</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button onClick={saveSettings} className="w-full">Save Settings</Button>
            </div>
        </div>
    )
}