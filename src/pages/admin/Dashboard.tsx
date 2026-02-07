import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Check, 
  Ban, 
  Loader2,
  Shield,
  Activity,
  FileText,
  AlertTriangle,
  Calendar,
  MessageSquare,
  Clock,
  UserCheck,
  UserX,
  Eye,
  BarChart3,
  Bell,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp } from 'firebase/firestore';

interface SystemUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'student' | 'psychologist' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  createdAt: Timestamp | null;
}

interface DashboardStats {
  totalUsers: number;
  totalStudents: number;
  totalPsychologists: number;
  totalAdmins: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  pendingApplications: number;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  pendingAppointments: number;
  totalCommunities: number;
  activeCommunities: number;
  totalMessages: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  appointmentsThisWeek: number;
  appointmentsLastWeek: number;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentActivity, setRecentActivity] = useState<Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    icon: 'user' | 'appointment' | 'alert' | 'message';
  }>>([]);

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    async function fetchDashboardData() {
      try {
        setLoading(true);
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const userData = usersSnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as SystemUser[];
        setUsers(userData);

        // Calculate time ranges
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

        // Calculate user stats
        const totalUsers = userData.length;
        const totalStudents = userData.filter(u => u.role === 'student').length;
        const totalPsychologists = userData.filter(u => u.role === 'psychologist').length;
        const totalAdmins = userData.filter(u => u.role === 'admin').length;
        const activeUsers = userData.filter(u => u.status === 'active').length;
        const pendingUsers = userData.filter(u => u.status === 'pending').length;
        const suspendedUsers = userData.filter(u => u.status === 'suspended').length;
        
        // New users calculation
        const newUsersThisWeek = userData.filter(u => {
          if (!u.createdAt) return false;
          const created = u.createdAt.toDate ? u.createdAt.toDate() : new Date();
          return created >= weekAgo;
        }).length;
        
        const newUsersLastWeek = userData.filter(u => {
          if (!u.createdAt) return false;
          const created = u.createdAt.toDate ? u.createdAt.toDate() : new Date();
          return created >= twoWeeksAgo && created < weekAgo;
        }).length;

        // Fetch pending applications
        let pendingApplications = 0;
        try {
          const appsSnapshot = await getDocs(collection(db, 'psychologistApplications'));
          pendingApplications = appsSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.status === 'pending';
          }).length;
        } catch {
          console.log('No applications collection');
        }

        // Fetch appointments
        let totalAppointments = 0;
        let completedAppointments = 0;
        let cancelledAppointments = 0;
        let pendingAppointments = 0;
        let appointmentsThisWeek = 0;
        let appointmentsLastWeek = 0;
        
        try {
          const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
          const appointments = appointmentsSnapshot.docs.map(doc => doc.data());
          totalAppointments = appointments.length;
          completedAppointments = appointments.filter(a => a.status === 'completed').length;
          cancelledAppointments = appointments.filter(a => a.status === 'cancelled').length;
          pendingAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'confirmed').length;
          
          appointmentsThisWeek = appointments.filter(a => {
            if (!a.date) return false;
            const date = a.date.toDate ? a.date.toDate() : new Date(a.date);
            return date >= weekAgo;
          }).length;
          
          appointmentsLastWeek = appointments.filter(a => {
            if (!a.date) return false;
            const date = a.date.toDate ? a.date.toDate() : new Date(a.date);
            return date >= twoWeeksAgo && date < weekAgo;
          }).length;
        } catch {
          console.log('No appointments collection');
        }

        // Fetch communities
        let totalCommunities = 0;
        let activeCommunities = 0;
        try {
          const communitiesSnapshot = await getDocs(collection(db, 'communities'));
          totalCommunities = communitiesSnapshot.size;
          activeCommunities = communitiesSnapshot.docs.filter(doc => {
            const data = doc.data();
            return data.status !== 'archived';
          }).length;
        } catch {
          console.log('No communities collection');
        }

        // Fetch messages count
        let totalMessages = 0;
        try {
          const messagesSnapshot = await getDocs(collection(db, 'messages'));
          totalMessages = messagesSnapshot.size;
        } catch {
          console.log('No messages collection');
        }

        setStats({
          totalUsers,
          totalStudents,
          totalPsychologists,
          totalAdmins,
          activeUsers,
          pendingUsers,
          suspendedUsers,
          pendingApplications,
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          pendingAppointments,
          totalCommunities,
          activeCommunities,
          totalMessages,
          newUsersThisWeek,
          newUsersLastWeek,
          appointmentsThisWeek,
          appointmentsLastWeek
        });

        // Build recent activity from real data
        const activities: Array<{
          id: string;
          type: string;
          message: string;
          time: string;
          icon: 'user' | 'appointment' | 'alert' | 'message';
        }> = [];

        // Add recent user registrations
        userData
          .filter(u => u.createdAt)
          .sort((a, b) => {
            const aTime = a.createdAt?.toDate?.() || new Date(0);
            const bTime = b.createdAt?.toDate?.() || new Date(0);
            return bTime.getTime() - aTime.getTime();
          })
          .slice(0, 3)
          .forEach((u, i) => {
            const time = u.createdAt?.toDate?.() ? formatRelativeTime(u.createdAt.toDate()) : 'Recently';
            activities.push({
              id: `user-${i}`,
              type: 'New User',
              message: `${u.displayName || 'New user'} registered as ${u.role}`,
              time,
              icon: 'user'
            });
          });

        if (pendingApplications > 0) {
          activities.push({
            id: 'pending-apps',
            type: 'Applications',
            message: `${pendingApplications} psychologist application(s) pending review`,
            time: 'Action needed',
            icon: 'alert'
          });
        }

        if (pendingUsers > 0) {
          activities.push({
            id: 'pending-users',
            type: 'Pending Users',
            message: `${pendingUsers} user(s) awaiting approval`,
            time: 'Action needed',
            icon: 'alert'
          });
        }

        setRecentActivity(activities.slice(0, 5));

      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, [profile, navigate]);

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (uid: string, status: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status } : u) as SystemUser[]);
    } catch {
      alert('Failed to update user status');
    }
  };

  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const calculateGrowth = (current: number, previous: number): { value: number; positive: boolean } => {
    if (previous === 0) return { value: current > 0 ? 100 : 0, positive: current > 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), positive: change >= 0 };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  const userGrowth = calculateGrowth(stats?.newUsersThisWeek || 0, stats?.newUsersLastWeek || 0);
  const appointmentGrowth = calculateGrowth(stats?.appointmentsThisWeek || 0, stats?.appointmentsLastWeek || 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500">Welcome back, {profile?.displayName || 'Admin'}. Here's what's happening.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/admin/notifications')}
            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            {(stats?.pendingApplications || 0) + (stats?.pendingUsers || 0) > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {(stats?.pendingApplications || 0) + (stats?.pendingUsers || 0)}
              </span>
            )}
          </button>
          <div className="flex items-center gap-3 px-3 py-2 bg-white border border-gray-200 rounded-xl">
            <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center text-white font-medium text-sm">
              {profile?.displayName?.charAt(0) || 'A'}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{profile?.displayName || 'Admin'}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={Users} 
          label="Total Users" 
          value={stats?.totalUsers || 0}
          subtitle={`+${stats?.newUsersThisWeek || 0} this week`}
          color="blue"
          growth={userGrowth}
        />
        <StatsCard 
          icon={Calendar} 
          label="Total Appointments" 
          value={stats?.totalAppointments || 0}
          subtitle={`${stats?.pendingAppointments || 0} pending`}
          color="green"
          growth={appointmentGrowth}
        />
        <StatsCard 
          icon={FileText} 
          label="Pending Applications" 
          value={stats?.pendingApplications || 0}
          subtitle="Awaiting review"
          color="yellow"
          highlight={stats?.pendingApplications ? stats.pendingApplications > 0 : false}
        />
        <StatsCard 
          icon={MessageSquare} 
          label="Total Messages" 
          value={stats?.totalMessages || 0}
          subtitle={`${stats?.activeCommunities || 0} active communities`}
          color="purple"
        />
      </div>

      {/* User Breakdown & Appointment Status */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-gray-400" />
            User Breakdown
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Activity className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Students</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.totalStudents || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <span className="text-gray-700">Psychologists</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.totalPsychologists || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <Shield className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-gray-700">Admins</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.totalAdmins || 0}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <UserCheck className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Active</span>
              </div>
              <span className="font-semibold text-green-600">{stats?.activeUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-yellow-600">{stats?.pendingUsers || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <UserX className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-gray-700">Suspended</span>
              </div>
              <span className="font-semibold text-red-600">{stats?.suspendedUsers || 0}</span>
            </div>
          </div>
        </div>

        {/* Appointment Status */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Appointment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Calendar className="w-4 h-4 text-blue-600" />
                </div>
                <span className="text-gray-700">Total Appointments</span>
              </div>
              <span className="font-semibold text-gray-900">{stats?.totalAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-gray-700">Completed</span>
              </div>
              <span className="font-semibold text-green-600">{stats?.completedAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-50 rounded-lg">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
                <span className="text-gray-700">Pending/Confirmed</span>
              </div>
              <span className="font-semibold text-yellow-600">{stats?.pendingAppointments || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-600" />
                </div>
                <span className="text-gray-700">Cancelled</span>
              </div>
              <span className="font-semibold text-red-600">{stats?.cancelledAppointments || 0}</span>
            </div>
            <hr className="border-gray-100" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 rounded-lg">
                  <Users className="w-4 h-4 text-indigo-600" />
                </div>
                <span className="text-gray-700">Communities</span>
              </div>
              <span className="font-semibold text-indigo-600">{stats?.totalCommunities || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button 
              onClick={() => navigate('/admin/users')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Manage Users</span>
            </button>
            <button 
              onClick={() => navigate('/admin/applications')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                <FileText className="w-4 h-4" />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Applications</span>
                {(stats?.pendingApplications || 0) > 0 && (
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    {stats?.pendingApplications}
                  </span>
                )}
              </div>
            </button>
            <button 
              onClick={() => navigate('/admin/analytics')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-green-50 text-green-600 rounded-lg">
                <BarChart3 className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">View Analytics</span>
            </button>
            <button 
              onClick={() => navigate('/admin/appointments')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Appointments</span>
            </button>
            <button 
              onClick={() => navigate('/admin/crisis-alerts')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Crisis Alerts</span>
            </button>
            <button 
              onClick={() => navigate('/admin/settings')}
              className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="p-2 bg-gray-100 text-gray-600 rounded-lg">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium text-gray-700">Settings</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-lg ${
                    activity.icon === 'user' ? 'bg-blue-100 text-blue-600' :
                    activity.icon === 'appointment' ? 'bg-green-100 text-green-600' :
                    activity.icon === 'alert' ? 'bg-red-100 text-red-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {activity.icon === 'user' && <Users className="w-4 h-4" />}
                    {activity.icon === 'appointment' && <Calendar className="w-4 h-4" />}
                    {activity.icon === 'alert' && <AlertTriangle className="w-4 h-4" />}
                    {activity.icon === 'message' && <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.type}</p>
                    <p className="text-sm text-gray-600 truncate">{activity.message}</p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p>No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* User Management Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">User Management</h2>
            <p className="text-sm text-gray-500">{users.length} total users</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-9 pr-4 py-2 text-sm w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              />
            </div>
            <button 
              onClick={() => navigate('/admin/users')}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
            >
              <Eye className="w-4 h-4" />
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr className="text-left">
                <th className="py-3 px-6 text-sm font-medium text-gray-500">User</th>
                <th className="py-3 px-6 text-sm font-medium text-gray-500">Role</th>
                <th className="py-3 px-6 text-sm font-medium text-gray-500">Status</th>
                <th className="py-3 px-6 text-sm font-medium text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.slice(0, 5).map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'Unnamed User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm capitalize px-2 py-1 rounded-full ${
                      user.role === 'admin' ? 'bg-red-50 text-red-700 font-semibold' : 
                      user.role === 'psychologist' ? 'bg-purple-50 text-purple-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                      user.status === 'active' ? 'bg-green-50 text-green-700' :
                      user.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      {user.status === 'pending' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.uid, 'active')}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      {user.status === 'active' && user.role !== 'admin' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.uid, 'suspended')}
                          className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                          title="Suspend"
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}
                       {user.status === 'suspended' && (
                        <button 
                          onClick={() => handleUpdateStatus(user.uid, 'active')}
                          className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                          title="Reactivate"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredUsers.length > 5 && (
          <div className="p-4 border-t border-gray-100 text-center">
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              View all {filteredUsers.length} users →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  subtitle?: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red';
  growth?: { value: number; positive: boolean };
  highlight?: boolean;
}

function StatsCard({ icon: Icon, label, value, subtitle, color, growth, highlight }: StatsCardProps) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
  };
  
  return (
    <div className={`bg-white p-5 rounded-xl border transition-shadow hover:shadow-md ${
      highlight ? 'border-yellow-300 bg-yellow-50/50' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {growth && (
          <div className={`flex items-center gap-1 text-xs font-medium ${
            growth.positive ? 'text-green-600' : 'text-red-600'
          }`}>
            {growth.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {growth.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  );
}
