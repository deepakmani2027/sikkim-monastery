import { useState } from "react"
import { MapPin, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface DestinationCardProps {
  title: string
  location: string
  description: string
  image: string
  rating: number
  highlights: string[]
  alt: string
  className?: string
}

const DestinationCard = ({ 
  title, 
  location, 
  description, 
  image, 
  rating, 
  highlights,
  alt,
  className 
}: DestinationCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <article className={cn(
      "group relative overflow-hidden rounded-2xl card-gradient shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2",
      className
    )}>
      {/* Image Container */}
      <div className="relative h-64 overflow-hidden">
        {!imageError ? (
          <img
            src={image}
            alt={alt}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0"
            )}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
            <span>Image unavailable</span>
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
          <Star className="w-4 h-4 text-secondary fill-secondary" />
          <span className="text-sm font-medium">{rating}</span>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-primary transition-colors duration-300">
            {title}
          </h3>
        </div>
        
        <div className="flex items-center gap-1 text-muted-foreground mb-3">
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{location}</span>
        </div>
        
        <p className="text-muted-foreground mb-4 line-clamp-3">
          {description}
        </p>
        
        {/* Highlights */}
        <div className="flex flex-wrap gap-2">
          {highlights.slice(0, 3).map((highlight, index) => (
            <span 
              key={index}
              className="px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
            >
              {highlight}
            </span>
          ))}
        </div>
      </div>
    </article>
  )
}

export default DestinationCard