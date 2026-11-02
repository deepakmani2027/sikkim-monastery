"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, MapPin, Users, UserCheck, ExternalLink } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Button } from "@/components/ui/button"
const festivalImage = "/festival-celebration.jpg"

interface Event {
  id: number
  title: string
  date: string
  time: string
  monastery: string
  location: string
  description: string
  image: string
  capacity: number
  registered: number
  type: "festival" | "ceremony" | "workshop" | "lecture"
  duration: string
  isUpcoming: boolean
}

const events: Event[] = [
  {
    id: 1,
    title: "Losar - Tibetan New Year",
    date: "2024-02-10",
    time: "6:00 AM",
    monastery: "Rumtek Monastery",
    location: "Main Prayer Hall",
    description: "Experience the most important celebration in Tibetan Buddhism with traditional prayers, masked dances, and community feast.",
    image: festivalImage,
    capacity: 500,
    registered: 387,
    type: "festival",
    duration: "3 days",
    isUpcoming: true
  },
  {
    id: 2,
    title: "Saga Dawa Festival",
    date: "2024-05-22",
    time: "5:30 AM",
    monastery: "Tashiding Monastery",
    location: "Sacred Courtyard",
    description: "Commemorating Buddha's birth, enlightenment, and parinirvana with special prayers and merit-making activities.",
    image: "https://images.unsplash.com/photo-1544531586-fbb6cf2ad6c3?w=600&q=80",
    capacity: 300,
    registered: 156,
    type: "festival",
    duration: "1 day",
    isUpcoming: true
  },
  {
    id: 3,
    title: "Meditation Workshop",
    date: "2024-03-15",
    time: "9:00 AM",
    monastery: "Enchey Monastery",
    location: "Meditation Hall",
    description: "Learn traditional Buddhist meditation techniques from experienced monks. Suitable for beginners and practitioners.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    capacity: 50,
    registered: 42,
    type: "workshop",
    duration: "4 hours",
    isUpcoming: true
  },
  {
    id: 4,
    title: "Thangka Painting Ceremony",
    date: "2024-04-08",
    time: "10:00 AM",
    monastery: "Pemayangtse Monastery",
    location: "Art Studio",
    description: "Witness the creation of sacred thangka paintings and learn about their spiritual significance and artistic techniques.",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80",
    capacity: 75,
    registered: 23,
    type: "ceremony",
    duration: "2 hours",
    isUpcoming: true
  },
  {
    id: 5,
    title: "Buddhist Philosophy Lecture",
    date: "2024-03-25",
    time: "2:00 PM",
    monastery: "Dubdi Monastery",
    location: "Conference Hall",
    description: "Scholarly discussion on Buddhist philosophy and its relevance in modern life, conducted by visiting scholars.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&q=80",
    capacity: 100,
    registered: 67,
    type: "lecture",
    duration: "3 hours",
    isUpcoming: true
  },
  {
    id: 6,
    title: "Bumchu Festival",
    date: "2024-01-15",
    time: "7:00 AM",
    monastery: "Tashiding Monastery", 
    location: "Sacred Courtyard",
    description: "The holy water vase ceremony that took place with traditional rituals and community participation.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    capacity: 400,
    registered: 400,
    type: "festival",
    duration: "1 day",
    isUpcoming: false
  }
]

const typeColors = {
  festival: "bg-primary/10 text-primary",
  ceremony: "bg-secondary/10 text-secondary",
  workshop: "bg-accent/10 text-accent",
  lecture: "bg-purple-100 text-purple-700"
}

