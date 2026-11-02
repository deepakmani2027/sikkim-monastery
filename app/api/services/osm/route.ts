import { NextResponse } from "next/server"
import { regionBBoxes } from "@/lib/regions"

type TransportContact = {
  id: string
  name: string
  phone?: string
  coordinates: { lat: number; lng: number }
  address?: string
  operator?: string
}

function sikkimUnionBBox() {
  const boxes = Object.values(regionBBoxes)
  const south = Math.min(...boxes.map((b) => b[0]))
  const west = Math.min(...boxes.map((b) => b[1]))
  const north = Math.max(...boxes.map((b) => b[2]))
  const east = Math.max(...boxes.map((b) => b[3]))
  return { south, west, north, east }
}

function isInSikkim(lat: number, lng: number) {
  const { south, west, north, east } = sikkimUnionBBox()
  return lat >= south && lat <= north && lng >= west && lng <= east
}

async function fetchOverpass(query: string, tries = 3): Promise<any> {
  const endpoint = "https://overpass-api.de/api/interpreter"
  let lastErr: any
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `data=${encodeURIComponent(query)}`,
        // Overpass can be slow; give it time
        // @ts-ignore - Next fetch supports next.revalidate/timeout differently, keep default
      })
      if (!r.ok) throw new Error(`Overpass ${r.status}`)
      const j = await r.json()
      return j
    } catch (e) {
      lastErr = e
      // Exponential backoff: 500ms, 1s, 2s
      await new Promise((res) => setTimeout(res, 500 * Math.pow(2, i)))
    }
  }
  throw lastErr
}

function mapElement(el: any): TransportContact | null {
  if (!el) return null
  const tags = el.tags || {}
  const lat = el.lat ?? el.center?.lat
  const lon = el.lon ?? el.center?.lon
  if (typeof lat !== "number" || typeof lon !== "number") return null
  const phone = tags.phone || tags["contact:phone"] || tags["operator:phone"] || undefined
  const name = tags.name || tags.operator || (tags.brand ? `${tags.brand}${tags.operator ? ` (${tags.operator})` : ""}` : "Unnamed")
  const address = tags["addr:full"] || tags["addr:street"] || undefined
  const operator = tags.operator || undefined
  return {
    id: `${el.type}/${el.id}`,
    name,
    phone,
    coordinates: { lat, lng: lon },
    address,
    operator,
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const lat = Number(url.searchParams.get("lat"))
    const lng = Number(url.searchParams.get("lng"))
    const radius = Math.min(Math.max(Number(url.searchParams.get("radius")) || 15000, 1000), 40000)
    const include = (url.searchParams.get("include") || "taxi,bus").split(",").map((s) => s.trim())

    if ([lat, lng].some((n) => Number.isNaN(n))) {
      return NextResponse.json({ error: "invalid coordinates" }, { status: 400 })
    }
    if (!isInSikkim(lat, lng)) {
      return NextResponse.json({ taxi: [], bus: [], note: "outside_sikkim" })
    }

    const qBase = (amenity: string) => `[
      out:json][timeout:25];(
        node(around:${radius},${lat},${lng})["amenity"="${amenity}"];
        way(around:${radius},${lat},${lng})["amenity"="${amenity}"];
      );out center;`

    const needTaxi = include.includes("taxi")
    const needBus = include.includes("bus")

    const tasks: Array<Promise<any>> = []
    if (needTaxi) tasks.push(fetchOverpass(qBase("taxi")))
    if (needBus) tasks.push(fetchOverpass(qBase("bus_station")))

    const results = await Promise.all(tasks)
    const [taxiRaw, busRaw] = [needTaxi ? results.shift() : null, needBus ? results.shift() : null]

  const inSikkimFilter = (x: TransportContact | null): x is TransportContact => !!x && isInSikkim(x.coordinates.lat, x.coordinates.lng)
  const hasName = (x: TransportContact | null): x is TransportContact => !!x && !!x.name && x.name !== "Unnamed" && x.name.trim().length > 0

  const taxi: TransportContact[] = taxiRaw?.elements?.map(mapElement).filter(hasName).filter(inSikkimFilter) || []
  const bus: TransportContact[] = busRaw?.elements?.map(mapElement).filter(hasName).filter(inSikkimFilter) || []

    return NextResponse.json({ taxi, bus })
  } catch (e) {
    return NextResponse.json({ error: "osm fetch failed" }, { status: 502 })
  }
}
