import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar, MessageSquare, Heart, TrendingUp, Users, Clock, BookOpen, Shield, Loader2, Star, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WellnessCheckin from '@/components/dashboard/WellnessCheckin';
import { getAppointments, getMoodHistory, type Appointment, type MoodEntry } from '@/lib/firestore';

export default function Dashboard() {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const isStudent = profile?.role === 'student';

  useEffect(() => {
    async function fetchData() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const [apts, moods] = await Promise.all([
          getAppointments(profile.uid, profile.role as 'student' | 'psychologist'),
          getMoodHistory(profile.uid, 7)
        ]);
        setAppointments(apts);
        setMoodHistory(moods);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile]);

  const upcomingApts = appointments.filter(a => a.status === 'confirmed' && new Date(a.date) >= new Date());
  const latestMood = moodHistory[0]?.mood.replace('_', ' ') || 'No entry';

  const moodData = moodHistory.slice().reverse().map(entry => ({
    date: new Date(entry.date).toLocaleDateString([], { weekday: 'short' }),
    score: entry.mood === 'very_good' ? 5 : entry.mood === 'good' ? 4 : entry.mood === 'neutral' ? 3 : entry.mood === 'bad' ? 2 : 1
  }));

  const stats = isStudent ? [
    { icon: Calendar, label: 'Upcoming', value: upcomingApts.length.toString(), color: 'bg-green-100 text-green-700' },
    { icon: MessageSquare, label: 'Messages', value: 'Live', color: 'bg-blue-100 text-blue-700' },
    { icon: Heart, label: 'Latest Mood', value: latestMood, color: 'bg-pink-100 text-pink-700' },
    { icon: TrendingUp, label: 'Total Sessions', value: appointments.filter(a => a.status === 'completed').length.toString(), color: 'bg-purple-100 text-purple-700' },
  ] : [
    { icon: Calendar, label: 'Today', value: upcomingApts.filter(a => new Date(a.date).toDateString() === new Date().toDateString()).length.toString(), color: 'bg-green-100 text-green-700' },
    { icon: Users, label: 'Total Patients', value: Array.from(new Set(appointments.map(a => a.studentId))).length.toString(), color: 'bg-blue-100 text-blue-700' },
    { icon: MessageSquare, label: 'Messages', value: 'Active', color: 'bg-pink-100 text-pink-700' },
    { icon: Clock, label: 'Confirmed Hours', value: (upcomingApts.length * 0.5).toString(), color: 'bg-purple-100 text-purple-700' },
  ];

  const actions = isStudent ? [
    { icon: Calendar, title: 'Book Appointment', desc: 'Schedule with a psychologist', href: '/student/psychologists', color: 'bg-primary' },
    { icon: MessageSquare, title: 'Messages', desc: 'Chat with your psychologist', href: '/student/messages', color: 'bg-primary-light' },
    { icon: Heart, title: 'Mood Tracker', desc: 'Track how you feel', href: '/student/mood', color: 'bg-accent' },
    { icon: BookOpen, title: 'Resources', desc: 'Helpful articles & guides', href: '/student/resources', color: 'bg-primary-dark' },
    { icon: Shield, title: 'Safety Plan', desc: 'Your personal safety plan', href: '/student/safety-plan', color: 'bg-primary' },
  ] : [
    { icon: Calendar, title: 'Schedule', desc: 'View appointments', href: '/psychologist/calendar', color: 'bg-primary' },
    { icon: MessageSquare, title: 'Messages', desc: 'Patient messages', href: '/psychologist/messages', color: 'bg-primary-light' },
    { icon: Users, title: 'Patients', desc: 'View all patients', href: '/psychologist/patients', color: 'bg-primary-dark' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="w-full animate-fade-in">
      {/* Welcome */}
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="badge badge-green flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Premium Access
            </span>
          </div>
          <h1 className="text-4xl font-bold text-text mb-2 tracking-tight">
            Welcome back, <span className="text-gradient">{profile?.displayName?.split(' ')[0] || 'User'}</span> 👋
          </h1>
          <p className="text-lg text-text-muted">
            {isStudent ? "Your journey towards mental clarity continues today." : "You have a productive day ahead with your patients."}
          </p>
        </div>
        
        <div className="glass p-4 rounded-2xl flex items-center gap-4 border-white/40">
          <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <Star className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Daily insight</p>
            <p className="text-sm font-medium text-text italic">"Small steps everyday lead to big results."</p>
          </div>
        </div>
      </div>

      {/* Proactive Check-in */}
      {isStudent && (
        <div className="mb-10">
          <WellnessCheckin />
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="card card-hover card-glass border-none group cursor-pointer relative overflow-hidden">
            <div className="absolute -right-2 -top-2 w-16 h-16 bg-current opacity-5 rounded-full group-hover:scale-150 transition-transform duration-500" />
            <div className={`w-12 h-12 rounded-2xl ${stat.color} flex items-center justify-center mb-4 shadow-sm group-hover:rotate-12 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-text-muted mb-1 uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-text">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Mood Trend Chart */}
      {isStudent && moodHistory.length > 0 && (
        <div className="card card-glass mb-10 border-none overflow-hidden">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-text">Emotional Wellbeing</h2>
              <p className="text-sm text-text-muted">Your mood patterns over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2">
               <Link to="/student/mood" className="text-sm font-bold text-primary hover:text-primary-dark transition-colors">View Details →</Link>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={moodData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E0E0E0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#7F8C8D', fontSize: 12, fontWeight: 600}}
                  dy={10}
                />
                <YAxis hide domain={[0, 6]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                  labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2D6A4F" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-text mb-6">Explore Tools</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {actions.map((action, i) => (
            <Link 
              key={i} 
              to={action.href}
              className="card card-glass border-none flex items-center gap-6 group hover:translate-x-1"
            >
              <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-black/5`}>
                <action.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors">{action.title}</h3>
                <p className="text-sm text-text-muted leading-relaxed font-medium">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
