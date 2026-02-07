import { useState, useEffect } from 'react';
import { 
  Bell,
  Send,
  Search,
  Plus,
  Trash2,
  Clock,
  Users,
  Mail,
  Smartphone,
  Globe,
  Loader2,
  X
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'announcement' | 'update' | 'alert' | 'maintenance';
  targetAudience: 'all' | 'students' | 'psychologists' | 'admins';
  channel: 'in-app' | 'email' | 'push' | 'all';
  status: 'draft' | 'scheduled' | 'sent';
  scheduledAt?: { seconds: number } | null;
  sentAt?: { seconds: number } | null;
  createdAt: { seconds: number } | null;
  createdBy: string;
  readCount?: number;
}

type TabType = 'all' | 'draft' | 'scheduled' | 'sent';

export default function Notifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'announcement' as Notification['type'],
    targetAudience: 'all' as Notification['targetAudience'],
    channel: 'in-app' as Notification['channel'],
    scheduledAt: ''
  });

  useEffect(() => {
    fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'adminNotifications'));
      const notifs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notification[];
      
      // Sort by created date, most recent first
      notifs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
      setNotifications(notifs);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (e: React.FormEvent, sendImmediately = false) => {
    e.preventDefault();
    try {
      setProcessingId('new');
      
      const notificationData = {
        ...formData,
        status: sendImmediately ? 'sent' : (formData.scheduledAt ? 'scheduled' : 'draft'),
        createdAt: serverTimestamp(),
        createdBy: profile?.displayName || 'Admin',
        ...(sendImmediately && { sentAt: serverTimestamp() }),
        ...(formData.scheduledAt && { 
          scheduledAt: { seconds: new Date(formData.scheduledAt).getTime() / 1000 } 
        }),
        readCount: 0
      };
      
      await addDoc(collection(db, 'adminNotifications'), notificationData);
      
      // If sending immediately, also create individual notifications for users
      if (sendImmediately) {
        // In production, this would trigger a cloud function to send to all users
        console.log('Notification sent to all users');
      }
      
      await fetchNotifications();
      setShowComposeModal(false);
      resetForm();
    } catch (err) {
      console.error('Error creating notification:', err);
      alert('Failed to create notification');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendNow = async (id: string) => {
    try {
      setProcessingId(id);
      await updateDoc(doc(db, 'adminNotifications', id), {
        status: 'sent',
        sentAt: serverTimestamp()
      });
      setNotifications(prev => prev.map(n => 
        n.id === id ? { ...n, status: 'sent' as const } : n
      ));
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('Failed to send notification');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification?')) return;
    try {
      setProcessingId(id);
      await deleteDoc(doc(db, 'adminNotifications', id));
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
      alert('Failed to delete notification');
    } finally {
      setProcessingId(null);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'announcement',
      targetAudience: 'all',
      channel: 'in-app',
      scheduledAt: ''
    });
  };

  const formatTimestamp = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp.seconds * 1000).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'announcement': return 'bg-blue-100 text-blue-700';
      case 'update': return 'bg-green-100 text-green-700';
      case 'alert': return 'bg-red-100 text-red-700';
      case 'maintenance': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status: Notification['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-600';
      case 'scheduled': return 'bg-purple-100 text-purple-700';
      case 'sent': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const getChannelIcon = (channel: Notification['channel']) => {
    switch (channel) {
      case 'in-app': return <Bell className="w-4 h-4" />;
      case 'email': return <Mail className="w-4 h-4" />;
      case 'push': return <Smartphone className="w-4 h-4" />;
      case 'all': return <Globe className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesTab = activeTab === 'all' || n.status === activeTab;
    const matchesSearch = 
      n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: notifications.length,
    draft: notifications.filter(n => n.status === 'draft').length,
    scheduled: notifications.filter(n => n.status === 'scheduled').length,
    sent: notifications.filter(n => n.status === 'sent').length
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500">Send announcements and alerts to users</p>
        </div>
        <button
          onClick={() => setShowComposeModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Compose Notification
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          <p className="text-sm text-gray-500">Drafts</p>
        </div>
        <div className="bg-purple-50 rounded-xl border border-purple-100 p-4 text-center">
          <p className="text-2xl font-bold text-purple-700">{stats.scheduled}</p>
          <p className="text-sm text-purple-600">Scheduled</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.sent}</p>
          <p className="text-sm text-green-600">Sent</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex gap-2">
          {(['all', 'draft', 'scheduled', 'sent'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search notifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No notifications found</p>
            <button
              onClick={() => setShowComposeModal(true)}
              className="mt-4 text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Create your first notification
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div key={notification.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">{notification.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getTypeColor(notification.type)}`}>
                        {notification.type}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(notification.status)}`}>
                        {notification.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">{notification.message}</p>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        <span className="capitalize">{notification.targetAudience}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {getChannelIcon(notification.channel)}
                        <span className="capitalize">{notification.channel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {notification.status === 'sent' 
                          ? `Sent ${formatTimestamp(notification.sentAt || notification.createdAt)}`
                          : notification.status === 'scheduled'
                          ? `Scheduled for ${formatTimestamp(notification.scheduledAt || null)}`
                          : `Created ${formatTimestamp(notification.createdAt)}`
                        }
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {notification.status !== 'sent' && (
                      <button
                        onClick={() => handleSendNow(notification.id)}
                        disabled={processingId === notification.id}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Send Now"
                      >
                        {processingId === notification.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      disabled={processingId === notification.id}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-2xl flex items-center justify-center z-50 p-4 overflow-y-auto animate-in fade-in duration-300">
          <div className="bg-white/90 backdrop-blur-3xl border border-white/50 rounded-[2.5rem] shadow-[0_32px_128px_-12px_rgba(0,0,0,0.15)] w-full max-w-2xl my-8 transform transition-all animate-in zoom-in-95 duration-300">
            <div className="px-8 py-6 border-b border-gray-100/50 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Compose Notification</h2>
              <button
                onClick={() => {
                  setShowComposeModal(false);
                  resetForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={(e) => handleCreate(e, false)} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  placeholder="Important Announcement"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 min-h-[120px]"
                  placeholder="Write your notification message here..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as Notification['type'] }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="alert">Alert</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetAudience: e.target.value as Notification['targetAudience'] }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="all">All Users</option>
                    <option value="students">Students Only</option>
                    <option value="psychologists">Psychologists Only</option>
                    <option value="admins">Admins Only</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value as Notification['channel'] }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  >
                    <option value="in-app">In-App</option>
                    <option value="email">Email</option>
                    <option value="push">Push Notification</option>
                    <option value="all">All Channels</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                  <input
                    type="datetime-local"
                    value={formData.scheduledAt}
                    onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowComposeModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={processingId === 'new'}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium disabled:opacity-50 transition-colors"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  onClick={(e) => handleCreate(e as unknown as React.FormEvent, true)}
                  disabled={processingId === 'new'}
                  className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-colors"
                >
                  {processingId === 'new' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      {formData.scheduledAt ? 'Schedule' : 'Send'}
                    </>
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
