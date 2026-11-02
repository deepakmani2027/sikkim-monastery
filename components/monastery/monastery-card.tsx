"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, Camera, Headphones, Clock, Users } from "lucide-react"
import type { Monastery } from "@/lib/monasteries"
import Link from "next/link"

interface MonasteryCardProps {
  monastery: Monastery
}

export function MonasteryCard({ monastery }: MonasteryCardProps) {
  return (
    <Card className="overflow-hidden transition-all duration-300 group pt-0 rounded-xl h-full flex flex-col">
      <div className="relative overflow-hidden aspect-[4/3] rounded-t-xl">
        <img
          src={monastery.images[0] || "/placeholder.svg"}
          alt={monastery.name}
          className="block w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/0 via-black/0 to-black/0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1">
          <Badge variant="secondary" className="bg-background/90 text-foreground">
            {monastery.category}
          </Badge>
        </div>
        <div className="absolute top-3 right-3 flex gap-1">
          {monastery.virtualTour?.available && (
            <Badge variant="secondary" className="bg-primary/90 text-primary-foreground">
              <Camera className="mr-1 h-3 w-3" />
              360°
            </Badge>
          )}
          {monastery.audioGuide?.available && (
            <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground">
              <Headphones className="h-3 w-3" />
            </Badge>
          )}
        </div>
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-background/90 rounded-full px-2 py-1">
          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-medium">{monastery.rating}</span>
          <span className="text-xs text-muted-foreground">({monastery.reviews})</span>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <h3 className="font-semibold text-lg text-card-foreground leading-tight">{monastery.name}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-1 h-3 w-3" />
            {monastery.location}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 flex flex-col flex-1">
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{monastery.description}</p>

        <div className="text-xs text-muted-foreground mb-4 space-y-1">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Founded {monastery.founded}
          </div>
          <div className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            <Users className="h-3 w-3" />
            {monastery.reviews} reviews
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {monastery.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
          {monastery.tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{monastery.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="mt-auto flex gap-2">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/monastery/${monastery.id}`}>Explore</Link>
          </Button>
          {monastery.virtualTour?.available && (
            <Button asChild size="sm" variant="outline">
              <Link href={`/monastery/${monastery.id}/tour`}>
                <Camera className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
