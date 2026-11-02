export type Region = "East Sikkim" | "West Sikkim" | "North Sikkim" | "South Sikkim"

export const regions: Region[] = ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"]

// Bounding boxes for Sikkim regions: [south, west, north, east]
export const regionBBoxes: Record<Region, [number, number, number, number]> = {
  "East Sikkim": [27.12, 88.45, 27.47, 88.75],
  "West Sikkim": [27.16, 88.05, 27.58, 88.45],
  "North Sikkim": [27.55, 88.10, 28.20, 88.70],
  "South Sikkim": [27.07, 88.25, 27.42, 88.55],
}
