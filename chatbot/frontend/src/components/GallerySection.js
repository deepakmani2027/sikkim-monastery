import React from 'react';
import { motion } from 'framer-motion';

const GALLERY_IMAGES = {
  meditation: "https://static.prod-images.emergentagent.com/jobs/555f74e7-3ced-43c1-b248-5241d6ead246/images/ff8af45b4515b9080cc48fe6bf96eb57bc37734ca6234c4e0fc8407c6eca09e6.png",
  landscape1: "https://images.unsplash.com/photo-1750600451617-7c1dd5927edc?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwyfHxzaWtraW0lMjBtb25hc3RlcnklMjBtb3VudGFpbnN8ZW58MHx8fHwxNzc1Mzc5MTQ3fDA&ixlib=rb-4.1.0&q=85",
  landscape2: "https://images.unsplash.com/photo-1741535796028-d50429641bac?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxzaWtraW0lMjBtb25hc3RlcnklMjBtb3VudGFpbnN8ZW58MHx8fHwxNzc1Mzc5MTQ3fDA&ixlib=rb-4.1.0&q=85",
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: i * 0.15, ease: 'easeOut' }
  })
};

export default function GallerySection({ monasteries }) {
  const displayMonasteries = monasteries.slice(0, 6);

  return (
    <section id="gallery" data-testid="gallery-section" className="py-24 md:py-32 bg-sand/40">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="uppercase text-xs tracking-[0.2em] font-medium text-monk-red mb-4 font-body">
            Sacred Spaces
          </p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-medium text-forest tracking-tight">
            Monastery Gallery
          </h2>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Large card - Meditation details */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-8 md:row-span-2 group relative overflow-hidden rounded-2xl border border-border-subtle"
            data-testid="gallery-card-meditation"
          >
            <img
              src={GALLERY_IMAGES.meditation}
              alt="Meditation details"
              className="w-full h-[300px] md:h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute bottom-6 left-6 right-6">
                <p className="font-heading text-2xl text-bone">Sacred Meditation</p>
                <p className="font-body text-sm text-bone/80 mt-2">Ancient rituals preserved through centuries of devotion</p>
              </div>
            </div>
          </motion.div>

          {/* Landscape 1 */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-4 group relative overflow-hidden rounded-2xl border border-border-subtle"
            data-testid="gallery-card-landscape1"
          >
            <img
              src={GALLERY_IMAGES.landscape1}
              alt="Sikkim mountain temple"
              className="w-full h-[240px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-heading text-lg text-bone">Mountain Temples</p>
              </div>
            </div>
          </motion.div>

          {/* Landscape 2 */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="md:col-span-4 group relative overflow-hidden rounded-2xl border border-border-subtle"
            data-testid="gallery-card-landscape2"
          >
            <img
              src={GALLERY_IMAGES.landscape2}
              alt="Sikkim village and mountains"
              className="w-full h-[240px] object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <div className="absolute bottom-4 left-4 right-4">
                <p className="font-heading text-lg text-bone">Himalayan Villages</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Monastery Cards */}
        {displayMonasteries.length > 0 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayMonasteries.map((m, i) => (
              <motion.div
                key={m.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-50px" }}
                className="bg-bone border border-border-subtle rounded-2xl overflow-hidden group hover:shadow-lg transition-shadow duration-500"
                data-testid={`monastery-card-${m.id}`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={m.image_url}
                    alt={m.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <p className="uppercase text-xs tracking-[0.15em] font-medium text-monk-red mb-2 font-body">
                    Est. {m.founded}
                  </p>
                  <h3 className="font-heading text-xl font-medium text-forest mb-2">{m.name}</h3>
                  <p className="font-body text-sm text-forest-light leading-relaxed line-clamp-3 mb-4">
                    {m.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {m.highlights.slice(0, 2).map((h, idx) => (
                      <span key={idx} className="bg-sand px-3 py-1 rounded-full text-xs font-body text-forest-light">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
