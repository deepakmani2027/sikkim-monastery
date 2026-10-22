"use client"
import { useEffect, useRef, useState } from "react"

// Minimal ambient type guards so TS doesn't error when Google types not available at build.
// For full types, project could add @types/google.maps, but keeping lightweight here.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace google {
    namespace maps {
      interface LatLngLiteral { lat: number; lng: number }
      class Map { constructor(el: HTMLElement, opts: any); setCenter(c: LatLngLiteral): void; fitBounds(b: any, padding?: number | google.maps.Padding): void }
      class Marker { constructor(opts: any); setMap(m: Map | null): void; addListener(ev: string, cb: () => void): void }
      class Polyline { constructor(opts: any); setMap(m: Map | null): void }
      class Size { constructor(w: number, h: number) }
      class Point { constructor(x: number, y: number) }
      class LatLngBounds { constructor(); extend(c: LatLngLiteral): void }
      interface Padding { top?: number; bottom?: number; left?: number; right?: number }
    }
  }
}

// Lightweight Google Maps JS API loader (no external lib dependency)
// Expects process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to be defined at build/runtime.

let mapsScriptPromise: Promise<void> | null = null
function loadGoogleMaps(apiKey: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve()
  if ((window as any).google?.maps) return Promise.resolve()
  if (mapsScriptPromise) return mapsScriptPromise
  mapsScriptPromise = new Promise((resolve, reject) => {
    const callbackName = `__googleMapsReady_${Date.now()}`
    const script = document.createElement('script')
    const previousAuthFailure = (window as any).gm_authFailure
    ;(window as any).gm_authFailure = () => {
      mapsScriptPromise = null
      reject(new Error("Google Maps JavaScript API authorization failed. Enable Maps JavaScript API and billing for this key."))
      if (typeof previousAuthFailure === "function") previousAuthFailure()
    }
    ;(window as any)[callbackName] = () => {
      delete (window as any)[callbackName]
      resolve()
    }
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=places&v=weekly&loading=async&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => {
      mapsScriptPromise = null
      reject(new Error('Failed to load Google Maps'))
    }
    document.head.appendChild(script)
  })
  return mapsScriptPromise
}

export type GoogleMapMarker = {
  id?: string
  position: google.maps.LatLngLiteral
  title?: string
  iconUrl?: string
  onClick?: () => void
}

export interface GoogleMapProps {
  center: google.maps.LatLngLiteral
  zoom?: number
  className?: string
  markers?: GoogleMapMarker[]
  polyline?: { path: google.maps.LatLngLiteral[]; color?: string }
  fitBoundsToMarkers?: boolean
  onMapReady?: (map: google.maps.Map) => void
  onError?: (error: Error) => void
}

export function GoogleMap({ center, zoom = 9, className = "h-full w-full", markers = [], polyline, fitBoundsToMarkers, onMapReady, onError }: GoogleMapProps){
  const ref = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!key){
      const missing = new Error("Google Maps browser API key is missing.")
      setError(missing.message)
      onError?.(missing)
      return
    }
    let cancelled = false
    loadGoogleMaps(key)
      .then(()=>{
      if (cancelled || !ref.current) return
      mapRef.current = new google.maps.Map(ref.current, {
        center,
        zoom,
        mapTypeControl: false,
        fullscreenControl: true,
        streetViewControl: true,
      })
      setReady(true)
      if (onMapReady && mapRef.current) onMapReady(mapRef.current)
      })
    .catch((e) => {
      const failure = e instanceof Error ? e : new Error("Google Maps failed to load.")
      setError(failure.message)
      onError?.(failure)
    })
    return ()=> { cancelled = true }
  }, [center.lat, center.lng, zoom])

  // Update center if props change
  useEffect(()=>{
    if (ready && mapRef.current){
      mapRef.current.setCenter(center)
    }
  }, [center, ready])

  // Manage markers
  const markersRef = useRef<google.maps.Marker[]>([])
  useEffect(()=>{
    if (!ready || !mapRef.current) return
    // Clear existing
    markersRef.current.forEach(m=> m.setMap(null))
    markersRef.current = []
    markers.forEach(m=>{
      const marker = new google.maps.Marker({
        position: m.position,
        map: mapRef.current!,
        title: m.title,
        icon: m.iconUrl
          ? {
              url: m.iconUrl,
              scaledSize: new google.maps.Size(18, 27),
              anchor: new google.maps.Point(9, 27),
            }
          : undefined,
      })
      if (m.onClick) marker.addListener('click', m.onClick)
      markersRef.current.push(marker)
    })
    if (fitBoundsToMarkers && markers.length){
      const b = new google.maps.LatLngBounds()
      markers.forEach(m=> b.extend(m.position))
      mapRef.current.fitBounds(b, 60)
    }
  }, [markers, ready, fitBoundsToMarkers])

  // Polyline
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  useEffect(()=>{
    if (!ready || !mapRef.current) return
    if (polylineRef.current){ polylineRef.current.setMap(null); polylineRef.current = null }
    if (polyline && polyline.path.length){
      polylineRef.current = new google.maps.Polyline({
        path: polyline.path,
        map: mapRef.current,
        strokeColor: polyline.color || '#c1121f',
        strokeOpacity: 0.9,
        strokeWeight: 4,
      })
      if (fitBoundsToMarkers && polyline.path.length){
        const b = new google.maps.LatLngBounds()
        polyline.path.forEach(p=> b.extend(p))
        mapRef.current.fitBounds(b, 60)
      }
    }
  }, [polyline, ready])

  if (error) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted/40 p-6 text-center`}>
        <div className="max-w-md space-y-2 text-sm">
          <p className="font-medium">Google Maps is unavailable for this API key.</p>
          <p className="text-muted-foreground">{error}</p>
          <a
            className="inline-block underline text-primary"
            href={`https://www.google.com/maps/@${center.lat},${center.lng},10z`}
            target="_blank"
            rel="noreferrer"
          >
            Open this area in Google Maps
          </a>
        </div>
      </div>
    )
  }

  return <div ref={ref} className={className} />
}
