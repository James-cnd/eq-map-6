"use client"

import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import type { CustomGpsStation } from "@/types/stations"

interface GpsStationPopupProps {
    station: CustomGpsStation
    onClose: () => void
}

export default function GpsStationPopup({ station, onClose }: GpsStationPopupProps) {
    return (
        <div className="fixed left-0 top-0 bottom-0 w-1/2 bg-gray-900/95 border-r border-gray-700 z-[2002] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <h2 className="text-xl font-bold text-white">{station.name} GPS Station</h2>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white hover:bg-gray-800"
                >
                    <X className="h-5 w-5" />
                </Button>
            </div>

            <div className="flex-1 overflow-auto p-4">
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-medium text-white">Station Information</h3>
                        <p className="text-gray-300 mt-1">{station.description}</p>
                        <p className="text-gray-400 text-sm mt-2">
                            Coordinates: {station.coordinates[0].toFixed(6)}°, {station.coordinates[1].toFixed(6)}°
                        </p>
                        <p className="text-gray-400 text-sm">Added: {new Date(station.dateAdded).toLocaleDateString()}</p>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-medium text-white mb-3">Station Data</h3>
                        <div className="bg-gray-800 rounded-lg overflow-hidden">
                            <iframe
                                src={station.url}
                                className="w-full h-[500px] border-0"
                                title={`${station.name} GPS Station Data`}
                                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                                referrerPolicy="no-referrer"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    <div className="border-t border-gray-700 pt-4">
                        <h3 className="text-lg font-medium text-white mb-3">External Resources</h3>
                        <a
                            href={station.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                        >
                            Open in New Tab
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}