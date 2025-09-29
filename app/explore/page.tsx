"use client"

import { useState, useEffect, useMemo } from "react"
import { useAuth } from "@/hooks/use-auth"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { MonasteryCard } from "@/components/monastery/monastery-card"
import { MonasteryFilters, type FilterState } from "@/components/monastery/monastery-filters"
import { monasteries, searchMonasteries } from "@/lib/monasteries"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Grid, List, Map } from "lucide-react"
import { FestivalCalendarButton } from "@/components/interactive/festival-calendar"
import dynamic from "next/dynamic"
import Link from "next/link"

export default function ExplorePage() {
  const MonasteryMap = useMemo(
    () => dynamic(() => import("@/components/interactive/monastery-map").then(m => m.MonasteryMap), { ssr: false }),
    []
  )
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [filters, setFilters] = useState<FilterState>({
    district: [],
    category: [],
    features: [],
    rating: 0,
  })
  const [viewMode, setViewMode] = useState<"grid" | "list" | "map">("grid")

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, loading, router])

  const filteredMonasteries = useMemo(() => {
    let result = searchQuery ? searchMonasteries(searchQuery) : monasteries

    // Apply district filter
    if (filters.district.length > 0) {
      result = result.filter((monastery) => filters.district.includes(monastery.district))
    }

    // Apply category filter
    if (filters.category.length > 0) {
      result = result.filter((monastery) => filters.category.includes(monastery.category))
    }

    // Apply features filter
    if (filters.features.length > 0) {
      result = result.filter((monastery) => {
        return filters.features.every((feature) => {
          switch (feature) {
            case "Virtual Tour":
              return monastery.virtualTour?.available
            case "Audio Guide":
              return monastery.audioGuide?.available
            case "Photography Allowed":
              return monastery.tags.includes("Photography")
            case "Wheelchair Accessible":
              return monastery.visitingInfo.accessibility.toLowerCase().includes("wheelchair")
            default:
              return true
          }
        })
      })
    }

    // Apply rating filter
    if (filters.rating > 0) {
      result = result.filter((monastery) => monastery.rating >= filters.rating)
    }

    return result
  }, [searchQuery, filters])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Explore Monasteries</h1>
              <p className="text-muted-foreground">
                Discover the sacred heritage of Sikkim through {monasteries.length} monasteries
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button variant={viewMode === "map" ? "default" : "outline"} size="sm" onClick={() => setViewMode("map")}>
                <Map className="h-4 w-4" />
              </Button>
              <FestivalCalendarButton />
            </div>
          </div>

          <MonasteryFilters searchQuery={searchQuery} onSearch={setSearchQuery} onFilterChange={setFilters} />
        </div>

        {/* Results */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {filteredMonasteries.length} of {monasteries.length} monasteries
            </p>
          </div>
        </div>

        {/* Monastery Grid/List */}
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMonasteries.map((monastery) => (
              <MonasteryCard key={monastery.id} monastery={monastery} />
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="space-y-4">
            {filteredMonasteries.map((monastery) => (
              <Card key={monastery.id} className="overflow-hidden pt-0 pb-0">
                <CardContent className="p-0">
                  <div className="flex items-stretch min-h-[10rem] md:min-h-[11rem] lg:min-h-[12rem]">
                    <div className="w-44 md:w-52 lg:w-56 h-40 md:h-44 lg:h-48 flex-shrink-0 overflow-hidden rounded-l-xl">
                      <img
                        src={monastery.images[0] || "/placeholder.svg"}
                        alt={monastery.name}
                        className="block w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      />
                    </div>
                    <div className="flex-1 px-4 py-3 flex flex-col">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="text-xl font-semibold text-card-foreground">{monastery.name}</h3>
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm font-medium">{monastery.rating}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        <div className="flex items-center mb-1">
                          <MapPin className="mr-1 h-4 w-4" />
                          {monastery.location}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="flex items-center">Founded {monastery.founded}</span>
                          <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[12px] font-medium text-primary">
                            {monastery.reviews} reviews
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-1">{monastery.description}</p>
                      <div className="mt-auto flex items-center justify-between pt-1">
                        <div className="flex gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              monastery.virtualTour?.available
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            360° Tour
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded ${
                              monastery.audioGuide?.available
                                ? "bg-secondary/10 text-secondary"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            Audio Guide
                          </span>
                        </div>
                        <Button asChild size="sm">
                          <Link href={`/monastery/${monastery.id}`}>Explore</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {viewMode === "map" && (
          <Card className="h-[600px] py-0">
            <CardContent className="p-0 h-full">
              <MonasteryMap />
            </CardContent>
          </Card>
        )}

        {/* No Results */}
        {filteredMonasteries.length === 0 && (
          <Card className="p-12">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No monasteries found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search criteria or filters to find more results.
              </p>
            </div>
          </Card>
        )}
      </main>
    </div>
  )
}
