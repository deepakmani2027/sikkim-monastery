import { NextResponse } from "next/server"

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

function jitter(n:number){
	return (Math.random()-0.5) * n
}

export async function GET(req: Request){
	try {
		const url = new URL(req.url)
		const near = url.searchParams.get('near')
		const radiusKm = Number(url.searchParams.get('radiusKm') || '5')
		if (!near) return NextResponse.json({ error: 'near required as "lat,lng"' }, { status: 400 })
		const [lat, lng] = near.split(',').map(Number)
		if ([lat,lng].some(Number.isNaN)) return NextResponse.json({ error: 'invalid coordinates' }, { status: 400 })
		const origin = { lat, lng }

		// Mock catalogs
		const gen = (count:number, type:'hotel'|'tours'|'dining') => Array.from({length: count}).map((_,i)=>{
			const p = { lat: origin.lat + jitter(0.02), lng: origin.lng + jitter(0.02) }
			const d = haversineKm(origin, p)
			return {
				id: `${type}_${i+1}`,
				name: `${type === 'hotel' ? 'Hotel' : type === 'tours' ? 'Tour' : 'Cafe'} ${i+1}`,
				rating: Number((3.8 + Math.random()*1.2).toFixed(1)),
				priceINR: type==='tours' ? Math.round(800 + Math.random()*1500) : Math.round(600 + Math.random()*2000),
				distanceKm: Number(d.toFixed(2)),
				location: p,
			}
		}).filter(x=> x.distanceKm <= radiusKm)

		const hotel = gen(8,'hotel')
		const tours = gen(6,'tours')
		const dining = gen(10,'dining')

		return NextResponse.json({ hotel, tours, dining })
	} catch {
		return NextResponse.json({ error: 'unexpected error' }, { status: 500 })
	}
}

