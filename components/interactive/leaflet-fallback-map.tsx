"use client"

import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet"
import { divIcon } from "leaflet"

type Location = {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  iconUrl: string
}

export function LeafletFallbackMap({ locations, onSelect }: { locations: Location[]; onSelect: (id: string) => void }) {
  return (
    <MapContainer center={[27.38, 88.35]} zoom={9} className="h-full w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {locations.map((location) => (
        <Marker
          key={location.id}
          position={[location.coordinates.lat, location.coordinates.lng]}
          icon={divIcon({
            className: "",
            html: decodeURIComponent(location.iconUrl.replace(/^data:image\/svg\+xml;charset=UTF-8,/, "")),
            iconSize: [28, 40],
            iconAnchor: [14, 40],
          })}
          eventHandlers={{ click: () => onSelect(location.id) }}
        >
          <Popup>{location.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
