"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/layout/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"
import { getFavorites, removeFavorite } from "@/lib/favorites"
import { getMonasteryById, type Monastery } from "@/lib/monasteries"

export default function FavoritePage() {
  const { user, isAuthenticated, loading } = useAuth()
  const router = useRouter()
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth?returnTo=/profile/favorite")
    }
  }, [loading, isAuthenticated, router])

  useEffect(() => {
    if (user) setIds(getFavorites(user.id))
  }, [user?.id])

  const items: Monastery[] = useMemo(() => ids.map((id) => getMonasteryById(id)).filter(Boolean) as Monastery[], [ids])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
  if (!isAuthenticated || !user) return null

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Favorites</h1>
          <Button variant="outline" onClick={() => router.push("/profile")}>Back to Profile</Button>
        </div>

        {items.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            No favorites yet. Explore monasteries and tap the heart.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((m) => (
              <Card key={m.id} className="overflow-hidden pt-0">
                <div className="relative w-full h-64 md:h-72 lg:h-80">
                  <img src={m.images?.[0] || "/placeholder.svg"} alt={m.name} className="w-full h-full object-cover block" />
                </div>
                <CardContent className="p-4 space-y-2 pt-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{m.name}</h3>
                    <Badge variant="secondary" className="whitespace-nowrap">{m.category}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{m.location}</p>
                  <div className="flex items-center gap-2 pt-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/monastery/${m.id}`}>View</Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (!user) return
                        const list = removeFavorite(user.id, m.id)
                        setIds(list)
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
