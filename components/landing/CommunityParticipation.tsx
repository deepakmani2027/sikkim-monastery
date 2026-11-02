import { useState } from "react"
import { motion } from "framer-motion"
import { Upload, Camera, Mic, FileText, Users, Heart, Award, CheckCircle } from "lucide-react"
import { HeroButton } from "@/components/ui/hero-button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface ContributionType {
  id: string
  name: string
  icon: any
  description: string
  examples: string[]
}

const contributionTypes: ContributionType[] = [
  {
    id: "photo",
    name: "Historical Photos",
    icon: Camera,
    description: "Share historical monastery photographs from family collections",
    examples: ["Old monastery ceremonies", "Historical monastery structures", "Community gatherings"]
  },
  {
    id: "story",
    name: "Oral Histories", 
    icon: Mic,
    description: "Record and preserve stories from elders and local community",
    examples: ["Foundation stories", "Miraculous events", "Cultural practices"]
  },
  {
    id: "document",
    name: "Documents & Texts",
    icon: FileText,
    description: "Contribute manuscripts, texts, or written historical records",
    examples: ["Family records", "Historical documents", "Traditional recipes"]
  },
  {
    id: "artifact",
    name: "Cultural Artifacts",
    icon: Award,
    description: "Document traditional items and their cultural significance",
    examples: ["Traditional tools", "Ceremonial items", "Handicrafts"]
  }
]

const recentContributions = [
  {
    id: 1,
    contributor: "Pemba Sherpa",
    type: "photo",
    title: "Rumtek Monastery Foundation Ceremony 1960",
    date: "2 days ago",
    status: "verified"
  },
  {
    id: 2,
    contributor: "Dolma Bhutia",
    type: "story",
    title: "Stories of Guru Rinpoche at Tashiding",
    date: "1 week ago",
    status: "verified"
  },
  {
    id: 3,
    contributor: "Tenzin Norbu",
    type: "document",
    title: "Traditional Festival Calendar",
    date: "2 weeks ago",
    status: "processing"
  }
]

const CommunityParticipation = () => {
  const [selectedType, setSelectedType] = useState<string>("")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    monastery: "",
    year: "",
    contributor: "",
    email: "",
    language: ""
  })
  const [files, setFiles] = useState<File[]>([])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    setFiles(prev => [...prev, ...uploadedFiles])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Contribution submitted:", { formData, selectedType, files })
    // In a real implementation, this would upload to server
  }

  return (
    <section id="community-participation" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-6">
            Community <span className="text-primary">Contributions</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Help preserve our heritage by sharing your photos, stories, and artifacts. 
            Together, we create a living archive of Sikkim's monastic traditions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          {/* Contribution Types */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="font-display text-xl font-bold text-foreground mb-6">
              What Can You Contribute?
            </h3>
            <div className="space-y-4">
              {contributionTypes.map((type) => {
                const IconComponent = type.icon
                return (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                      selectedType === type.id
                        ? 'bg-primary/10 border-2 border-primary shadow-soft'
                        : 'bg-card hover:bg-muted border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        selectedType === type.id ? 'bg-primary/20' : 'bg-muted'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${
                          selectedType === type.id ? 'text-primary' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground mb-1">
                          {type.name}
                        </h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {type.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Examples: {type.examples.join(", ")}
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Upload Form */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <div className="card-gradient rounded-2xl shadow-elevated overflow-hidden">
              <div className="p-6 border-b border-border">
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  Contribute to Heritage Archive
                </h3>
                <p className="text-muted-foreground text-sm">
                  Share your historical materials to help preserve our cultural heritage
                </p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Monastery Festival 1975"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monastery">Related Monastery</Label>
                    <Select value={formData.monastery} onValueChange={(value) => handleInputChange("monastery", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select monastery" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rumtek">Rumtek Monastery</SelectItem>
                        <SelectItem value="tashiding">Tashiding Monastery</SelectItem>
                        <SelectItem value="pemayangtse">Pemayangtse Monastery</SelectItem>
                        <SelectItem value="enchey">Enchey Monastery</SelectItem>
                        <SelectItem value="dubdi">Dubdi Monastery</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="year">Year/Period</Label>
                    <Input
                      id="year"
                      placeholder="e.g., 1975 or 1970s"
                      value={formData.year}
                      onChange={(e) => handleInputChange("year", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="language">Language</Label>
                    <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="english">English</SelectItem>
                        <SelectItem value="nepali">Nepali</SelectItem>
                        <SelectItem value="tibetan">Tibetan</SelectItem>
                        <SelectItem value="hindi">Hindi</SelectItem>
                        <SelectItem value="lepcha">Lepcha</SelectItem>
                        <SelectItem value="bhutia">Bhutia</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the historical significance, context, and any stories associated with this contribution..."
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    className="min-h-24"
                    required
                  />
                </div>

                {/* File Upload */}
                <div>
                  <Label htmlFor="files">Upload Files</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                    <input
                      type="file"
                      id="files"
                      multiple
                      accept="image/*,audio/*,video/*,.pdf,.doc,.docx"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label htmlFor="files" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-foreground font-medium mb-2">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Photos, videos, audio recordings, or documents
                      </p>
                    </label>
                  </div>
                  
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="text-sm text-foreground">{file.name}</span>
                          <span className="text-xs text-muted-foreground ml-auto">
                            {(file.size / 1024 / 1024).toFixed(1)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Contributor Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contributor">Your Name *</Label>
                    <Input
                      id="contributor"
                      placeholder="Your full name"
                      value={formData.contributor}
                      onChange={(e) => handleInputChange("contributor", e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <HeroButton type="submit" variant="monastery" className="flex-1">
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Contribution
                  </HeroButton>
                  <HeroButton type="button" variant="hero-outline">
                    Save Draft
                  </HeroButton>
                </div>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Recent Contributions */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          viewport={{ once: true }}
        >
          <h3 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Recent Community Contributions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentContributions.map((contribution) => {
              const type = contributionTypes.find(t => t.id === contribution.type)
              const IconComponent = type?.icon || FileText
              
              return (
                <motion.div
                  key={contribution.id}
                  className="card-gradient rounded-xl p-6 shadow-soft"
                  whileHover={{ y: -4 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: contribution.id * 0.1 }}
                  viewport={{ once: true }}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground mb-1 truncate">
                        {contribution.title}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        By {contribution.contributor}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-4 h-4 text-accent" />
                      <span className="text-xs text-accent">
                        {contribution.status === "verified" ? "Verified" : "Processing"}
                      </span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {contribution.date}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Impact Statistics */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          viewport={{ once: true }}
        >
          {[
            { label: "Contributors", value: "200+", icon: Users, color: "text-primary" },
            { label: "Items Archived", value: "1.2K", icon: Award, color: "text-secondary" },
            { label: "Stories Preserved", value: "350", icon: Heart, color: "text-accent" },
            { label: "Monasteries Covered", value: "50+", icon: CheckCircle, color: "text-primary" }
          ].map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="text-center">
                <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <IconComponent className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-2xl font-bold font-display ${stat.color}`}>
                  {stat.value}
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

export default CommunityParticipation