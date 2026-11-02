"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type React from "react"
import { motion } from "framer-motion"
import { Search, Download, Eye, Calendar, FileText, Image, Scroll, Filter } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
const manuscriptImage = "/digital-archive-manuscript.jpg"
const manuscriptDetail = "/manuscript-detail.jpg"
const sacredMural = "/sacred-mural.jpg"
const thangkaMandala = "/thangka-mandala.jpg"
const festivalCeremony = "/festival-ceremony.jpg"

interface ArchiveItem {
  id: number
  title: string
  type: "manuscript" | "mural" | "photo" | "document"
  monastery: string
  century: string
  description: string
  image: string
  downloadUrl: string
  metadata: {
    language: string
    material: string
    dimensions: string
    dateAcquired: string
    conservationStatus: string
  }
}

const archiveItems: ArchiveItem[] = [
  {
    id: 1,
    title: "Lotus Sutra Manuscript",
    type: "manuscript",
    monastery: "Rumtek Monastery",
    century: "17th Century",
    description: "Ancient Tibetan manuscript of the Lotus Sutra written on handmade paper with gold ink illuminations, representing one of the most important Buddhist texts.",
    image: manuscriptDetail,
    downloadUrl: "/archives/lotus-sutra-ms001.pdf",
    metadata: {
      language: "Classical Tibetan",
      material: "Handmade paper, gold ink",
      dimensions: "32 x 8 cm",
      dateAcquired: "1998-03-15",
      conservationStatus: "Excellent"
    }
  },
  {
    id: 2,
    title: "Buddha Life Murals",
    type: "mural",
    monastery: "Pemayangtse Monastery",
    century: "18th Century",
    description: "Intricate wall paintings depicting the life of Buddha from birth to enlightenment, showcasing traditional Tibetan artistic techniques.",
    image: sacredMural,
    downloadUrl: "/archives/buddha-murals-pm002.jpg",
    metadata: {
      language: "Visual Art",
      material: "Natural pigments on wall",
      dimensions: "300 x 150 cm",
      dateAcquired: "2001-07-22",
      conservationStatus: "Good"
    }
  },
  {
    id: 3,
    title: "Monastery Foundation Ceremony",
    type: "photo",
    monastery: "Tashiding Monastery",
    century: "17th Century",
    description: "Historical photograph documenting the foundation ceremony of Tashiding Monastery in 1717, showing traditional Buddhist rituals.",
    image: festivalCeremony,
    downloadUrl: "/archives/foundation-ceremony-tm003.jpg",
    metadata: {
      language: "N/A",
      material: "Silver gelatin print",
      dimensions: "20 x 15 cm",
      dateAcquired: "1995-11-08",
      conservationStatus: "Fair"
    }
  },
  {
    id: 4,
    title: "Ritual Prayer Instructions",
    type: "document",
    monastery: "Enchey Monastery",
    century: "19th Century",
    description: "Detailed instructions for conducting daily prayers and seasonal festivals, including proper pronunciations and ritual procedures.",
    image: manuscriptImage,
    downloadUrl: "/archives/prayer-instructions-em004.pdf",
    metadata: {
      language: "Tibetan, Nepali",
      material: "Handmade paper",
      dimensions: "25 x 18 cm",
      dateAcquired: "2003-05-12",
      conservationStatus: "Good"
    }
  },
  {
    id: 5,
    title: "Sacred Mandala Thangka",
    type: "photo",
    monastery: "Dubdi Monastery",
    century: "17th Century",
    description: "Sacred thangka painting depicting an intricate Buddhist mandala with geometric patterns representing the universe and spiritual path.",
    image: thangkaMandala,
    downloadUrl: "/archives/mandala-thangka-dm005.jpg",
    metadata: {
      language: "Visual Art",
      material: "Silk, natural pigments",
      dimensions: "80 x 80 cm",
      dateAcquired: "1999-09-30",
      conservationStatus: "Excellent"
    }
  },
  {
    id: 6,
    title: "Chanting Manuscript",
    type: "manuscript",
    monastery: "Rumtek Monastery",
    century: "18th Century",
    description: "Musical notation and lyrics for traditional Buddhist chants and prayers, preserving ancient vocal traditions.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    downloadUrl: "/archives/chanting-ms006.pdf",
    metadata: {
      language: "Sanskrit, Tibetan",
      material: "Palm leaf, iron ink",
      dimensions: "30 x 6 cm",
      dateAcquired: "2000-12-05",
      conservationStatus: "Good"
    }
  },
  {
    id: 7,
    title: "Mahakala Dance Masks",
    type: "photo",
    monastery: "Sangachoeling Monastery",
    century: "18th Century",
    description: "Traditional ceremonial masks used in Cham dances, representing protective deities in Buddhist tradition.",
    image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&q=80",
    downloadUrl: "/archives/mahakala-masks-sm007.jpg",
    metadata: {
      language: "Visual Art",
      material: "Wood, paper-mache, pigments",
      dimensions: "30 x 25 cm",
      dateAcquired: "2005-04-18",
      conservationStatus: "Good"
    }
  },
  {
    id: 8,
    title: "Monastery Architecture Plans",
    type: "document",
    monastery: "Pemayangtse Monastery",
    century: "17th Century",
    description: "Original architectural drawings showing the construction plans and sacred geometry of the monastery complex.",
    image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&q=80",
    downloadUrl: "/archives/architecture-plans-pm008.pdf",
    metadata: {
      language: "Tibetan",
      material: "Handmade paper, ink",
      dimensions: "45 x 35 cm",
      dateAcquired: "1997-08-14",
      conservationStatus: "Fair"
    }
  },
  {
    id: 9,
    title: "Prayer Wheel Inscriptions",
    type: "photo",
    monastery: "Enchey Monastery",
    century: "19th Century",
    description: "Detailed photographs of prayer wheel inscriptions containing sacred mantras and Buddhist teachings.",
    image: "https://images.unsplash.com/photo-1544531586-fbb6cf2ad6c3?w=600&q=80",
    downloadUrl: "/archives/prayer-wheels-em009.jpg",
    metadata: {
      language: "Sanskrit, Tibetan",
      material: "Copper, silver",
      dimensions: "Various sizes",
      dateAcquired: "2002-11-20",
      conservationStatus: "Excellent"
    }
  },
  {
    id: 10,
    title: "Yak Butter Sculptures",
    type: "photo",
    monastery: "Tashiding Monastery",
    century: "18th Century",
    description: "Traditional butter sculptures created for religious ceremonies, showcasing intricate artistic skills and devotional practices.",
    image: "https://images.unsplash.com/photo-1590736969955-71cc94901144?w=600&q=80",
    downloadUrl: "/archives/butter-sculptures-tm010.jpg",
    metadata: {
      language: "Visual Art",
      material: "Yak butter, natural dyes",
      dimensions: "Various sizes",
      dateAcquired: "2004-02-28",
      conservationStatus: "Documentation only"
    }
  },
  {
    id: 11,
    title: "Bon Tradition Texts",
    type: "manuscript",
    monastery: "Dubdi Monastery",
    century: "17th Century",
    description: "Rare manuscripts documenting the pre-Buddhist Bon tradition and its integration with Buddhism in Sikkim.",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80",
    downloadUrl: "/archives/bon-texts-dm011.pdf",
    metadata: {
      language: "Tibetan, Ancient Bon",
      material: "Handmade paper, ink",
      dimensions: "28 x 12 cm",
      dateAcquired: "2001-05-07",
      conservationStatus: "Fair"
    }
  },
  {
    id: 12,
    title: "Festival Photography Collection",
    type: "photo",
    monastery: "Multiple Monasteries",
    century: "20th Century",
    description: "Comprehensive photographic documentation of various Buddhist festivals celebrated across Sikkim's monasteries.",
    image: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=600&q=80",
    downloadUrl: "/archives/festivals-collection-mc012.zip",
    metadata: {
      language: "N/A",
      material: "Digital photography",
      dimensions: "Various resolutions",
      dateAcquired: "2010-12-31",
      conservationStatus: "Excellent"
    }
  }
]

