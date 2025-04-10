"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, ExternalLink } from "lucide-react"

interface RaspberryShakeInfoProps {
    onClose: () => void
}

export default function RaspberryShakeInfo({ onClose }: RaspberryShakeInfoProps) {
    const [activeTab, setActiveTab] = useState("overview")

    return (
        <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-4xl">
            <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">Raspberry Shake Seismometer Data</CardTitle>
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
            <CardContent className="max-h-[80vh] overflow-y-auto">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid grid-cols-3 mb-4">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="reading">Reading Seismograms</TabsTrigger>
                        <TabsTrigger value="examples">Examples</TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        <div className="space-y-4">
                            <p>
                                Raspberry Shake is a citizen science project that uses affordable seismometers to create a global
                                network of earthquake detection devices. The data from these devices is publicly available and can be
                                viewed in real-time.
                            </p>

                            <div className="p-4 bg-gray-800 rounded-lg">
                                <h3 className="font-medium mb-2">Iceland Raspberry Shake Stations</h3>
                                <p className="text-sm text-gray-300 mb-4">
                                    There are several Raspberry Shake stations in Iceland that provide valuable data on seismic activity,
                                    particularly around the Reykjanes Peninsula.
                                </p>

                                <div className="space-y-3">
                                    <div>
                                        <h4 className="font-medium text-sm">RBDCF - Reykjanes</h4>
                                        <div className="flex items-center mt-1">
                                            <a
                                                href="https://dataview.raspberryshake.org/#/AM/RBDCF/00/EHZ"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                                            >
                                                View Live Data <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-medium text-sm">R135F - Reykjanes Peninsula</h4>
                                        <div className="flex items-center mt-1">
                                            <a
                                                href="https://dataview.raspberryshake.org/#/AM/R135F/00/EHZ"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                                            >
                                                View Live Data <ExternalLink className="h-3 w-3 ml-1" />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-medium mb-2">What is a Seismogram?</h3>
                                <p className="text-sm text-gray-300">
                                    A seismogram is a visual record of ground motion at a specific location over time. The vertical axis
                                    represents the amplitude (strength) of the ground motion, while the horizontal axis represents time.
                                    Seismograms can show various types of seismic waves, including P-waves, S-waves, and surface waves.
                                </p>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Reading Seismograms Tab */}
                    <TabsContent value="reading" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">How to Read a Seismogram</h3>
                            <p className="text-sm text-gray-300">
                                Reading a seismogram takes practice, but here are some key elements to look for:
                            </p>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">1. Baseline Activity</h4>
                                    <p className="text-sm text-gray-300">
                                        The normal "background noise" on a seismogram represents ambient vibrations from wind, ocean waves,
                                        human activity, etc. This appears as small, irregular wiggles on the seismogram.
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">2. Earthquake Signatures</h4>
                                    <p className="text-sm text-gray-300">
                                        Earthquakes typically appear as sudden increases in amplitude (larger wiggles) that gradually
                                        decrease over time. The pattern often shows distinct phases:
                                    </p>
                                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-300 space-y-2">
                                        <li>
                                            <strong>P-waves</strong> (Primary waves) arrive first and are faster but smaller in amplitude.
                                            They appear as small, rapid oscillations.
                                        </li>
                                        <li>
                                            <strong>S-waves</strong> (Secondary waves) arrive next and are typically larger in amplitude. They
                                            appear as larger oscillations.
                                        </li>
                                        <li>
                                            <strong>Surface waves</strong> arrive last and often have the largest amplitude. They can appear
                                            as slow, rolling waves on the seismogram.
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">3. Distinguishing Earthquakes from Noise</h4>
                                    <p className="text-sm text-gray-300">
                                        Here are key differences between earthquake signals and noise:
                                    </p>
                                    <ul className="list-disc pl-5 mt-2 text-sm text-gray-300 space-y-2">
                                        <li>
                                            <strong>Earthquakes</strong> show a clear onset (sudden increase in amplitude), followed by a
                                            gradual decay. The different wave types arrive in sequence.
                                        </li>
                                        <li>
                                            <strong>Human activity</strong> (cars, construction, etc.) typically shows as regular, rhythmic
                                            patterns or sudden spikes without the characteristic wave progression.
                                        </li>
                                        <li>
                                            <strong>Wind or weather</strong> noise often appears as irregular but continuous disturbances
                                            without clear wave phases.
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">4. Time and Distance</h4>
                                    <p className="text-sm text-gray-300">
                                        The time between P-wave and S-wave arrivals can help determine the distance to the earthquake. The
                                        greater the time difference, the farther away the earthquake occurred.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Examples Tab */}
                    <TabsContent value="examples" className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="font-medium">Example Seismograms & Spectrograms</h3>
                            <p className="text-sm text-gray-300 mb-4">
                                Below are examples of different seismic events as they appear on Raspberry Shake seismograms and
                                spectrograms:
                            </p>

                            <div className="space-y-6">
                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">Local Earthquake</h4>
                                    <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                                        <p className="text-white text-center p-4">Local Earthquake Seismogram Placeholder</p>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        <strong>Characteristics:</strong> Sharp P-wave onset, short time between P and S waves (seconds to
                                        tens of seconds), high frequency content, and rapid amplitude decay.
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">Understanding Spectrograms</h4>
                                    <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                                        <p className="text-white text-center p-4">Spectrogram Explanation Placeholder</p>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">
                                        A spectrogram shows how the frequency content of a seismic signal changes over time. It's a powerful
                                        tool for identifying different types of seismic events.
                                    </p>
                                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                                        <li>The horizontal axis represents time (just like in a seismogram)</li>
                                        <li>The vertical axis represents frequency (measured in Hertz)</li>
                                        <li>The color intensity represents the amplitude or energy at each frequency</li>
                                        <li>Brighter colors indicate stronger energy at that frequency</li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">Interpreting Spectrograms</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                                                <p className="text-white text-center p-4">Earthquake Spectrogram Placeholder</p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 text-center">Earthquake spectrogram</p>
                                        </div>
                                        <div>
                                            <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                                                <p className="text-white text-center p-4">Cultural Noise Spectrogram Placeholder</p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 text-center">Cultural noise spectrogram</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300 mb-2">
                                        Different seismic events have distinctive spectrogram patterns:
                                    </p>
                                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                                        <li>
                                            <strong>Earthquakes:</strong> Show a broad frequency range initially, with higher frequencies
                                            arriving first (P-waves), followed by lower frequencies (S-waves and surface waves)
                                        </li>
                                        <li>
                                            <strong>Cultural noise:</strong> Often appears as horizontal bands or lines at specific
                                            frequencies
                                        </li>
                                        <li>
                                            <strong>Volcanic tremor:</strong> Appears as sustained energy in specific frequency bands
                                        </li>
                                        <li>
                                            <strong>Teleseismic events:</strong> (distant earthquakes) show more energy in the lower
                                            frequencies
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">Helicorder vs. Spectrogram</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                                                <p className="text-white text-center p-4">Helicorder Display Placeholder</p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 text-center">Helicorder display</p>
                                        </div>
                                        <div>
                                            <div className="bg-gray-700 rounded-lg h-48 flex items-center justify-center">
                                                <p className="text-white text-center p-4">Spectrogram Display Placeholder</p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1 text-center">Spectrogram display</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        The Raspberry Shake dataview provides both helicorder (time-amplitude) and spectrogram
                                        (time-frequency-amplitude) displays. Using them together provides the most complete picture:
                                    </p>
                                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1 mt-2">
                                        <li>
                                            <strong>Helicorder:</strong> Best for seeing the overall shape and amplitude of waveforms
                                        </li>
                                        <li>
                                            <strong>Spectrogram:</strong> Best for distinguishing between different types of seismic events
                                            and noise
                                        </li>
                                    </ul>
                                </div>

                                <div className="p-4 bg-gray-800 rounded-lg">
                                    <h4 className="font-medium mb-2">Human Activity (Noise)</h4>
                                    <div className="aspect-video bg-gray-700 rounded-lg overflow-hidden mb-3 flex items-center justify-center">
                                        <p className="text-white text-center p-4">Human Activity Noise Seismogram Placeholder</p>
                                    </div>
                                    <p className="text-sm text-gray-300">
                                        <strong>Characteristics:</strong> Regular patterns or sudden spikes, no clear wave progression,
                                        often occurs during daytime hours, and may show repetitive patterns. In spectrograms, human activity
                                        often appears as horizontal lines or bands at specific frequencies.
                                    </p>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                                <h4 className="font-medium mb-2">Tips for Using Raspberry Shake Data</h4>
                                <ul className="list-disc pl-5 text-sm text-gray-300 space-y-2">
                                    <li>Use the time controls to zoom in/out and navigate through the data</li>
                                    <li>Toggle between helicorder and spectrogram views for different perspectives</li>
                                    <li>Compare multiple stations to confirm if an event is a real earthquake</li>
                                    <li>Look for the characteristic frequency patterns of earthquakes in the spectrogram</li>
                                    <li>Remember that local conditions can affect the signal quality at each station</li>
                                    <li>The "EHZ" channel shows vertical ground motion, while "EHE" and "EHN" show horizontal motion</li>
                                </ul>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}