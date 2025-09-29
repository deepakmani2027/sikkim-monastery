"use client"

import { useState, useEffect, useMemo } from "react"
import { useParams, useRouter, usePathname, notFound } from "next/navigation"
import { useAuth } from "@/hooks/use-auth"
import { getFavorites, isFavorite as isFav, toggleFavorite } from "@/lib/favorites"
import { Navbar } from "@/components/layout/navbar"
import { AudioGuide } from "@/components/interactive/audio-guide"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GooglePhotosGrid } from "@/components/interactive/google-photos-grid"
import { getMonasteryById } from "@/lib/monasteries"
import {
  MapPin,
  Clock,
  Star,
  Camera,
  Headphones,
  Calendar,
  Info,
  ArrowLeft,
  Share2,
  Heart,
  Download,
  Plus,
  ChevronLeft,
  ChevronRight,
  X,
  BookOpen,
} from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { toast } from "sonner"
import Link from "next/link"

export default function MonasteryDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { isAuthenticated, loading, user } = useAuth()
  const pathname = usePathname()
  const [monastery, setMonastery] = useState(getMonasteryById(params.id as string))
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("overview")
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [googleImages, setGoogleImages] = useState<string[]>([])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  // Track recently visited monasteries for recommendations
  useEffect(() => {
    const id = params.id as string
    if (!id) return
    try {
      const key = "recent-monasteries"
      const raw = localStorage.getItem(key)
      const list: string[] = raw ? JSON.parse(raw) : []
      const next = [id, ...list.filter((x) => x !== id)].slice(0, 10)
      localStorage.setItem(key, JSON.stringify(next))
    } catch {}
  }, [params.id])

  // Initialize favorite state for logged-in user
  useEffect(() => {
    try {
      const id = params.id as string
      if (!id || !user) return
      setIsFavorite(isFav(user.id, id))
    } catch {}
  }, [user?.id, params.id])

  useEffect(() => {
    let active = true
    async function loadGooglePhotos() {
      try {
        if (!monastery || !apiKey) return
        const { name, coordinates } = monastery
        const findRes = await fetch(
          `/api/services/places?find=${encodeURIComponent(name)}&type=point_of_interest&near=${coordinates.lat},${coordinates.lng}&radius=1500`,
        )
        const found = await findRes.json()
        const cand = found.results?.[0]
        if (!cand?.id) return
        const detRes = await fetch(`/api/services/places?placeId=${cand.id}`)
        const det = await detRes.json()
        const photos: Array<{ ref: string; width: number }> = det?.result?.photos || []
        if (!active) return
        const toUrl = (ref: string, w: number) =>
          `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${Math.min(1600, Math.max(800, w || 1200))}&photo_reference=${encodeURIComponent(
            ref,
          )}&key=${encodeURIComponent(apiKey)}`
        const urls = photos.map((p) => toUrl(p.ref, p.width))
        setGoogleImages(urls)
      } catch {
        if (active) setGoogleImages([])
      }
    }
    loadGooglePhotos()
    return () => {
      active = false
    }
  }, [monastery?.id, apiKey])

  const allImages = useMemo(() => {
    const base = monastery?.images ?? []
    return [...base, ...googleImages]
  }, [monastery?.images, googleImages])

  async function handleShare() {
    try {
      const url = typeof window !== "undefined" ? window.location.href : ""
      const title = monastery?.name || "Monastery"
      const text = monastery ? `${monastery.name} — ${monastery.location}` : ""
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title, text, url })
        return
      }
      if (typeof navigator !== "undefined" && navigator.clipboard && url) {
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
        return
      }
      // Last resort: prompt for manual copy
      if (url) {
        window.prompt("Copy this link", url)
      }
    } catch (err: any) {
      // Ignore AbortError (user cancelled). Show fallback copy else.
      try {
        const url = window.location.href
        await navigator.clipboard.writeText(url)
        toast.success("Link copied to clipboard")
      } catch {}
    }
  }

  const goToAudioGuide = () => {
    setActiveTab("audio")
    // scroll after tab renders
    setTimeout(() => {
      const el = document.getElementById("audio-guide")
      el?.scrollIntoView({ behavior: "smooth", block: "start" })
    }, 50)
  }

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const ret = pathname || "/monastery/" + String(params.id || "")
      router.push(`/auth?returnTo=${encodeURIComponent(ret)}`)
    }
  }, [isAuthenticated, loading, router, pathname, params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (!monastery) return notFound()

  // Sample audio guide chapters
  const audioChapters = [
    {
      id: "intro",
      title: "Introduction & History",
      duration: "3:45",
      description: "Learn about the monastery's founding and historical significance",
      content:
        params.id === "rumtek"
          ? `Rumtek Monastery, also known as the Dharma Chakra Centre, is one of the most famous and sacred monasteries of Sikkim. It is located about 23 kilometers from Gangtok, the capital of the state, on a hilltop that provides a panoramic view of the surrounding valleys and mountains. The monastery belongs to the Karma Kagyu sect of Tibetan Buddhism, one of the oldest and most respected schools of Buddhism. The original structure of Rumtek was built in the mid-1700s by the 9th Karmapa, Wangchuk Dorje. The Karmapa is the head of the Karma Kagyu lineage, just like the Dalai Lama is the head of the Gelug school. At that time, Rumtek was established to spread Buddhist teachings and serve as a center of learning, prayer, and meditation. However, with the passage of time, the monastery fell into a state of neglect and slowly lost its former glory.

The story of Rumtek took a new turn in the 20th century, especially after the political changes in Tibet. In 1959, when Tibet was invaded and taken over by China, the 16th Karmapa, Rangjung Rigpe Dorje, fled Tibet along with many followers. He came to Sikkim and chose Rumtek as his new seat, as Sikkim had always shared close cultural and spiritual links with Tibet. With the support of the Sikkimese royal family and local people, the Karmapa rebuilt Rumtek Monastery in the 1960s. The new structure was modeled after the original Kagyu headquarters in Tsurphu, Tibet, and became the international center for the Karma Kagyu lineage. This made Rumtek not only a spiritual refuge but also a symbol of the resilience of Tibetan Buddhism in exile.

Inside the monastery, one can find rare Buddhist manuscripts, scriptures, thankas or religious paintings, and many holy relics that were brought from Tibet. The monastery is also famous for its grand prayer halls, golden stupa, and intricate murals that display the depth of Buddhist art and philosophy. Apart from being a place of worship, Rumtek serves as a training ground for young monks who learn Buddhist philosophy, ritual practices, meditation, and traditional arts. It also becomes lively during festivals like Losar, the Tibetan New Year, and other religious ceremonies when monks perform sacred dances and rituals, attracting both devotees and visitors from around the world.

In this way, Rumtek Monastery is not just an architectural wonder, but also a living example of Sikkim’s cultural and religious heritage. Its history tells us about the journey of the Karma Kagyu lineage, the hardships faced during exile, and the successful preservation of tradition in a new land. Today, Rumtek continues to be a beacon of Buddhist teachings, a place of peace, and a bridge connecting Tibet, Sikkim, and the wider Buddhist world.`
          : undefined,
    },
    {
      id: "architecture",
      title: "Architecture & Design",
      duration: "4:20",
      description: "Explore the unique architectural features and Buddhist symbolism",
      content:
        params.id === "rumtek"
          ? `Rumtek Monastery is not only famous for its spiritual importance but also admired for its unique architecture and artistic design. The monastery is a beautiful example of traditional Tibetan Buddhist style, blended with some local Sikkimese influences. When you enter the monastery complex, the first thing that captures attention is its grand entrance gate, which is richly decorated with bright colors and symbolic motifs. The entire structure of Rumtek follows the traditional Tibetan pattern, with spacious courtyards, multi-storied buildings, prayer halls, and residential quarters for monks. The main monastery building has a massive golden roof that glitters under the sunlight and can be seen from a great distance, symbolizing purity and enlightenment.

The central attraction of Rumtek is the main prayer hall, which is three stories high. Its walls are decorated with beautiful murals and frescoes that depict various scenes from Buddhist mythology, the life of Lord Buddha, and the teachings of different lamas. The hall also houses a magnificent golden stupa containing the sacred relics of the 16th Karmapa. The pillars and ceilings are adorned with vibrant colors like red, blue, green, and gold, each having symbolic meaning in Buddhist tradition. Along the walls, there are thangkas, or scroll paintings, and intricate silk hangings that add to the sacred atmosphere. Large statues of Lord Buddha, Guru Padmasambhava, and other important deities are placed within the hall, reminding visitors of the deep spiritual energy of the place.

Another striking feature of the design is the monks’ quarters and institutes built around the main monastery. The complex also has a shedra, or monastic college, where monks receive training in philosophy, logic, meditation, and rituals. The entire layout of Rumtek is planned in a way that reflects harmony and balance, which are central to Buddhist thought. In the outer courtyard, one can often see monks chanting, practicing debate, or performing sacred dances during festivals. Colorful prayer flags flutter across the complex, carrying prayers to the winds, while the giant prayer wheels along the walls allow devotees to spin them as they walk, believing it spreads blessings.

Rumtek also reflects Tibetan craftsmanship in its wood carvings and decorative motifs. Intricate dragons, lotus flowers, and other sacred symbols are carved into the doors, windows, and beams, making the monastery not just a place of worship but also a gallery of traditional art. The monastery is surrounded by lush green hills, and its elevated position adds to its grandeur, making it look like a jewel resting on a hilltop. The whole design gives a sense of peace, symmetry, and sacredness, which perfectly matches the purpose of a Buddhist monastery.

In summary, the architecture and design of Rumtek Monastery combine functionality, symbolism, and beauty. It is built to serve as a spiritual center, a home for monks, and a treasure house of Buddhist art. Every corner of the monastery — from its golden roof to its sacred prayer hall and its colorful decorations — reflects the values of compassion, wisdom, and harmony. This makes Rumtek not only a significant religious site but also an architectural masterpiece that continues to inspire visitors and devotees from across the world.`
          : undefined,
    },
    {
      id: "rituals",
      title: "Daily Rituals & Practices",
      duration: "5:15",
      description: "Discover the daily life and spiritual practices of the monks",
      content:
        params.id === "rumtek"
          ? `Life at Rumtek Monastery is guided by discipline, devotion, and daily spiritual practice. The monks who live here follow a well-structured routine that is centered around prayer, meditation, and learning. Their day usually begins very early in the morning, often before sunrise. The first activity of the day is the morning prayer, where monks gather in the main prayer hall, chanting sacred mantras and reciting scriptures. These chants, accompanied by the sound of traditional instruments like drums, horns, and cymbals, create a deeply peaceful and spiritual atmosphere. The purpose of these prayers is to dedicate the day to the service of the Buddha’s teachings and to spread compassion and peace to all living beings.

After the morning prayers, monks engage in meditation practices. Meditation is considered essential in Buddhist life as it helps in calming the mind, developing wisdom, and understanding the nature of reality. Some monks may also perform personal rituals, lighting butter lamps or turning prayer wheels, which are believed to send blessings across the world. Throughout the day, the monastery also remains open to visitors and devotees, who join in prayers, spin the prayer wheels, or make offerings.

Another important part of daily life at Rumtek is scriptural study and training. Young monks spend several hours a day in classrooms or with senior teachers, learning Buddhist philosophy, scriptures, rituals, and the Tibetan language. They also practice debate, which is a traditional method of sharpening reasoning and understanding of Buddhist thought. Apart from spiritual learning, monks are also trained in arts like painting thangkas, making mandalas, and playing ritual instruments, which are all part of Buddhist culture.

Meals are taken together in simplicity, usually consisting of rice, vegetables, butter tea, or soup. Before eating, the monks chant prayers of gratitude and offer food symbolically to the Buddha and all sentient beings. In the afternoon, there may be more prayers, teachings, or meditation sessions. The evening again includes chanting and pujas, which are devotional ceremonies performed for peace, healing, and spiritual blessings. These pujas often involve the recitation of sacred texts and the offering of incense, butter lamps, and flowers.

Festivals and special occasions bring additional rituals. For example, during Losar, the Tibetan New Year, or the Kagyu Monlam Chenmo, the Great Prayer Festival, the monastery becomes vibrant with large-scale prayers, sacred dances called cham, and colorful rituals performed to purify negativity and bring prosperity. But even on regular days, the discipline of daily prayer, meditation, study, and service keeps the monastery alive with spiritual energy.

In this way, the daily rituals and practices at Rumtek Monastery are not just religious duties but a way of life. They are designed to bring inner peace, cultivate compassion, preserve Buddhist traditions, and keep the teachings of the Karmapa lineage alive for future generations. For visitors, watching these practices is a reminder of the deep spiritual culture that has been maintained at Rumtek for centuries.`
          : undefined,
    },
    {
      id: "artifacts",
      title: "Sacred Artifacts & Art",
      duration: "3:30",
      description: "Examine the precious artifacts and religious artwork",
      content:
        params.id === "rumtek"
          ? `Rumtek Monastery is not only a spiritual and cultural center but also a treasure house of sacred artifacts and Buddhist art. Within its walls, one can find many holy objects that carry deep religious significance and connect the monastery to centuries of Buddhist tradition. One of the most important relics preserved here is the golden stupa of the 16th Karmapa, which is richly decorated with precious stones. This stupa holds the remains of the revered leader and is considered the heart of the monastery. Devotees from across the world come to pay their respects at this sacred monument, believing that it radiates blessings and spiritual power.

Apart from the stupa, Rumtek houses an invaluable collection of ancient manuscripts, scriptures, and texts brought from Tibet when the 16th Karmapa came into exile. These texts preserve the teachings of the Karma Kagyu lineage and are carefully stored and studied by the monks. Many of them are hand-written in golden ink on black paper, reflecting the artistry and devotion of Buddhist scholars. The monastery also safeguards rare religious objects such as ritual instruments, vajras, bells, conch shells, and butter lamps, all of which are used in daily pujas and special ceremonies.

Art plays an equally important role in Rumtek’s identity. The walls of the main prayer hall are decorated with intricate murals and frescoes that depict Buddhist deities, protective guardians, mandalas, and scenes from the life of the Buddha. These artworks are not simply decorative but serve as teaching tools and visual guides for meditation. Each image is rich in symbolism — for example, the lotus represents purity, the wheel symbolizes the Dharma or teachings of the Buddha, and the dragon represents power and protection. The monastery also has a remarkable collection of thangkas, which are scroll paintings made on silk or cotton. These thangkas are hung during festivals and rituals, and some of them are very large and centuries old.

Another artistic feature of Rumtek is its woodwork and carvings. The monastery’s doors, windows, and beams are decorated with hand-carved designs of flowers, mythical creatures, and sacred symbols, all painted in vibrant colors like red, gold, and turquoise. The prayer wheels around the monastery, inscribed with the mantra Om Mani Padme Hum, are themselves considered sacred objects. By spinning them, devotees believe they are sending countless prayers into the universe.

In short, Rumtek Monastery is like a living museum of Buddhist art and sacred heritage. Every statue, painting, and relic inside it carries a spiritual message and reflects centuries of devotion. For monks, these artifacts are tools of learning and worship, while for visitors, they provide a glimpse into the depth of Tibetan Buddhist culture. Together, the sacred artifacts and art of Rumtek preserve the wisdom of the past and continue to inspire people with beauty, meaning, and faith.`
          : undefined,
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Explore
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleShare} aria-label="Share monastery">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!user) {
                  toast.error("Please login to save favorites")
                  router.push(`/auth?returnTo=${encodeURIComponent(pathname || "/")}`)
                  return
                }
                const id = String(params.id)
                const res = toggleFavorite(user.id, id)
                setIsFavorite(res.active)
                toast.success(res.active ? "Added to favorites" : "Removed from favorites")
              }}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="aspect-video rounded-lg overflow-hidden cursor-zoom-in"
              onClick={() => {
                setLightboxIndex(selectedImage)
                setLightboxOpen(true)
              }}
            >
              <img
                src={allImages[selectedImage] || "/placeholder.svg"}
                alt={monastery.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {allImages.slice(0, 3).map((image, index) => {
                const isLastPreview = index === 2 && allImages.length > 3
                return (
                  <button
                    key={index}
                    onClick={() => {
                      if (isLastPreview) {
                        setLightboxIndex(selectedImage)
                        setLightboxOpen(true)
                      } else {
                        setSelectedImage(index)
                      }
                    }}
                    className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === index ? "border-primary" : "border-transparent"
                    }`}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${monastery.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {isLastPreview && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="flex items-center gap-1 text-white text-sm font-medium">
                          <Plus className="h-5 w-5" />
                          <span>View more</span>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary">{monastery.category}</Badge>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{monastery.rating}</span>
                  <span className="text-muted-foreground">({monastery.reviews} reviews)</span>
                </div>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{monastery.name}</h1>
              <div className="flex items-center text-muted-foreground mb-4">
                <MapPin className="mr-2 h-4 w-4" />
                {monastery.location}, {monastery.district}
              </div>
              <p className="text-muted-foreground leading-relaxed">{monastery.description}</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              {monastery.virtualTour?.available ? (
                <Button asChild className="h-12 w-full">
                  <Link href={`/monastery/${monastery.id}/tour`}>
                    <Camera className="mr-2 h-4 w-4" />
                    Virtual Tour
                  </Link>
                </Button>
              ) : (
                <Button className="h-12 w-full pointer-events-none opacity-60">
                  <Camera className="mr-2 h-4 w-4" />
                  Virtual Tour
                </Button>
              )}

              {monastery.audioGuide?.available && (
                <Button variant="outline" className="h-12 w-full bg-transparent" onClick={goToAudioGuide}>
                  <Headphones className="mr-2 h-4 w-4" />
                  Audio Guide
                </Button>
              )}

              <Button asChild variant="outline" className="h-12 w-full bg-transparent">
                <Link href={`/monter/${monastery.id}/direction`}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Get Directions
                </Link>
              </Button>
              <Button variant="outline" className="h-12 w-full bg-transparent">
                <Download className="mr-2 h-4 w-4" />
                Download Info
              </Button>
            </div>

            {/* Key Features */}
            <div className="flex flex-wrap gap-2">
              {monastery.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="w-full gap-1 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
            <TabsTrigger value="visiting">Visiting Info</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="festivals">Festivals</TabsTrigger>
            <TabsTrigger value="audio">Audio Guide</TabsTrigger>
          </TabsList>
          <TabsContent value="media" className="space-y-6">
            <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-extrabold text-primary tracking-tight">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                    <Camera className="h-4 w-4" />
                  </span>
                  Photos & Videos from Google
                </CardTitle>
              </CardHeader>
              <CardContent>
                <GooglePhotosGrid name={monastery.name} lat={monastery.coordinates.lat} lng={monastery.coordinates.lng} />
                <div className="text-xs text-muted-foreground mt-2">
                  Images may be subject to copyright. Sources: Google Maps contributors.
                </div>
                {/* Street View removed from Media per request */}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="relative overflow-hidden border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 font-extrabold text-primary tracking-tight">
                    <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                      <Info className="h-4 w-4" />
                    </span>
                    About This Monastery
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 text-[15px] leading-7 tracking-[.01em]">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5">Founded</h4>
                    <p className="text-foreground/90">{monastery.founded}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5">Architecture</h4>
                    <p className="text-foreground/90">{monastery.architecture}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-1.5">Significance</h4>
                    <p className="text-foreground/90">{monastery.significance}</p>
                  </div>
                </CardContent>
              </Card>

              {monastery.audioGuide?.available && (
                <Card className="relative overflow-hidden border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
                  {/* subtle decorative glow using same palette */}
                  <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-3 font-extrabold tracking-tight">
                      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                        <Headphones className="h-4 w-4" />
                      </span>
                      Audio Guide
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1.5">Duration</h4>
                        <p className="text-foreground/90">{monastery.audioGuide.duration}</p>
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1.5">Available Languages</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {monastery.audioGuide.languages.map((lang) => (
                            <Badge
                              key={lang}
                              variant="outline"
                              className="border-amber-400/50 bg-transparent hover:bg-amber-200/20"
                            >
                              {lang}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">
                      <Button
                        className="w-full h-11 rounded-full shadow-md ring-1 ring-primary/40 hover:ring-primary/50"
                        onClick={goToAudioGuide}
                        aria-label="Start Audio Guide"
                      >
                        <Headphones className="mr-2 h-4 w-4" />
                        Start Audio Guide
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="visiting" className="space-y-6">
            <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-extrabold text-primary tracking-tight">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                    <Clock className="h-4 w-4" />
                  </span>
                  Visiting Information
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Opening Hours</h4>
                    <p className="text-muted-foreground">{monastery.visitingInfo.openingHours}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Entry Fee</h4>
                    <p className="text-muted-foreground">{monastery.visitingInfo.entryFee}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Best Time to Visit</h4>
                    <p className="text-muted-foreground">{monastery.visitingInfo.bestTimeToVisit}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground mb-2">Accessibility</h4>
                    <p className="text-muted-foreground">{monastery.visitingInfo.accessibility}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 font-extrabold text-primary tracking-tight">
                  <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                    <BookOpen className="h-4 w-4" />
                  </span>
                  Historical Background
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{monastery.history}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="festivals" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {monastery.festivals.map((festival, index) => (
                <Card key={index} className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 font-extrabold text-primary tracking-tight">
                      <span className="inline-flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 text-primary ring-1 ring-primary/30">
                        <Calendar className="h-4 w-4" />
                      </span>
                      {festival.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <strong>When:</strong> {festival.date}
                      </div>
                      <p className="text-muted-foreground">{festival.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="audio" className="space-y-6" id="audio-guide">
            {monastery.audioGuide?.available ? (
              <AudioGuide
                monasteryName={monastery.name}
                languages={monastery.audioGuide.languages}
                duration={monastery.audioGuide.duration}
                chapters={audioChapters}
              />
            ) : (
              <Card className="rounded-2xl border-amber-300/60 shadow-[0_10px_28px_-10px_rgba(0,0,0,0.35)]">
                <CardContent className="p-12 text-center">
                  <Headphones className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Audio Guide Not Available</h3>
                  <p className="text-muted-foreground">Audio guide for this monastery is currently being prepared.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
      {/* Lightbox for images */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-none sm:max-w-none w-[94vw] mt-3 mb-3 p-0 overflow-hidden">
          <div className="relative bg-black">
            <div
              className="relative w-full"
              style={{ height: "90vh" }}
              onTouchStart={(e) => setTouchStartX(e.changedTouches[0]?.clientX ?? null)}
              onTouchEnd={(e) => {
                if (touchStartX == null) return
                const dx = (e.changedTouches[0]?.clientX ?? touchStartX) - touchStartX
                const threshold = 40
                if (dx > threshold) {
                  setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length)
                } else if (dx < -threshold) {
                  setLightboxIndex((i) => (i + 1) % allImages.length)
                }
                setTouchStartX(null)
              }}
            >
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-2 right-2 z-10 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <button
                onClick={() => setLightboxIndex((i) => (i - 1 + allImages.length) % allImages.length)}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <img
                src={allImages[lightboxIndex]}
                alt={`${monastery.name} large`}
                className="absolute inset-0 w-full h-full object-contain"
              />
              <button
                onClick={() => setLightboxIndex((i) => (i + 1) % allImages.length)}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full bg-white/10 hover:bg-white/20 p-2 text-white"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          </div>
          <div className="bg-background p-3 overflow-x-auto flex gap-2">
            {allImages.map((img, idx) => (
              <button
                key={img + idx}
                onClick={() => setLightboxIndex(idx)}
                className={`h-16 w-24 rounded overflow-hidden border ${
                  lightboxIndex === idx ? "border-primary" : "border-transparent"
                }`}
              >
                <img src={img} alt={`${monastery.name} thumb ${idx + 1}`} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
