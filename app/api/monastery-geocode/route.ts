import { NextRequest, NextResponse } from 'next/server'

// Geocode a monastery name + district/location to refine coordinates.
// Query params: q=monastery name text
// Returns: { lat, lng, accuracyMeters?, source }
// Uses Google Geocoding API (server side) if key present else returns 503.

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim()
  if (!q) return NextResponse.json({ error: 'Missing q' }, { status: 400 })

  const key = process.env.GOOGLE_MAPS_GEOCODING_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) return NextResponse.json({ error: 'Geocoding not configured' }, { status: 503 })

  try {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json')
    url.searchParams.set('address', q)
    url.searchParams.set('key', key)
    const resp = await fetch(url.toString(), { next: { revalidate: 0 } })
    if (!resp.ok) throw new Error('geocode-failed')
    const data = await resp.json()
    const result = data.results?.[0]
    if (!result) return NextResponse.json({ error: 'No result' }, { status: 404 })
    const loc = result.geometry?.location
    const bounds = result.geometry?.bounds || result.geometry?.viewport
    let accuracy: number | undefined
    if (bounds) {
      // rough accuracy as diagonal of bounding box (meters)
      const sw = bounds.southwest, ne = bounds.northeast
      if (sw && ne) {
        const R = 6371000
        const dLat = (ne.lat - sw.lat) * Math.PI/180
        const dLng = (ne.lng - sw.lng) * Math.PI/180
        const a = Math.sin(dLat/2)**2 + Math.cos(sw.lat*Math.PI/180)*Math.cos(ne.lat*Math.PI/180)*Math.sin(dLng/2)**2
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
        accuracy = R * c
      }
    }
    return NextResponse.json({ lat: loc.lat, lng: loc.lng, accuracyMeters: accuracy, source: 'google-geocode' })
  } catch (e: any) {
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
