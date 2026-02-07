import { Video, Users, Calendar, MessageCircle, Brain, Heart, Shield, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Services() {
  const services = [
    {
      icon: Video,
      title: 'Virtual Therapy Sessions',
      desc: 'Connect with licensed psychologists through secure video calls from anywhere on campus or home.',
      features: ['HD video quality', 'End-to-end encryption', 'Flexible scheduling', 'Session recording (optional)'],
      color: 'blue'
    },
    {
      icon: Users,
      title: 'In-Person Counseling',
      desc: 'Visit our counseling center for face-to-face sessions with experienced therapists.',
      features: ['Private consultation rooms', 'Walk-in availability', 'Extended hours', 'Comfortable environment'],
      color: 'purple'
    },
    {
      icon: MessageCircle,
      title: 'Chat Support',
      desc: 'Text-based support for when you need someone to talk to but prefer typing.',
      features: ['Real-time messaging', 'Secure chat history', 'Available 24/7', 'Anonymous option'],
      color: 'green'
    },
    {
      icon: Brain,
      title: 'Group Therapy',
      desc: 'Join peer support groups led by professionals to share experiences and grow together.',
      features: ['Topic-based groups', 'Peer support', 'Professional moderation', 'Community building'],
      color: 'amber'
    },
    {
      icon: Heart,
      title: 'Wellness Programs',
      desc: 'Structured programs designed to build mental resilience and healthy habits.',
      features: ['Mindfulness sessions', 'Stress management', 'Sleep improvement', 'Healthy coping skills'],
      color: 'rose'
    },
    {
      icon: Shield,
      title: 'Crisis Support',
      desc: '24/7 crisis intervention for students in urgent need of mental health support.',
      features: ['Always available', 'Trained responders', 'Immediate assistance', 'Follow-up care'],
      color: 'red'
    },
  ];

  const colorClasses: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
    purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
    green: { bg: 'bg-green-100', text: 'text-green-600' },
    amber: { bg: 'bg-amber-100', text: 'text-amber-600' },
    rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
    red: { bg: 'bg-red-100', text: 'text-red-600' },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="relative py-24 bg-linear-to-br from-primary/10 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-text-heading font-display mb-6">
            Our Services
          </h1>
          <p className="text-xl text-text-muted max-w-3xl mx-auto leading-relaxed">
            Comprehensive mental health services designed specifically for university students. 
            Choose the support that works best for you.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all group">
                <div className={`w-14 h-14 rounded-xl ${colorClasses[service.color].bg} ${colorClasses[service.color].text} flex items-center justify-center mb-4`}>
                  <service.icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-text-heading mb-2 group-hover:text-primary transition-colors">{service.title}</h3>
                <p className="text-text-muted mb-4">{service.desc}</p>
                <ul className="space-y-2">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-text-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-heading font-display mb-4">Affordable Care</h2>
            <p className="text-text-muted text-lg">All services are free or heavily subsidized for El Taref University students.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">Individual Session</h3>
              <p className="text-3xl font-bold text-primary mb-2">Free</p>
              <p className="text-text-muted text-sm">First 5 sessions per semester</p>
            </div>
            <div className="bg-primary p-8 rounded-2xl text-white text-center transform scale-105 shadow-xl">
              <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold mb-2">Group Sessions</h3>
              <p className="text-3xl font-bold mb-2">Free</p>
              <p className="text-white/80 text-sm">Unlimited group therapy</p>
            </div>
            <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm text-center">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-heading mb-2">Extended Care</h3>
              <p className="text-3xl font-bold text-primary mb-2">500 DZD</p>
              <p className="text-text-muted text-sm">Per additional session</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-text-heading font-display mb-6">Ready to Get Started?</h2>
          <p className="text-text-muted text-lg mb-8">
            Book your first session today and take the first step towards better mental health.
          </p>
          <Link 
            to="/register" 
            className="inline-flex items-center gap-2 btn-primary text-lg px-8 py-4"
          >
            Book a Session
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
