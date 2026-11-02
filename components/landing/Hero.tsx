"use client";

import { HeroButton } from "@/components/ui/hero-button";
import { ChevronDown, Play, Map } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Hero() {
  const router = useRouter();
  const scrollToVirtualTours = () => {
    document.getElementById("explore")?.scrollIntoView({ behavior: "smooth" });
  };
  const scrollToArchives = () => {
    document.getElementById("archives")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/hero-monastery-panorama.jpg')" }}
        role="img"
        aria-label="Panoramic view of traditional Buddhist monastery in Sikkim mountains at golden hour with prayer flags and Himalayan peaks"
      />
      <div className="absolute inset-0 hero-overlay" />

      <motion.div
        className="relative z-10 text-center text-white px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <motion.h1
          className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-6 text-balance"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Sacred Journeys,
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-amber-400 to-orange-500 bg-clip-text text-transparent">
            Seamlessly Connected.
          </span>
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl md:text-2xl mb-2 font-body font-light max-w-3xl mx-auto opacity-90 text-balance text-shadow-subtle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Experience the sacred, preserve the heritage.
        </motion.p>

        <motion.p
          className="text-base sm:text-lg md:text-xl mb-8 font-body font-light max-w-3xl mx-auto opacity-80 text-balance text-shadow-subtle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          Explore Sikkim's 200+ monasteries through immersive virtual tours, digital archives, and interactive cultural experiences.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <HeroButton
            variant="saffron"
            size="lg"
            onClick={() => router.push("/auth")}
            className="min-w-56"
          >
            <Play className="w-5 h-5 mr-2" />
            Explore Virtual Tours
          </HeroButton>
          <HeroButton variant="hero-outline" size="lg" className="min-w-48" onClick={scrollToArchives}>
            <Map className="w-5 h-5 mr-2" />
            View Archives
          </HeroButton>
        </motion.div>
      </motion.div>

      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/80"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        <button
          onClick={scrollToVirtualTours}
          className="flex flex-col items-center gap-2 hover:text-white transition-colors duration-300"
          aria-label="Scroll to virtual tours section"
        >
          <span className="text-sm font-body">Discover monasteries</span>
          <ChevronDown className="w-6 h-6" />
        </button>
      </motion.div>
    </section>
  );
}