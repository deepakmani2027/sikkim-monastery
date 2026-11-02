"use client"
import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Play, Pause, Maximize2, RotateCcw, Volume2, Languages } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const virtualTours = [
  {
    id: 1,
    name: "Rumtek Monastery",
    description: "The Golden Dharmachakra Centre, seat of the Karmapa",
  image: "/monastery-interior-1.jpg",
    century: "17th Century",
    region: "East Sikkim",
    audio: {
      en: "Welcome to Rumtek Monastery, one of the most significant Buddhist centers in Sikkim. Here you'll discover the magnificent prayer hall with its golden Buddha statues and sacred artifacts that have been preserved for centuries.",
      hi: "रुमटेक मठ में आपका स्वागत है, जो सिक्किम के सबसे महत्वपूर्ण बौद्ध केंद्रों में से एक है। यहाँ आप सुनहरी बुद्ध मूर्तियों और पवित्र कलाकृतियों के साथ भव्य प्रार्थना हॉल की खोज करेंगे।",
      ne: "रुम्टेक मठमा तपाईंलाई स्वागत छ, जुन सिक्किमका सबैभन्दा महत्वपूर्ण बौद्ध केन्द्रहरू मध्ये एक हो। यहाँ तपाईंले सुनौला बुद्ध मूर्तिहरू र पवित्र कलाकृतिहरूसहित भव्य प्रार्थना हल पत्ता लगाउनुहुनेछ।"
    }
  },
  {
    id: 2,
    name: "Tashiding Monastery",
    description: "The holy monastery of central glory",
  image: "/monastery-exterior-mountain.jpg",
    century: "17th Century",
    region: "West Sikkim",
    audio: {
      en: "Perched on a hilltop between the Ratong and Rangeet rivers, Tashiding Monastery offers breathtaking panoramic views and is believed to cleanse the sins of all who visit with pure heart and devotion.",
      hi: "रतोंग और रंगीत नदियों के बीच एक पहाड़ी पर स्थित, ताशिदिंग मठ लुभावने मनोरम दृश्य प्रदान करता है और माना जाता है कि यह शुद्ध हृदय और भक्ति के साथ आने वाले सभी लोगों के पापों को धो देता है।",
      ne: "रतोङ र रंगीत नदीहरूको बीचमा पहाडको चुचुरोमा अवस्थित, ताशिदिङ मठले मनमोहक दृश्यहरू प्रदान गर्दछ र शुद्ध मन र भक्तिसाथ आउने सबैका पापहरू धुन्छ भन्ने विश्वास गरिन्छ।"
    }
  },
  {
    id: 3,
    name: "Pemayangtse Monastery",
    description: "The perfect sublime lotus monastery",
  image: "/virtual-tour-interior.jpg",
    century: "17th Century", 
    region: "West Sikkim",
    audio: {
      en: "Founded in 1705 by Lhatsun Chempo, this monastery represents the pure spiritual tradition of the Nyingma sect. The seven-tiered wooden sculpture 'Sanghthokpalri' depicts the heavenly palace of Guru Rinpoche.",
      hi: "1705 में ल्हात्सुन चेम्पो द्वारा स्थापित, यह मठ न्यिंगमा संप्रदाय की शुद्ध आध्यात्मिक परंपरा का प्रतिनिधित्व करता है। सात स्तरीय लकड़ी की मूर्ति 'संगथोकपालरी' गुरु रिनपोछे के स्वर्गीय महल को दर्शाती है।",
      ne: "1705 मा ल्हात्सुन चेम्पो द्वारा स्थापना भएको, यो मठले न्यिङमा सम्प्रदायको शुद्ध आध्यात्मिक परम्पराको प्रतिनिधित्व गर्दछ। सात तले काठको मूर्ति 'संघथोकपालरी'ले गुरु रिनपोछेको स्वर्गीय दरबारलाई चित्रण गर्दछ।"
    }
  },
  {
    id: 4,
    name: "Enchey Monastery",
    description: "The solitary monastery above Gangtok",
    image: "https://media.istockphoto.com/id/1158619900/photo/colorful-passage-at-rumtek-monastery-sikkim-india.jpg?s=612x612&w=0&k=20&c=aXlgzz6A0v4GtWM0Ymw1tTaiPl47TFqApoCiVerZIWs=",
    century: "19th Century",
    region: "East Sikkim",
    audio: {
      en: "Built in 1909 by Lama Druptob Karpo, Enchey Monastery overlooks the capital city of Gangtok. The monastery follows the Nyingma tradition and is famous for its Chaam dance performances during festivals.",
      hi: "1909 में लामा द्रुप्तोब कार्पो द्वारा निर्मित, एंचे मठ राजधानी गंगटोक को देखता है। यह मठ न्यिंगमा परंपरा का पालन करता है और त्योहारों के दौरान अपने छम नृत्य प्रदर्शन के लिए प्रसिद्ध है।",
      ne: "1909 मा लामा द्रुप्तोब कार्पो द्वारा निर्माण भएको, एन्चे मठले राजधानी गंगटोकलाई हेर्छ। यो मठले न्यिङमा परम्पराको पालना गर्छ र चाड पर्वहरूमा छम नृत्य प्रदर्शनका लागि प्रसिद्ध छ।"
    }
  },
  {
    id: 5,
    name: "Dubdi Monastery",
    description: "The first monastery built in Sikkim",
    image: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/2b/f3/0e/56/caption.jpg?w=1400&h=800&s=1",
    century: "17th Century",
    region: "West Sikkim",
    audio: {
      en: "Built in 1701, Dubdi is the oldest monastery in Sikkim, also known as 'Hermit's Cell'. It was established by Lhatsun Chempo and houses ancient Buddhist texts and sacred relics.",
      hi: "1701 में निर्मित, दुब्दी सिक्किम का सबसे पुराना मठ है, जिसे 'साधु कक्ष' के नाम से भी जाना जाता है। यह ल्हात्सुन चेम्पो द्वारा स्थापित किया गया था और इसमें प्राचीन बौद्ध ग्रंथ और पवित्र अवशेष हैं।",
      ne: "1701 मा निर्माण भएको, दुब्दी सिक्किमको सबैभन्दा पुरानो मठ हो, जसलाई 'सन्यासी कोठा' भनेर पनि चिनिन्छ। यो ल्हात्सुन चेम्पो द्वारा स्थापना गरिएको थियो र यसमा प्राचीन बौद्ध ग्रन्थहरू र पवित्र अवशेषहरू छन्।"
    }
  },
  {
    id: 6,
    name: "Sangachoeling Monastery",
    description: "The sacred summit monastery",
    image: "https://cdn.tripuntold.com/media/photos/location/2018/12/01/a12d8939-8232-4357-8e28-8907ab23e0e2.jpg",
    century: "17th Century",
    region: "West Sikkim",
    audio: {
      en: "Founded in 1697, Sangachoeling is the second oldest monastery in Sikkim. Perched at an altitude of 2,100 meters, it offers spectacular views of the Kanchenjunga range and houses numerous Buddhist sculptures.",
      hi: "1697 में स्थापित, संगाचोलिंग सिक्किम का दूसरा सबसे पुराना मठ है। 2,100 मीटर की ऊंचाई पर स्थित, यह कंचनजंगा श्रृंखला के शानदार दृश्य प्रस्तुत करता है और कई बौद्ध मूर्तियों का घर है।",
      ne: "1697 मा स्थापना भएको, संगाचोलिङ सिक्किमको दोस्रो सबैभन्दा पुरानो मठ हो। 2,100 मिटरको उचाइमा अवस्थित, यसले कञ्चनजङ्घा शृङ्खलाको शानदार दृश्यहरू प्रदान गर्दछ र धेरै बौद्ध मूर्तिहरूको घर हो।"
    }
  }
]

