import React from 'react';
import { motion } from 'framer-motion';

const HERO_IMG = "https://static.prod-images.emergentagent.com/jobs/555f74e7-3ced-43c1-b248-5241d6ead246/images/77939d0fe256f28606a940074e8a51788a1d7de02ba3fbba68398e60eba31f85.png";

export default function HeroSection() {
  return (
    <section data-testid="hero-section" className="relative min-h-screen flex items-center bg-bone pt-16">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="order-2 lg:order-1"
          >
            <p className="uppercase text-xs tracking-[0.2em] font-medium text-monk-red mb-6 font-body">
              Sacred Journeys of Sikkim
            </p>
            <h1 className="font-heading text-5xl sm:text-6xl lg:text-7xl font-medium text-forest leading-[1.05] tracking-tight mb-8">
              Awaken Your<br />
              <span className="italic text-monk-red">Inner Pilgrim</span>
            </h1>
            <p className="font-body text-base md:text-lg text-forest-light leading-relaxed max-w-md mb-10">
              Discover peace in Sikkim's ancient monasteries. Let the mountains guide your breath, 
              and the prayer flags carry your thoughts into the vast sky.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-monk-red text-bone px-8 py-3.5 rounded-full font-body font-medium text-sm hover:bg-monk-red/90 transition-all duration-300 hover:shadow-xl hover:shadow-monk-red/20 hover:-translate-y-0.5"
                data-testid="explore-monasteries-btn"
              >
                Explore Monasteries
              </button>
              <button
                onClick={() => {
                  const evt = new CustomEvent('open-chatbot');
                  window.dispatchEvent(evt);
                }}
                className="border border-forest/20 text-forest px-8 py-3.5 rounded-full font-body font-medium text-sm hover:bg-forest hover:text-bone transition-all duration-300"
                data-testid="meet-tenzin-btn"
              >
                Meet Tenzin
              </button>
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="order-1 lg:order-2"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-sage/10 rounded-3xl -rotate-2" />
              <img
                src={HERO_IMG}
                alt="Serene Sikkim monastery at golden hour"
                className="relative w-full rounded-2xl object-cover shadow-2xl shadow-forest/10"
                style={{ maxHeight: '560px' }}
                data-testid="hero-image"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-6 h-10 border-2 border-forest/30 rounded-full flex justify-center pt-2"
        >
          <div className="w-1.5 h-1.5 bg-monk-red rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
