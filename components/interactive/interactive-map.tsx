"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Navigation, Search, Filter, Layers, ZoomIn, ZoomOut, Locate, Route } from "lucide-react"
import { GoogleMap, type GoogleMapMarker } from "@/components/interactive/google-map"
import dynamic from "next/dynamic"

interface MapLocation {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  type: "monastery" | "landmark" | "viewpoint"
  description: string
  rating: number
  image: string
}

const locations: MapLocation[] = [
  {
    id: "rumtek",
    name: "Rumtek Monastery",
    coordinates: { lat: 27.3389, lng: 88.5583 },
    type: "monastery",
    description: "The largest monastery in Sikkim",
    rating: 4.8,
    image: "/rumtek-monastery-sikkim-buddhist-temple.jpg",
  },
  {
    id: "pemayangtse",
    name: "Pemayangtse Monastery",
    coordinates: { lat: 27.2951, lng: 88.2158 },
    type: "monastery",
    description: "One of the oldest monasteries in Sikkim",
    rating: 4.7,
    image: "/pemayangtse-monastery-sikkim-mountain-view.jpg",
  },
  {
    id: "tashiding",
    name: "Tashiding Monastery",
    coordinates: { lat: 27.3333, lng: 88.2667 },
    type: "monastery",
    description: "Sacred monastery on a hilltop",
    rating: 4.6,
    image: "/tashiding-monastery-sikkim-sacred-site.jpg",
  },
  {
    id: "kanchenjunga",
    name: "Kanchenjunga Viewpoint",
    coordinates: { lat: 27.7025, lng: 88.1475 },
    type: "viewpoint",
    description: "Best view of the third highest peak",
    rating: 4.9,
    image: "/placeholder.svg?height=200&width=300&text=Kanchenjunga+View",
  },
]

function markerIcon(type: MapLocation["type"]) {
  const colors = { monastery: "#7c3aed", landmark: "#0f766e", viewpoint: "#ea580c" }
  const color = colors[type]
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40"><path d="M14 39S2 23.5 2 14a12 12 0 1 1 24 0c0 9.5-12 25-12 25Z" fill="${color}" stroke="white" stroke-width="2"/><circle cx="14" cy="14" r="5" fill="white"/></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const LeafletFallbackMap = dynamic(
  () => import("@/components/interactive/leaflet-fallback-map").then((module) => module.LeafletFallbackMap),
  { ssr: false },
)

export function InteractiveMap() {
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [mapLayer, setMapLayer] = useState<"satellite" | "terrain">("satellite")
  const [showFilters, setShowFilters] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [googleMapError, setGoogleMapError] = useState(false)

  const filteredLocations = useMemo(
    () =>
      locations.filter(
        (location) =>
          location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          location.description.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery],
  )

  const markers: GoogleMapMarker[] = filteredLocations.map((location) => ({
    id: location.id,
    position: location.coordinates,
    title: location.name,
    iconUrl: markerIcon(location.type),
    onClick: () => setSelectedLocation(location),
  }))

  const getMarkerColor = (type: MapLocation["type"]) => {
    if (type === "monastery") return "bg-violet-600"
    if (type === "landmark") return "bg-teal-700"
    return "bg-orange-600"
  }

  const setLayer = (layer: "satellite" | "terrain") => {
    setMapLayer(layer)
    map?.setMapTypeId(layer === "satellite" ? "satellite" : "terrain")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Interactive Map of DharmaTech
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => navigator.geolocation?.getCurrentPosition(
                ({ coords }) => map?.panTo({ lat: coords.latitude, lng: coords.longitude }),
              )}>
                <Locate className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search locations..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Map Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => map?.setZoom((map.getZoom() || 9) + 1)}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => map?.setZoom((map.getZoom() || 9) - 1)}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => map?.setMapTypeId(mapLayer)}>
                  <Layers className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button variant={mapLayer === "satellite" ? "default" : "outline"} size="sm" onClick={() => setLayer("satellite")}>
                  Satellite
                </Button>
                <Button variant={mapLayer === "terrain" ? "default" : "outline"} size="sm" onClick={() => setLayer("terrain")}>
                  Terrain
                </Button>
              </div>
              {showFilters && <p className="text-xs text-muted-foreground">Search filters the visible Google Maps markers.</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Locations ({filteredLocations.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-y-auto">
              {filteredLocations.map((location) => (
                <button
                  key={location.id}
                  onClick={() => {
                    setSelectedLocation(location)
                    map?.panTo(location.coordinates)
                    map?.setZoom(14)
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedLocation?.id === location.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full ${getMarkerColor(location.type)} mt-1`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{location.name}</span>
                        <Badge variant="outline" className="text-xs capitalize">{location.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{location.description}</p>
                      <span className="text-yellow-400 text-xs">⭐ {location.rating}</span>
                    </div>
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full relative overflow-hidden rounded-lg">
              {googleMapError ? (
                <LeafletFallbackMap
                  locations={filteredLocations.map((location) => ({
                    ...location,
                    iconUrl: markerIcon(location.type),
                  }))}
                  onSelect={(id) => {
                    const selected = filteredLocations.find((location) => location.id === id)
                    if (selected) setSelectedLocation(selected)
                  }}
                />
              ) : (
                <GoogleMap
                  center={{ lat: 27.38, lng: 88.35 }}
                  zoom={9}
                  className="h-full w-full"
                  markers={markers}
                  fitBoundsToMarkers
                  onMapReady={setMap}
                  onError={() => setGoogleMapError(true)}
                />
              )}
              <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                <h4 className="text-sm font-medium mb-2">Legend</h4>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-violet-600" />Monastery</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-teal-700" />Landmark</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-600" />Viewpoint</div>
                </div>
              </div>
              {selectedLocation && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg">
                  <div className="flex items-start gap-4">
                    <img src={selectedLocation.image} alt={selectedLocation.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{selectedLocation.name}</h4>
                        <Badge variant="outline" className="text-xs capitalize">{selectedLocation.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{selectedLocation.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-yellow-400">⭐ {selectedLocation.rating}</span>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`, "_blank")}>
                            <Route className="h-4 w-4" />
                          </Button>
                          <Button size="sm" onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${selectedLocation.coordinates.lat},${selectedLocation.coordinates.lng}`, "_blank")}>
                            <Navigation className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
