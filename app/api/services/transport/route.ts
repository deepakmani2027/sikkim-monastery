import { NextResponse } from "next/server"
import { computeGoogleRoute } from "@/lib/google-maps"

function toRad(n: number) { return (n * Math.PI) / 180 }
function haversineKm(a: {lat:number,lng:number}, b: {lat:number,lng:number}){
	const R = 6371
	const dLat = toRad(b.lat - a.lat)
	const dLon = toRad(b.lng - a.lng)
	const lat1 = toRad(a.lat)
	const lat2 = toRad(b.lat)
	const h = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2
	return 2 * R * Math.asin(Math.sqrt(h))
}

// Simple in-memory cache (per serverless instance) to reduce latency & quota.
const distanceCache: Record<string,{ km:number; ts:number }> = {}
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes

async function googleDrivingDistanceKm(from: {lat:number,lng:number}, to: {lat:number,lng:number}): Promise<number | null> {
	try {
		const route = await computeGoogleRoute(from, to, "DRIVE")
		return route && route.distanceMeters > 0 ? route.distanceMeters / 1000 : null
	} catch { return null }
}

export async function GET(req: Request){
	try {
		const url = new URL(req.url)
		const fromStr = url.searchParams.get('from')
		const toStr = url.searchParams.get('to')
		if (!fromStr || !toStr) {
			return NextResponse.json({ error: 'from and to required as "lat,lng"' }, { status: 400 })
		}
		const [fLat, fLng] = fromStr.split(',').map(Number)
		const [tLat, tLng] = toStr.split(',').map(Number)
		if ([fLat,fLng,tLat,tLng].some((n)=> Number.isNaN(n))) {
			return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 })
		}
		const from = { lat: fLat, lng: fLng }
		const to = { lat: tLat, lng: tLng }

    const cacheKey = `${from.lat.toFixed(4)},${from.lng.toFixed(4)}|${to.lat.toFixed(4)},${to.lng.toFixed(4)}`
    let distanceKm: number | null = null
    const cached = distanceCache[cacheKey]
    if (cached && (Date.now() - cached.ts) < CACHE_TTL_MS){ distanceKm = cached.km }
    if (distanceKm == null){
      distanceKm = await googleDrivingDistanceKm(from, to)
      if (distanceKm != null){ distanceCache[cacheKey] = { km: distanceKm, ts: Date.now() } }
    }
    if (distanceKm == null){ distanceKm = haversineKm(from, to) }
    distanceKm = Math.max(0.5, distanceKm)

		const vehicles = [
			{ id: 'bike', label: 'bike', base: 40, perKm: 12, speedKmh: 35 },
			{ id: 'car-hatchback', label: 'car-hatchback', base: 60, perKm: 15, speedKmh: 40 },
			{ id: 'car-sedan', label: 'car-sedan', base: 80, perKm: 18, speedKmh: 45 },
			{ id: 'car-suv', label: 'car-suv', base: 100, perKm: 22, speedKmh: 45 },
		] as const

		const options = vehicles.map(v => {
			const fare = v.base + v.perKm * distanceKm
			const etaMin = Math.round((distanceKm / v.speedKmh) * 60 + 5)
			return {
				id: v.id,
				vehicleType: v.label,
				distanceKm: Number(distanceKm.toFixed(2)),
				etaMin,
				estimatedPriceINR: Math.round(fare)
			}
		})

		return NextResponse.json({ from, to, distanceKm: Number(distanceKm.toFixed(2)), via: distanceCache[cacheKey] ? 'google-cached' : 'google-or-haversine', options })
	} catch (e:any) {
		return NextResponse.json({ error: 'unexpected error' }, { status: 500 })
	}
}
