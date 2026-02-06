import { Link } from 'react-router-dom';
import { Brain, Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, Heart } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block text-xl font-bold text-text-heading font-display">MindWell</span>
                <span className="text-xs text-text-muted font-medium">EL TAREF UNIVERSITY</span>
              </div>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Empowering students with accessible mental health support and resources. 
              Together, we build a resilient and thriving university community.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary hover:bg-primary hover:text-white transition-all duration-300">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-text-heading font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-text-muted hover:text-primary transition-colors text-sm">About Us</Link></li>
              <li><Link to="/services" className="text-text-muted hover:text-primary transition-colors text-sm">Our Services</Link></li>
              <li><Link to="/login" className="text-text-muted hover:text-primary transition-colors text-sm">Find a Psychologist</Link></li>
              <li><Link to="/login" className="text-text-muted hover:text-primary transition-colors text-sm">Book Appointment</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-text-heading font-semibold mb-6">Resources</h3>
            <ul className="space-y-4">
              <li><Link to="/resources" className="text-text-muted hover:text-primary transition-colors text-sm">Mental Health Library</Link></li>
              <li><Link to="/contact" className="text-text-muted hover:text-primary transition-colors text-sm">Emergency Contacts</Link></li>
              <li><Link to="/faq" className="text-text-muted hover:text-primary transition-colors text-sm">FAQs</Link></li>
              <li><Link to="/about" className="text-text-muted hover:text-primary transition-colors text-sm">Student Life</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-text-heading font-semibold mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-text-muted text-sm">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <span>University Campus, El Taref<br />Algeria</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted text-sm">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>+213 38 70 00 00</span>
              </li>
              <li className="flex items-center gap-3 text-text-muted text-sm">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>support@univ-eltaref.dz</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {currentYear} El Taref University. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-text-muted">
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link to="/accessibility" className="hover:text-primary transition-colors">Accessibility</Link>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-muted">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
            <span>for Students</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
