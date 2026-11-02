"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, X, MapPin, Camera, Headphones } from "lucide-react"
import { useState } from "react"

interface MonasteryFiltersProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterState) => void
  searchQuery: string
}

export interface FilterState {
  district: string[]
  category: string[]
  features: string[]
  rating: number
}

export function MonasteryFilters({ onSearch, onFilterChange, searchQuery }: MonasteryFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    district: [],
    category: [],
    features: [],
    rating: 0,
  })
  const [showFilters, setShowFilters] = useState(false)

  const districts = ["East Sikkim", "West Sikkim", "North Sikkim", "South Sikkim"]
  const categories = ["Major Monastery", "Historic Monastery", "Sacred Site", "Meditation Center"]
  const features = ["Virtual Tour", "Audio Guide", "Photography Allowed", "Wheelchair Accessible"]

  const toggleFilter = (type: keyof FilterState, value: string) => {
    const newFilters = { ...filters }
    if (type === "rating") {
      newFilters[type] = Number.parseFloat(value)
    } else {
      const currentArray = newFilters[type] as string[]
      if (currentArray.includes(value)) {
        newFilters[type] = currentArray.filter((item) => item !== value)
      } else {
        newFilters[type] = [...currentArray, value]
      }
    }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const emptyFilters: FilterState = {
      district: [],
      category: [],
      features: [],
      rating: 0,
    }
    setFilters(emptyFilters)
    onFilterChange(emptyFilters)
  }

  const hasActiveFilters =
    filters.district.length > 0 || filters.category.length > 0 || filters.features.length > 0 || filters.rating > 0

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search monasteries, locations, or features..."
          value={searchQuery}
          onChange={(e) => onSearch(e.target.value)}
            className="h-11 sm:h-12 pl-10 sm:pl-12 pr-12 rounded-xl border border-foreground/15 shadow-sm"
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
            className="absolute right-1 top-1/2 -translate-y-1/2"
        >
            <Filter className="h-5 w-5" />
        </Button>
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {filters.district.map((district) => (
            <Badge key={district} variant="secondary" className="cursor-pointer">
              <MapPin className="mr-1 h-3 w-3" />
              {district}
              <X className="ml-1 h-3 w-3" onClick={() => toggleFilter("district", district)} />
            </Badge>
          ))}
          {filters.category.map((category) => (
            <Badge key={category} variant="secondary" className="cursor-pointer">
              {category}
              <X className="ml-1 h-3 w-3" onClick={() => toggleFilter("category", category)} />
            </Badge>
          ))}
          {filters.features.map((feature) => (
            <Badge key={feature} variant="secondary" className="cursor-pointer">
              {feature === "Virtual Tour" && <Camera className="mr-1 h-3 w-3" />}
              {feature === "Audio Guide" && <Headphones className="mr-1 h-3 w-3" />}
              {feature}
              <X className="ml-1 h-3 w-3" onClick={() => toggleFilter("features", feature)} />
            </Badge>
          ))}
          {filters.rating > 0 && (
            <Badge variant="secondary" className="cursor-pointer">
              Rating {filters.rating}+
              <X className="ml-1 h-3 w-3" onClick={() => toggleFilter("rating", "0")} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* District Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">District</Label>
              <div className="flex flex-wrap gap-2">
                {districts.map((district) => (
                  <Badge
                    key={district}
                    variant={filters.district.includes(district) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("district", district)}
                  >
                    <MapPin className="mr-1 h-3 w-3" />
                    {district}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Category</Label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Badge
                    key={category}
                    variant={filters.category.includes(category) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("category", category)}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Features Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Features</Label>
              <div className="flex flex-wrap gap-2">
                {features.map((feature) => (
                  <Badge
                    key={feature}
                    variant={filters.features.includes(feature) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("features", feature)}
                  >
                    {feature === "Virtual Tour" && <Camera className="mr-1 h-3 w-3" />}
                    {feature === "Audio Guide" && <Headphones className="mr-1 h-3 w-3" />}
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div>
              <Label className="text-sm font-medium mb-3 block">Minimum Rating</Label>
              <div className="flex gap-2">
                {[4.0, 4.5, 4.7].map((rating) => (
                  <Badge
                    key={rating}
                    variant={filters.rating === rating ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleFilter("rating", rating.toString())}
                  >
                    {rating}+ ⭐
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
