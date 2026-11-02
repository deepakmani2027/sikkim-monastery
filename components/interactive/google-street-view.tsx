"use client"

import { useMemo } from "react"

type Props = {
  lat: number
  lng: number
  heading?: number
  pitch?: number
  fov?: number
  className?: string
  height?: string | number
}

export function GoogleStreetView({ lat, lng, heading = 0, pitch = 0, fov = 80, className = "", height = "70vh" }: Props) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const src = useMemo(() => {
    if (!key) return ""
    const u = new URL("https://www.google.com/maps/embed/v1/streetview")
    u.searchParams.set("key", key)
    u.searchParams.set("location", `${lat},${lng}`)
    u.searchParams.set("heading", String(heading))
    u.searchParams.set("pitch", String(pitch))
    u.searchParams.set("fov", String(Math.max(10, Math.min(120, fov))))
    return u.toString()
  }, [key, lat, lng, heading, pitch, fov])

  if (!key) {
    const pano = `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`
    return (
      <div className={`w-full bg-muted flex items-center justify-center ${className}`} style={{ height }}>
        <div className="text-center text-sm">
          <div className="mb-2">Google Street View requires `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.</div>
          <a href={pano} target="_blank" rel="noreferrer" className="underline text-primary">Open Street View in Google Maps</a>
        </div>
      </div>
    )
  }

  return (
    <iframe
      src={src}
      className={className}
      style={{ width: "100%", height, border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  )
}
