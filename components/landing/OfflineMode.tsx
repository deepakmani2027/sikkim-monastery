import { useState } from "react"
import { motion } from "framer-motion"
import { Download, Smartphone, Wifi, WifiOff, CheckCircle, Clock, HardDrive } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Progress } from "@/components/ui/progress"

const downloadableContent = [
  {
    id: 1,
    name: "Complete Virtual Tours",
    description: "All 360° monastery tours with audio guides in 5 languages",
    size: "2.3 GB",
    duration: "50+ tours",
    status: "available"
  },
  {
    id: 2,
    name: "Digital Archives Package",
    description: "High-resolution manuscripts, murals, and historical photos",
    size: "1.8 GB",
    duration: "500+ items",
    status: "available"
  },
  {
    id: 3,
    name: "Audio Guide Collection",
    description: "Smart audio guides for all major monasteries",
    size: "450 MB",
    duration: "25+ hours",
    status: "available"
  },
  {
    id: 4,
    name: "Interactive Maps",
    description: "Offline maps with monastery locations and travel routes",
    size: "120 MB",
    duration: "200+ locations",
    status: "downloading"
  }
]

const features = [
  {
    icon: WifiOff,
    title: "Full Offline Access",
    description: "Access all content without internet connection, perfect for remote monastery visits"
  },
  {
    icon: HardDrive,
    title: "Efficient Storage",
    description: "Optimized compression ensures maximum content with minimal storage impact"
  },
  {
    icon: CheckCircle,
    title: "Auto-Sync Updates",
    description: "Seamlessly sync new content when connected to WiFi"
  }
]

const OfflineMode = () => {
  const [downloadProgress, setDownloadProgress] = useState(45)
  const [selectedItems, setSelectedItems] = useState<number[]>([1, 2, 3])

  const toggleItem = (id: number) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const totalSize = downloadableContent
    .filter(item => selectedItems.includes(item.id))
    .reduce((total, item) => total + parseFloat(item.size), 0)

  return (
    <section id="offline-mode" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Offline <span className="text-primary">Access</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Download tours, guides, and archives for seamless exploration even in remote areas. 
            Experience monasteries without worrying about connectivity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Download Manager */}
          <motion.div 
            className="order-2 lg:order-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <div className="card-gradient rounded-2xl shadow-elevated overflow-hidden">
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-xl font-bold text-foreground">
                    Download Manager
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <HardDrive className="w-4 h-4" />
                    <span>{totalSize.toFixed(1)} GB selected</span>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Select content packages to download for offline use
                </p>
              </div>

              <div className="p-6">
                {/* Download Progress */}
                <div className="mb-6 p-4 bg-primary/5 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">
                      Interactive Maps
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {downloadProgress}%
                    </span>
                  </div>
                  <Progress value={downloadProgress} className="mb-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Download className="w-3 h-3" />
                    <span>54 MB of 120 MB • 2 minutes remaining</span>
                  </div>
                </div>

                {/* Content List */}
                <div className="space-y-3">
                  {downloadableContent.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 rounded-lg border transition-all duration-200 ${
                        selectedItems.includes(item.id)
                          ? 'bg-primary/5 border-primary/20'
                          : 'bg-muted/30 border-border'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => toggleItem(item.id)}
                            className="mt-1 w-4 h-4 text-primary rounded border-border focus:ring-primary"
                            disabled={item.status === "downloading"}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1">
                              {item.name}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <HardDrive className="w-3 h-3" />
                                <span>{item.size}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>{item.duration}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-3">
                          {item.status === "downloading" ? (
                            <div className="flex items-center gap-1 text-primary text-xs">
                              <Download className="w-3 h-3 animate-pulse" />
                              <span>Downloading</span>
                            </div>
                          ) : (
                            <CheckCircle className="w-5 h-5 text-accent" />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex gap-3">
                    <HeroButton variant="primary" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download Selected
                    </HeroButton>
                    <HeroButton variant="hero-outline">
                      <Wifi className="w-4 h-4" />
                    </HeroButton>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Features & App Download */}
          <motion.div 
            className="order-1 lg:order-2 space-y-8"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            {/* Features */}
            <div>
              <h3 className="font-display text-2xl font-bold text-foreground mb-6">
                Offline Capabilities
              </h3>
              <div className="space-y-4">
                {features.map((feature, index) => {
                  const IconComponent = feature.icon
                  return (
                    <motion.div
                      key={index}
                      className="flex gap-4 p-4 card-gradient rounded-xl shadow-soft"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      viewport={{ once: true }}
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">
                          {feature.title}
                        </h4>
                        <p className="text-muted-foreground text-sm">
                          {feature.description}
                        </p>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>

            {/* Mobile App Download */}
            <motion.div 
              className="card-gradient rounded-2xl p-6 shadow-soft"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-monastery rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  Mobile Application
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  Get the complete MonasteryView experience with our mobile app. 
                  Perfect for on-the-go exploration with full offline capabilities.
                </p>
                
                <div className="space-y-3">
                  <HeroButton variant="monastery" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download for iOS
                  </HeroButton>
                  <HeroButton variant="primary" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download for Android
                  </HeroButton>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                    <span>📱 iOS 14.0+</span>
                    <span>🤖 Android 8.0+</span>
                    <span>💾 Free Download</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Usage Statistics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            { label: "Downloads", value: "50K+", color: "text-primary" },
            { label: "Offline Tours", value: "50+", color: "text-secondary" },
            { label: "Languages", value: "5", color: "text-accent" },
            { label: "User Rating", value: "4.9", color: "text-primary" }
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

export default OfflineMode