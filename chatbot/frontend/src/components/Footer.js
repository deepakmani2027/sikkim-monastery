import React from 'react';

export default function Footer() {
  return (
    <footer data-testid="footer" className="py-16 bg-forest text-bone/80">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div>
            <h3 className="font-heading text-2xl font-medium text-bone mb-4">Sikkim Monastery</h3>
            <p className="font-body text-sm leading-relaxed text-bone/60">
              A digital experience to explore the sacred monasteries of Sikkim. 
              May your journey bring you inner peace and wisdom.
            </p>
          </div>
          <div>
            <h4 className="font-body text-sm font-medium text-bone uppercase tracking-widest mb-4">Explore</h4>
            <ul className="space-y-2 font-body text-sm text-bone/60">
              <li><button onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-bone transition-colors">About Sikkim</button></li>
              <li><button onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-bone transition-colors">Monastery Gallery</button></li>
              <li><button onClick={() => document.getElementById('travel')?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-bone transition-colors">Travel Guides</button></li>
            </ul>
          </div>
          <div>
            <h4 className="font-body text-sm font-medium text-bone uppercase tracking-widest mb-4">Connect</h4>
            <p className="font-body text-sm text-bone/60">
              Click the monk avatar at the bottom-right corner to speak with Tenzin, your virtual monk guide.
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-bone/10 text-center">
          <p className="font-body text-xs text-bone/40">
            Om Mani Padme Hum — The jewel is in the lotus
          </p>
        </div>
      </div>
    </footer>
  );
}
