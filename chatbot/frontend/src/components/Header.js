import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <motion.header
      data-testid="header"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 w-full z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/70 backdrop-blur-xl border-b border-white/30 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 flex items-center justify-between h-16">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="font-heading text-xl md:text-2xl font-medium text-forest tracking-tight"
          data-testid="brand-logo"
        >
          Sikkim Monastery
        </button>

        <nav className="hidden md:flex items-center gap-8" data-testid="main-nav">
          <button
            onClick={() => scrollTo('about')}
            className="font-body text-sm text-forest-light hover:text-monk-red transition-colors duration-300"
            data-testid="nav-discover"
          >
            Discover
          </button>
          <button
            onClick={() => scrollTo('gallery')}
            className="font-body text-sm text-forest-light hover:text-monk-red transition-colors duration-300"
            data-testid="nav-galleries"
          >
            Galleries
          </button>
          <button
            onClick={() => scrollTo('travel')}
            className="font-body text-sm text-forest-light hover:text-monk-red transition-colors duration-300"
            data-testid="nav-travel"
          >
            Travel Guides
          </button>
        </nav>

        <button
          onClick={() => {
            const evt = new CustomEvent('open-chatbot');
            window.dispatchEvent(evt);
          }}
          className="bg-monk-red text-bone px-5 py-2 rounded-full text-sm font-body font-medium hover:bg-monk-red/90 transition-all duration-300 hover:shadow-lg hover:shadow-monk-red/20"
          data-testid="speak-to-tenzin-btn"
        >
          Speak to Tenzin
        </button>
      </div>
    </motion.header>
  );
}
