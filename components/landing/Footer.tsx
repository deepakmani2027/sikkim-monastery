import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from "lucide-react"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-foreground text-background py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="font-display text-2xl font-bold mb-4">DharmaTech</h3>
            <p className="text-background/80 mb-6 leading-relaxed">
              Preserving Sikkim's sacred heritage through digital innovation. 
              We create immersive experiences that connect you with ancient wisdom 
              and cultural treasures of Himalayan monasteries.
            </p>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-secondary" />
                <span>+91 8709313047</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-secondary" />
                <span>verifymonastery@gmail.com</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-secondary mt-0.5" />
                <span>Digital Heritage Center, Gangtok, Sikkim 737101</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><a href="#virtual-tours" className="text-background/80 hover:text-secondary transition-colors duration-300">Virtual Tours</a></li>
              <li><a href="#interactive-map" className="text-background/80 hover:text-secondary transition-colors duration-300">Interactive Map</a></li>
              <li><a href="#digital-archives" className="text-background/80 hover:text-secondary transition-colors duration-300">Digital Archives</a></li>
              <li><a href="#cultural-calendar" className="text-background/80 hover:text-secondary transition-colors duration-300">Cultural Calendar</a></li>
              <li><a href="#smart-audio-guide" className="text-background/80 hover:text-secondary transition-colors duration-300">Audio Guide</a></li>
              <li><a href="#contact" className="text-background/80 hover:text-secondary transition-colors duration-300">Contact Us</a></li>
            </ul>
          </div>

          {/* Travel Services */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Heritage Services</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">360° Virtual Experiences</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Digital Preservation</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Cultural Workshops</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Educational Programs</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Research Collaboration</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Monastery Partnerships</a></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="font-semibold text-lg mb-4">Support & Info</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Technical Support</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">User Guidelines</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Privacy Policy</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Terms of Use</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">Accessibility</a></li>
              <li><a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t border-background/20 pt-8 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-3">Follow Our Heritage Journey</h4>
              <div className="flex gap-4">
                <a 
                  href="https://facebook.com/monasteryview" 
                  className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-foreground transition-all duration-300"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://instagram.com/monasteryview" 
                  className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-foreground transition-all duration-300"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://twitter.com/monasteryview" 
                  className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-foreground transition-all duration-300"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://youtube.com/monasteryview" 
                  className="w-10 h-10 bg-background/10 rounded-full flex items-center justify-center hover:bg-secondary hover:text-foreground transition-all duration-300"
                  aria-label="Subscribe to our YouTube channel"
                >
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="text-center md:text-right">
              <h4 className="font-semibold text-lg mb-2">Supported by</h4>
              <div className="text-background/80 text-sm space-y-1">
                <p>Government of Sikkim</p>
                <p>Buddhist Heritage Foundation</p>
                <p>Digital India Initiative</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 pt-8 text-center md:text-left">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-background/80 text-sm">
              © {currentYear} MonasteryView Digital Heritage Platform. All rights reserved. 
              Made for Digital Heritage Innovation.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-background/80 hover:text-secondary transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer