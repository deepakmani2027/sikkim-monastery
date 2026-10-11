export type LatLng = { lat: number; lng: number }

export function getGoogleMapsBrowserApiKey(): string | null {
  const key =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_MAPS_BROWSER_KEY
  return key?.trim() || null
}

export function getGoogleMapsServerApiKey(): string | null {
  const key =
    process.env.GOOGLE_MAPS_SERVER_API_KEY ||
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.GOOGLE_PLACES_API_KEY
  return key?.trim() || null
}

export function getGoogleMapsApiKey(): string | null {
  return getGoogleMapsServerApiKey()
}

export class GoogleMapsApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message)
    this.name = "GoogleMapsApiError"
  }
}

export function parseLatLng(value: string | null): LatLng | null {
  if (!value) return null
  const [lat, lng] = value.split(",").map((part) => Number(part.trim()))
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return null
  }
  return { lat, lng }
}

export function decodePolyline(encoded: string): LatLng[] {
  let index = 0
  let lat = 0
  let lng = 0
  const coordinates: LatLng[] = []

  while (index < encoded.length) {
    let result = 0
    let shift = 0
    let byte: number
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1

    result = 0
    shift = 0
    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    coordinates.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }

  return coordinates
}

export function parseGoogleDuration(value: string | undefined): number {
  if (!value) return 0
  const seconds = Number.parseFloat(value.replace(/s$/, ""))
  return Number.isFinite(seconds) ? Math.round(seconds) : 0
}

export async function computeGoogleRoute(
  origin: LatLng,
  destination: LatLng,
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT",
) {
  const key = getGoogleMapsServerApiKey()
  if (!key) {
    throw new GoogleMapsApiError(
      "Google Maps server API key is not configured. Set GOOGLE_MAPS_SERVER_API_KEY.",
      503,
    )
  }

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
      destination: { location: { latLng: { latitude: destination.lat, longitude: destination.lng } } },
      travelMode,
      routingPreference: travelMode === "DRIVE" ? "TRAFFIC_AWARE" : undefined,
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "METRIC",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    const message = data?.error?.message || `Google Routes API returned ${response.status}`
    throw new GoogleMapsApiError(message, response.status)
  }
  const data = await response.json()
  const route = data?.routes?.[0]
  if (!route) {
    throw new GoogleMapsApiError("Google Routes API returned no route.", 502)
  }

  return {
    distanceMeters: Number(route.distanceMeters) || 0,
    durationSeconds: parseGoogleDuration(route.duration),
    path: route.polyline?.encodedPolyline ? decodePolyline(route.polyline.encodedPolyline) : [],
  }
}

export async function optimizeGoogleRoute(
  waypoints: LatLng[],
  travelMode: "DRIVE" | "WALK" | "BICYCLE" | "TRANSIT" = "DRIVE",
) {
  if (waypoints.length < 2) {
    throw new GoogleMapsApiError("At least two waypoints are required.", 400)
  }

  const key = getGoogleMapsServerApiKey()
  if (!key) {
    throw new GoogleMapsApiError(
      "Google Maps server API key is not configured. Set GOOGLE_MAPS_SERVER_API_KEY.",
      503,
    )
  }

  const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "routes.optimizedIntermediateWaypointIndex,routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline",
    },
    body: JSON.stringify({
      origin: { location: { latLng: { latitude: waypoints[0].lat, longitude: waypoints[0].lng } } },
      destination: {
        location: {
          latLng: {
            latitude: waypoints[waypoints.length - 1].lat,
            longitude: waypoints[waypoints.length - 1].lng,
          },
        },
      },
      intermediates: waypoints.slice(1, -1).map((point) => ({
        location: { latLng: { latitude: point.lat, longitude: point.lng } },
      })),
      travelMode,
      routingPreference: travelMode === "DRIVE" ? "TRAFFIC_AWARE" : undefined,
      optimizeWaypointOrder: true,
      computeAlternativeRoutes: false,
      languageCode: "en-US",
      units: "METRIC",
    }),
    cache: "no-store",
  })

  if (!response.ok) {
    const data = await response.json().catch(() => null)
    throw new GoogleMapsApiError(
      data?.error?.message || `Google Routes API returned ${response.status}`,
      response.status,
    )
  }

  const data = await response.json()
  const route = data?.routes?.[0]
  if (!route) throw new GoogleMapsApiError("Google Routes API returned no optimized route.", 502)

  return {
    optimizedIntermediateWaypointIndex: Array.isArray(route.optimizedIntermediateWaypointIndex)
      ? route.optimizedIntermediateWaypointIndex.map((index: unknown) => Number(index))
      : [],
    distanceMeters: Number(route.distanceMeters) || 0,
    durationSeconds: parseGoogleDuration(route.duration),
    path: route.polyline?.encodedPolyline ? decodePolyline(route.polyline.encodedPolyline) : [],
  }
}
