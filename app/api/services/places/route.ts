import { NextResponse } from "next/server"

type Place = {
  id: string
  name: string
  location: { lat: number; lng: number }
  rating?: number
  userRatingsTotal?: number
  priceLevel?: number
  phone?: string
  vicinity?: string
  address?: string
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const near = url.searchParams.get("near") // lat,lng
  const radius = Number(url.searchParams.get("radius")) || 5000
  const type = url.searchParams.get("type") || "restaurant"
  const q = url.searchParams.get("q") || ""
  const placeId = url.searchParams.get("placeId")
  const text = url.searchParams.get("text")
  const find = url.searchParams.get("find")
  // Support either a server-side key or the public client key as fallback
  const key = process.env.GOOGLE_PLACES_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Graceful fallback when API key is not configured: return empty results
  if (!key) {
    if (placeId) return NextResponse.json({ result: null, disabled: true })
    if (text || find || near) return NextResponse.json({ results: [], disabled: true })
    return NextResponse.json({ results: [], disabled: true })
  }
  // If details for a specific place are requested
  if (placeId) {
    try {
      const detUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json")
      detUrl.searchParams.set("place_id", placeId)
      detUrl.searchParams.set(
        "fields",
        "formatted_phone_number,international_phone_number,formatted_address,name,geometry,photos"
      )
      detUrl.searchParams.set("key", key)
      const r = await fetch(detUrl.toString())
      const j = await r.json()
      const res = j?.result || {}
      return NextResponse.json({
        result: {
          id: placeId,
          name: res.name,
          location: res.geometry?.location,
          phone: res.formatted_phone_number || res.international_phone_number || null,
          address: res.formatted_address || null,
          photos: Array.isArray(res.photos)
            ? res.photos.map((p: any) => ({
                ref: p.photo_reference,
                width: p.width,
                height: p.height,
                attributions: p.html_attributions,
              }))
            : [],
        }
      })
    } catch (e) {
      return NextResponse.json({ error: "place details failed" }, { status: 502 })
    }
  }

  // Text search (query by name, optionally biased by near+radius)
  if (text) {
    try {
      const tsUrl = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json")
      tsUrl.searchParams.set("query", text)
      if (near) tsUrl.searchParams.set("location", near)
      if (radius) tsUrl.searchParams.set("radius", String(radius))
      if (type) tsUrl.searchParams.set("type", type)
      tsUrl.searchParams.set("key", key)
      const r = await fetch(tsUrl.toString())
      const j = await r.json()
      const results = (j.results || []).map((p: any) => ({
        id: p.place_id,
        name: p.name,
        location: { lat: p.geometry?.location?.lat, lng: p.geometry?.location?.lng },
        rating: p.rating,
        userRatingsTotal: p.user_ratings_total,
        priceLevel: p.price_level,
        address: p.formatted_address,
      }))
      return NextResponse.json({ results })
    } catch (e) {
      return NextResponse.json({ error: "text search failed" }, { status: 502 })
    }
  }

  // Find Place from text (good at exact business resolution)
  if (find) {
    try {
      const fpUrl = new URL("https://maps.googleapis.com/maps/api/place/findplacefromtext/json")
      fpUrl.searchParams.set("input", find)
      fpUrl.searchParams.set("inputtype", "textquery")
      fpUrl.searchParams.set("fields", "place_id,name,geometry,formatted_address")
      if (near && radius) fpUrl.searchParams.set("locationbias", `circle:${radius}@${near}`)
      else if (near) fpUrl.searchParams.set("locationbias", `point:${near}`)
      if (type) fpUrl.searchParams.set("type", type)
      fpUrl.searchParams.set("key", key)
      const r = await fetch(fpUrl.toString())
      const j = await r.json()
      const candidates = (j.candidates || []).map((p: any) => ({
        id: p.place_id,
        name: p.name,
        location: { lat: p.geometry?.location?.lat, lng: p.geometry?.location?.lng },
        address: p.formatted_address,
      }))
      return NextResponse.json({ results: candidates })
    } catch (e) {
      return NextResponse.json({ error: "find place failed" }, { status: 502 })
    }
  }

  if (!near) return NextResponse.json({ error: 'near required as "lat,lng"' }, { status: 400 })
  const [lat, lng] = near.split(",").map(Number)
  if ([lat, lng].some(Number.isNaN)) return NextResponse.json({ error: "invalid coordinates" }, { status: 400 })

  try {
    const nearbyUrl = new URL("https://maps.googleapis.com/maps/api/place/nearbysearch/json")
    nearbyUrl.searchParams.set("location", `${lat},${lng}`)
    nearbyUrl.searchParams.set("radius", String(radius))
    nearbyUrl.searchParams.set("type", type)
    if (q) nearbyUrl.searchParams.set("keyword", q)
    nearbyUrl.searchParams.set("key", key)

    const r = await fetch(nearbyUrl.toString())
    const j = await r.json()
    const results: Place[] = (j.results || []).map((p: any) => ({
      id: p.place_id,
      name: p.name,
      location: { lat: p.geometry?.location?.lat, lng: p.geometry?.location?.lng },
      rating: p.rating,
      userRatingsTotal: p.user_ratings_total,
      priceLevel: p.price_level,
      vicinity: p.vicinity,
    }))

    // Fetch phone numbers for the top few results using Place Details
    const top = results.slice(0, 8)
    await Promise.all(
      top.map(async (pl) => {
        try {
          const detUrl = new URL("https://maps.googleapis.com/maps/api/place/details/json")
          detUrl.searchParams.set("place_id", pl.id)
          detUrl.searchParams.set("fields", "formatted_phone_number,formatted_address")
          detUrl.searchParams.set("key", key)
          const rr = await fetch(detUrl.toString())
          const jj = await rr.json()
          const phone = jj?.result?.formatted_phone_number
          if (phone) pl.phone = phone
          const addr = jj?.result?.formatted_address
          if (addr) (pl as any).address = addr
        } catch {}
      })
    )

    return NextResponse.json({ results })
  } catch (e) {
    return NextResponse.json({ error: "places fetch failed" }, { status: 502 })
  }
}