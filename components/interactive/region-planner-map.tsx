"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { GoogleMap, type GoogleMapMarker } from "@/components/interactive/google-map"
import { monasteries, type Monastery } from "@/lib/monasteries"
import { regions, type Region } from "@/lib/regions"
import { trekRoutes } from "@/lib/poi"
import { haversineKm, sortByDistance, withinKm } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Route, Navigation } from "lucide-react"

type Category = "monastery" | "attraction" | "hotel" | "homestay" | "restaurant" | "transport"
type Coordinates = { lat: number; lng: number }
type PlannerPlace = {
  id: string
  name: string
  coordinates: Coordinates
  category: Exclude<Category, "monastery">
  address?: string
  rating?: number
  distanceKm?: number
  url?: string
}
type ItineraryItem = {
  id: string
  name: string
  coordinates: Coordinates
  kind: "monastery" | "poi"
}

const categoryColors: Record<Category, string> = {
  monastery: "#c026d3",
  attraction: "#2563eb",
  hotel: "#16a34a",
  homestay: "#059669",
  restaurant: "#ea580c",
  transport: "#0ea5e9",
}

function markerSvgDataUrl(color: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="27" viewBox="0 0 24 36"><path fill="${color}" d="M12 0c-6.6 0-12 5.3-12 12 0 8.6 12 24 12 24s12-15.4 12-24C24 5.3 18.6 0 12 0z"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function regionOf(monastery: Monastery): Region | null {
  if (monastery.district.includes("East")) return "East Sikkim"
  if (monastery.district.includes("West")) return "West Sikkim"
  if (monastery.district.includes("North")) return "North Sikkim"
  if (monastery.district.includes("South")) return "South Sikkim"
  return null
}

function addUniquePlaces(target: PlannerPlace[], incoming: PlannerPlace[]) {
  const seen = new Set(target.map((place) => place.id))
  incoming.forEach((place) => {
    if (!seen.has(place.id)) {
      seen.add(place.id)
      target.push(place)
    }
  })
}

function placeCategory(category: Category): PlannerPlace["category"] | null {
  if (category === "attraction") return "attraction"
  if (category === "hotel" || category === "homestay") return "hotel"
  if (category === "restaurant") return "restaurant"
  if (category === "transport") return "transport"
  return null
}

export function RegionPlannerMap() {
  const [region, setRegion] = useState<Region>("West Sikkim")
  const [radiusKm, setRadiusKm] = useState(5)
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null)
  const [places, setPlaces] = useState<PlannerPlace[]>([])
  const [itinerary, setItinerary] = useState<ItineraryItem[]>([])
  const [routePath, setRoutePath] = useState<Coordinates[]>([])
  const [routeDistanceKm, setRouteDistanceKm] = useState<number | null>(null)
  const [optimizeLoading, setOptimizeLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [routeLoading, setRouteLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [enabled, setEnabled] = useState<Record<Category, boolean>>({
    monastery: true,
    attraction: true,
    hotel: true,
    homestay: true,
    restaurant: true,
    transport: true,
  })

  const regionMonasteries = useMemo(
    () => monasteries.filter((monastery) => regionOf(monastery) === region),
    [region],
  )
  const center = useMemo<Coordinates>(() => {
    if (!regionMonasteries.length) return { lat: 27.5, lng: 88.4 }
    return {
      lat: regionMonasteries.reduce((sum, monastery) => sum + monastery.coordinates.lat, 0) / regionMonasteries.length,
      lng: regionMonasteries.reduce((sum, monastery) => sum + monastery.coordinates.lng, 0) / regionMonasteries.length,
    }
  }, [regionMonasteries])

  useEffect(() => {
    setSelectedMonastery(regionMonasteries[0] || null)
    setItinerary([])
    setRoutePath([])
  }, [region, regionMonasteries])

  useEffect(() => {
    if (!selectedMonastery) return
    let active = true
    async function loadGooglePlaces() {
      setLoading(true)
      setError(null)
      try {
        const origin = selectedMonastery.coordinates
        const queries: Array<{ category: PlannerPlace["category"]; text: string; type: string }> = [
          { category: "attraction", type: "tourist_attraction", text: `tourist attractions and activities near ${selectedMonastery.name}` },
          { category: "hotel", type: "lodging", text: `hotels near ${selectedMonastery.name}` },
          { category: "homestay", type: "lodging", text: `homestays and guest houses near ${selectedMonastery.name}` },
          { category: "restaurant", type: "restaurant", text: `restaurants and local dining near ${selectedMonastery.name}` },
          { category: "transport", type: "car_rental", text: `transport and car rental near ${selectedMonastery.name}` },
        ]
        const responses = await Promise.all(
          queries.map(async (query) => {
            const response = await fetch(
              `/api/services/places?near=${origin.lat},${origin.lng}&radius=${radiusKm * 1000}&type=${query.type}&text=${encodeURIComponent(query.text)}`,
              { cache: "no-store" },
            )
            if (!response.ok) throw new Error(`Google Places request failed: ${response.status}`)
            const data = await response.json()
            return {
              category: query.category,
              results: Array.isArray(data.results) ? data.results : [],
            }
          }),
        )
        if (!active) return
        const next: PlannerPlace[] = []
        responses.forEach(({ category, results }) => {
          addUniquePlaces(
            next,
            results
              .filter((place: any) => Number.isFinite(place.location?.lat) && Number.isFinite(place.location?.lng))
              .map((place: any) => ({
                id: place.id,
                name: place.name,
                category,
                coordinates: { lat: place.location.lat, lng: place.location.lng },
                address: place.address || place.vicinity,
                rating: place.rating,
                distanceKm: haversineKm(origin, { lat: place.location.lat, lng: place.location.lng }),
                url: place.website,
              })),
          )
        })
        setPlaces(next)
      } catch (loadError) {
        if (!active) return
        setPlaces([])
        setError(loadError instanceof Error ? loadError.message : "Failed to load Google places")
      } finally {
        if (active) setLoading(false)
      }
    }
    loadGooglePlaces()
    return () => {
      active = false
    }
  }, [selectedMonastery, radiusKm])

  useEffect(() => {
    if (itinerary.length < 2) {
      setRoutePath([])
      setRouteDistanceKm(null)
      return
    }
    let active = true
    async function loadRoute() {
      setRouteLoading(true)
      try {
        const paths: Coordinates[] = []
        let totalDistanceMeters = 0
        for (let index = 0; index < itinerary.length - 1; index += 1) {
          const from = itinerary[index].coordinates
          const to = itinerary[index + 1].coordinates
          const response = await fetch(
            `/api/directions?origin=${from.lat},${from.lng}&destination=${to.lat},${to.lng}&modes=driving`,
            { cache: "no-store" },
          )
          if (!response.ok) throw new Error(`Route request failed: ${response.status}`)
          const data = await response.json()
          const segment = data.routes?.[0]?.polyline?.path || []
          totalDistanceMeters += Number(data.routes?.[0]?.distanceMeters) || 0
          if (index === 0) paths.push(...segment)
          else paths.push(...segment.slice(1))
        }
        if (active) {
          setRoutePath(paths)
          setRouteDistanceKm(totalDistanceMeters ? totalDistanceMeters / 1000 : null)
        }
      } catch (routeError) {
        if (active) {
          setRoutePath(itinerary.map((item) => item.coordinates))
          setRouteDistanceKm(null)
          setError(routeError instanceof Error ? routeError.message : "Failed to calculate route")
        }
      } finally {
        if (active) setRouteLoading(false)
      }
    }
    loadRoute()
    return () => {
      active = false
    }
  }, [itinerary])

  const nearbyPlaces = useMemo(
    () => (selectedMonastery ? withinKm(selectedMonastery.coordinates, places, radiusKm) : []),
    [places, selectedMonastery, radiusKm],
  )
  const visiblePlaces = useMemo(
    () => nearbyPlaces.filter((place) => enabled[place.category]),
    [nearbyPlaces, enabled],
  )
  const markers = useMemo<GoogleMapMarker[]>(() => {
    const result: GoogleMapMarker[] = []
    if (selectedMonastery && enabled.monastery) {
      result.push({
        id: `monastery-${selectedMonastery.id}`,
        position: selectedMonastery.coordinates,
        title: selectedMonastery.name,
        iconUrl: markerSvgDataUrl(categoryColors.monastery),
        onClick: () => setItinerary((items) => items.find((item) => item.id === selectedMonastery.id) ? items : [...items, { id: selectedMonastery.id, name: selectedMonastery.name, coordinates: selectedMonastery.coordinates, kind: "monastery" }]),
      })
    }
    visiblePlaces.forEach((place) => {
      result.push({
        id: place.id,
        position: place.coordinates,
        title: place.name,
        iconUrl: markerSvgDataUrl(categoryColors[place.category]),
        onClick: () => setItinerary((items) => items.find((item) => item.id === place.id) ? items : [...items, { id: place.id, name: place.name, coordinates: place.coordinates, kind: "poi" }]),
      })
    })
    return result
  }, [enabled.monastery, selectedMonastery, visiblePlaces])

  const addToItinerary = (item: ItineraryItem) =>
    setItinerary((items) => items.some((existing) => existing.id === item.id) ? items : [...items, item])

  async function optimizeItinerary() {
    if (itinerary.length < 3 || optimizeLoading) return
    setOptimizeLoading(true)
    setError(null)
    try {
      const response = await fetch("/api/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waypoints: itinerary.map((item) => item.coordinates) }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.error || `Route optimization failed: ${response.status}`)
      const indexes = Array.isArray(data.optimizedIntermediateWaypointIndex)
        ? data.optimizedIntermediateWaypointIndex
        : []
      if (indexes.length !== itinerary.length - 2) throw new Error("Google returned an incomplete optimized route.")
      const middle = indexes.map((index: number) => itinerary[index + 1]).filter(Boolean)
      setItinerary([itinerary[0], ...middle, itinerary[itinerary.length - 1]])
    } catch (optimizationError) {
      setError(optimizationError instanceof Error ? optimizationError.message : "Route optimization failed")
    } finally {
      setOptimizeLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
      <div className="space-y-4 lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto lg:pr-2">
        <Card>
          <CardHeader><CardTitle className="text-sm">Plan by Region</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Select value={region} onValueChange={(value) => setRegion(value as Region)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{regions.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(enabled) as Category[]).map((category) => (
                <label key={category} className="flex items-center gap-2 text-xs">
                  <Switch checked={enabled[category]} onCheckedChange={(value) => setEnabled((current) => ({ ...current, [category]: value }))} />
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: categoryColors[category] }} />{category}</span>
                </label>
              ))}
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs mb-2"><span className="font-medium">Nearby Radius</span><span>{radiusKm} km</span></div>
              <Slider value={[radiusKm]} min={1} max={20} step={1} onValueChange={(value) => setRadiusKm(value[0])} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Map legend</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-xs">
            {(Object.keys(categoryColors) as Category[]).map((category) => (
              <div key={category} className="flex items-center gap-2 capitalize">
                <span className="h-3 w-3 rounded-full border border-white shadow" style={{ backgroundColor: categoryColors[category] }} />
                {category}
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-sm">Monasteries in {region}</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-80 overflow-auto">
            {regionMonasteries.map((monastery) => (
              <button key={monastery.id} onClick={() => setSelectedMonastery(monastery)} className={`w-full text-left p-2 rounded border ${selectedMonastery?.id === monastery.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                <div className="flex items-center justify-between"><div><div className="text-sm font-medium">{monastery.name}</div><div className="text-xs text-muted-foreground">{monastery.location}</div></div><Badge variant="secondary">{monastery.district}</Badge></div>
              </button>
            ))}
          </CardContent>
        </Card>

        {selectedMonastery && (
          <Card>
            <CardHeader><CardTitle className="text-sm">Nearby to {selectedMonastery.name} (≤ {radiusKm}km)</CardTitle></CardHeader>
            <CardContent className="space-y-2 max-h-96 overflow-auto">
              {loading && <div className="text-xs text-muted-foreground">Loading live Google Places…</div>}
              {!loading && !visiblePlaces.length && <div className="text-xs text-muted-foreground">No Google Places found in this radius.</div>}
              {(["attraction", "hotel", "homestay", "restaurant", "transport"] as const).map((category) => {
                const categoryPlaces = sortByDistance(selectedMonastery.coordinates, visiblePlaces.filter((place) => place.category === category))
                if (!categoryPlaces.length) return null
                return <div key={category}><div className="text-xs font-medium capitalize mb-1" style={{ color: categoryColors[category] }}>{category}</div>{categoryPlaces.map((place) => <div key={place.id} className="flex items-center justify-between gap-2 text-xs mb-1"><span className="min-w-0"><span className="block truncate">{place.name}</span><span className="text-muted-foreground">{place.distanceKm?.toFixed(1)} km{place.rating ? ` · ${place.rating.toFixed(1)}★` : ""}</span></span><Button size="sm" variant="outline" onClick={() => addToItinerary({ id: place.id, name: place.name, coordinates: place.coordinates, kind: "poi" })}>Add</Button></div>)}</div>
              })}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle className="text-sm">Itinerary ({itinerary.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!itinerary.length && <div className="text-xs text-muted-foreground">Add the monastery or Google Places to create a route.</div>}
            {itinerary.map((item, index) => <div key={item.id} className="flex items-center justify-between text-xs border rounded p-2"><div><div className="font-medium">{index + 1}. {item.name}</div><div className="text-muted-foreground">{item.kind}</div></div><Button variant="outline" size="sm" onClick={() => setItinerary((items) => items.filter((current) => current.id !== item.id))}>Remove</Button></div>)}
            {itinerary.length >= 2 && <div className="flex items-center justify-between pt-2"><div className="text-xs">{routeLoading ? "Calculating driving route…" : routeDistanceKm != null ? `Driving distance: ${routeDistanceKm.toFixed(1)} km` : "Driving route unavailable"}</div><div className="flex gap-2"><Button variant="outline" size="sm" disabled={itinerary.length < 3 || optimizeLoading} onClick={optimizeItinerary}>{optimizeLoading ? "Optimizing…" : "Optimize"}</Button><a className="inline-flex items-center text-xs underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&origin=${itinerary[0].coordinates.lat},${itinerary[0].coordinates.lng}&destination=${itinerary[itinerary.length - 1].coordinates.lat},${itinerary[itinerary.length - 1].coordinates.lng}&travelmode=driving`}>Open in Google Maps</a></div></div>}
            {!!itinerary.length && <Button variant="ghost" size="sm" onClick={() => setItinerary([])}>Clear</Button>}
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-2 lg:sticky lg:top-4">
        <Card className="min-h-[500px] h-[calc(100vh-7rem)] pt-0 pb-0">
          <CardContent className="p-0 h-full">
            {error && <div className="p-2 text-xs text-amber-600">{error}</div>}
            <GoogleMap
              center={selectedMonastery?.coordinates || center}
              zoom={selectedMonastery ? 12 : 9}
              className="h-full min-h-[500px] w-full rounded-lg overflow-hidden"
              markers={markers}
              polyline={routePath.length >= 2 ? { path: routePath, color: "#ef4444" } : undefined}
              fitBoundsToMarkers={markers.length > 1}
            />
            {selectedMonastery && <div className="absolute bottom-4 left-4 right-4 z-10 rounded bg-white/95 p-2 text-xs shadow"><Link href={`/monastery/${selectedMonastery.id}`} className="font-medium text-primary underline">{selectedMonastery.name}</Link><span className="ml-2 text-muted-foreground">Click a marker to add it to the route.</span><span className="ml-2"><a className="underline" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMonastery.coordinates.lat},${selectedMonastery.coordinates.lng}`}>Directions</a></span></div>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
