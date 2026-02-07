import { useState } from 'react';
import { 
  ShieldAlert, 
  Phone, 
  MessageSquare, 
  MapPin, 
  ArrowRight,
  Heart,
  Activity,
  UserCheck
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PanicHelper from '@/components/tools/PanicHelper';

export default function CrisisSupport() {
  const [isPanicOpen, setIsPanicOpen] = useState(false);

  const emergencyContacts = [
    {
      name: 'Emergency Services',
      number: '112',
      desc: 'Immediate medical or police assistance',
      icon: ShieldAlert,
      color: 'bg-red-100 text-red-600',
      action: 'Call Now'
    },
    {
      name: 'Suicide Prevention Lifeline',
      number: '988',
      desc: '24/7, free and confidential support',
      icon: Phone,
      color: 'bg-orange-100 text-orange-600',
      action: 'Call Now'
    },
    {
      name: 'Crisis Text Line',
      number: 'Text HOME to 741741',
      desc: 'Text with a trained Crisis Counselor',
      icon: MessageSquare,
      color: 'bg-blue-100 text-blue-600',
      action: 'Text Now'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Hero Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-8 h-8 text-red-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-text mb-4">Crisis Support Center</h1>
          <p className="text-lg text-text-muted mb-8">
            You are not alone. Whether you're experiencing a crisis or just having a tough moment, 
            support is available right now.
          </p>
          
          <button 
            onClick={() => setIsPanicOpen(true)}
            className="btn bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200 text-lg px-8 py-4 w-full sm:w-auto flex items-center justify-center gap-3 transform hover:scale-105 transition-all"
          >
            <Activity className="w-6 h-6" />
            I Need Help Now (Panic Assist)
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Emergency Contacts */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-text flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Immediate Assistance
            </h2>
            <div className="grid gap-4">
              {emergencyContacts.map((contact, i) => (
                <div key={i} className="card flex flex-col sm:flex-row items-center gap-6 group hover:border-primary/20 transition-colors">
                  <div className={`w-14 h-14 rounded-2xl ${contact.color} flex items-center justify-center shrink-0`}>
                    <contact.icon className="w-7 h-7" />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="font-bold text-text text-lg">{contact.name}</h3>
                    <p className="text-text-muted">{contact.desc}</p>
                  </div>
                  <a 
                    href={contact.number.startsWith('Text') ? `sms:741741` : `tel:${contact.number}`}
                    className="btn btn-secondary min-w-[120px]"
                  >
                    {contact.action}
                  </a>
                </div>
              ))}
            </div>

            {/* Local Resources Placeholder */}
            <div className="bg-linear-to-br from-red-500 to-red-600 rounded-2xl p-8 mb-8 text-white shadow-xl relative overflow-hidden animate-pulse-slow">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-bold text-text mb-2">Campus Resources</h3>
                  <p className="text-sm text-text-muted mb-4">
                    Your university offers confidential counseling services. Walk-ins are welcome during business hours.
                  </p>
                  <ul className="space-y-2 text-sm text-text-muted mb-4">
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <strong>Student Health Center:</strong> Building A, Room 102
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                      <strong>After-Hours Line:</strong> (555) 012-3456
                    </li>
                  </ul>
                  <button className="text-indigo-600 font-semibold text-sm hover:underline">
                    View Interactive Campus Map →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Tools */}
          <div className="space-y-6">
            {/* Safety Plan Card */}
            <div className="card bg-gray-900 text-white overflow-hidden relative group cursor-pointer">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors" />
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">My Safety Plan</h3>
                <p className="text-gray-300 text-sm mb-6">
                  Access your personalized coping strategies and warning sign trackers.
                </p>
                <Link 
                  to="/student/safety-plan"
                  className="inline-flex items-center gap-2 text-sm font-bold hover:gap-3 transition-all"
                >
                  View Plan <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Quick Tips */}
            <div className="card">
              <h3 className="font-semibold text-text mb-4 text-sm uppercase tracking-wider">Grounding Techniques</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <span className="font-bold text-primary text-xl">01</span>
                  <div>
                    <h4 className="font-bold text-text text-sm">5-4-3-2-1 Technique</h4>
                    <p className="text-xs text-text-muted mt-1">
                      Name 5 things you see, 4 you feel, 3 hear, 2 smell, 1 taste.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary text-xl">02</span>
                  <div>
                    <h4 className="font-bold text-text text-sm">Box Breathing</h4>
                    <p className="text-xs text-text-muted mt-1">
                      Inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="font-bold text-primary text-xl">03</span>
                  <div>
                    <h4 className="font-bold text-text text-sm">Cold Water</h4>
                    <p className="text-xs text-text-muted mt-1">
                      Splash cold water on your face to trigger the dive reflex.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Professional Help */}
            <div className="card bg-green-50/50 border-green-100">
              <div className="flex items-center gap-3 mb-3">
                 <UserCheck className="w-5 h-5 text-green-600" />
                 <h3 className="font-bold text-green-900">Need a Professional?</h3>
              </div>
              <p className="text-xs text-green-800 mb-3">
                Our psychologists are here to help you build long-term resilience.
              </p>
              <Link to="/student/psychologists" className="btn btn-sm bg-white text-green-700 border-green-200 text-xs w-full">
                Book an Appointment
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <PanicHelper isOpen={isPanicOpen} onClose={() => setIsPanicOpen(false)} />
    </div>
  );
}
