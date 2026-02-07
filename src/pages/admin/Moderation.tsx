import { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Flag,
  Eye,
  Check,
  X,
  MessageSquare,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Report {
  id: string;
  type: 'post' | 'comment' | 'message' | 'profile';
  content: string;
  reportedBy: string;
  reportedUser: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  createdAt: { seconds: number } | null;
}

type TabType = 'reports' | 'flagged' | 'resolved';

const tabs: { id: TabType; label: string }[] = [
  { id: 'reports', label: 'Pending Reports' },
  { id: 'flagged', label: 'Under Review' },
  { id: 'resolved', label: 'Resolved' },
];

export default function Moderation() {
  const [activeTab, setActiveTab] = useState<TabType>('reports');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  async function fetchReports() {
    try {
      const snapshot = await getDocs(collection(db, 'reports'));
      const reportData = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Report[];
      setReports(reportData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredReports = reports.filter(r => {
    const matchesSearch = r.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.reportedUser?.toLowerCase().includes(searchQuery.toLowerCase());
    if (activeTab === 'reports') return matchesSearch && r.status === 'pending';
    if (activeTab === 'flagged') return matchesSearch && r.status === 'reviewed';
    return matchesSearch && (r.status === 'resolved' || r.status === 'dismissed');
  });

  const handleAction = async (id: string, action: 'approve' | 'dismiss' | 'review') => {
    try {
      const newStatus = action === 'approve' ? 'resolved' : action === 'dismiss' ? 'dismissed' : 'reviewed';
      await updateDoc(doc(db, 'reports', id), { status: newStatus });
      setReports(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r) as Report[]);
    } catch (error) {
      console.error('Error updating report:', error);
      alert('Failed to update report');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'post': return FileText;
      case 'comment': return MessageSquare;
      case 'message': return MessageSquare;
      case 'profile': return AlertTriangle;
      default: return Flag;
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved' || r.status === 'dismissed').length;

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
          <h1 className="text-2xl font-bold text-gray-900">Content Moderation</h1>
          <p className="text-gray-500">Review flagged content and user reports</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-xl font-medium">
            <Clock className="w-4 h-4" />
            {pendingCount} Pending
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
          <p className="text-xs text-gray-500">Total Reports</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
          <p className="text-xs text-gray-500">Pending Review</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-blue-600">{reviewedCount}</p>
          <p className="text-xs text-gray-500">Under Review</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
          <p className="text-xs text-gray-500">Resolved</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab.id
                ? 'border-red-600 text-red-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search reports..."
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
        />
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <Flag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No reports in this category</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const TypeIcon = getTypeIcon(report.type);
            return (
              <div key={report.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      report.type === 'profile' ? 'bg-red-50 text-red-600' :
                      report.type === 'post' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                    }`}>
                      <TypeIcon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500 uppercase">{report.type}</span>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          report.reason === 'Harassment' ? 'bg-red-50 text-red-700' :
                          report.reason === 'Spam' ? 'bg-amber-50 text-amber-700' :
                          report.reason === 'Hate Speech' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {report.reason}
                        </span>
                      </div>
                      <p className="text-gray-900 font-medium mb-2">{report.content}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Reported: <strong className="text-gray-700">{report.reportedUser}</strong></span>
                        <span>By: {report.reportedBy}</span>
                        <span>{report.createdAt ? new Date(report.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {report.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleAction(report.id, 'review')}
                        className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        title="Review"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAction(report.id, 'approve')}
                        className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                        title="Take Action"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleAction(report.id, 'dismiss')}
                        className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                        title="Dismiss"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
