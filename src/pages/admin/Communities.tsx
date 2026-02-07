import { useState, useEffect } from 'react';
import { 
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  MessageCircle,
  Lock,
  Loader2,
  Archive
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  postCount: number;
  isPrivate: boolean;
  moderators: string[];
  createdAt: { seconds: number } | null;
  status: 'active' | 'archived';
  imageUrl?: string;
  rules?: string[];
}

export default function Communities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCommunity, setEditingCommunity] = useState<Community | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Mental Health',
    isPrivate: false,
    rules: ''
  });

  const categories = [
    'Mental Health',
    'Anxiety Support',
    'Depression Support',
    'Stress Management',
    'Self-Care',
    'Relationships',
    'Academic Support',
    'Mindfulness',
    'Recovery',
    'General Wellness'
  ];

  useEffect(() => {
    fetchCommunities();
  }, []);

  async function fetchCommunities() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'communities'));
      const comms = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Community[];
      setCommunities(comms);
    } catch (err) {
      console.error('Error fetching communities:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setProcessingId('new');
      await addDoc(collection(db, 'communities'), {
        ...formData,
        rules: formData.rules.split('\n').filter(r => r.trim()),
        memberCount: 0,
        postCount: 0,
        moderators: [],
        status: 'active',
        createdAt: serverTimestamp()
      });
      await fetchCommunities();
      setShowAddModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating community:', err);
      alert('Failed to create community');
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCommunity) return;
    
    try {
      setProcessingId(editingCommunity.id);
      await updateDoc(doc(db, 'communities', editingCommunity.id), {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        isPrivate: formData.isPrivate,
        rules: formData.rules.split('\n').filter(r => r.trim())
      });
      setCommunities(prev => prev.map(c => 
        c.id === editingCommunity.id ? { ...c, ...formData, rules: formData.rules.split('\n').filter(r => r.trim()) } : c
      ));
      setEditingCommunity(null);
      resetForm();
    } catch (err) {
      console.error('Error updating community:', err);
      alert('Failed to update community');
    } finally {
      setProcessingId(null);
    }
  };

  const handleArchive = async (id: string) => {
    try {
      setProcessingId(id);
      const community = communities.find(c => c.id === id);
      const newStatus = community?.status === 'archived' ? 'active' : 'archived';
      await updateDoc(doc(db, 'communities', id), { status: newStatus });
      setCommunities(prev => prev.map(c => 
        c.id === id ? { ...c, status: newStatus } : c
      ));
    } catch (err) {
      console.error('Error archiving community:', err);
      alert('Failed to archive community');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setProcessingId(id);
      await deleteDoc(doc(db, 'communities', id));
      setCommunities(prev => prev.filter(c => c.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting community:', err);
      alert('Failed to delete community');
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (community: Community) => {
    setFormData({
      name: community.name,
      description: community.description,
      category: community.category,
      isPrivate: community.isPrivate,
      rules: community.rules?.join('\n') || ''
    });
    setEditingCommunity(community);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'Mental Health',
      isPrivate: false,
      rules: ''
    });
  };

  const filteredCommunities = communities.filter(c =>
    c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStats = () => ({
    total: communities.length,
    active: communities.filter(c => c.status === 'active').length,
    archived: communities.filter(c => c.status === 'archived').length,
    totalMembers: communities.reduce((acc, c) => acc + (c.memberCount || 0), 0)
  });

  const stats = getStats();

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
          <h1 className="text-2xl font-bold text-gray-900">Community Management</h1>
          <p className="text-gray-500">Create and manage support groups</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Create Community
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total Communities</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.active}</p>
          <p className="text-sm text-green-600">Active</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-700">{stats.archived}</p>
          <p className="text-sm text-gray-500">Archived</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.totalMembers}</p>
          <p className="text-sm text-blue-600">Total Members</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search communities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
        />
      </div>

      {/* Communities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommunities.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No communities found</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Create your first community
            </button>
          </div>
        ) : (
          filteredCommunities.map((community) => (
            <div 
              key={community.id} 
              className={`bg-white rounded-xl border p-5 transition-all hover:shadow-md ${
                community.status === 'archived' ? 'border-gray-200 opacity-75' : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                    {community.name?.charAt(0) || 'C'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {community.name}
                      {community.isPrivate && <Lock className="w-3.5 h-3.5 text-gray-400" />}
                    </h3>
                    <span className="text-xs text-gray-500">{community.category}</span>
                  </div>
                </div>
                {community.status === 'archived' && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium">
                    Archived
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{community.description || 'No description'}</p>
              
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {community.memberCount || 0} members
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {community.postCount || 0} posts
                </div>
              </div>
              
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => startEdit(community)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => handleArchive(community.id)}
                  disabled={processingId === community.id}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Archive className="w-4 h-4" />
                  {community.status === 'archived' ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(community.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || editingCommunity) && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-xl flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] w-full max-w-lg my-8 transform transition-all animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCommunity ? 'Edit Community' : 'Create Community'}
              </h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingCommunity(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-200/50 rounded-lg transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={editingCommunity ? handleUpdate : handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Community Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                  placeholder="Anxiety Support Group"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[100px] transition-all outline-none"
                  placeholder="A safe space for sharing experiences..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Community Rules (one per line)</label>
                <textarea
                  value={formData.rules}
                  onChange={(e) => setFormData(prev => ({ ...prev, rules: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[80px] transition-all outline-none"
                  placeholder="Be respectful&#10;No spam&#10;Keep discussions supportive"
                />
              </div>
              
              <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-gray-900 flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Private Community
                  </p>
                  <p className="text-sm text-gray-500">Members need approval to join</p>
                </div>
              </label>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingCommunity(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === 'new' || processingId === editingCommunity?.id}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-colors"
                >
                  {(processingId === 'new' || processingId === editingCommunity?.id) ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    editingCommunity ? 'Update Community' : 'Create Community'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] p-8 max-w-sm w-full transform transition-all animate-in zoom-in-95 duration-300">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">Delete Community?</h2>
              <p className="text-gray-500 mb-6">This action cannot be undone. All posts and members will be removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={processingId === showDeleteConfirm}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium transition-colors disabled:opacity-50 shadow-lg shadow-red-600/20"
                >
                  {processingId === showDeleteConfirm ? (
                    <span className="flex items-center justify-center gap-2">
                       <Loader2 className="w-4 h-4 animate-spin" />
                       Deleting...
                    </span>
                  ) : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
