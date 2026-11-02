"use client"

import { Navbar } from "@/components/layout/navbar"
import { RegionPlannerMap } from "@/components/interactive/region-planner-map"

export default function PlannerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 lg:py-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Travel Planner</h1>
          <p className="text-muted-foreground text-sm">Geo-tagged map with monasteries, treks, and nearby stays/food/transport.</p>
        </div>
        <RegionPlannerMap />
      </main>
    </div>
  )
}
