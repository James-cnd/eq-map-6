import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    buildId: process.env.NEXT_PUBLIC_BUILD_ID || "not set",
    allEnvVars: Object.keys(process.env)
      .filter((key) => key.startsWith("NEXT_PUBLIC_"))
      .reduce(
        (obj, key) => {
          obj[key] = process.env[key]
          return obj
        },
        {} as Record<string, string | undefined>,
      ),
  })
}
