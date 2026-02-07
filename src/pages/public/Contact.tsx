import { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';

// El Taref University coordinates - outside component to avoid useEffect dependencies
const UNIVERSITY_LOCATION = { lat: 36.7667, lng: 8.3167 };

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Dynamically load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    
    // Load Leaflet JS
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = () => setMapLoaded(true);
    document.body.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (mapLoaded && (window as unknown as { L: typeof import('leaflet') }).L) {
      const L = (window as unknown as { L: typeof import('leaflet') }).L;
      
      // Check if map already exists
      const container = document.getElementById('contact-map');
      if (container && !(container as unknown as { _leaflet_id?: number })._leaflet_id) {
        const map = L.map('contact-map').setView([UNIVERSITY_LOCATION.lat, UNIVERSITY_LOCATION.lng], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map);

        // Custom marker icon
        const customIcon = L.divIcon({
          html: `<div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 3px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.3);"></div>`,
          iconSize: [40, 40],
          iconAnchor: [20, 40],
          className: ''
        });

        L.marker([UNIVERSITY_LOCATION.lat, UNIVERSITY_LOCATION.lng], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="text-align: center; padding: 8px;">
              <strong style="font-size: 14px;">Rahatek Counseling Center</strong><br/>
              <span style="color: #666; font-size: 12px;">El Taref University Campus</span><br/>
              <span style="color: #666; font-size: 12px;">Building C, Ground Floor</span>
            </div>
          `)
          .openPopup();
      }
    }
  }, [mapLoaded]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: ['University Counseling Center', 'Building C, Ground Floor', 'El Taref University Campus']
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: ['+213 38 XX XX XX', 'Emergency: +213 38 XX XX XX']
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: ['rahatek@univ-eltaref.dz', 'support@rahatek.dz']
    },
    {
      icon: Clock,
      title: 'Office Hours',
      details: ['Sun - Thu: 8:00 AM - 5:00 PM', 'Fri - Sat: Closed', 'Crisis line available 24/7']
    },
  ];

  const faqs = [
    {
      q: 'Is counseling confidential?',
      a: 'Yes, all counseling sessions are completely confidential. Information is only shared with your explicit consent or in rare cases where safety is a concern.'
    },
    {
      q: 'How do I book my first appointment?',
      a: 'Simply create an account on Rahatek, browse our psychologists, and book a time that works for you. Your first 5 sessions each semester are free.'
    },
    {
      q: 'Can I switch psychologists?',
      a: 'Absolutely. Finding the right fit is important. You can switch psychologists at any time without any explanation needed.'
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-24 bg-linear-to-br from-primary/10 via-white to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading font-display mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Have questions? We're here to help. Reach out through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Info Grid */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((info) => (
              <div key={info.title} className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <info.icon className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-text-heading mb-2">{info.title}</h3>
                {info.details.map((detail, i) => (
                  <p key={i} className="text-text-muted text-sm">{detail}</p>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQs */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Form */}
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-bold text-text-heading">Send us a Message</h2>
              </div>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-text-heading mb-2">Message Sent!</h3>
                  <p className="text-text-muted">We'll get back to you as soon as possible.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-text-heading mb-2">Your Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text-heading mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-2">Subject</label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
                      placeholder="How can we help?"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-heading mb-2">Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Write your message here..."
                    />
                  </div>
                  <button type="submit" className="w-full btn-primary flex items-center justify-center gap-2 py-4">
                    <Send className="w-5 h-5" />
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* FAQs */}
            <div>
              <h2 className="text-2xl font-bold text-text-heading mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
                {faqs.map((faq, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100">
                    <h3 className="font-semibold text-text-heading mb-2">{faq.q}</h3>
                    <p className="text-text-muted text-sm leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>

              {/* Interactive Map */}
              <div className="mt-8">
                <h3 className="text-lg font-bold text-text-heading mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Find Us on the Map
                </h3>
                <div 
                  id="contact-map" 
                  className="w-full h-64 rounded-2xl overflow-hidden shadow-lg border border-gray-200"
                  style={{ background: '#e5e7eb' }}
                >
                  {!mapLoaded && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-text-muted text-sm">Loading map...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

