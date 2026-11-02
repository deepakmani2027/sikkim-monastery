"use client"

import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet"
import L, { LatLngBoundsExpression } from "leaflet"
import "leaflet/dist/leaflet.css"
import { monasteries } from "@/lib/monasteries"
import Link from "next/link"

export function MonasteryMap() {
  const sikkimBounds: LatLngBoundsExpression = [
    [26.8, 87.8],
    [28.4, 89.2],
  ]

  const markerBounds = monasteries.reduce(
    (b, m) => b.extend([m.coordinates.lat, m.coordinates.lng] as [number, number]),
    L.latLngBounds([monasteries[0].coordinates.lat, monasteries[0].coordinates.lng], [monasteries[0].coordinates.lat, monasteries[0].coordinates.lng])
  )

  return (
    <div className="h-full w-full">
      <MapContainer
        bounds={markerBounds as any}
        maxBounds={sikkimBounds as any}
        maxBoundsViscosity={1.0}
        zoom={8}
        minZoom={7}
        className="h-full w-full rounded-lg overflow-hidden"
      >
        <TileLayer
          attribution={"&copy; OpenStreetMap contributors" as any}
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {monasteries.map((m) => (
          <Marker
            key={m.id}
            position={[m.coordinates.lat, m.coordinates.lng] as any}
            icon={L.icon({
              iconUrl: "/marker-red-3d.svg",
              iconRetinaUrl: "/marker-red-3d.svg",
              iconSize: [36, 54],
              iconAnchor: [18, 52],
              popupAnchor: [0, -44],
            }) as any}
          >
            <Popup>
              <div className="space-y-1">
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.location}</div>
                <Link href={`/monastery/${m.id}`} className="text-primary text-xs underline">
                  View details
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
