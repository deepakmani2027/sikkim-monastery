import { Camera, Mountain, Utensils, Building } from "lucide-react"

const experiences = [
  {
    icon: Building,
    title: "Heritage & Culture",
    description: "Explore ancient temples, magnificent palaces, and UNESCO World Heritage sites that tell the story of India's glorious past.",
    features: ["Temple complexes", "Palace tours", "Archaeological sites", "Cultural workshops"],
    color: "text-primary",
    bgColor: "bg-primary/10"
  },
  {
    icon: Camera,
    title: "Wildlife Safari",
    description: "Encounter majestic tigers, elephants, and exotic birds in their natural habitat across India's renowned national parks.",
    features: ["Tiger reserves", "Elephant sanctuaries", "Bird watching", "Nature photography"],
    color: "text-green-600",
    bgColor: "bg-green-100"
  },
  {
    icon: Utensils,
    title: "Culinary Journey",
    description: "Savor authentic flavors, learn traditional cooking techniques, and discover the diverse culinary heritage of different regions.",
    features: ["Cooking classes", "Street food tours", "Spice markets", "Regional specialties"],
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  {
    icon: Mountain,
    title: "Adventure & Trekking",
    description: "Challenge yourself with thrilling adventures from Himalayan treks to desert expeditions and coastal water sports.",
    features: ["Mountain trekking", "Desert safari", "River rafting", "Rock climbing"],
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  }
]

const ExperienceTypes = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Experience <span className="text-primary">Types</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Choose your adventure from our curated collection of experiences. 
            Each journey is designed to connect you with India's authentic spirit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {experiences.map((experience, index) => {
            const Icon = experience.icon
            return (
              <article 
                key={experience.title}
                className="group relative p-8 rounded-2xl card-gradient shadow-soft hover:shadow-elevated transition-all duration-500 hover:-translate-y-2 text-center animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl ${experience.bgColor} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${experience.color}`} />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {experience.title}
                </h3>

                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {experience.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {experience.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-2">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Hover effect border */}
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-primary/20 transition-colors duration-300 pointer-events-none" />
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}

export default ExperienceTypes