const typeIcons = {
  manuscript: Scroll,
  mural: Image,
  photo: FileText,
  document: FileText
}

const DigitalArchives = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterMonastery, setFilterMonastery] = useState<string>("all")
  const [selectedItem, setSelectedItem] = useState<ArchiveItem | null>(null)
  const { isAuthenticated, loading } = useAuth()
  const router = useRouter()

  const filteredItems = archiveItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.monastery.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = filterType === "all" || item.type === filterType
    const matchesMonastery = filterMonastery === "all" || item.monastery === filterMonastery
    
    return matchesSearch && matchesType && matchesMonastery
  })

  const types = [...new Set(archiveItems.map(item => item.type))]
  const monasteries = [...new Set(archiveItems.map(item => item.monastery))]

  const handlePreview = (item: ArchiveItem) => {
    setSelectedItem(item)
  }

  const handleDownload = (item: ArchiveItem) => {
    // In a real implementation, this would trigger a download
    console.log(`Downloading: ${item.title}`)
  }

  return (
    <section id="digital-archives" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Digital <span className="text-primary">Archives</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Explore our digitized collection of ancient manuscripts, historic murals, 
            photographs, and sacred texts preserved for future generations.
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          <div className="card-gradient rounded-2xl p-6 shadow-soft">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search archives by title, description, or monastery..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm font-medium text-foreground">Filter:</span>
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {types.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}s
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterMonastery} onValueChange={setFilterMonastery}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="All Monasteries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Monasteries</SelectItem>
                    {monasteries.map((monastery) => (
                      <SelectItem key={monastery} value={monastery}>
                        {monastery}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* AI-Powered Search Note */}
            <div className="mt-4 p-3 bg-accent/10 rounded-lg">
              <p className="text-sm text-accent-foreground">
                🤖 <strong>AI-Enhanced Search:</strong> Our intelligent search system can identify items by visual content, 
                cultural context, and historical significance beyond just text matching.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Results Counter */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <p className="text-muted-foreground">
            Showing {filteredItems.length} of {archiveItems.length} archive items
          </p>
        </motion.div>

        {/* Archive Grid (limit to 3 on homepage) */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
        >
          {filteredItems.slice(0, 3).map((item, index) => {
            const IconComponent = typeIcons[item.type]
            return (
              <motion.article
                key={item.id}
                className="group relative card-gradient rounded-2xl shadow-soft hover:shadow-elevated transition-all duration-500 overflow-hidden"
                whileHover={{ y: -8 }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                {/* Full-card content (blurred on 3rd card) */}
                <div className={`${index === 2 ? 'pointer-events-none filter blur-sm' : ''}`}>
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={item.image}
                      alt={`${item.title} - ${item.type} from ${item.monastery}`}
                      className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-700`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Type Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <IconComponent className="w-3 h-3 text-primary" />
                      <span className="text-xs font-medium text-foreground capitalize">
                        {item.type}
                      </span>
                    </div>

                    {/* Century Badge */}
                    <div className="absolute top-3 right-3 bg-secondary/90 backdrop-blur-sm rounded-full px-3 py-1">
                      <span className="text-xs font-medium text-secondary-foreground">
                        {item.century}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-300">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">{item.monastery}</span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
                      {item.description}
                    </p>

                    {/* Metadata Preview */}
                    <div className="space-y-2 mb-6">
                      <div className="text-xs text-muted-foreground">
                        <strong>Language:</strong> {item.metadata.language}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <strong>Material:</strong> {item.metadata.material}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                          item.metadata.conservationStatus === 'Excellent' ? 'bg-green-100 text-green-700' :
                          item.metadata.conservationStatus === 'Good' ? 'bg-blue-100 text-blue-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {item.metadata.conservationStatus}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <HeroButton
                        variant="primary"
                        size="default"
                        onClick={() => handlePreview(item)}
                        className="flex-1 text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Preview
                      </HeroButton>
                      <HeroButton
                        variant="hero-outline"
                        size="default"
                        onClick={() => handleDownload(item)}
                        className="px-3"
                      >
                        <Download className="w-4 h-4" />
                      </HeroButton>
                    </div>
                  </div>
                </div>

                {/* View more overlay on the 3rd card */}
                {index === 2 && (
                  <a
                    href="/digital-archives"
                    onClick={(e) => {
                      e.preventDefault()
                      if (loading) return // avoid flicker; user can click again
                      if (isAuthenticated) {
                        router.push("/digital-archives")
                      } else {
                        router.push("/auth?returnTo=/digital-archives")
                      }
                    }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <span className="px-6 py-3 rounded-xl bg-black/60 text-white text-2xl font-semibold tracking-wide backdrop-blur hover:bg-black/70 transition-colors">
                      View more
                    </span>
                  </a>
                )}
              </motion.article>
            )
          })}
        </motion.div>

        {/* Preview Modal */}
        {selectedItem && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedItem(null)}
          >
            <motion.div
              className="card-gradient rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-auto"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      {selectedItem.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedItem.monastery} • {selectedItem.century}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <img
                  src={selectedItem.image}
                  alt={selectedItem.title}
                  className="w-full h-64 object-cover rounded-lg mb-6"
                />

                <p className="text-foreground mb-6 leading-relaxed">
                  {selectedItem.description}
                </p>

                {/* Detailed Metadata */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {Object.entries(selectedItem.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-border">
                      <span className="font-medium text-foreground capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-muted-foreground">{value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3">
                  <HeroButton
                    variant="monastery"
                    onClick={() => handleDownload(selectedItem)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download High Resolution
                  </HeroButton>
                  <HeroButton variant="primary" className="flex-1">
                    Share Archive
                  </HeroButton>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Archive Statistics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            { label: "Manuscripts", count: "1,250+", icon: Scroll },
            { label: "Historic Photos", count: "800+", icon: Image },
            { label: "Murals Documented", count: "150+", icon: FileText },
            { label: "Languages", count: "8", icon: Search }
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center p-6 card-gradient rounded-xl shadow-soft">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="text-2xl font-bold font-display text-primary mb-1">
                  {stat.count}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default DigitalArchives