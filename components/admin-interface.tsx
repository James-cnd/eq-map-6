"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DraggablePanel } from "@/components/draggable-panel"
import AdminDashboard from "@/components/admin-dashboard"
import MapVisibilitySettings from "@/components/admin/map-visibility-settings"
import FissureLinesEditor from "@/components/admin/fissure-lines-editor"
import LavaFlowsEditor from "@/components/admin/lava-flows-editor"
import BermsEditor from "@/components/admin/berms-editor"
import GpsStationsEditor from "@/components/admin/gps-stations-editor"
import SeismicStationsEditor from "@/components/admin/seismic-stations-editor"
import RaspberryShakeEditor from "@/components/admin/raspberry-shake-editor"
import YouTubeLinksEditor from "@/components/admin/youtube-links-editor"

interface AdminInterfaceProps {
  map: any
  L: any
  onClose: () => void
}

export default function AdminInterface({ map, L, onClose }: AdminInterfaceProps) {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [activeFeatureTab, setActiveFeatureTab] = useState("fissures")

  return (
    <DraggablePanel
      title="Admin Panel"
      onClose={onClose}
      initialPosition={{ x: 100, y: 100 }}
      className="w-[600px] h-[80vh] max-w-[90vw] max-h-[90vh]"
    >
      <div className="p-4 h-full overflow-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="map-settings">Map Settings</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="feeds">Feeds</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="h-[calc(100%-40px)] overflow-auto">
            <AdminDashboard />
          </TabsContent>

          {/* Map Settings Tab */}
          <TabsContent value="map-settings" className="h-[calc(100%-40px)] overflow-auto">
            <MapVisibilitySettings />
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="h-[calc(100%-40px)] overflow-auto">
            <Tabs value={activeFeatureTab} onValueChange={setActiveFeatureTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="fissures">Fissures</TabsTrigger>
                <TabsTrigger value="lava-flows">Lava Flows</TabsTrigger>
                <TabsTrigger value="berms">Berms</TabsTrigger>
                <TabsTrigger value="stations">Stations</TabsTrigger>
              </TabsList>

              <TabsContent value="fissures">
                <FissureLinesEditor map={map} L={L} />
              </TabsContent>

              <TabsContent value="lava-flows">
                <LavaFlowsEditor map={map} L={L} />
              </TabsContent>

              <TabsContent value="berms">
                <BermsEditor map={map} L={L} />
              </TabsContent>

              <TabsContent value="stations">
                <Tabs defaultValue="gps">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="gps">GPS Stations</TabsTrigger>
                    <TabsTrigger value="seismic">Seismic Stations</TabsTrigger>
                    <TabsTrigger value="raspberry">Raspberry Shake</TabsTrigger>
                  </TabsList>

                  <TabsContent value="gps">
                    <GpsStationsEditor map={map} L={L} />
                  </TabsContent>

                  <TabsContent value="seismic">
                    <SeismicStationsEditor map={map} L={L} />
                  </TabsContent>

                  <TabsContent value="raspberry">
                    <RaspberryShakeEditor />
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </Tabs>
          </TabsContent>

          {/* Feeds Tab */}
          <TabsContent value="feeds" className="h-[calc(100%-40px)] overflow-auto">
            <YouTubeLinksEditor />
          </TabsContent>
        </Tabs>
      </div>
    </DraggablePanel>
  )
}
