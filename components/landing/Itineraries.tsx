import { Clock, MapPin, Users, Star } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"

const itineraries = [
  {
    title: "Classic Golden Triangle",
    duration: "7 Days",
    groupSize: "2-12 people",
    rating: 4.9,
    price: "From $899",
    description: "Perfect introduction to India covering Delhi, Agra, and Jaipur with comfortable accommodations and expert guides.",
    highlights: [
      "Taj Mahal sunrise visit",
      "Red Fort & India Gate in Delhi", 
      "Amber Palace elephant ride",
      "Traditional Rajasthani dinner",
      "Shopping in local bazaars"
    ],
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80",
    bestFor: "First-time visitors",
    includes: ["Accommodation", "Transport", "Guide", "Some meals"]
  },
  {
    title: "Kerala Backwater Odyssey", 
    duration: "10 Days",
    groupSize: "2-8 people",
    rating: 4.8,
    price: "From $1,299",
    description: "Immersive journey through God's Own Country with houseboat stays, spice plantations, and Ayurvedic treatments.",
    highlights: [
      "2-night houseboat cruise",
      "Spice plantation tour",
      "Authentic Ayurvedic massage",
      "Kathakali dance performance",
      "Traditional cooking class"
    ],
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
    bestFor: "Nature & wellness lovers",
    includes: ["Houseboat", "Treatments", "All meals", "Activities"]
  },
  {
    title: "Rajasthan Desert Adventure",
    duration: "14 Days", 
    groupSize: "4-10 people",
    rating: 4.7,
    price: "From $1,799",
    description: "Epic journey through the land of kings with palace stays, camel safaris, and desert camping under the stars.",
    highlights: [
      "Luxury palace hotels",
      "Camel safari in Thar Desert",
      "Desert camping experience",
      "Rajasthani folk performances",
      "Heritage city tours"
    ],
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=800&q=80",
    bestFor: "Adventure seekers",
    includes: ["Palace stays", "Safaris", "Camping", "Cultural shows"]
  }
]

const Itineraries = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Sample <span className="text-primary">Itineraries</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Carefully crafted journeys that showcase the best of India. 
            Each itinerary can be customized to match your interests and travel style.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {itineraries.map((itinerary, index) => (
            <article 
              key={itinerary.title}
              className="group relative overflow-hidden rounded-2xl card-gradient shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={itinerary.image}
                  alt={`${itinerary.title} - scenic view representing the itinerary destinations and experiences`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Best For Badge */}
                <div className="absolute top-4 left-4 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  {itinerary.bestFor}
                </div>
                
                {/* Price Badge */}
                <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  {itinerary.price}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors duration-300">
                    {itinerary.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-secondary fill-secondary" />
                    <span className="text-sm font-medium">{itinerary.rating}</span>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{itinerary.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{itinerary.groupSize}</span>
                  </div>
                </div>

                <p className="text-muted-foreground mb-4">
                  {itinerary.description}
                </p>

                {/* Highlights */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-3">Trip Highlights:</h4>
                  <div className="space-y-2">
                    {itinerary.highlights.slice(0, 3).map((highlight, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{highlight}</span>
                      </div>
                    ))}
                    {itinerary.highlights.length > 3 && (
                      <span className="text-xs text-muted-foreground italic">
                        +{itinerary.highlights.length - 3} more experiences
                      </span>
                    )}
                  </div>
                </div>

                {/* Includes */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-2">Includes:</h4>
                  <div className="flex flex-wrap gap-2">
                    {itinerary.includes.map((item, idx) => (
                      <span 
                        key={idx}
                        className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <HeroButton variant="primary" className="w-full">
                  View Details & Book
                </HeroButton>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <HeroButton variant="hero-outline" size="lg">
            Customize Your Own Itinerary
          </HeroButton>
        </div>
      </div>
    </section>
  )
}

export default Itineraries