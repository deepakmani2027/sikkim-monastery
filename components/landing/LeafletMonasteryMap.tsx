"use client"
import { useEffect, useMemo, useState } from "react"
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet"
import { divIcon } from "leaflet"

export interface Monastery {
  id: number
  name: string
  lat: number
  lng: number
  century: string
  region: string
  description: string
  image: string
  festivals: string[]
  visitingHours: string
  contact: string
  nearbyAttractions: string[]
}

interface Props {
  monasteries: Monastery[]
  center: [number, number]
  onSelect: (m: Monastery) => void
}

export default function LeafletMonasteryMap({ monasteries, center, onSelect }: Props) {
  const [ready, setReady] = useState(false)
  const [mapKey] = useState(() => `leaflet-map-${Date.now()}-${Math.random().toString(36).slice(2)}`)

  useEffect(() => setReady(true), [])
  const pinIcon = useMemo(() =>
    divIcon({
      className: "monastery-pin",
      html: `
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));">
          <path d="M12 22s7-6.16 7-12a7 7 0 1 0-14 0c0 5.84 7 12 7 12z" fill="#b91c1c" stroke="white" stroke-width="2"/>
          <circle cx="12" cy="10" r="3.2" fill="white"/>
        </svg>
      `,
      iconSize: [28, 28],
      iconAnchor: [14, 28]
    }),
    []
  )

  const bounds = useMemo(() => {
    const lats = monasteries.map(m => m.lat)
    const lngs = monasteries.map(m => m.lng)
    const minLat = Math.min(...lats) - 0.2
    const maxLat = Math.max(...lats) + 0.2
    const minLng = Math.min(...lngs) - 0.2
    const maxLng = Math.max(...lngs) + 0.2
    return [
      [minLat, minLng],
      [maxLat, maxLng]
    ] as [[number, number], [number, number]]
  }, [monasteries])

  function FitBounds({ b }: { b: [[number, number],[number, number]] | null | undefined }) {
    const map = useMap()
    useEffect(() => {
      if (!b) return
      try {
        map.fitBounds(b as any, { padding: [40, 40] })
      } catch {
        // ignore
      }
    // stringify to avoid ref issues without deep compare
    }, [map, b ? JSON.stringify(b) : "no-bounds"]) 
    return null
  }

  if (!ready) return <div className="h-full w-full rounded-b-2xl" />

  return (
    <MapContainer key={mapKey} center={center} scrollWheelZoom zoom={8} className="h-full w-full rounded-b-2xl">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds b={bounds} />
      {monasteries.map((m) => (
        <Marker key={m.id} position={[m.lat, m.lng]} icon={pinIcon} eventHandlers={{ click: () => onSelect(m) }}>
          <Tooltip direction="top" offset={[0, -4]} opacity={1} permanent={false}>
            <div className="font-medium">{m.name}</div>
            <div className="text-xs text-muted-foreground">{m.region}</div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  )
}
