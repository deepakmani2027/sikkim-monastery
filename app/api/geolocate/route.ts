import { NextRequest, NextResponse } from 'next/server'

// Server proxy to Google Geolocation API so we don't expose the key.
// Requires the Geolocation API enabled in the Google Cloud project.
// Uses WIFI + cell tower data sent from client (if available) but we also allow
// a no‑payload request which lets Google infer coarse IP location.
// Docs: https://developers.google.com/maps/documentation/geolocation/overview

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const apiKey = process.env.GOOGLE_MAPS_GEOLOCATION_API_KEY || process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_BROWSER_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Geolocation API key not configured' }, { status: 503 })
  }
  let body: any = {}
  try {
    if (req.headers.get('content-type')?.includes('application/json')) {
      body = await req.json()
    }
  } catch {
    // ignore; body stays empty
  }

  try {
    const resp = await fetch(`https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {}),
      // do not cache
      next: { revalidate: 0 },
    })
    if (!resp.ok) {
      const text = await resp.text()
      return NextResponse.json({ error: 'Upstream error', details: text.slice(0,500) }, { status: 500 })
    }
    const data = await resp.json()
    return NextResponse.json({
      location: data.location,
      accuracy: data.accuracy,
      provider: 'google-geolocation'
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'Geolocation request failed' }, { status: 500 })
  }
}
