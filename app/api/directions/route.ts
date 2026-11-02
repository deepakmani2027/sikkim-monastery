import { NextRequest, NextResponse } from 'next/server'
import { computeGoogleRoute, optimizeGoogleRoute, parseLatLng, type LatLng } from '@/lib/google-maps'

export const dynamic = 'force-dynamic'

async function fallbackWaypointOrder(waypoints: LatLng[]): Promise<number[]> {
  const remaining = waypoints.slice(1, -1).map((_, index) => index)
  const order: number[] = []
  let current = 0

  while (remaining.length) {
    const candidates = await Promise.all(
      remaining.map(async (index) => {
        try {
          const route = await computeGoogleRoute(waypoints[current], waypoints[index + 1], 'DRIVE')
          return { index, distance: route.distanceMeters || Number.POSITIVE_INFINITY }
        } catch {
          return { index, distance: Number.POSITIVE_INFINITY }
        }
      }),
    )
    candidates.sort((a, b) => a.distance - b.distance)
    const next = candidates[0]
    if (!next || !Number.isFinite(next.distance)) {
      order.push(...remaining)
      break
    }
    order.push(next.index)
    current = next.index + 1
    remaining.splice(remaining.indexOf(next.index), 1)
  }

  return order
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const waypoints = Array.isArray(body?.waypoints)
      ? body.waypoints.map((point: unknown) => {
          if (!point || typeof point !== "object") return null
          const value = point as { lat?: unknown; lng?: unknown }
          const lat = Number(value.lat)
          const lng = Number(value.lng)
          return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null
        })
      : []

    if (
      waypoints.length < 2 ||
      waypoints.length > 27 ||
      waypoints.some((point: { lat: number; lng: number } | null) => !point)
    ) {
      return NextResponse.json({ error: "At least two valid waypoints are required." }, { status: 400 })
    }

    const route = await optimizeGoogleRoute(waypoints as Array<{ lat: number; lng: number }>)
    const hasUsableOrder =
      route.optimizedIntermediateWaypointIndex.length === waypoints.length - 2 &&
      route.optimizedIntermediateWaypointIndex.every(
        (index, position) =>
          Number.isInteger(index) && index >= 0 && index < waypoints.length - 2 && !route.optimizedIntermediateWaypointIndex.slice(0, position).includes(index),
      )
    const optimizedIntermediateWaypointIndex = hasUsableOrder
      ? route.optimizedIntermediateWaypointIndex
      : await fallbackWaypointOrder(waypoints as Array<{ lat: number; lng: number }>)
    return NextResponse.json({
      optimizedIntermediateWaypointIndex,
      distanceMeters: route.distanceMeters,
      durationSeconds: route.durationSeconds,
      polyline: { path: route.path },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Google route optimization failed." },
      { status: 502 },
    )
  }
}

export async function GET(req: NextRequest){
  const { searchParams } = new URL(req.url)
  const originStr = searchParams.get('origin')
  const destinationStr = searchParams.get('destination')
  const modesParam = searchParams.get('modes') || 'driving,walking'
  const origin = parseLatLng(originStr)
  const destination = parseLatLng(destinationStr)
  if (!origin || !destination){
    return NextResponse.json({ error: 'Invalid origin/destination' }, { status: 400 })
  }
  const modes = modesParam.split(',').map(m=> m.trim()).filter(Boolean)
  const results: any[] = []
  const errors: Array<{ mode: string; error: string }> = []

  for (const mode of modes){
    const travelMode = mode.toLowerCase()
    if (!['driving','walking','transit','bicycling'].includes(travelMode)) continue
    try {
      const route = await computeGoogleRoute(
        origin,
        destination,
        ({ driving: 'DRIVE', walking: 'WALK', transit: 'TRANSIT', bicycling: 'BICYCLE' } as const)[travelMode]!,
      )
      if (route){
        results.push({
          mode: travelMode,
          distanceMeters: route.distanceMeters,
          durationSeconds: route.durationSeconds,
          polyline: { path: route.path },
        })
      }
    } catch (error) {
      errors.push({
        mode: travelMode,
        error: error instanceof Error ? error.message : 'Google Routes API request failed',
      })
    }
  }

  return NextResponse.json(
    { routes: results, ...(errors.length ? { errors } : {}) },
    results.length || !errors.length ? undefined : { status: 502 },
  )
}
