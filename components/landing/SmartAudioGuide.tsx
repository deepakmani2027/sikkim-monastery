"use client"
import { useState } from "react"
import { motion } from "framer-motion"
import { Bluetooth, MapPin, Volume2, Download, Smartphone, Headphones } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Slider } from "@/components/ui/slider"

const SmartAudioGuide = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState([75])
  const [currentTrack, setCurrentTrack] = useState(0)

  const audioTracks = [
    {
      title: "Welcome to Rumtek Monastery",
      duration: "3:24",
      description: "Introduction to the Golden Dharmachakra Centre and its significance",
      monastery: "Rumtek Monastery"
    },
    {
      title: "The Great Prayer Hall",
      duration: "4:15",
      description: "Exploring the main prayer hall with its sacred artifacts and murals",
      monastery: "Rumtek Monastery"
    },
    {
      title: "Monastery Gardens & Stupas",
      duration: "2:45",
      description: "Walking through the peaceful gardens and understanding stupa symbolism",
      monastery: "Rumtek Monastery"
    }
  ]

  const features = [
    {
      icon: Bluetooth,
      title: "Bluetooth Beacon Technology",
      description: "Automatic audio triggers as you approach different areas of the monastery",
      color: "text-blue-600"
    },
    {
      icon: MapPin,
      title: "GPS-Based Navigation", 
      description: "Location-aware content that adapts to your exact position within the monastery",
      color: "text-green-600"
    },
    {
      icon: Volume2,
      title: "Multi-Language Support",
      description: "Audio guides available in English, Hindi, Nepali, Tibetan, and Lepcha",
      color: "text-orange-600"
    },
    {
      icon: Smartphone,
      title: "Offline Capability",
      description: "Download guides before your visit for areas with limited connectivity",
      color: "text-purple-600"
    }
  ]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <section id="smart-audio-guide" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Smart Audio <span className="text-primary">Guide</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Experience monasteries like never before with our intelligent audio guide system. 
            Get contextual information triggered by your location and movements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Audio Player Demo */}
          <motion.div 
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="card-gradient rounded-2xl shadow-elevated overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Demo Audio Player
                </h3>
                <p className="text-muted-foreground text-sm">
                  Experience a sample of our guided monastery tour
                </p>
              </div>

              {/* Audio Player */}
              <div className="p-6">
                {/* Current Track Info */}
                <div className="mb-6">
                  <h4 className="font-semibold text-foreground mb-1">
                    {audioTracks[currentTrack].title}
                  </h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {audioTracks[currentTrack].description}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{audioTracks[currentTrack].monastery}</span>
                    <span>•</span>
                    <span>{audioTracks[currentTrack].duration}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-primary rounded-full"
                      initial={{ width: "0%" }}
                      animate={{ width: isPlaying ? "35%" : "0%" }}
                      transition={{ duration: 2, repeat: isPlaying ? Infinity : 0 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>1:15</span>
                    <span>{audioTracks[currentTrack].duration}</span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <button 
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setCurrentTrack(Math.max(0, currentTrack - 1))}
                    disabled={currentTrack === 0}
                  >
                    ⏮
                  </button>
                  
                  <button
                    onClick={handlePlayPause}
                    className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
                  >
                    {isPlaying ? (
                      <span className="text-xl">⏸</span>
                    ) : (
                      <span className="text-xl ml-1">▶</span>
                    )}
                  </button>
                  
                  <button 
                    className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setCurrentTrack(Math.min(audioTracks.length - 1, currentTrack + 1))}
                    disabled={currentTrack === audioTracks.length - 1}
                  >
                    ⏭
                  </button>
                </div>

                {/* Volume Control */}
                <div className="flex items-center gap-3 mb-6">
                  <Volume2 className="w-4 h-4 text-muted-foreground" />
                  <Slider
                    value={volume}
                    onValueChange={setVolume}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm text-muted-foreground w-8">
                    {volume[0]}%
                  </span>
                </div>

                {/* Playlist */}
                <div>
                  <h4 className="font-semibold text-foreground mb-3">Current Tour</h4>
                  <div className="space-y-2">
                    {audioTracks.map((track, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentTrack(index)}
                        className={`w-full p-3 rounded-lg text-left transition-all duration-200 ${
                          currentTrack === index
                            ? 'bg-primary/10 border border-primary/20'
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
                      >
                        <div className="font-medium text-sm text-foreground">
                          {track.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {track.duration}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features */}
          <motion.div 
            className="order-1 lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-2xl font-bold text-foreground mb-8">
              How It Works
            </h3>

            <div className="space-y-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon
                return (
                  <motion.div
                    key={index}
                    className="flex gap-4 p-6 card-gradient rounded-xl shadow-soft"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-${feature.color.split('-')[1]}-100 flex-shrink-0`}>
                      <IconComponent className={`w-6 h-6 ${feature.color}`} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-2">
                        {feature.title}
                      </h4>
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* App Download */}
            <motion.div 
              className="mt-8 p-6 bg-gradient-monastery text-primary-foreground rounded-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="w-6 h-6" />
                <h4 className="font-semibold">Download the App</h4>
              </div>
              <p className="text-primary-foreground/90 text-sm mb-6">
                Get the full MonasteryView mobile app for the complete audio guide experience 
                with offline downloads and augmented reality features.
              </p>
              <div className="flex gap-3">
                <HeroButton
                  variant="hero-outline"
                  size="default"
                  className="w-full whitespace-normal leading-snug text-base px-4 py-4"
                >
                  <Download className="w-4 h-4 mr-2 flex-shrink-0" />
                  <span className="block text-left">Download Android App</span>
                </HeroButton>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Technology Explanation */}
        <motion.div 
          className="card-gradient rounded-2xl p-8 shadow-soft"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Beacon Technology
              </h3>
              <p className="text-muted-foreground mb-4">
                Strategically placed Bluetooth beacons throughout monastery grounds automatically 
                trigger relevant audio content as you move through different areas. No manual 
                selection needed - the guide knows where you are.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Bluetooth className="w-4 h-4 text-blue-600" />
                <span className="text-muted-foreground">
                  Range: 10-50 meters per beacon
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-display text-xl font-bold text-foreground mb-4">
                Adaptive Content
              </h3>
              <p className="text-muted-foreground mb-4">
                Our AI-powered system adapts content based on your interests, time of visit, 
                and walking pace. Whether you're a spiritual seeker, history enthusiast, or 
                architecture lover, get personalized insights.
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Headphones className="w-4 h-4 text-purple-600" />
                <span className="text-muted-foreground">
                  5 languages available
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default SmartAudioGuide