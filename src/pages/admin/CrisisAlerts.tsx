import { useState } from 'react';
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
  MapPin
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface CrisisAlert {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'suicide' | 'self-harm' | 'crisis' | 'concerning';
  severity: 'critical' | 'high' | 'medium' | 'low';
  message: string;
  context: string;
  timestamp: Date;
  status: 'new' | 'acknowledged' | 'in-progress' | 'resolved';
  assignedTo?: string;
  notes: string[];
  location?: string;
}

const mockAlerts: CrisisAlert[] = [
  {
    id: '1',
    userId: 'user123',
    userName: 'Anonymous Student',
    userEmail: 'student@university.edu',
    type: 'suicide',
    severity: 'critical',
    message: 'I can\'t do this anymore, I want to end it all',
    context: 'Chat message in therapy session',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    status: 'new',
    location: 'Student Housing Block C',
    notes: [],
  },
  {
    id: '2',
    userId: 'user456',
    userName: 'Sarah M.',
    userEmail: 'sarah.m@university.edu',
    type: 'self-harm',
    severity: 'high',
    message: 'Been cutting again, can\'t stop',
    context: 'Journal entry flagged',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    status: 'acknowledged',
    assignedTo: 'Dr. Johnson',
    notes: ['Student contacted via email', 'Waiting for response'],
  },
  {
    id: '3',
    userId: 'user789',
    userName: 'Mike R.',
    userEmail: 'mike.r@university.edu',
    type: 'crisis',
    severity: 'high',
    message: 'Having panic attacks every day, can\'t attend classes',
    context: 'Appointment cancellation note',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    status: 'in-progress',
    assignedTo: 'Crisis Team',
    notes: ['Emergency session scheduled for tomorrow 2pm'],
  },
  {
    id: '4',
    userId: 'user321',
    userName: 'Emma L.',
    userEmail: 'emma.l@university.edu',
    type: 'concerning',
    severity: 'medium',
    message: 'Feeling very isolated and lonely lately',
    context: 'Mood tracker - 5 consecutive bad days',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    status: 'resolved',
    assignedTo: 'Dr. Smith',
    notes: ['Wellness check completed', 'Student referred to support group'],
  },
];

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
  const [alerts, setAlerts] = useState<CrisisAlert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);
  const [newNote, setNewNote] = useState('');

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch = 
      alert.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.userEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = filterSeverity ? alert.severity === filterSeverity : true;
    const matchesStatus = filterStatus ? alert.status === filterStatus : true;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const updateAlertStatus = (alertId: string, newStatus: CrisisAlert['status']) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, status: newStatus } : alert
    ));
  };

  const addNote = (alertId: string) => {
    if (!newNote.trim()) return;
    
    setAlerts(alerts.map(alert => 
      alert.id === alertId 
        ? { ...alert, notes: [...alert.notes, `${new Date().toLocaleString()}: ${newNote}`] }
        : alert
    ));
    setNewNote('');
  };

  const criticalCount = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
  const newCount = alerts.filter(a => a.status === 'new').length;
  const inProgressCount = alerts.filter(a => a.status === 'in-progress').length;
  const resolvedToday = alerts.filter(a => a.status === 'resolved').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text">Crisis Alerts</h1>
          <p className="text-text-muted mt-1">
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
              className="btn bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
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
                <p className="text-2xl font-bold text-text">{criticalCount}</p>
                <p className="text-xs text-text-muted">Critical</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{newCount}</p>
                <p className="text-xs text-text-muted">New Alerts</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{inProgressCount}</p>
                <p className="text-xs text-text-muted">In Progress</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-text">{resolvedToday}</p>
                <p className="text-xs text-text-muted">Resolved</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search alerts..."
                  className="input pl-9 w-full"
                />
              </div>
            </div>
            
            <select
              value={filterSeverity || ''}
              onChange={(e) => setFilterSeverity(e.target.value || null)}
              className="input"
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
              className="input"
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
              <h3 className="text-lg font-semibold text-text mb-2">No alerts match your filters</h3>
              <p className="text-text-muted">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isExpanded = expandedAlert === alert.id;
              const severity = severityConfig[alert.severity];
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
                            <span className={`text-xs font-medium ${typeConfig[alert.type].color}`}>
                              {typeConfig[alert.type].label}
                            </span>
                            <span className={`w-2 h-2 rounded-full ${statusConfig[alert.status].color}`} />
                            <span className="text-xs text-text-muted capitalize">
                              {alert.status.replace('-', ' ')}
                            </span>
                          </div>
                          <p className="font-medium text-text">{alert.message}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-text-muted">
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {alert.userName}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(alert.timestamp).toLocaleString()}
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
                          <span className="text-xs text-text-muted">
                            Assigned to: {alert.assignedTo}
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-text-muted" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-muted" />
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
                            <h4 className="font-medium text-text mb-2">Context</h4>
                            <p className="text-sm text-text-muted">{alert.context}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium text-text mb-2">Student Information</h4>
                            <div className="space-y-1 text-sm">
                              <p><span className="text-text-muted">Name:</span> {alert.userName}</p>
                              <p><span className="text-text-muted">Email:</span> {alert.userEmail}</p>
                              <p><span className="text-text-muted">ID:</span> {alert.userId}</p>
                            </div>
                          </div>

                          {/* Quick Actions */}
                          <div className="flex gap-2">
                            <a 
                              href={`mailto:${alert.userEmail}`}
                              className="btn btn-secondary text-sm flex items-center gap-2"
                            >
                              <MessageSquare className="w-4 h-4" />
                              Contact Student
                            </a>
                            <a 
                              href={`/student/messages/${alert.userId}`}
                              className="btn btn-primary text-sm flex items-center gap-2"
                            >
                              <ExternalLink className="w-4 h-4" />
                              View Chat History
                            </a>
                          </div>
                        </div>

                        {/* Right Column - Notes & Status */}
                        <div className="space-y-4">
                          {/* Status Update */}
                          <div>
                            <h4 className="font-medium text-text mb-2">Update Status</h4>
                            <div className="flex flex-wrap gap-2">
                              {(['new', 'acknowledged', 'in-progress', 'resolved'] as const).map((status) => (
                                <button
                                  key={status}
                                  onClick={() => updateAlertStatus(alert.id, status)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                    alert.status === status
                                      ? 'bg-primary text-white'
                                      : 'bg-white border border-gray-200 text-text hover:bg-gray-50'
                                  }`}
                                >
                                  {statusConfig[status].label}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <h4 className="font-medium text-text mb-2">Notes</h4>
                            <div className="space-y-2 mb-3">
                              {alert.notes.length === 0 ? (
                                <p className="text-sm text-text-muted italic">No notes yet</p>
                              ) : (
                                alert.notes.map((note, index) => (
                                  <div key={index} className="bg-white p-2 rounded-lg text-sm">
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
                                className="input flex-1 text-sm"
                              />
                              <button
                                onClick={() => addNote(alert.id)}
                                disabled={!newNote.trim()}
                                className="btn btn-primary text-sm"
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
