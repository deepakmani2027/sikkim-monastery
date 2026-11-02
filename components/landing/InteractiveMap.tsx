"use client"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MapPin, Navigation, Info, Clock, Phone } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { toSlugId } from "@/lib/utils/slug"
import { getMonasteryIdByName, getMonasteryById } from "@/lib/monasteries"
import dynamic from "next/dynamic"

const LeafletMonasteryMap = dynamic(() => import("@/components/landing/LeafletMonasteryMap"), { ssr: false })

interface Monastery {
  id: number
  name: string
  lat: number
  lng: number
  century: string
  region: string
  description: string
  image: string
  festivals: string[]
  visitingHours: string
  contact: string
  nearbyAttractions: string[]
}

const monasteries: Monastery[] = [
  {
    id: 1,
    name: "Rumtek Monastery",
    lat: 27.3389,
    lng: 88.5583,
    century: "17th Century",
    region: "East Sikkim",
    description: "The Golden Dharmachakra Centre, seat of the Karmapa and one of the most significant monasteries in Sikkim. Home to precious Buddhist artifacts and sacred relics.",
    image: "/monastery-interior-1.jpg",
    festivals: ["Losar (Tibetan New Year)", "Saga Dawa", "Drupka Kunley Festival"],
    visitingHours: "6:00 AM - 6:00 PM",
    contact: "+91 3592 252345",
    nearbyAttractions: ["Gangtok City", "Tsomgo Lake", "Baba Harbhajan Singh Mandir", "Nathula Pass"]
  },
  {
    id: 2,
    name: "Tashiding Monastery",
    lat: 27.3167,
    lng: 88.2833,
    century: "17th Century", 
    region: "West Sikkim",
    description: "The holy monastery of central glory, believed to cleanse sins of devotees who visit with pure heart. Located at the confluence of two sacred rivers.",
    image: "/monastery-exterior-mountain.jpg",
    festivals: ["Bumchu Festival", "Losar", "Dashain", "Holy Water Festival"],
    visitingHours: "5:00 AM - 7:00 PM",
    contact: "+91 3595 242123",
    nearbyAttractions: ["Yuksom Historic Town", "Khecheopalri Wish Fulfilling Lake", "Pelling Skywalk", "Rabdentse Ruins"]
  },
  {
    id: 3,
    name: "Pemayangtse Monastery",
    lat: 27.3167,
    lng: 88.2167,
    century: "17th Century",
    region: "West Sikkim", 
    description: "The perfect sublime lotus monastery, representing the pure spiritual tradition of Nyingma sect. Features the famous seven-tiered wooden sculpture.",
    image: "/virtual-tour-interior.jpg",
    festivals: ["Chaam Dance Festival", "Losar", "Pang Lhabsol", "Guru Rinpoche Festival"],
    visitingHours: "6:00 AM - 5:00 PM",
    contact: "+91 3595 250789",
    nearbyAttractions: ["Rabdentse Palace Ruins", "Khecheopalri Lake", "Sangachoeling Monastery", "Pelling Glass Skywalk"]
  },
  {
    id: 4,
    name: "Enchey Monastery",
    lat: 27.3333,
    lng: 88.6167,
    century: "19th Century",
    region: "East Sikkim",
    description: "The solitary monastery above Gangtok, built in 1909 and offering panoramic views of the capital. Known for its spectacular Chaam dance performances.",
    image: "https://media.istockphoto.com/id/1158619900/photo/colorful-passage-at-rumtek-monastery-sikkim-india.jpg?s=612x612&w=0&k=20&c=aXlgzz6A0v4GtWM0Ymw1tTaiPl47TFqApoCiVerZIWs=",
    festivals: ["Chaam Dance Festival", "Losar", "Buddha Jayanti", "Drupka Teshi"],
    visitingHours: "5:30 AM - 6:30 PM",
    contact: "+91 3592 252890",
    nearbyAttractions: ["Gangtok City Center", "Do Drul Chorten Stupa", "Institute of Tibetology", "Ganesh Tok Viewpoint"]
  },
  {
    id: 5,
    name: "Dubdi Monastery",
    lat: 27.3500,
    lng: 88.2333,
    century: "17th Century",
    region: "West Sikkim",
    description: "The first monastery built in Sikkim in 1701, also known as Hermit's Cell. Holds special significance as the birthplace of Buddhism in Sikkim.",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/f3/0e/56/caption.jpg?w=1400&h=800&s=1",
    festivals: ["Bumchu Festival", "Losar", "Guru Rinpoche Birthday", "Sacred Dance Festival"],
    visitingHours: "6:00 AM - 6:00 PM",
    contact: "+91 3595 241567",
    nearbyAttractions: ["Yuksom Village", "Coronation Throne of Norbugang", "Kathog Lake", "Tashiding Monastery"]
  },
  {
    id: 6,
    name: "Sangachoeling Monastery",
    lat: 27.3083,
    lng: 88.2167,
    century: "17th Century",
    region: "West Sikkim",
    description: "The second oldest monastery in Sikkim, perched at 2,100 meters offering breathtaking views of Kanchenjunga. Known for its ancient Buddhist sculptures.",
    image: "https://cdn.tripuntold.com/media/photos/location/2018/12/01/a12d8939-8232-4357-8e28-8907ab23e0e2.jpg",
    festivals: ["Losar", "Saga Dawa", "Drukpa Kunley", "Mahakala Festival"],
    visitingHours: "6:00 AM - 5:30 PM",
    contact: "+91 3595 250654",
    nearbyAttractions: ["Pelling Town", "Kanchenjunga Falls", "Pemayangtse Monastery", "Rabdentse Ruins"]
  },
  {
    id: 7,
    name: "Ralang Monastery",
    lat: 27.2667,
    lng: 88.5167,
    century: "18th Century",
    region: "South Sikkim",
    description: "A Kagyu monastery founded in 1768, known for its annual Pang Lhabsol festival and traditional architecture. Houses important Buddhist scriptures.",
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&q=80",
    festivals: ["Pang Lhabsol", "Losar", "Kagyu Monlam", "Mahakala Dance"],
    visitingHours: "6:00 AM - 6:00 PM",
    contact: "+91 3595 264789",
    nearbyAttractions: ["Ravangla Buddha Park", "Temi Tea Garden", "Maenam Wildlife Sanctuary", "Borong Hot Springs"]
  },
  {
    id: 8,
    name: "Phensang Monastery",
    lat: 27.6167,
    lng: 88.3833,
    century: "18th Century",
    region: "North Sikkim",
    description: "Located in the remote north, this monastery serves the local Buddhist community and maintains traditional practices in one of Sikkim's most pristine regions.",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&q=80",
    festivals: ["Losar", "Yak Churning Festival", "Harvest Festival", "Local Deity Celebrations"],
    visitingHours: "7:00 AM - 5:00 PM",
    contact: "+91 3592 234567",
    nearbyAttractions: ["Lachen Village", "Gurudongmar Lake", "Yumthang Valley", "Zero Point"]
  }
]

