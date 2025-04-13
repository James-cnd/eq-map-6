import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdminSeismicStations } from "./sections/admin-seismic-stations"
import { AdminGpsStations } from "./sections/admin-gps-stations"
import { AdminRaspberryShakes } from "./sections/admin-raspberry-shakes"
import { AdminBerms } from "./sections/admin-berms"
import { AdminLavaFlows } from "./sections/admin-lava-flows"
import { AdminFissures } from "./sections/admin-fissures"
import { AdminYoutubeFeeds } from "./sections/admin-youtube-feeds"
import { AdminSettings } from "./sections/admin-settings"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdminDashboardProps {
    onClose?: () => void
    map?: any  // Replace with proper Leaflet type
    L?: any    // Replace with proper Leaflet type
}

export function AdminDashboard({ onClose, map, L }: AdminDashboardProps) {
    const [activeTab, setActiveTab] = useState("seismic")

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Admin Dashboard</h2>
                {onClose && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-auto p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-4 lg:grid-cols-8 mb-4">
                        <TabsTrigger value="seismic">Seismic</TabsTrigger>
                        <TabsTrigger value="gps">GPS</TabsTrigger>
                        <TabsTrigger value="raspberry">Raspberry</TabsTrigger>
                        <TabsTrigger value="berms">Berms</TabsTrigger>
                        <TabsTrigger value="lava">Lava Flows</TabsTrigger>
                        <TabsTrigger value="fissures">Fissures</TabsTrigger>
                        <TabsTrigger value="youtube">YouTube</TabsTrigger>
                        <TabsTrigger value="settings">Settings</TabsTrigger>
                    </TabsList>

                    <TabsContent value="seismic" className="mt-0">
                        <AdminSeismicStations map={map} L={L} />
                    </TabsContent>

                    <TabsContent value="gps" className="mt-0">
                        <AdminGpsStations map={map} L={L} />
                    </TabsContent>

                    <TabsContent value="raspberry" className="mt-0">
                        <AdminRaspberryShakes map={map} L={L} />
                    </TabsContent>

                    <TabsContent value="berms" className="mt-0">
                        <AdminBerms map={map} L={L} />
                    </TabsContent>

                    <TabsContent value="lava" className="mt-0">
                        <AdminLavaFlows map={map} L={L} />
                    </TabsContent>

                    <TabsContent value="fissures" className="mt-0">
                        <AdminFissures map={map} L={L} />
                    </TabsContent>

                    <TabsContent value="youtube" className="mt-0">
                        <AdminYoutubeFeeds />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0">
                        <AdminSettings />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}