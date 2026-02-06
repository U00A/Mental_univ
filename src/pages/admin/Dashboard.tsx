import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Users, TrendingUp, LogOut, Search, Check, Ban, Loader2 } from 'lucide-react';
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
  const { profile, signOut } = useAuth();
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
        // Error is logged to console during development
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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[#E0E0E0] hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-text">MindWell</span>
          </div>

          <nav className="space-y-2">
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-primary text-white">
              <TrendingUp className="w-5 h-5" />
              Dashboard
            </Link>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg text-text-muted hover:bg-gray-100">
              <Users className="w-5 h-5" />
              Users
            </Link>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#E0E0E0]">
          <button onClick={handleSignOut} className="flex items-center gap-2 text-red-600 hover:text-red-700">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
              <p className="text-text-muted">Manage users and platform settings</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-medium">
                {profile?.displayName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-right">
                <p className="font-medium text-text">{profile?.displayName || 'Admin'}</p>
                <p className="text-sm text-text-muted">Administrator</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <p className="text-sm text-text-muted">Total Users</p>
              <p className="text-2xl font-bold text-text">{users.length}</p>
            </div>
            <div className="card">
              <p className="text-sm text-text-muted">Students</p>
              <p className="text-2xl font-bold text-text">
                {users.filter(u => u.role === 'student').length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-text-muted">Psychologists</p>
              <p className="text-2xl font-bold text-text">
                {users.filter(u => u.role === 'psychologist').length}
              </p>
            </div>
            <div className="card">
              <p className="text-sm text-text-muted">Pending</p>
              <p className="text-2xl font-bold text-text">
                {users.filter(u => u.status === 'pending').length}
              </p>
            </div>
          </div>

          {/* User Management */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-text">User Management</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users..."
                  className="input pl-9 py-2 text-sm w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#E0E0E0] text-left">
                    <th className="py-3 px-4 text-sm font-medium text-text-muted">User</th>
                    <th className="py-3 px-4 text-sm font-medium text-text-muted">Role</th>
                    <th className="py-3 px-4 text-sm font-medium text-text-muted">Status</th>
                    <th className="py-3 px-4 text-sm font-medium text-text-muted text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.uid} className="border-b border-[#E0E0E0] last:border-0">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center text-primary font-medium text-sm">
                            {user.displayName?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-text">{user.displayName || 'Unnamed User'}</p>
                            <p className="text-sm text-text-muted">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm capitalize ${user.role === 'admin' ? 'text-purple-600 font-bold' : 'text-text'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge capitalize ${
                          user.status === 'active' ? 'badge-green' :
                          user.status === 'pending' ? 'badge-amber' : 'badge-red'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
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
                      <td colSpan={4} className="py-10 text-center text-text-muted">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
