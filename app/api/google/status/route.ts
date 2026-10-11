import { NextResponse } from "next/server"
import { getGoogleMapsServerApiKey } from "@/lib/google-maps"

export const dynamic = "force-dynamic"

export async function GET() {
  const key = getGoogleMapsServerApiKey()
  if (!key) return NextResponse.json({ enabled: false, error: "Google Maps server API key is not configured." }, { status: 503 })

  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "places.id",
    },
    body: JSON.stringify({ textQuery: "Rumtek Monastery Sikkim", maxResultCount: 1 }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    return NextResponse.json(
      { enabled: false, error: data?.error?.message || `Google Maps API returned ${response.status}` },
      { status: 502 },
    )
  }

  return NextResponse.json({ enabled: true })
}
