import { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send, MessageCircle, CheckCircle } from 'lucide-react';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send to a backend
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
      details: ['mindwell@univ-eltaref.dz', 'support@mindwell.dz']
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
      a: 'Simply create an account on MindWell, browse our psychologists, and book a time that works for you. Your first 5 sessions each semester are free.'
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

              {/* Map Placeholder */}
              <div className="mt-8 bg-gray-200 rounded-2xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-text-muted">Interactive map coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
