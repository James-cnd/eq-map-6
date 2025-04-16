import { redis } from "@/lib/redis"
import { APP_VERSION } from "@/lib/version"

export const dynamic = "force-dynamic"
export const revalidate = 0

async function getVersionStats() {
  try {
    // Get version counts
    const versionCounts = (await redis.hgetall("version_counts")) || {}

    // Calculate total users
    let totalUsers = 0
    Object.values(versionCounts).forEach((count) => {
      totalUsers += Number(count)
    })

    // Calculate percentages
    const versionStats = Object.entries(versionCounts).map(([version, count]) => ({
      version,
      count: Number(count),
      percentage: Math.round((Number(count) / totalUsers) * 100),
    }))

    // Sort by version (newest first)
    versionStats.sort((a, b) => {
      const aVer = a.version.split(".").map(Number)
      const bVer = b.version.split(".").map(Number)

      for (let i = 0; i < Math.max(aVer.length, bVer.length); i++) {
        const aNum = aVer[i] || 0
        const bNum = bVer[i] || 0
        if (aNum !== bNum) return bNum - aNum
      }
      return 0
    })

    return { versionStats, totalUsers }
  } catch (error) {
    console.error("Error fetching version stats:", error)
    return { versionStats: [], totalUsers: 0 }
  }
}

export default async function VersionDashboard() {
  const { versionStats, totalUsers } = await getVersionStats()

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Version Dashboard</h1>

      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Current Version</h2>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">{APP_VERSION}</span>
        </div>
        <p className="text-gray-600">This is the version currently deployed to production.</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Version Distribution</h2>
        <p className="text-gray-600 mb-4">Total Users Tracked: {totalUsers}</p>

        {versionStats.length === 0 ? (
          <p className="text-gray-500 italic">No version data available yet.</p>
        ) : (
          <div className="space-y-4">
            {versionStats.map((stat) => (
              <div key={stat.version} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{stat.version}</span>
                  <span className="text-sm text-gray-500">
                    {stat.count} users ({stat.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${stat.percentage}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