const VirtualTours = () => {
  const [selectedTour, setSelectedTour] = useState(virtualTours[0])
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState("en")
  const [isFullscreen, setIsFullscreen] = useState(false)
  const viewerRef = useRef<HTMLDivElement>(null)

  const languages = [
    { code: "en", name: "English" },
    { code: "hi", name: "हिन्दी" },
    { code: "ne", name: "नेपाली" },
    { code: "le", name: "Lepcha" },
    { code: "bh", name: "Bhutia" }
  ]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    // In a real implementation, this would control the 360° viewer or audio
  }

  const handleFullscreen = () => {
    if (viewerRef.current) {
      if (!document.fullscreenElement) {
        viewerRef.current.requestFullscreen()
        setIsFullscreen(true)
      } else {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <section id="virtual-tours" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Virtual <span className="text-primary">Tours</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Step inside sacred spaces with immersive 360° virtual tours. 
            Experience the spiritual atmosphere and architectural beauty of Sikkim's ancient monasteries.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Tour Selection */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              Select Monastery
            </h3>
            <div className="space-y-3">
              {virtualTours.map((tour) => (
                <button
                  key={tour.id}
                  onClick={() => setSelectedTour(tour)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    selectedTour.id === tour.id
                      ? 'bg-primary/10 border-2 border-primary shadow-soft'
                      : 'bg-card hover:bg-muted border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground truncate">
                        {tour.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {tour.region}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>

          {/* 360° Viewer */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="card-gradient rounded-2xl shadow-elevated overflow-hidden">
              {/* Tour Header */}
              <div className="p-6 border-b border-border">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                      {selectedTour.name}
                    </h3>
                    <p className="text-muted-foreground mb-2">
                      {selectedTour.description}
                    </p>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{selectedTour.century}</span>
                      <span>•</span>
                      <span>{selectedTour.region}</span>
                    </div>
                  </div>
                  
                  {/* Language Selector */}
                  <div className="flex items-center gap-3">
                    <Languages className="w-5 h-5 text-muted-foreground" />
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {languages.map((lang) => (
                          <SelectItem key={lang.code} value={lang.code}>
                            {lang.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 360° Viewer Container */}
              <div ref={viewerRef} className="relative">
                <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                  <img
                    src={selectedTour.image}
                    alt={`360° view of ${selectedTour.name} interior showing traditional Buddhist architecture and sacred artifacts`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay Controls */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent">
                    {/* Center Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button
                        onClick={handlePlayPause}
                        className="w-20 h-20 bg-background/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background/30 transition-all duration-300 hover:scale-110"
                      >
                        {isPlaying ? (
                          <Pause className="w-8 h-8 text-white" />
                        ) : (
                          <Play className="w-8 h-8 text-white ml-1" />
                        )}
                      </button>
                    </div>

                    {/* Top Controls */}
                    <div className="absolute top-4 right-4 flex gap-2">
                      <button
                        onClick={() => {/* Reset view */}}
                        className="w-10 h-10 bg-background/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background/30 transition-colors"
                        title="Reset view"
                      >
                        <RotateCcw className="w-5 h-5 text-white" />
                      </button>
                      <button
                        onClick={handleFullscreen}
                        className="w-10 h-10 bg-background/20 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-background/30 transition-colors"
                        title="Fullscreen"
                      >
                        <Maximize2 className="w-5 h-5 text-white" />
                      </button>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-background/20 backdrop-blur-md rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-white" />
                          <p className="text-white text-sm">
                            {selectedTour.audio[selectedLanguage as keyof typeof selectedTour.audio]}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-6 border-t border-border">
                <div className="flex justify-center">
                  <HeroButton
                    variant="primary"
                    className="min-w-64"
                    onClick={() => {
                      const el = document.getElementById("interactive-map");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }}
                  >
                    View on Map
                  </HeroButton>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tour Gallery */}
        <motion.div 
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            More Virtual Experiences
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {virtualTours.map((tour, index) => (
              <motion.button
                key={tour.id}
                onClick={() => setSelectedTour(tour)}
                className="group relative aspect-square rounded-xl overflow-hidden shadow-soft hover:shadow-elevated transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img
                  src={tour.image}
                  alt={`${tour.name} virtual tour preview`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <h4 className="text-white font-semibold text-sm">
                    {tour.name}
                  </h4>
                  <p className="text-white/80 text-xs">
                    {tour.region}
                  </p>
                </div>
                <div className="absolute top-3 right-3">
                  <div className="w-8 h-8 bg-background/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default VirtualTours