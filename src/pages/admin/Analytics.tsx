import { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar,
  MessageSquare,
  Activity,
  Download,
  BarChart3,
  PieChart,
  LineChart,
  Loader2,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AnalyticsData {
  totalUsers: number;
  totalStudents: number;
  totalPsychologists: number;
  totalAppointments: number;
  completedSessions: number;
  cancelledSessions: number;
  totalMessages: number;
  activeToday: number;
  newUsersThisWeek: number;
  newUsersLastWeek: number;
  appointmentsThisWeek: number;
  appointmentsLastWeek: number;
}

// Types for Firestore data
interface UserData {
  id: string;
  role: string;
  createdAt?: { toDate?: () => Date } | Date | null;
  lastActive?: { toDate?: () => Date } | Date | null;
}

interface AppointmentData {
  id: string;
  status: string;
  date?: { toDate?: () => Date } | Date | null;
}

interface DateRange {
  label: string;
  value: 'week' | 'month' | 'quarter' | 'year';
}

const dateRanges: DateRange[] = [
  { label: 'Last 7 Days', value: 'week' },
  { label: 'Last 30 Days', value: 'month' },
  { label: 'Last 3 Months', value: 'quarter' },
  { label: 'Last Year', value: 'year' },
];

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange['value']>('month');
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalStudents: 0,
    totalPsychologists: 0,
    totalAppointments: 0,
    completedSessions: 0,
    cancelledSessions: 0,
    totalMessages: 0,
    activeToday: 0,
    newUsersThisWeek: 0,
    newUsersLastWeek: 0,
    appointmentsThisWeek: 0,
    appointmentsLastWeek: 0
  });

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as UserData[];
        
        const totalUsers = users.length;
        const totalStudents = users.filter((u) => u.role === 'student').length;
        const totalPsychologists = users.filter((u) => u.role === 'psychologist').length;
        
        // Calculate new users
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const newUsersThisWeek = users.filter((u) => {
          if (!u.createdAt) return false;
          const createdAt = u.createdAt as { toDate?: () => Date } | Date;
          const created = typeof createdAt === 'object' && 'toDate' in createdAt && createdAt.toDate 
            ? createdAt.toDate() 
            : new Date(createdAt as unknown as string);
          return created >= weekAgo;
        }).length;
        
        const newUsersLastWeek = users.filter((u) => {
          if (!u.createdAt) return false;
          const createdAt = u.createdAt as { toDate?: () => Date } | Date;
          const created = typeof createdAt === 'object' && 'toDate' in createdAt && createdAt.toDate 
            ? createdAt.toDate() 
            : new Date(createdAt as unknown as string);
          return created >= twoWeeksAgo && created < weekAgo;
        }).length;

        // Fetch appointments
        let totalAppointments = 0;
        let completedSessions = 0;
        let cancelledSessions = 0;
        let appointmentsThisWeek = 0;
        let appointmentsLastWeek = 0;
        
        try {
          const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
          const appointments = appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppointmentData[];
          
          totalAppointments = appointments.length;
          completedSessions = appointments.filter((a) => a.status === 'completed').length;
          cancelledSessions = appointments.filter((a) => a.status === 'cancelled').length;
          
          appointmentsThisWeek = appointments.filter((a) => {
            if (!a.date) return false;
            const dateVal = a.date as { toDate?: () => Date } | Date;
            const date = typeof dateVal === 'object' && 'toDate' in dateVal && dateVal.toDate 
              ? dateVal.toDate() 
              : new Date(dateVal as unknown as string);
            return date >= weekAgo;
          }).length;
          
          appointmentsLastWeek = appointments.filter((a) => {
            if (!a.date) return false;
            const dateVal = a.date as { toDate?: () => Date } | Date;
            const date = typeof dateVal === 'object' && 'toDate' in dateVal && dateVal.toDate 
              ? dateVal.toDate() 
              : new Date(dateVal as unknown as string);
            return date >= twoWeeksAgo && date < weekAgo;
          }).length;
        } catch {
          console.log('No appointments collection yet');
        }

        // Fetch messages count
        let totalMessages = 0;
        try {
          const messagesSnapshot = await getDocs(collection(db, 'messages'));
          totalMessages = messagesSnapshot.size;
        } catch {
          console.log('No messages collection yet');
        }

        // Calculate active today (simplified - users who logged in today)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const activeToday = users.filter((u) => {
          if (!u.lastActive) return false;
          const lastActiveVal = u.lastActive as { toDate?: () => Date } | Date;
          const lastActive = typeof lastActiveVal === 'object' && 'toDate' in lastActiveVal && lastActiveVal.toDate 
            ? lastActiveVal.toDate() 
            : new Date(lastActiveVal as unknown as string);
          return lastActive >= today;
        }).length;

        setData({
          totalUsers,
          totalStudents,
          totalPsychologists,
          totalAppointments,
          completedSessions,
          cancelledSessions,
          totalMessages,
          activeToday,
          newUsersThisWeek,
          newUsersLastWeek,
          appointmentsThisWeek,
          appointmentsLastWeek
        });
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [dateRange]);

  const handleExport = () => {
    const csvContent = `
Analytics Report - ${new Date().toLocaleDateString()}

USERS
Total Users,${data.totalUsers}
Students,${data.totalStudents}
Psychologists,${data.totalPsychologists}
Active Today,${data.activeToday}
New This Week,${data.newUsersThisWeek}

APPOINTMENTS
Total Appointments,${data.totalAppointments}
Completed Sessions,${data.completedSessions}
Cancelled Sessions,${data.cancelledSessions}
This Week,${data.appointmentsThisWeek}

ENGAGEMENT
Total Messages,${data.totalMessages}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rahatek-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getGrowthIndicator = (current: number, previous: number) => {
    if (previous === 0) return { percent: current > 0 ? 100 : 0, isPositive: current > 0 };
    const percent = Math.round(((current - previous) / previous) * 100);
    return { percent: Math.abs(percent), isPositive: percent >= 0 };
  };

  const userGrowth = getGrowthIndicator(data.newUsersThisWeek, data.newUsersLastWeek);
  const appointmentGrowth = getGrowthIndicator(data.appointmentsThisWeek, data.appointmentsLastWeek);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-500">Platform usage metrics and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {dateRanges.map(range => (
              <button
                key={range.value}
                onClick={() => setDateRange(range.value)}
                className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  dateRange === range.value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${userGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {userGrowth.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {userGrowth.percent}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalUsers}</p>
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="text-xs text-gray-400 mt-1">+{data.newUsersThisWeek} this week</p>
        </div>

        {/* Appointments */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div className={`flex items-center gap-1 text-sm font-medium ${appointmentGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {appointmentGrowth.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              {appointmentGrowth.percent}%
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalAppointments}</p>
          <p className="text-sm text-gray-500">Total Appointments</p>
          <p className="text-xs text-gray-400 mt-1">{data.appointmentsThisWeek} this week</p>
        </div>

        {/* Messages */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.totalMessages.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total Messages</p>
          <p className="text-xs text-gray-400 mt-1">Platform-wide</p>
        </div>

        {/* Active Today */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{data.activeToday}</p>
          <p className="text-sm text-gray-500">Active Today</p>
          <p className="text-xs text-gray-400 mt-1">{Math.round((data.activeToday / data.totalUsers) * 100) || 0}% of users</p>
        </div>
      </div>

      {/* User Distribution & Session Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">User Distribution</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-4">
            {/* Students */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Students</span>
                <span className="text-sm text-gray-500">{data.totalStudents} ({Math.round((data.totalStudents / data.totalUsers) * 100) || 0}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${(data.totalStudents / data.totalUsers) * 100 || 0}%` }}
                />
              </div>
            </div>
            
            {/* Psychologists */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Psychologists</span>
                <span className="text-sm text-gray-500">{data.totalPsychologists} ({Math.round((data.totalPsychologists / data.totalUsers) * 100) || 0}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${(data.totalPsychologists / data.totalUsers) * 100 || 0}%` }}
                />
              </div>
            </div>
            
            {/* Admins */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Admins</span>
                <span className="text-sm text-gray-500">{data.totalUsers - data.totalStudents - data.totalPsychologists}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500 rounded-full transition-all duration-500"
                  style={{ width: `${((data.totalUsers - data.totalStudents - data.totalPsychologists) / data.totalUsers) * 100 || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Session Stats */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Session Statistics</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-green-50 rounded-xl">
                <p className="text-2xl font-bold text-green-700">{data.completedSessions}</p>
                <p className="text-xs text-green-600 font-medium">Completed</p>
              </div>
              <div className="p-4 bg-yellow-50 rounded-xl">
                <p className="text-2xl font-bold text-yellow-700">{data.totalAppointments - data.completedSessions - data.cancelledSessions}</p>
                <p className="text-xs text-yellow-600 font-medium">Upcoming</p>
              </div>
              <div className="p-4 bg-red-50 rounded-xl">
                <p className="text-2xl font-bold text-red-700">{data.cancelledSessions}</p>
                <p className="text-xs text-red-600 font-medium">Cancelled</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-500 mb-2">Completion Rate</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-linear-to-r from-green-400 to-green-600 rounded-full transition-all duration-500"
                    style={{ width: `${data.totalAppointments > 0 ? (data.completedSessions / data.totalAppointments) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  {data.totalAppointments > 0 ? Math.round((data.completedSessions / data.totalAppointments) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Summary */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Weekly Summary</h2>
          <LineChart className="w-5 h-5 text-gray-400" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-gray-900">{data.newUsersThisWeek}</p>
            <p className="text-sm text-gray-500">New Users</p>
            <p className={`text-xs font-medium mt-1 ${userGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {userGrowth.isPositive ? '+' : '-'}{userGrowth.percent}% vs last week
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-gray-900">{data.appointmentsThisWeek}</p>
            <p className="text-sm text-gray-500">Appointments</p>
            <p className={`text-xs font-medium mt-1 ${appointmentGrowth.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {appointmentGrowth.isPositive ? '+' : '-'}{appointmentGrowth.percent}% vs last week
            </p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-gray-900">{data.totalPsychologists}</p>
            <p className="text-sm text-gray-500">Active Psychologists</p>
            <p className="text-xs font-medium mt-1 text-blue-600">Available to book</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-xl">
            <p className="text-3xl font-bold text-gray-900">{data.activeToday}</p>
            <p className="text-sm text-gray-500">Active Today</p>
            <p className="text-xs font-medium mt-1 text-purple-600">Currently online</p>
          </div>
        </div>
      </div>
    </div>
  );
}
