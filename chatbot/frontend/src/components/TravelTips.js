import React from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Mountain, HandHelping, Sun, Car, Backpack } from 'lucide-react';

const iconMap = {
  scroll: ScrollText,
  mountain: Mountain,
  'hands-praying': HandHelping,
  sun: Sun,
  car: Car,
  backpack: Backpack,
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' }
  })
};

export default function TravelTips({ tips }) {
  if (!tips || tips.length === 0) return null;

  return (
    <section id="travel" data-testid="travel-section" className="py-24 md:py-32 bg-bone">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="uppercase text-xs tracking-[0.2em] font-medium text-monk-red mb-4 font-body">
            Prepare Your Journey
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium text-forest tracking-tight">
            Travel Wisdom
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tips.map((tip, i) => {
            const Icon = iconMap[tip.icon] || ScrollText;
            return (
              <motion.div
                key={tip.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-sand/50 border border-border-subtle rounded-2xl p-8 hover:bg-sand transition-colors duration-400"
                data-testid={`travel-tip-${tip.id}`}
              >
                <div className="w-12 h-12 rounded-xl bg-monk-red/10 flex items-center justify-center mb-5">
                  <Icon size={22} className="text-monk-red" />
                </div>
                <h3 className="font-heading text-xl font-medium text-forest mb-3">{tip.title}</h3>
                <p className="font-body text-sm text-forest-light leading-relaxed">{tip.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
