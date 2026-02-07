import { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Phone, 
  MessageSquare,
  ExternalLink,
  Search,
  ChevronDown,
  ChevronUp,
  User,
  Calendar,
  MapPin,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc, Timestamp, arrayUnion, orderBy, query } from 'firebase/firestore';

interface CrisisAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'suicide' | 'self-harm' | 'crisis' | 'concerning';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  context: string;
  timestamp: Timestamp | null;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved';
  assignedTo?: string;
  notes: string[];
  location?: string;
}

const severityConfig = {
  critical: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertTriangle, label: 'Critical' },
  high: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle, label: 'High' },
  medium: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: AlertCircle, label: 'Medium' },
  low: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle, label: 'Low' },
};

const statusConfig = {
  'new': { color: 'bg-red-500', label: 'New' },
  'acknowledged': { color: 'bg-yellow-500', label: 'Acknowledged' },
  'in-progress': { color: 'bg-blue-500', label: 'In Progress' },
  'resolved': { color: 'bg-green-500', label: 'Resolved' },
};

const typeConfig = {
  'suicide': { color: 'text-red-600', label: 'Suicide Risk' },
  'self-harm': { color: 'text-orange-600', label: 'Self-Harm' },
  'crisis': { color: 'text-purple-600', label: 'Crisis' },
  'concerning': { color: 'text-yellow-600', label: 'Concerning' },
};

