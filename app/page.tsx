import EarthquakeMap from "@/components/earthquake-map"

export default function Home() {
    return (
        <main className="flex min-h-screen flex-col bg-gray-950 text-white">
            <div className="h-screen w-full">
                <EarthquakeMap />
            </div>
        </main>
    )
}