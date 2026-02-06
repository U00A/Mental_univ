import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronRight,
  Video,
  DollarSign,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  getAppointments,
  type Appointment 
} from '@/lib/firestore';

interface DashboardStats {
  totalPatients: number;
  upcomingSessions: number;
  completedSessions: number;
  unreadMessages: number;
  averageRating: number;
  totalEarnings: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'message' | 'review';
  title: string;
  description: string;
  timestamp: Date;
  patientName?: string;
}

export default function PsychologistDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    upcomingSessions: 0,
    completedSessions: 0,
    unreadMessages: 0,
    averageRating: 0,
    totalEarnings: 0,
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Get all appointments for this psychologist
      const appointments = await getAppointments(user.uid, 'psychologist');
      
      // Calculate stats
      const now = new Date();
      const upcoming = appointments.filter(a => 
        new Date(a.date) >= now && 
        a.status === 'confirmed'
      ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const completed = appointments.filter(a => a.status === 'completed');
      const uniquePatients = new Set(appointments.map(a => a.studentId));
      
      setStats({
        totalPatients: uniquePatients.size,
        upcomingSessions: upcoming.length,
        completedSessions: completed.length,
        unreadMessages: 3, // Placeholder - would come from messages query
        averageRating: 4.8,
        totalEarnings: completed.length * 75, // Assuming $75 per session
      });
      
      setUpcomingAppointments(upcoming.slice(0, 5));
      
      // Generate recent activity
      const activity: RecentActivity[] = [
        ...upcoming.slice(0, 3).map(a => ({
          id: a.id!,
          type: 'appointment' as const,
          title: 'Upcoming Session',
          description: `Session with ${a.studentName}`,
          timestamp: new Date(a.date),
          patientName: a.studentName,
        })),
        {
          id: '1',
          type: 'message',
          title: 'New Message',
          description: 'You have 3 unread messages',
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'review',
          title: 'New Review',
          description: 'A patient left you a 5-star review',
          timestamp: new Date(Date.now() - 86400000),
        },
      ];
      
      setRecentActivity(activity);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">
            {getGreeting()}, Dr. {profile?.displayName?.split(' ')[0] || 'Therapist'}
          </h1>
          <p className="text-text-muted mt-1">
            Here's what's happening with your practice today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span className="text-xs text-green-600 font-medium">+2 this week</span>
            </div>
            <p className="text-2xl font-bold text-text">{stats.totalPatients}</p>
            <p className="text-xs text-text-muted">Total Patients</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-500" />
              <span className="text-xs text-text-muted">Today</span>
            </div>
            <p className="text-2xl font-bold text-text">{stats.upcomingSessions}</p>
            <p className="text-xs text-text-muted">Upcoming Sessions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+5 this week</span>
            </div>
            <p className="text-2xl font-bold text-text">{stats.completedSessions}</p>
            <p className="text-xs text-text-muted">Completed Sessions</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <MessageSquare className="w-5 h-5 text-orange-500" />
              {stats.unreadMessages > 0 && (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.unreadMessages}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-text">{stats.unreadMessages}</p>
            <p className="text-xs text-text-muted">Unread Messages</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span className="text-xs text-green-600 font-medium">Excellent</span>
            </div>
            <p className="text-2xl font-bold text-text">{stats.averageRating}</p>
            <p className="text-xs text-text-muted">Average Rating</p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-xs text-green-600 font-medium">+12%</span>
            </div>
            <p className="text-2xl font-bold text-text">${stats.totalEarnings}</p>
            <p className="text-xs text-text-muted">Total Earnings</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Upcoming Sessions
                </h2>
                <button 
                  onClick={() => navigate('/psychologist/calendar')}
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  View Calendar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="divide-y divide-gray-100">
                {upcomingAppointments.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-text-muted">No upcoming sessions</p>
                    <p className="text-sm text-text-muted mt-1">
                      Your schedule is clear for now
                    </p>
                  </div>
                ) : (
                  upcomingAppointments.map((apt) => (
                    <div key={apt.id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {apt.studentName.charAt(0)}
                          </div>
                          <div>
                            <h3 className="font-medium text-text">{apt.studentName}</h3>
                            <div className="flex items-center gap-3 text-sm text-text-muted">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {apt.time}
                              </span>
                              <span className="flex items-center gap-1">
                                <Video className="w-3 h-3" />
                                {apt.type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-text">
                            {new Date(apt.date).toLocaleDateString(undefined, { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </p>
                          <p className="text-xs text-text-muted">
                            {Math.ceil((new Date(apt.date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Weekly Activity Chart */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-text mb-6 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Weekly Activity
              </h2>
              <div className="flex items-end justify-between h-40 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
                  const height = [60, 80, 45, 90, 70, 30, 50][i];
                  return (
                    <div key={day} className="flex-1 flex flex-col items-center gap-2">
                      <div 
                        className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30"
                        style={{ height: `${height}%` }}
                      />
                      <span className="text-xs text-text-muted">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-text mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate('/psychologist/calendar')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">Manage Schedule</p>
                    <p className="text-xs text-text-muted">View and edit availability</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
                
                <button 
                  onClick={() => navigate('/psychologist/patients')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">Patient Records</p>
                    <p className="text-xs text-text-muted">Access patient information</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
                
                <button 
                  onClick={() => navigate('/psychologist/messages')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text">Messages</p>
                    <p className="text-xs text-text-muted">
                      {stats.unreadMessages > 0 ? `${stats.unreadMessages} unread` : 'No new messages'}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-text-muted" />
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-text mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      activity.type === 'appointment' ? 'bg-blue-100 text-blue-600' :
                      activity.type === 'message' ? 'bg-purple-100 text-purple-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      {activity.type === 'appointment' && <Calendar className="w-4 h-4" />}
                      {activity.type === 'message' && <MessageSquare className="w-4 h-4" />}
                      {activity.type === 'review' && <Star className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text">{activity.title}</p>
                      <p className="text-xs text-text-muted truncate">{activity.description}</p>
                      <p className="text-xs text-text-muted mt-1">
                        {activity.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Alerts */}
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Action Required</h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Complete your profile verification to unlock all features
                  </p>
                  <button className="mt-2 text-sm text-orange-600 hover:text-orange-800 font-medium">
                    Complete Verification →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
