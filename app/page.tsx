import dynamic from "next/dynamic"
const Hero = dynamic(() => import("@/components/landing/Hero"), { ssr: false })
import VirtualTours from "@/components/landing/VirtualTours"
import InteractiveMap from "@/components/landing/InteractiveMap"
import DigitalArchives from "@/components/landing/DigitalArchives"
import CulturalCalendar from "@/components/landing/CulturalCalendar"
import SmartAudioGuide from "@/components/landing/SmartAudioGuide"
import Newsletter from "@/components/landing/Newsletter"
import ContactForm from "@/components/landing/ContactForm"
import Footer from "@/components/landing/Footer"
import { PublicTopbar } from "@/components/layout/PublicTopbar"
import { SectionReveal } from "@/components/layout/SectionReveal"
import { FloatingCTA } from "@/components/layout/FloatingCTA"

export default function HomePage() {
  return (
    <main className="min-h-screen">
  <PublicTopbar hideVirtualTours />
      <div className="animate-in fade-in slide-in-from-top-2 duration-700">
        <Hero />
      </div>
      <SectionReveal id="explore">
        <VirtualTours />
      </SectionReveal>
      <SectionReveal>
        <InteractiveMap />
      </SectionReveal>
      <SectionReveal id="archives">
        <DigitalArchives />
      </SectionReveal>
      <SectionReveal>
        <CulturalCalendar />
      </SectionReveal>
      <SmartAudioGuide />
      <Newsletter />
      <ContactForm />
      <FloatingCTA />
      <Footer />
    </main>
  )
}
