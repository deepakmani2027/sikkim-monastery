"use client"

import Link from "next/link"
import { Navbar } from "@/components/layout/navbar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { monasteries } from "@/lib/monasteries"

export default function VirtualToursIndexPage() {
  const tours = monasteries.map((m) => ({
    id: m.id,
    name: m.name,
    location: m.location,
    image: m.images?.[0] || "/placeholder.jpg",
  }))

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Virtual Tours</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Open any monastery to check its live Google Street View coverage and Google Places media. Coverage and photos are shown
            only when Google has them for that location.
          </p>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="overflow-hidden pt-0">
              <div className="relative w-full h-56 sm:h-60 lg:h-64 bg-muted overflow-hidden">
                <img
                  src={tour.image}
                  alt={tour.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    if (e.currentTarget.src.endsWith("/placeholder.jpg")) return
                    e.currentTarget.src = "/placeholder.jpg"
                  }}
                />
              </div>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tour.name}</CardTitle>
                  <Badge variant="default">Google media</Badge>
                </div>
                <CardDescription>{tour.location}</CardDescription>
              </CardHeader>
              <CardFooter className="pt-0">
                <Button asChild size="sm">
                  <Link href={`/monastery/${tour.id}/tour`}>Open virtual tour</Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </section>
      </main>
    </div>
  )
}