export default function CrisisAlerts() {
  useAuth();
  const [alerts, setAlerts] = useState<CrisisAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  async function fetchAlerts() {
    try {
      setLoading(true);
      const alertsQuery = query(
        collection(db, 'crisisFlags'),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(alertsQuery);
      
      if (snapshot.size > 0) {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          notes: doc.data().notes || []
        })) as CrisisAlert[];
        setAlerts(alertsData);
      } else {
        // No alerts found - this is the real data scenario
        setAlerts([]);
      }
    } catch (err) {
      console.error('Error fetching crisis alerts:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity ? alert.severity === filterSeverity : true;
    const matchesStatus = filterStatus ? alert.status === filterStatus : true;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const updateAlertStatus = async (alertId: string, newStatus: CrisisAlert['status']) => {
    try {
      setUpdating(alertId);
      await updateDoc(doc(db, 'crisisFlags', alertId), { 
        status: newStatus,
        updatedAt: Timestamp.now()
      });
      setAlerts(alerts.map(alert => 
        alert.id === alertId ? { ...alert, status: newStatus } : alert
      ));
    } catch (err) {
      console.error('Failed to update alert status:', err);
      alert('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const addNote = async (alertId: string) => {
    if (!newNote.trim()) return;
    
    try {
      setUpdating(alertId);
      const noteEntry = `${new Date().toLocaleString()}: ${newNote}`;
      await updateDoc(doc(db, 'crisisFlags', alertId), {
        notes: arrayUnion(noteEntry),
        updatedAt: Timestamp.now()
      });
      setAlerts(alerts.map(alert => 
        alert.id === alertId 
          ? { ...alert, notes: [...alert.notes, noteEntry] }
          : alert
      ));
      setNewNote('');
    } catch (err) {
      console.error('Failed to add note:', err);
      alert('Failed to add note');
    } finally {
      setUpdating(null);
    }
  };

  const formatTimestamp = (timestamp: Timestamp | null): string => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date();
    return date.toLocaleString();
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const newCount = alerts.filter(a => a.status === 'new').length;
  const inProgressCount = alerts.filter(a => a.status === 'in-progress').length;
  const resolvedCount = alerts.filter(a => a.status === 'resolved').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Crisis Alerts</h1>
          <p className="text-gray-500 mt-1">
            Monitor and respond to mental health crises and concerning behavior
          </p>
        </div>

        {/* Emergency Banner */}
        {criticalCount > 0 && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-800">
                {criticalCount} Critical Alert{criticalCount !== 1 ? 's' : ''} Requiring Immediate Attention
              </h3>
              <p className="text-sm text-red-700">
                Immediate intervention may be necessary. Contact crisis team and emergency services if needed.
              </p>
            </div>
            <a 
              href="tel:988" 
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium"
            >
              <Phone className="w-4 h-4" />
              Call 988
            </a>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
                <p className="text-xs text-gray-500">Critical</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{newCount}</p>
                <p className="text-xs text-gray-500">New Alerts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{inProgressCount}</p>
                <p className="text-xs text-gray-500">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{resolvedCount}</p>
                <p className="text-xs text-gray-500">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts..."
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
            
            <select
              value={filterSeverity || ''}
              onChange={(e) => setFilterSeverity(e.target.value || null)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={filterStatus || ''}
              onChange={(e) => setFilterStatus(e.target.value || null)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {alerts.length === 0 ? 'No crisis alerts' : 'No alerts match your filters'}
              </h3>
              <p className="text-gray-500">
                {alerts.length === 0 
                  ? 'No crisis flags have been reported in the system'
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = expandedAlert === alert.id;
              const severity = severityConfig[alert.severity] || severityConfig.medium;
              const StatusIcon = severity.icon;
              
              return (
                <div 
                  key={alert.id} 
                  className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-all ${
                    alert.severity === 'critical' ? 'border-red-300' : 'border-gray-100'
                  }`}
                >
                  {/* Alert Header */}
                  <div 
                    className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedAlert(isExpanded ? null : alert.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${severity.color}`}>
                          <StatusIcon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${severity.color}`}>
                              {severity.label}
                            </span>
                            <span className={`text-xs font-medium ${typeConfig[alert.type]?.color || 'text-gray-600'}`}>
                              {typeConfig[alert.type]?.label || alert.type}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${statusConfig[alert.status]?.color || 'bg-gray-400'}`} />
                            <span className="text-xs text-gray-500 capitalize">
                              {alert.status?.replace('-', ' ') || 'unknown'}
                            </span>
                          </div>
                          <p className="font-medium text-gray-900">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {alert.userName || 'Unknown'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatTimestamp(alert.timestamp)}
                            </span>
                            {alert.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {alert.location}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {alert.assignedTo && (
                          <span className="text-xs text-gray-500">
                            Assigned to: {alert.assignedTo}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-4 bg-gray-50">
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Left Column - Details */}
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Context</h4>
                            <p className="text-sm text-gray-600">{alert.context || 'No context provided'}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Student Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-gray-500">Name:</span> {alert.userName || 'Unknown'}</p>
                              <p><span className="text-gray-500">Email:</span> {alert.userEmail || 'Unknown'}</p>
                              <p><span className="text-gray-500">ID:</span> {alert.userId}</p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            <a 
                              href={`mailto:${alert.userEmail}`}
                              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-50"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Contact Student
                            </a>
                            <a 
                              href={`/admin/users`}
                              className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-red-700"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View User Profile
                            </a>
                          </div>
                        </div>

                        {/* Right Column - Notes & Status */}
                        <div className="space-y-4">
                          {/* Status Update */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {(['new', 'acknowledged', 'in-progress', 'resolved'] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateAlertStatus(alert.id, status)}
                                  disabled={updating === alert.id}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    alert.status === status
                                      ? 'bg-red-600 text-white'
                                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                                  } ${updating === alert.id ? 'opacity-50' : ''}`}
                                >
                                  {statusConfig[status].label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                            <div className="space-y-2 mb-3 max-h-40 overflow-y-auto">
                              {alert.notes.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No notes yet</p>
                              ) : (
                                alert.notes.map((note, index) => (
                                  <div key={index} className="bg-white p-2 rounded-lg text-sm border border-gray-100">
                                    {note}
                                  </div>
                                ))
                              )}
                            </div>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addNote(alert.id)}
                                placeholder="Add a note..."
                                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                              />
                              <button
                                onClick={() => addNote(alert.id)}
                                disabled={!newNote.trim() || updating === alert.id}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Emergency Resources */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <a href="tel:988" className="bg-red-50 border border-red-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-semibold text-red-800">988 Suicide & Crisis Lifeline</p>
                <p className="text-sm text-red-600">Call or text 24/7</p>
              </div>
            </div>
          </a>

          <a href="tel:911" className="bg-orange-50 border border-orange-200 rounded-xl p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-semibold text-orange-800">Emergency Services</p>
                <p className="text-sm text-orange-600">911 for immediate danger</p>
              </div>
            </div>
          </a>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-blue-800">Campus Crisis Team</p>
                <p className="text-sm text-blue-600">Available Mon-Fri 8am-6pm</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
