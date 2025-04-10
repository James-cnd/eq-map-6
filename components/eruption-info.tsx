"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import type { CustomFissure } from "./admin-draw-panel"

interface EruptionInfoProps {
    onClose: () => void
}

export default function EruptionInfo({ onClose }: EruptionInfoProps) {
    // Get custom fissures from localStorage
    const [customFissures] = useLocalStorage<CustomFissure[]>("earthquakeCustomFissures", [])

    // Store enabled fissures in localStorage
    const [enabledFissures, setEnabledFissures] = useLocalStorage<string[]>("earthquakeEnabledFissures", [])

    // Toggle a specific fissure
    const toggleFissure = (fissureId: string) => {
        if (enabledFissures.includes(fissureId)) {
            // Remove the fissure from enabled list
            setEnabledFissures(enabledFissures.filter((id) => id !== fissureId))
        } else {
            // Add the fissure to enabled list
            setEnabledFissures([...enabledFissures, fissureId])
        }
    }

    // Toggle all fissures on
    const toggleAllOn = () => {
        const allFissureIds = customFissures.map((f) => f.id)
        setEnabledFissures(allFissureIds)
    }

    // Toggle all fissures off
    const toggleAllOff = () => {
        setEnabledFissures([])
    }

    // Group fissures by eruption
    const eruptionGroups = customFissures.reduce(
        (groups, fissure) => {
            if (!groups[fissure.eruption]) {
                groups[fissure.eruption] = []
            }
            groups[fissure.eruption].push(fissure)
            return groups
        },
        {} as Record<string, typeof customFissures>,
    )

    return (
        <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-md">
            <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">Eruptions at Sundhnúkur 2023-24</CardTitle>
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
                    {customFissures.length === 0 ? (
                        <div className="text-center py-4">
                            <p className="text-gray-400">No fissures have been created yet.</p>
                            <p className="text-gray-400 text-sm mt-2">The admin can add fissures using the drawing tool.</p>
                        </div>
                    ) : (
                        <div>
                            <h3 className="font-medium mb-3">Toggle Fissures</h3>
                            <p className="text-sm text-gray-400 mb-4">Select which eruption fissures to display on the map</p>

                            <div className="flex justify-between mb-4">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleAllOn}
                                    className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700"
                                >
                                    Toggle On All
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={toggleAllOff}
                                    className="text-xs font-bold text-white bg-gray-800 hover:bg-gray-700"
                                >
                                    Toggle Off All
                                </Button>
                            </div>

                            {Object.entries(eruptionGroups).map(([eruption, fissures]) => (
                                <div key={eruption} className="mb-6">
                                    <h4 className="font-medium text-sm mb-2 border-b border-gray-700 pb-1">{eruption}</h4>
                                    <div className="space-y-3 ml-2">
                                        {fissures.map((fissure) => (
                                            <div key={fissure.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={fissure.id}
                                                    checked={enabledFissures.includes(fissure.id)}
                                                    onCheckedChange={() => toggleFissure(fissure.id)}
                                                />
                                                <div className="flex items-center gap-2">
                                                    <div className="w-4 h-3 rounded-sm" style={{ backgroundColor: fissure.color }}></div>
                                                    <Label htmlFor={fissure.id} className="text-sm font-normal cursor-pointer">
                                                        {fissure.name}
                                                        <span className="text-xs text-gray-400 ml-1">
                                                            ({new Date(fissure.startDate).toLocaleDateString()})
                                                            {fissure.endDate ? ` - ${new Date(fissure.endDate).toLocaleDateString()}` : " - ongoing"}
                                                        </span>
                                                    </Label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-700">
                        <h3 className="font-medium mb-3">About Sundhnúkur Eruptions</h3>
                        <div className="space-y-3 text-sm text-gray-300">
                            <p>
                                The Sundhnúkur volcanic system on the Reykjanes Peninsula has been highly active since December 2023,
                                with multiple distinct eruption events occurring through 2024.
                            </p>
                            <p>
                                These eruptions are part of a reawakening of volcanic activity on the Reykjanes Peninsula after nearly
                                800 years of dormancy, beginning with the Fagradalsfjall eruption in 2021.
                            </p>
                            <p>
                                The eruptions have followed a fissure pattern along a northeast-southwest trending line, with each new
                                eruption typically occurring slightly south of the previous one.
                            </p>
                            <p>
                                The Icelandic Meteorological Office (IMO) closely monitors this activity through a network of seismic
                                and GPS stations, providing early warnings for new eruptions.
                            </p>
                            <p>
                                The town of Grindavík was evacuated in November 2023 due to the threat posed by these eruptions and
                                associated ground deformation.
                            </p>
                            <p className="text-xs text-gray-400 mt-4">Data source: Icelandic Meteorological Office (IMO)</p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}