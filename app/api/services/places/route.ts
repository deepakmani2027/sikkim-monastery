import { NextResponse } from "next/server"
import { getGoogleMapsServerApiKey, parseLatLng } from "@/lib/google-maps"

type Place = {
  id: string
  name: string
  location: { lat: number; lng: number }
  rating?: number
  userRatingsTotal?: number
  priceLevel?: string
  phone?: string
  website?: string
  businessStatus?: string
  openingHours?: string[]
  primaryType?: string
  types?: string[]
  vicinity?: string
  address?: string
  photos?: Array<{ name: string; width: number; height: number; attributions?: string[] }>
}

function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (value: number) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(h))
}

function headers(key: string) {
  return {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": key,
    "X-Goog-FieldMask":
      "places.id,places.displayName,places.location,places.rating,places.userRatingCount,places.priceLevel,places.formattedAddress,places.shortFormattedAddress,places.nationalPhoneNumber,places.websiteUri,places.businessStatus,places.regularOpeningHours,places.photos",
  }
}

function mapPlace(place: any): Place {
  return {
    id: place.id,
    name: place.displayName?.text || "Unnamed",
    location: {
      lat: Number(place.location?.latitude),
      lng: Number(place.location?.longitude),
    },
    rating: place.rating,
    userRatingsTotal: place.userRatingCount,
    priceLevel: place.priceLevel,
    phone: place.nationalPhoneNumber,
    website: place.websiteUri,
    businessStatus: place.businessStatus,
    openingHours: place.regularOpeningHours?.weekdayDescriptions,
    primaryType: place.primaryType,
    types: place.types,
    address: place.formattedAddress || place.shortFormattedAddress,
    vicinity: place.shortFormattedAddress,
    photos: Array.isArray(place.photos)
      ? place.photos.map((photo: any) => ({
          name: photo.name,
          width: photo.widthPx,
          height: photo.heightPx,
          attributions: photo.authorAttributions?.map((item: any) => item.displayName),
        }))
      : [],
  }
}

async function searchPlaces(
  key: string,
  body: Record<string, unknown>,
): Promise<Place[]> {
  const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: headers(key),
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message = data?.error?.message || `Google Places API returned ${response.status}`
    throw new Error(message)
  }
  const data = await response.json()
  return Array.isArray(data.places) ? data.places.map(mapPlace) : []
}

function isGoogleAvailabilityError(error: unknown) {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase()
  return (
    message.includes("quota") ||
    message.includes("resource_exhausted") ||
    message.includes("permission") ||
    message.includes("api key") ||
    message.includes("billing")
  )
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const near = parseLatLng(url.searchParams.get("near"))
  const radius = Math.min(50000, Math.max(100, Number(url.searchParams.get("radius")) || 5000))
  const type = url.searchParams.get("type") || ""
  const q = url.searchParams.get("q") || ""
  const placeId = url.searchParams.get("placeId")
  const text = url.searchParams.get("text")
  const find = url.searchParams.get("find")
  const photoName = url.searchParams.get("photoName")
  const key = getGoogleMapsServerApiKey()

  if (!key) {
    return NextResponse.json(
      { error: "Google Places server API key is not configured. Set GOOGLE_MAPS_SERVER_API_KEY." },
      { status: 503 },
    )
  }

  if (photoName) {
    const response = await fetch(
      `https://places.googleapis.com/v1/${photoName}/media?maxWidthPx=1600&key=${encodeURIComponent(key)}`,
      { cache: "no-store", redirect: "manual" },
    )
    if (response.status >= 300 && response.status < 400) {
      return NextResponse.redirect(response.headers.get("location") || "/placeholder.jpg")
    }
    if (!response.ok) return NextResponse.json({ error: "photo unavailable" }, { status: 502 })
    return new NextResponse(response.body, {
      status: 200,
      headers: { "Content-Type": response.headers.get("content-type") || "image/jpeg", "Cache-Control": "public, max-age=3600" },
    })
  }

  if (placeId) {
    const id = placeId.replace(/^places\//, "")
    const response = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}`, {
      headers: {
        "X-Goog-Api-Key": key,
        "X-Goog-FieldMask":
          "id,displayName,location,rating,userRatingCount,priceLevel,formattedAddress,shortFormattedAddress,nationalPhoneNumber,internationalPhoneNumber,websiteUri,businessStatus,regularOpeningHours,primaryType,types,photos",
      },
      cache: "no-store",
    })
    if (!response.ok) {
      const data = await response.json().catch(() => null)
      const message = data?.error?.message || `Google Places returned ${response.status}`
      if (response.status === 403 || response.status === 429 || isGoogleAvailabilityError(new Error(message))) {
        return NextResponse.json({ result: null, degraded: true, error: message })
      }
      return NextResponse.json({ result: null, error: message }, { status: response.status })
    }
    const place = mapPlace(await response.json())
    return NextResponse.json({ result: place })
  }

  if (!near && (text || find || q)) {
    return NextResponse.json({ error: 'near required for place search as "lat,lng"' }, { status: 400 })
  }
  if (!near) return NextResponse.json({ error: 'near required as "lat,lng"' }, { status: 400 })

  const query = text || find || q || type || "places"
  const includedType = type && type !== "point_of_interest" ? type : undefined
  try {
    const results = await searchPlaces(key, {
      textQuery: query,
      maxResultCount: 20,
      ...(includedType ? { includedType } : {}),
      locationBias: {
        circle: {
          center: { latitude: near.lat, longitude: near.lng },
          radius,
        },
      },
    })

    return NextResponse.json({
      results: results.filter((place) =>
        distanceKm(near, place.location) <= radius / 1000,
      ),
    })
  } catch (error) {
    if (isGoogleAvailabilityError(error)) {
      return NextResponse.json({
        results: [],
        degraded: true,
        error: error instanceof Error ? error.message : "Google Places is temporarily unavailable",
      })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google Places request failed" },
      { status: 502 },
    )
  }
}
