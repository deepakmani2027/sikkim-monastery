import React from 'react';
import { motion } from 'framer-motion';

const PRAYER_FLAGS_IMG = "https://images.unsplash.com/photo-1635390335522-ca0b7ff2fa71?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NjZ8MHwxfHNlYXJjaHwzfHxidWRkaGlzdCUyMHByYXllciUyMGZsYWdzfGVufDB8fHx8MTc3NTM3OTE0N3ww&ixlib=rb-4.1.0&q=85";

export default function AboutSection() {
  return (
    <section id="about" data-testid="about-section" className="py-24 md:py-32 bg-bone relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Quote side */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7"
          >
            <p className="uppercase text-xs tracking-[0.2em] font-medium text-monk-red mb-8 font-body">
              The Path Within
            </p>
            <blockquote className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium text-forest leading-[1.2] tracking-tight mb-8">
              "The journey within is the <span className="italic text-monk-red">spiritual travel</span> deeper into your soul..."
            </blockquote>
            <p className="font-body text-base md:text-lg text-forest-light leading-relaxed max-w-lg">
              Sikkim, nestled in the eastern Himalayas, is home to over 200 monasteries 
              that have preserved Buddhist traditions for centuries. Each monastery tells 
              a story of devotion, artistry, and the eternal quest for inner peace.
            </p>
            <div className="mt-10 flex gap-12">
              <div>
                <p className="font-heading text-4xl font-medium text-monk-red">200+</p>
                <p className="font-body text-sm text-forest-light mt-1">Monasteries</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-medium text-monk-red">300+</p>
                <p className="font-body text-sm text-forest-light mt-1">Years of Heritage</p>
              </div>
              <div>
                <p className="font-heading text-4xl font-medium text-monk-red">4</p>
                <p className="font-body text-sm text-forest-light mt-1">Districts</p>
              </div>
            </div>
          </motion.div>

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="relative">
              <div className="absolute -inset-6 bg-sand rounded-3xl rotate-3" />
              <img
                src={PRAYER_FLAGS_IMG}
                alt="Buddhist prayer flags"
                className="relative w-full h-[400px] lg:h-[500px] object-cover rounded-2xl"
                data-testid="about-image"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
