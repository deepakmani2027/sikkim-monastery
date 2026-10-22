import { NextResponse } from "next/server"
import { getGoogleMapsServerApiKey } from "@/lib/google-maps"

export const dynamic = "force-dynamic"

export async function GET() {
  const browserConfigured = Boolean(
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_BROWSER_KEY,
  )
  const serverConfigured = Boolean(getGoogleMapsServerApiKey())

  return NextResponse.json({
    enabled: browserConfigured || serverConfigured,
    browserConfigured,
    serverConfigured,
    message: browserConfigured || serverConfigured
      ? "Google Maps credentials are configured. Individual APIs report their own authorization or quota errors."
      : "Configure NEXT_PUBLIC_GOOGLE_MAPS_API_KEY and GOOGLE_MAPS_SERVER_API_KEY.",
  })
}
