import type { Region } from "./regions"

export type Category = "monastery" | "attraction" | "hotel" | "homestay" | "restaurant" | "transport"

export interface POI {
  id: string
  name: string
  coordinates: { lat: number; lng: number }
  category: Category
  region?: Region
  tags?: Record<string, string>
  url?: string
}

export interface TrekRoute {
  id: string
  name: string
  region: Region
  polyline: Array<{ lat: number; lng: number }>
}

export const trekRoutes: TrekRoute[] = [
  {
    id: "dzongri-trail",
    name: "Dzongri Trek Segment",
    region: "West Sikkim",
    polyline: [
      { lat: 27.375, lng: 88.204 },
      { lat: 27.378, lng: 88.220 },
      { lat: 27.392, lng: 88.236 },
    ],
  },
  {
    id: "tsomgo-trail",
    name: "Tsomgo View Trail",
    region: "East Sikkim",
    polyline: [
      { lat: 27.375, lng: 88.762 },
      { lat: 27.380, lng: 88.754 },
      { lat: 27.389, lng: 88.746 },
    ],
  },
]