const CulturalCalendar = () => {
  const [viewType, setViewType] = useState<"list" | "calendar">("list")
  const [selectedType, setSelectedType] = useState<string>("all")

  const upcomingEvents = events.filter(event => event.isUpcoming)
  const pastEvents = events.filter(event => !event.isUpcoming)

  const filteredUpcomingEvents = selectedType === "all" 
    ? upcomingEvents 
    : upcomingEvents.filter(event => event.type === selectedType)

  const handleRSVP = (eventId: number) => {
    // In a real implementation, this would handle RSVP logic
    console.log(`RSVP for event ${eventId}`)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <section id="cultural-calendar" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Cultural <span className="text-primary">Calendar</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Join us for authentic Buddhist festivals, meditation workshops, and cultural ceremonies. 
            Experience the living traditions of Sikkim's monasteries.
          </p>
        </motion.div>

        {/* Controls */}
        <motion.div 
          className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="flex gap-2">
            <Button
              variant={viewType === "list" ? "default" : "outline"}
              onClick={() => setViewType("list")}
              size="sm"
            >
              List View
            </Button>
            <Button
              variant={viewType === "calendar" ? "default" : "outline"}
              onClick={() => setViewType("calendar")}
              size="sm"
            >
              Calendar View
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedType === "all" ? "default" : "outline"}
              onClick={() => setSelectedType("all")}
              size="sm"
            >
              All Events
            </Button>
            {["festival", "ceremony", "workshop", "lecture"].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                onClick={() => setSelectedType(type)}
                size="sm"
                className="capitalize"
              >
                {type}s
              </Button>
            ))}
          </div>
        </motion.div>

        {viewType === "list" ? (
          <>
            {/* Upcoming Events */}
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-2xl font-bold text-foreground mb-8">
                Upcoming Events
              </h3>

              <div className="space-y-6">
                {filteredUpcomingEvents.map((event, index) => (
                  <motion.article
                    key={event.id}
                    className="card-gradient rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-500 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="lg:flex">
                      {/* Image */}
                      <div className="lg:w-1/3">
                        <div className="relative h-64 lg:h-full">
                          <img
                            src={event.image}
                            alt={`${event.title} celebration at ${event.monastery}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-4 left-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeColors[event.type]}`}>
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8 lg:w-2/3">
                        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                          <h3 className="font-display text-2xl font-bold text-foreground mb-2 lg:mb-0">
                            {event.title}
                          </h3>
                          <div className="text-right">
                            <div className="text-sm text-muted-foreground mb-1">
                              {event.registered}/{event.capacity} registered
                            </div>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary rounded-full transition-all duration-500"
                                style={{ width: `${(event.registered / event.capacity) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Event Details */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>{formatDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            <span>{event.time} ({event.duration})</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span>{event.monastery}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            <span>{event.location}</span>
                          </div>
                        </div>

                        <p className="text-muted-foreground mb-6 leading-relaxed">
                          {event.description}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3">
                          <HeroButton
                            variant="monastery"
                            onClick={() => handleRSVP(event.id)}
                            className="flex-1"
                            disabled={event.registered >= event.capacity}
                          >
                            <UserCheck className="w-4 h-4 mr-2" />
                            {event.registered >= event.capacity ? "Event Full" : "RSVP / Book"}
                          </HeroButton>
                          <HeroButton
                            variant="primary"
                            className="flex-1"
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View Details
                          </HeroButton>
                          <HeroButton
                            variant="hero-outline"
                            className="sm:w-auto"
                          >
                            Share Event
                          </HeroButton>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>

            {/* Past Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <h3 className="font-display text-2xl font-bold text-foreground mb-8">
                Past Events
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map((event, index) => (
                  <motion.article
                    key={event.id}
                    className="card-gradient rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-500 overflow-hidden"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className="relative h-48">
                      <img
                        src={event.image}
                        alt={`${event.title} celebration`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-background/20 backdrop-blur-sm text-white rounded-full text-xs font-medium">
                          Completed
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h4 className="font-display text-lg font-bold text-foreground mb-2">
                        {event.title}
                      </h4>

                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">{formatDate(event.date)}</span>
                      </div>

                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>

                      <HeroButton variant="primary" className="w-full">
                        View Gallery
                      </HeroButton>
                    </div>
                  </motion.article>
                ))}
              </div>
            </motion.div>
          </>
        ) : (
          /* Calendar View */
          <motion.div
            className="card-gradient rounded-2xl p-8 shadow-elevated"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="text-center py-20">
              <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                Calendar View Coming Soon
              </h3>
              <p className="text-muted-foreground mb-6">
                We're working on an interactive calendar view to help you plan your monastery visits.
              </p>
              <HeroButton variant="primary">
                Get Notified When Ready
              </HeroButton>
            </div>
          </motion.div>
        )}

        {/* Newsletter Signup for Events */}
        <motion.div 
          className="mt-16 card-gradient rounded-2xl p-8 text-center shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-2xl font-bold text-foreground mb-4">
            Never Miss a Sacred Celebration
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our cultural calendar to receive notifications about upcoming festivals, 
            workshops, and special ceremonies at Sikkim's monasteries.
          </p>
          <HeroButton
            variant="saffron"
            size="lg"
            className="w-full sm:w-auto whitespace-normal leading-snug text-base sm:text-lg px-4 sm:px-8 py-4 sm:py-5"
          >
            <span className="block sm:inline">Subscribe to Calendar Updates</span>
          </HeroButton>
        </motion.div>
      </div>
    </section>
  )
}

export default CulturalCalendar