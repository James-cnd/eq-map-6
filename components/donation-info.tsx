"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, Coffee } from "lucide-react"

interface DonationInfoProps {
    onClose: () => void
}

export default function DonationInfo({ onClose }: DonationInfoProps) {
    return (
        <Card className="shadow-lg bg-gray-900 border-gray-700 text-gray-200 w-full max-w-md">
            <CardHeader className="pb-2 sticky top-0 bg-gray-900 z-10">
                <div className="flex items-start justify-between">
                    <CardTitle className="text-lg text-white">Support This Project</CardTitle>
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
                    <div className="space-y-3 text-sm text-gray-300">
                        <p>
                            Donating will help me keep the Iceland Earthquake Tracker page open. Any extra funds will be redirected to
                            disaster relief in Iceland.
                        </p>

                        <div className="flex justify-center mt-6">
                            <a
                                href="https://buymeacoffee.com/jameshowell"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 bg-[#FFDD00] hover:bg-[#FFDD00]/90 text-black font-bold py-3 px-6 rounded-lg transition-colors"
                            >
                                <Coffee className="h-5 w-5" />
                                Buy Me A Coffee
                            </a>
                        </div>

                        <p className="text-center mt-4 text-gray-400 text-xs">
                            Your support helps maintain this service and contributes to disaster relief efforts.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
