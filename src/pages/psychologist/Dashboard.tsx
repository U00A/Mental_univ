import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  Star,
  Video,
  DollarSign,
  Activity,
  Plus,
  FileText,
  Bell
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments, type Appointment } from '@/lib/firestore';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

interface DashboardStats {
  totalPatients: number;
  upcomingSessions: number;
  completedSessions: number;
  earnings: number;
  rating: number;
}

export default function PsychologistDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    earnings: 0,
    rating: 4.9
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  // Mock data for the chart
  const activityData = [
    { name: 'Mon', sessions: 4 },
    { name: 'Tue', sessions: 6 },
    { name: 'Wed', sessions: 5 },
    { name: 'Thu', sessions: 8 },
    { name: 'Fri', sessions: 6 },
    { name: 'Sat', sessions: 3 },
    { name: 'Sun', sessions: 0 },
  ];

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    try {
      const appointments = await getAppointments(user.uid, 'psychologist');
      const now = new Date();
      
      const upcoming = appointments
        .filter(a => new Date(a.date) >= now && a.status === 'confirmed')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
      const completed = appointments.filter(a => a.status === 'completed');
      const uniquePatients = new Set(appointments.map(a => a.studentId));

      setStats({
        totalPatients: uniquePatients.size,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        earnings: completed.length * 75,
        rating: 4.8
      });
      
      setUpcomingAppointments(upcoming.slice(0, 4));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {getGreeting()}, Dr. {profile?.displayName?.split(' ')[1] || profile?.displayName || 'Psychologist'}
          </h1>
          <p className="text-gray-500 mt-1">Here's an overview of your practice today.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/psychologist/calendar')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Schedule
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            New Session
          </button>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={Users} 
          label="Total Patients" 
          value={stats.totalPatients} 
          trend="+12%" 
          color="blue"
        />
        <StatsCard 
          icon={Calendar} 
          label="Upcoming" 
          value={stats.upcomingSessions} 
          subValue="Next 7 days"
          color="purple"
        />
        <StatsCard 
          icon={DollarSign} 
          label="Earnings" 
          value={`$${stats.earnings}`} 
          trend="+8.5%" 
          color="green"
        />
        <StatsCard 
          icon={Star} 
          label="Rating" 
          value={stats.rating} 
          subValue="45 Reviews"
          color="yellow"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (Main) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Activity Chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Session Activity
              </h2>
              <select className="text-sm bg-gray-50 border-none rounded-lg text-gray-500 font-medium px-3 py-1">
                <option>This Week</option>
                <option>Last Week</option>
              </select>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9CA3AF', fontSize: 12}} 
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#4F46E5', strokeWidth: 1, strokeDasharray: '4 4'}}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="#4F46E5" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorSessions)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Upcoming Appointments List */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                Upcoming Sessions
              </h2>
              <button 
                onClick={() => navigate('/psychologist/calendar')}
                className="text-sm text-primary font-medium hover:underline"
              >
                View Calendar
              </button>
            </div>

            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No upcoming sessions scheduled</p>
                </div>
              ) : (
                upcomingAppointments.map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/20 hover:bg-gray-50/50 transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-primary font-bold text-lg">
                        {apt.studentName.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{apt.studentName}</h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {new Date(apt.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {apt.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-100">
                        Confirmed
                      </span>
                      <button 
                        onClick={() => navigate(`/psychologist/session/${apt.id}`)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                        title="Start Session"
                      >
                        <Video className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white shadow-lg">
            <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <ActionButton icon={FileText} label="Notes" onClick={() => {}} />
              <ActionButton icon={Users} label="Patients" onClick={() => navigate('/psychologist/patients')} />
              <ActionButton icon={MessageSquare} label="Messages" onClick={() => navigate('/psychologist/messages')} />
              <ActionButton icon={DollarSign} label="Earnings" onClick={() => navigate('/psychologist/earnings')} />
            </div>
          </div>

          {/* Notifications / Recent */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500" />
              Recent Updates
            </h3>
            <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
              <TimelineItem 
                title="New Appointment Request"
                desc="Sarah Connor requested a session"
                time="2h ago"
                type="alert"
              />
              <TimelineItem 
                title="Session Completed"
                desc="Therapy session with Mike Ross"
                time="5h ago"
                type="success"
              />
              <TimelineItem 
                title="New Review"
                desc="Received 5-star rating"
                time="1d ago"
                type="info"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  subValue?: string;
  color: 'blue' | 'purple' | 'green' | 'yellow';
}

function StatsCard({ icon: Icon, label, value, trend, subValue, color }: StatsCardProps) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    purple: 'text-purple-600 bg-purple-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-1">{subValue}</p>}
      </div>
    </div>
  );
}

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

function ActionButton({ icon: Icon, label, onClick }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 p-3 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-colors border border-white/10"
    >
      <Icon className="w-5 h-5 text-white" />
      <span className="text-xs font-medium text-white/90">{label}</span>
    </button>
  );
}

interface TimelineItemProps {
  title: string;
  desc: string;
  time: string;
  type: 'alert' | 'success' | 'info';
}

function TimelineItem({ title, desc, time, type }: TimelineItemProps) {
  const colors = {
    alert: 'bg-orange-500',
    success: 'bg-green-500',
    info: 'bg-blue-500'
  }
  
  return (
    <div className="relative pl-8">
      <div className={`absolute left-4 top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white box-content shadow-sm -translate-x-1/2 ${colors[type]}`} />
      <p className="text-sm font-semibold text-gray-800">{title}</p>
      <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      <span className="text-[10px] text-gray-400 mt-1 block font-medium uppercase tracking-wide">{time}</span>
    </div>
  );
}
