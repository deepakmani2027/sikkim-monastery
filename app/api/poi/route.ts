import { NextResponse } from "next/server"
import { regionBBoxes, regions, type Region } from "@/lib/regions"

// Build an Overpass query for a region's bbox
function buildQuery(bbox: [number, number, number, number]) {
  const [s, w, n, e] = bbox
  const bboxStr = `${s},${w},${n},${e}`
  return `
  [out:json][timeout:25];
  (
    // Monasteries (Buddhist places of worship)
    node[amenity=place_of_worship][religion=buddhist](${bboxStr});
    way[amenity=place_of_worship][religion=buddhist](${bboxStr});
    relation[amenity=place_of_worship][religion=buddhist](${bboxStr});

    // Attractions
    node[tourism=attraction](${bboxStr});
    way[tourism=attraction](${bboxStr});

    // Food (restaurant/cafe/fast food)
    node[amenity~"^(restaurant|cafe|fast_food)$"](${bboxStr});

    // Accommodation (hotel/guest_house/hostel/homestay/motel)
    node[tourism~"^(hotel|guest_house|hostel|motel)$"](${bboxStr});
    node[amenity=homestay](${bboxStr});

    // Transport (bus/taxi/rail/air)
    node[amenity~"^(bus_station|taxi)$"](${bboxStr});
    node[railway=station](${bboxStr});
    node[aeroway=aerodrome](${bboxStr});
  );
  out center;
  >;
  out skel qt;`
}

function toPoint(el: any) {
  if (el.type === "node") return { lat: el.lat, lng: el.lon }
  if (el.center) return { lat: el.center.lat, lng: el.center.lon }
  return null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const region = (searchParams.get("region") as Region) || regions[0]
  const bbox = regionBBoxes[region]
  if (!bbox) return NextResponse.json({ error: "invalid region" }, { status: 400 })

  const body = buildQuery(bbox)
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data: body }),
    cache: "no-store",
  })
  if (!res.ok) {
    return NextResponse.json({ error: `overpass ${res.status}` }, { status: 502 })
  }
  const data = await res.json()
  const out = {
    monastery: [] as any[],
    attraction: [] as any[],
    hotel: [] as any[],
    homestay: [] as any[],
    restaurant: [] as any[],
    transport: [] as any[],
  }
  for (const el of data.elements || []) {
    const pt = toPoint(el)
    if (!pt) continue
    const tags = el.tags || {}
    const name = tags.name || tags["name:en"] || "Unnamed"
    const id = `${el.type}/${el.id}`
    if (tags.amenity === "place_of_worship" && tags.religion === "buddhist") {
      out.monastery.push({ id, name, coordinates: pt, tags })
      continue
    }
    if (tags.tourism === "attraction") {
      out.attraction.push({ id, name, coordinates: pt, tags })
      continue
    }
    if (tags.amenity === "restaurant" || tags.amenity === "cafe" || tags.amenity === "fast_food") {
      out.restaurant.push({ id, name, coordinates: pt, tags })
      continue
    }
    if (tags.tourism && ["hotel", "guest_house", "hostel", "motel"].includes(tags.tourism)) {
      out.hotel.push({ id, name, coordinates: pt, tags })
      continue
    }
    if (tags.amenity === "homestay") {
      out.homestay.push({ id, name, coordinates: pt, tags })
      continue
    }
    if (
      (tags.amenity && ["bus_station", "taxi"].includes(tags.amenity)) ||
      tags.railway === "station" ||
      tags.aeroway === "aerodrome"
    ) {
      out.transport.push({ id, name, coordinates: pt, tags })
      continue
    }
  }
  return NextResponse.json(out)
}
