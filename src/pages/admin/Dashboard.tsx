import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  TrendingUp, 
  Search, 
  Check, 
  Ban, 
  Loader2,
  Shield,
  Activity,
  FileText,
  AlertTriangle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface SystemUser {
  uid: string;
  displayName: string;
  email: string;
  role: 'student' | 'psychologist' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  createdAt: any;
}

export default function AdminDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (profile && profile.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    async function fetchUsers() {
      try {
        setLoading(true);
        const snapshot = await getDocs(collection(db, 'users'));
        const userData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as SystemUser[];
        setUsers(userData);
      } catch (err) {
        console.error('Error fetching users:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, [profile, navigate]);

  const filteredUsers = users.filter(u =>
    u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (uid: string, status: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status } : u) as SystemUser[]);
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users and platform settings</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
            {profile?.displayName?.charAt(0) || 'A'}
          </div>
          <div className="text-right">
            <p className="font-medium text-gray-900">{profile?.displayName || 'Admin'}</p>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          icon={Users} 
          label="Total Users" 
          value={users.length}
          color="blue"
        />
        <StatsCard 
          icon={Activity} 
          label="Students" 
          value={users.filter(u => u.role === 'student').length}
          color="green"
        />
        <StatsCard 
          icon={Shield} 
          label="Psychologists" 
          value={users.filter(u => u.role === 'psychologist').length}
          color="purple"
        />
        <StatsCard 
          icon={AlertTriangle} 
          label="Pending" 
          value={users.filter(u => u.status === 'pending').length}
          color="yellow"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => navigate('/admin/users')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary/20 transition-all group"
        >
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
            <Users className="w-5 h-5" />
          </div>
          <span className="font-medium text-gray-700">Manage Users</span>
        </button>
        <button 
          onClick={() => navigate('/admin/psychologist-applications')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary/20 transition-all group"
        >
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
            <FileText className="w-5 h-5" />
          </div>
          <span className="font-medium text-gray-700">Applications</span>
        </button>
        <button 
          onClick={() => navigate('/admin/crisis-alerts')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary/20 transition-all group"
        >
          <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100 transition-colors">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <span className="font-medium text-gray-700">Crisis Alerts</span>
        </button>
        <button 
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-3 p-4 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-primary/20 transition-all group"
        >
          <div className="p-2 bg-gray-100 text-gray-600 rounded-lg group-hover:bg-gray-200 transition-colors">
            <Shield className="w-5 h-5" />
          </div>
          <span className="font-medium text-gray-700">Settings</span>
        </button>
      </div>

      {/* User Management */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">User Management</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="pl-9 pr-4 py-2 text-sm w-64 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
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
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'Unnamed User'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`text-sm capitalize ${user.role === 'admin' ? 'text-purple-600 font-semibold' : 'text-gray-600'}`}>
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
      </div>
    </div>
  );
}

interface StatsCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'blue' | 'green' | 'purple' | 'yellow';
}

function StatsCard({ icon: Icon, label, value, color }: StatsCardProps) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    yellow: 'text-yellow-600 bg-yellow-50',
  };
  
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <TrendingUp className="w-4 h-4 text-green-500" />
      </div>
      <div>
        <h3 className="text-gray-500 text-sm font-medium">{label}</h3>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
