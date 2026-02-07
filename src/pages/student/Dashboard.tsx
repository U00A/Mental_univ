import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Heart, 
  BookOpen, 
  Shield, 
  Users, 
  Leaf, 
  Trophy,
  ArrowRight,
  Sparkles,
  Zap,
  Brain,
  MessageSquare
} from 'lucide-react';
import { getAppointments, type Appointment } from '@/lib/firestore';

export default function StudentDashboard() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  });
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    async function fetchNextAppointment() {
      if (user) {
        try {
          const apts = await getAppointments(user.uid, 'student');
          const upcoming = apts
            .filter(a => a.status === 'confirmed' && new Date(a.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setNextAppointment(upcoming[0] || null);
        } catch (error) {
          console.error("Failed to fetch appointments", error);
        }
      }
    }
    fetchNextAppointment();
  }, [user]);

  const features = [
    {
      title: 'Find a Psychologist',
      desc: 'Browse verified professionals for therapy.',
      icon: Users,
      color: 'from-blue-500 to-indigo-600',
      href: '/student/psychologists',
      action: 'Book Now'
    },
    {
      title: 'Wellness Tools',
      desc: 'Mood tracking, journaling, and goals.',
      icon: Heart, 
      color: 'from-green-500 to-teal-600',
      href: '/student/wellness',
      action: 'Open Tools'
    },
    {
      title: 'Community Groups',
      desc: 'Connect with peers in safe spaces.',
      icon: Leaf,
      color: 'from-teal-500 to-cyan-600',
      href: '/student/groups',
      action: 'Join Discussion'
    },
    {
      title: 'Resources',
      desc: 'Articles, videos, and self-help guides.',
      icon: BookOpen,
      color: 'from-purple-500 to-violet-600',
      href: '/student/resources',
      action: 'Learn'
    },
    {
      title: 'Safety Plan',
      desc: 'Your emergency coping strategy.',
      icon: Shield,
      color: 'from-red-500 to-rose-600',
      href: '/student/safety-plan',
      action: 'View Plan'
    },
    {
      title: 'Challenges',
      desc: 'Daily tasks to boost your mental health.',
      icon: Trophy,
      color: 'from-orange-500 to-amber-600',
      href: '/student/challenges',
      action: 'Start Challenge'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white p-8 sm:p-10 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-semibold backdrop-blur-sm border border-white/10 uppercase tracking-wider">
              Student Portal
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">
            {greeting}, {profile?.displayName?.split(' ')[0] || 'Student'}!
          </h1>
          <p className="text-white/80 text-lg mb-8 leading-relaxed max-w-lg">
            Ready to take care of your mind today? Choose a tool below or check your upcoming schedule.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/student/wellness')}
              className="px-6 py-3 bg-white text-primary font-semibold rounded-xl shadow-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Check In
            </button>
            <button 
              onClick={() => navigate('/student/messages')}
              className="px-6 py-3 bg-white/20 text-white font-semibold rounded-xl backdrop-blur-md border border-white/20 hover:bg-white/30 transition-colors flex items-center gap-2"
            >
              <MessageSquare className="w-5 h-5" />
              Messages
            </button>
          </div>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
      </section>

      {/* Status Bar: Next Appointment & Daily Inspiration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Appointment Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            {nextAppointment && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full uppercase">Confirmed</span>}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Next Session</h3>
            {nextAppointment ? (
              <>
                <p className="text-2xl font-bold text-blue-600 mb-1">
                  {new Date(nextAppointment.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                </p>
                <p className="text-gray-500 flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  {nextAppointment.time} with Dr. {nextAppointment.psychologistName}
                </p>
                <button 
                  onClick={() => navigate(`/student/session/${nextAppointment.id}`)}
                  className="mt-4 w-full py-2 bg-blue-600/10 text-blue-700 font-semibold rounded-lg hover:bg-blue-600 hover:text-white transition-all text-sm"
                >
                  Join Waiting Room
                </button>
              </>
            ) : (
              <>
                <p className="text-gray-500 mb-4">No upcoming sessions scheduled.</p>
                <Link to="/student/psychologists" className="text-primary font-medium hover:underline flex items-center gap-1 group">
                  Find a psychologist <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Daily Insight / Quick Action */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 shadow-sm border border-amber-100 overflow-hidden relative">
           <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-white text-amber-500 rounded-xl shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Daily Thought</h3>
            <blockquote className="text-gray-600 italic mb-4 leading-relaxed">
              "You don't have to control your thoughts. You just have to stop letting them control you."
            </blockquote>
            <div className="flex gap-2">
               <button onClick={() => navigate('/student/challenges')} className="text-sm font-semibold text-amber-700 bg-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all">
                 View Today's Challenge
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
          <Brain className="w-5 h-5 text-gray-400" />
          Explore Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Link 
              key={feature.title} 
              to={feature.href}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/20 transition-all group flex flex-col"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} w-fit mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-gray-500 text-sm mb-6 flex-1">{feature.desc}</p>
              <div className="flex items-center text-sm font-semibold text-gray-400 group-hover:text-primary transition-colors">
                {feature.action} <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
