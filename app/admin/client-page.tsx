"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'

export default function AdminPage() {
    return (
        <main className="min-h-screen bg-gray-950 p-8">
            <Card className="max-w-md mx-auto bg-gray-900 border-gray-800 p-6">
                <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
                <div className="space-y-3">
                    <Link href="/admin/seismic-stations" className="block">
                        <Button variant="outline" className="w-full bg-emerald-950/50 text-white hover:bg-emerald-900/50 border-emerald-800">
                            Edit seismic stations
                        </Button>
                    </Link>
                    <Link href="/admin/gps-stations" className="block">
                        <Button variant="outline" className="w-full bg-sky-950/50 text-white hover:bg-sky-900/50 border-sky-800">
                            Edit GPS stations
                        </Button>
                    </Link>
                    <Link href="/admin/raspberry-shakes" className="block">
                        <Button variant="outline" className="w-full bg-pink-950/50 text-white hover:bg-pink-900/50 border-pink-800">
                            Edit Raspberry shakes
                        </Button>
                    </Link>
                    <Link href="/admin/berms" className="block">
                        <Button variant="outline" className="w-full bg-orange-950/50 text-white hover:bg-orange-900/50 border-orange-800">
                            Edit Berms
                        </Button>
                    </Link>
                    <Link href="/admin/lava-flows" className="block">
                        <Button variant="outline" className="w-full bg-red-950/50  text-white hover:bg-red-900/50 border-red-800">
                            Edit lava flows
                        </Button>
                    </Link>
                    <Link href="/admin/fissures" className="block">
                        <Button variant="outline" className="w-full bg-blue-950/50 text-white hover:bg-blue-900/50 border-blue-800">
                            Edit Fissure lines
                        </Button>
                    </Link>
                    <Link href="/admin/youtube" className="block">
                        <Button variant="outline" className="w-full bg-purple-950/50 text-white hover:bg-purple-900/50 border-purple-800">
                            Edit Youtube links
                        </Button>
                    </Link>
                </div>
            </Card>
        </main>
    )
}