"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { Navbar } from "@/components/layout/navbar"
import { VirtualTour } from "@/components/interactive/virtual-tour"
import { GoogleStreetViewDynamic } from "@/components/interactive/google-street-view-dynamic"
import { GooglePhotosGrid } from "@/components/interactive/google-photos-grid"
import { getMonasteryById } from "@/lib/monasteries"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function VirtualTourPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()
  const [monastery, setMonastery] = useState(getMonasteryById(params.id as string))

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading virtual tour...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !monastery) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to {monastery.name}
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{monastery.name} Virtual Tour</h1>
          <p className="text-muted-foreground">
            Explore verified Google Street View imagery and media for this monastery. Availability depends on Google coverage at the exact location.
          </p>
        </div>

        {/* Google 360 Street View for every monastery with available coverage */}
        <div className="relative mb-6">
          <GoogleStreetViewDynamic lat={monastery.coordinates.lat} lng={monastery.coordinates.lng} placeName={monastery.name} />
        </div>

        <section className="rounded-2xl border bg-card p-5 mb-6">
          <h2 className="text-xl font-semibold mb-3">Google media</h2>
          <GooglePhotosGrid name={monastery.name} lat={monastery.coordinates.lat} lng={monastery.coordinates.lng} />
        </section>

        {/* Site-curated panoramas, when verified scenes exist for this monastery */}
        {monastery.virtualTour?.scenes?.length ? (
          <VirtualTour monasteryId={monastery.id} scenes={monastery.virtualTour.scenes} />
        ) : null}
      </main>
    </div>
  )
}
