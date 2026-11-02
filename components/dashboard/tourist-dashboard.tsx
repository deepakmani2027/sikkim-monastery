"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Camera, Star, Car } from "lucide-react"
import { FestivalCalendarButton } from "@/components/interactive/festival-calendar"
import { monasteries } from "@/lib/monasteries"
import Link from "next/link"

export function TouristDashboard() {
  const featuredIds = [
    "rumtek",
    "pemayangtse",
    "tashiding",
    "enchey",
    "dubdi",
    "sangachoeling",
  ] as const

  const featuredMonasteries = featuredIds
    .map((id, idx) => {
      const m = monasteries.find((x) => x.id === id)
      if (!m) return null
      return {
        id: idx + 1,
        slug: m.id,
        name: m.name,
        location: m.location,
        description: m.description,
        image: m.images?.[0] || "/placeholder.svg",
        rating: m.rating,
        hasVirtualTour: !!m.virtualTour?.available,
        hasAudioGuide: !!m.audioGuide?.available,
      }
    })
    .filter(Boolean) as Array<{
      id: number
      slug: string
      name: string
      location: string
      description: string
      image: string
      rating: number
      hasVirtualTour: boolean
      hasAudioGuide: boolean
    }>

  const upcomingEvents = [
    {
      name: "Bhumchu (Bumchu) Festival",
      date: "13–14 March 2025",
      monastery: "Tashiding Monastery",
    },
    {
      name: "Pemayangtse Festival / Cham Dance Festival",
      date: "February 2025",
      monastery: "Pemayangtse Monastery",
    },
    {
      name: "Pang Lhabsol",
      date: "7 September 2025",
      monastery: "Tashiding & other monasteries",
    },
    {
      name: "Rainy Season Summer Retreat (Yarney / Yar Ngama)",
      date: "10 July – 7 October 2025",
      monastery: "Rumtek Monastery",
    },
  ]

  // KPI values (dynamic)
  const totalMonasteries = monasteries.length
  const totalVirtualTours = monasteries.filter((m) => m.virtualTour?.available).length
  const totalAudioGuides = monasteries.filter((m) => m.audioGuide?.available).length
  const totalUpcomingEvents = upcomingEvents.length

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg p-6 monastery-pattern">
        <h2 className="text-2xl font-bold text-foreground mb-2">Explore Sacred Monasteries</h2>
        <p className="text-muted-foreground mb-4">
          Discover the spiritual heritage of Sikkim through immersive virtual tours and cultural insights.
        </p>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/explore">
              <MapPin className="mr-2 h-4 w-4" />
              Explore Monasteries
            </Link>
          </Button>
          <Button asChild variant="secondary">
            <Link href="/planner">
              <MapPin className="mr-2 h-4 w-4" />
              Travel Planner
            </Link>
          </Button>
          <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white shadow">
            <Link href="/service">
              <Car className="mr-2 h-4 w-4" />
              Services
            </Link>
          </Button>
          <FestivalCalendarButton />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="group relative overflow-hidden transition-all duration-300 border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-amber-100/70 dark:bg-amber-900/10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-primary transition-transform duration-300 group-hover:scale-110">{totalMonasteries}</div>
            <div className="text-sm text-muted-foreground">Monasteries</div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden transition-all duration-300 border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-amber-100/70 dark:bg-amber-900/10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-secondary/10 blur-2xl" />
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-secondary transition-transform duration-300 group-hover:scale-110">{totalVirtualTours}</div>
            <div className="text-sm text-muted-foreground">Virtual Tours</div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden transition-all duration-300 border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-amber-100/70 dark:bg-amber-900/10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-accent/10 blur-2xl" />
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-accent transition-transform duration-300 group-hover:scale-110">{totalAudioGuides}</div>
            <div className="text-sm text-muted-foreground">Audio Guides</div>
          </CardContent>
        </Card>
        <Card className="group relative overflow-hidden transition-all duration-300 border-border/60 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 bg-amber-100/70 dark:bg-amber-900/10">
          <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-extrabold text-primary transition-transform duration-300 group-hover:scale-110">{totalUpcomingEvents}</div>
            <div className="text-sm text-muted-foreground">Upcoming Events</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Monasteries */}
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-4">Featured Monasteries</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredMonasteries.map((monastery) => (
            <Card key={monastery.id} className="overflow-hidden pt-0">
              <div className="relative w-full h-60 md:h-72 lg:h-80 overflow-hidden">
                <img
                  src={monastery.image || "/placeholder.svg"}
                  alt={monastery.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {monastery.hasVirtualTour && (
                    <Badge variant="secondary" className="text-xs">
                      <Camera className="mr-1 h-3 w-3" />
                      360° Tour
                    </Badge>
                  )}
                </div>
              </div>
              <CardHeader className="pb-2 pt-4">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{monastery.name}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">{monastery.rating}</span>
                  </div>
                </div>
                <CardDescription className="flex items-center text-sm">
                  <MapPin className="mr-1 h-3 w-3" />
                  {monastery.location}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-4">{monastery.description}</p>
                <div>
                  <Button asChild size="sm" className="w-full">
                    <Link href={`/monastery/${monastery.slug}`}>Explore</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming Festivals & Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {upcomingEvents.map((event, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <div>
                  <div className="font-medium text-foreground">{event.name}</div>
                  <div className="text-sm text-muted-foreground">{event.monastery}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-primary">{event.date}</div>
                  <Button size="sm" variant="ghost" className="text-xs">
                    Set Reminder
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
