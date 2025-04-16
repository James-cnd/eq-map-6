"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import LavaFlowsEditor from "@/components/admin/lava-flows-editor"
import BermsEditor from "@/components/admin/berms-editor"
import GpsStationsEditor from "@/components/admin/gps-stations-editor"
import SeismicStationsEditor from "@/components/admin/seismic-stations-editor"
import YoutubeLinksEditor from "@/components/admin/youtube-links-editor"
import MapVisibilitySettings from "@/components/admin/map-visibility-settings"

interface AdminInterfaceProps {
  map: any
  L: any
  onClose: () => void
}

export default function AdminInterface({ map, L, onClose }: AdminInterfaceProps) {
  const [activeTab, setActiveTab] = useState("lava-flows")

  return (
    <div className="fixed inset-0 z-[1005] bg-black/50 flex items-center justify-center p-4">
      <div className="bg-gray-900 text-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-xl font-bold">Admin Panel</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="bg-gray-800 p-1 mx-4 mt-4 justify-start overflow-x-auto">
            <TabsTrigger value="lava-flows">Lava Flows</TabsTrigger>
            <TabsTrigger value="berms">Berms</TabsTrigger>
            <TabsTrigger value="gps-stations">GPS Stations</TabsTrigger>
            <TabsTrigger value="seismic-stations">Seismic Stations</TabsTrigger>
            <TabsTrigger value="youtube-links">YouTube Links</TabsTrigger>
            <TabsTrigger value="map-settings">Map Settings</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-auto p-4">
            <TabsContent value="lava-flows" className="h-full">
              <LavaFlowsEditor map={map} L={L} />
            </TabsContent>

            <TabsContent value="berms" className="h-full">
              <BermsEditor map={map} L={L} />
            </TabsContent>

            <TabsContent value="gps-stations" className="h-full">
              <GpsStationsEditor map={map} L={L} />
            </TabsContent>

            <TabsContent value="seismic-stations" className="h-full">
              <SeismicStationsEditor map={map} L={L} />
            </TabsContent>

            <TabsContent value="youtube-links" className="h-full">
              <YoutubeLinksEditor />
            </TabsContent>

            <TabsContent value="map-settings" className="h-full">
              <MapVisibilitySettings />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  )
}