const InteractiveMap = () => {
  const [selectedMonastery, setSelectedMonastery] = useState<Monastery | null>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const router = useRouter()
  const { isAuthenticated, loading } = useAuth()

  const visibleMonasteries = useMemo(
    () => monasteries.filter(m => m.name !== "Ralang Monastery" && m.name !== "Phensang Monastery"),
    []
  )

  const mapCenter = useMemo(() => {
    const source = visibleMonasteries.length ? visibleMonasteries : monasteries
    const lat = source.reduce((sum, m) => sum + m.lat, 0) / source.length
    const lng = source.reduce((sum, m) => sum + m.lng, 0) / source.length
    return [lat, lng] as [number, number]
  }, [visibleMonasteries])

  const handleMarkerClick = (monastery: Monastery) => {
    setSelectedMonastery(monastery)
  }

  return (
    <section id="interactive-map" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Interactive <span className="text-primary">Map</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Discover the locations of Sikkim's sacred monasteries. 
            Click on markers to explore monastery details, travel routes, and nearby attractions.
          </p>
        </motion.div>

        {/* Filter bar removed */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Container */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="card-gradient rounded-2xl shadow-elevated overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground">
                  Monasteries of Sikkim
                </h3>
                <p className="text-sm text-muted-foreground">
                  Click on markers to view monastery details
                </p>
              </div>
              
              {/* Leaflet Map (client-only) */}
              <div className="w-full h-[480px] relative">
                {mounted ? (
                  <LeafletMonasteryMap monasteries={visibleMonasteries} center={mapCenter} onSelect={handleMarkerClick} />
                ) : null}
                <div className="absolute top-4 left-4 bg-background/90 backdrop-blur-sm rounded-lg p-3">
                  <div className="text-xs text-foreground font-medium mb-2">Legend</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                    <span>Monastery</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Monastery Details */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
          >
            {selectedMonastery ? (
              <div className="card-gradient rounded-2xl shadow-elevated overflow-hidden">
                <img
                  src={selectedMonastery.image}
                  alt={`${selectedMonastery.name} exterior view showing traditional Buddhist architecture`}
                  className="w-full h-48 object-cover"
                />
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-display text-xl font-bold text-foreground">
                      {selectedMonastery.name}
                    </h3>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                      {selectedMonastery.century}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground mb-4">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{selectedMonastery.region}</span>
                  </div>

                  <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                    {selectedMonastery.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-4 mb-6">
                    <div className="flex items-start gap-3">
                      <Clock className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Visiting Hours</div>
                        <div className="text-xs text-muted-foreground">{selectedMonastery.visitingHours}</div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Phone className="w-4 h-4 text-accent mt-0.5" />
                      <div>
                        <div className="text-sm font-medium text-foreground">Contact</div>
                        <div className="text-xs text-muted-foreground">{selectedMonastery.contact}</div>
                      </div>
                    </div>
                  </div>

                  {/* Festivals */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Festivals</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedMonastery.festivals.map((festival, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-secondary/10 text-secondary text-xs rounded-md"
                        >
                          {festival}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Nearby Attractions */}
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-foreground mb-3">Nearby Attractions</h4>
                    <div className="space-y-1">
                      {selectedMonastery.nearbyAttractions.map((attraction, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                          <span className="text-xs text-muted-foreground">{attraction}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <HeroButton
                      variant="monastery"
                      size="default"
                      className="flex-1 text-sm"
                      onClick={() => {
                        if (!selectedMonastery) return
                        const byId = getMonasteryIdByName(selectedMonastery.name)
                        if (!byId) {
                          router.push("/404")
                          return
                        }
                        const href = `/monter/${byId}/direction`
                        if (loading) return
                        if (isAuthenticated) router.push(href)
                        else router.push(`/auth?returnTo=${encodeURIComponent(href)}`)
                      }}
                    >
                      <Navigation className="w-4 h-4 mr-1" />
                      Get Directions
                    </HeroButton>
                    {(() => {
                      if (!selectedMonastery) return null
                      const byId = getMonasteryIdByName(selectedMonastery.name)
                      if (!byId) return null
                      const hasVirtual = !!getMonasteryById(byId)?.virtualTour?.available
                      if (!hasVirtual) return null
                      return (
                        <HeroButton
                          variant="primary"
                          size="default"
                          className="flex-1 text-sm"
                          onClick={() => {
                            if (!selectedMonastery) return
                            const href = `/monastery/${byId}/tour`
                            if (loading) return
                            if (isAuthenticated) router.push(href)
                            else router.push(`/auth?returnTo=${encodeURIComponent(href)}`)
                          }}
                        >
                          Virtual Tour
                        </HeroButton>
                      )
                    })()}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card-gradient rounded-2xl shadow-elevated p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Info className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  Select a Monastery
                </h3>
                <p className="text-muted-foreground text-sm">
                  Click on any monastery marker on the map to view detailed information, 
                  visiting hours, and nearby attractions.
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Quick Stats */}
        <motion.div 
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            { label: "Total Monasteries", value: "200+", color: "text-primary" },
            { label: "Centuries Covered", value: "3", color: "text-secondary" },
            { label: "Regions", value: "4", color: "text-accent" },
            { label: "Virtual Tours", value: "50+", color: "text-primary" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className={`text-2xl font-bold font-display ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default InteractiveMap