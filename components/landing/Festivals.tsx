import { Calendar, Clock, MapPin } from "lucide-react"
import festivalImage from "@/assets/hero-festival-colors.jpg"

const festivals = [
  {
    name: "Holi - Festival of Colors",
    date: "March 13-14, 2024",
    location: "Mathura, Vrindavan",
    duration: "2 Days",
    description: "Experience the most vibrant celebration as people throw colored powders and dance in joyous celebration of spring's arrival.",
    image: festivalImage,
    highlights: ["Color throwing", "Traditional sweets", "Folk music", "Community bonding"]
  },
  {
    name: "Diwali - Festival of Lights",
    date: "November 12, 2024",
    location: "Throughout India",
    duration: "5 Days",
    description: "Witness millions of oil lamps lighting up the night sky in this spectacular celebration of light conquering darkness.",
    image: "https://images.unsplash.com/photo-1605379399642-870262d3d051?w=800&q=80",
    highlights: ["Oil lamp displays", "Fireworks", "Traditional rangoli", "Family gatherings"]
  },
  {
    name: "Pushkar Camel Fair",
    date: "November 20-28, 2024",
    location: "Pushkar, Rajasthan",
    duration: "8 Days",
    description: "Join the world's largest camel trading fair with traditional competitions, folk performances, and desert festivities.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80",
    highlights: ["Camel trading", "Desert camping", "Folk dances", "Traditional crafts"]
  },
  {
    name: "Kumbh Mela",
    date: "January 15 - February 26, 2025",
    location: "Allahabad (Prayagraj)",
    duration: "44 Days",
    description: "Participate in the world's largest religious gathering where millions of pilgrims come together for spiritual purification.",
    image: "https://images.unsplash.com/photo-1544531586-fbb6cf2ad6c3?w=800&q=80",
    highlights: ["Sacred bathing", "Spiritual discourses", "Cultural programs", "Yoga sessions"]
  }
]

const Festivals = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Festivals & <span className="text-primary">Events</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Immerse yourself in India's colorful festivals and cultural celebrations. 
            Experience the joy, spirituality, and community spirit that defines our heritage.
          </p>
        </div>

        <div className="space-y-8">
          {festivals.map((festival, index) => (
            <article 
              key={festival.name}
              className={`
                group relative overflow-hidden rounded-2xl card-gradient shadow-soft hover:shadow-elevated 
                transition-all duration-500 hover:-translate-y-1
                ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''}
              `}
            >
              <div className="lg:flex lg:items-center">
                {/* Image */}
                <div className="lg:w-1/2">
                  <div className="relative h-64 lg:h-80 overflow-hidden">
                    <img
                      src={festival.image}
                      alt={`${festival.name} celebration showing vibrant cultural activities and community participation`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 lg:w-1/2">
                  <div className="flex flex-wrap gap-4 mb-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm font-medium">{festival.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{festival.duration}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{festival.location}</span>
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-foreground mb-4">
                    {festival.name}
                  </h3>

                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {festival.description}
                  </p>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-foreground">Festival Highlights:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {festival.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-secondary rounded-full" />
                          <span className="text-sm text-muted-foreground">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Festivals