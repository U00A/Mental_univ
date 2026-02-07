import { useState, useEffect } from 'react';
import { 
  Search, 
  Shield,
  Check,
  Ban,
  Trash2,
  Mail,
  UserPlus,
  X,
  Loader2
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc, addDoc, serverTimestamp } from 'firebase/firestore';

interface User {
  uid: string;
  displayName: string;
  email: string;
  role: 'student' | 'psychologist' | 'admin';
  status: 'active' | 'pending' | 'suspended';
  createdAt: { seconds: number } | null;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    displayName: '',
    email: '',
    role: 'student' as User['role'],
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const userData = snapshot.docs.map(d => ({
        uid: d.id,
        ...d.data()
      })) as User[];
      setUsers(userData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleUpdateStatus = async (uid: string, status: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { status });
      setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status } : u) as User[]);
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
    }
  };

  const handleDeleteUser = async (uid: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', uid));
      setUsers(prev => prev.filter(u => u.uid !== uid));
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      await addDoc(collection(db, 'users'), {
        ...newUser,
        status: 'active',
        createdAt: serverTimestamp(),
        photoURL: null,
        uid: crypto.randomUUID() // Valid placeholder for Firestore-only user
      });
      await fetchUsers();
      setShowAddModal(false);
      setNewUser({ displayName: '', email: '', role: 'student' });
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-500">{users.length} total users</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-xl hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
        >
          <UserPlus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        >
          <option value="all">All Roles</option>
          <option value="student">Students</option>
          <option value="psychologist">Psychologists</option>
          <option value="admin">Admins</option>
        </select>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Role</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                <th className="text-right py-4 px-6 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{user.displayName || 'Unnamed'}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${
                      user.role === 'admin' ? 'bg-red-50 text-red-700' :
                      user.role === 'psychologist' ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {user.role === 'admin' && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${
                      user.status === 'active' ? 'bg-green-50 text-green-700' :
                      user.status === 'pending' ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-500">
                    {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
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
                      <button 
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          {user.status === 'active' ? (
                            <button 
                              onClick={() => handleUpdateStatus(user.uid, 'suspended')}
                              className="p-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors"
                              title="Suspend"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : user.status === 'suspended' && (
                            <button 
                              onClick={() => handleUpdateStatus(user.uid, 'active')}
                              className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                              title="Reactivate"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteUser(user.uid)}
                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No users found matching your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-900">Add New User</h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-200/50 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={newUser.displayName}
                  onChange={e => setNewUser(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Email Address</label>
                <input
                  type="email"
                  required
                  value={newUser.email}
                  onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Role</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(prev => ({ ...prev, role: e.target.value as User['role'] }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                >
                  <option value="student">Student</option>
                  <option value="psychologist">Psychologist</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create User'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
