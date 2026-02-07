import { useState, useEffect } from 'react';
import { 
  FileText,
  Search,
  Download,
  Clock,
  Shield,
  Trash2,
  Edit2,
  UserPlus,
  LogIn,
  LogOut,
  Eye,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface AuditLog {
  id: string;
  action: string;
  actionType: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'view' | 'approve' | 'reject';
  userId: string;
  userName: string;
  userRole: 'admin' | 'psychologist' | 'student';
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: string;
  ipAddress?: string;
  timestamp: { seconds: number } | null;
}

type FilterType = 'all' | 'create' | 'update' | 'delete' | 'login' | 'logout' | 'approve' | 'reject';

// Mock data for demonstration - in production, this would come from Firestore
const mockLogs: AuditLog[] = [
  {
    id: '1',
    action: 'Approved psychologist application',
    actionType: 'approve',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    targetType: 'user',
    targetId: 'psy1',
    targetName: 'Dr. Sarah Johnson',
    timestamp: { seconds: Date.now() / 1000 - 3600 }
  },
  {
    id: '2',
    action: 'User logged in',
    actionType: 'login',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    ipAddress: '192.168.1.1',
    timestamp: { seconds: Date.now() / 1000 - 7200 }
  },
  {
    id: '3',
    action: 'Updated platform settings',
    actionType: 'update',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    targetType: 'settings',
    details: 'Changed maintenance mode to disabled',
    timestamp: { seconds: Date.now() / 1000 - 86400 }
  },
  {
    id: '4',
    action: 'Created new community',
    actionType: 'create',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    targetType: 'community',
    targetName: 'Anxiety Support Group',
    timestamp: { seconds: Date.now() / 1000 - 172800 }
  },
  {
    id: '5',
    action: 'Rejected psychologist application',
    actionType: 'reject',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    targetType: 'user',
    targetName: 'John Doe',
    details: 'Incomplete credentials',
    timestamp: { seconds: Date.now() / 1000 - 259200 }
  },
  {
    id: '6',
    action: 'Deleted user account',
    actionType: 'delete',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    targetType: 'user',
    targetName: 'Spam Account',
    timestamp: { seconds: Date.now() / 1000 - 345600 }
  },
  {
    id: '7',
    action: 'User logged out',
    actionType: 'logout',
    userId: 'admin1',
    userName: 'Admin User',
    userRole: 'admin',
    timestamp: { seconds: Date.now() / 1000 - 432000 }
  }
];

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const itemsPerPage = 15;

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    try {
      setLoading(true);
      // Try to fetch from Firestore first
      try {
        const snapshot = await getDocs(collection(db, 'auditLogs'));
        if (snapshot.size > 0) {
          const fetchedLogs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AuditLog[];
          setLogs(fetchedLogs.sort((a, b) => 
            (b.timestamp?.seconds || 0) - (a.timestamp?.seconds || 0)
          ));
        } else {
          // Use mock data if no logs exist yet
          setLogs(mockLogs);
        }
      } catch {
        // Fallback to mock data
        setLogs(mockLogs);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleExport = () => {
    const csvContent = [
      'Timestamp,Action,Action Type,User,Role,Target,Details',
      ...filteredLogs.map(log => 
        `"${formatTimestamp(log.timestamp)}","${log.action}","${log.actionType}","${log.userName}","${log.userRole}","${log.targetName || '-'}","${log.details || '-'}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeAgo = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return 'Unknown';
    const seconds = Math.floor(Date.now() / 1000 - timestamp.seconds);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return formatTimestamp(timestamp);
  };

  const getActionIcon = (type: AuditLog['actionType']) => {
    switch (type) {
      case 'create': return <UserPlus className="w-4 h-4" />;
      case 'update': return <Edit2 className="w-4 h-4" />;
      case 'delete': return <Trash2 className="w-4 h-4" />;
      case 'login': return <LogIn className="w-4 h-4" />;
      case 'logout': return <LogOut className="w-4 h-4" />;
      case 'view': return <Eye className="w-4 h-4" />;
      case 'approve': return <Shield className="w-4 h-4" />;
      case 'reject': return <Shield className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getActionColor = (type: AuditLog['actionType']) => {
    switch (type) {
      case 'create': return 'bg-green-100 text-green-600';
      case 'update': return 'bg-blue-100 text-blue-600';
      case 'delete': return 'bg-red-100 text-red-600';
      case 'login': return 'bg-purple-100 text-purple-600';
      case 'logout': return 'bg-gray-100 text-gray-600';
      case 'approve': return 'bg-green-100 text-green-600';
      case 'reject': return 'bg-red-100 text-red-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesType = filterType === 'all' || log.actionType === filterType;
    const matchesSearch = 
      log.action?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.targetName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesDate = true;
    if (dateRange.start) {
      const startDate = new Date(dateRange.start).getTime() / 1000;
      matchesDate = matchesDate && (log.timestamp?.seconds || 0) >= startDate;
    }
    if (dateRange.end) {
      const endDate = new Date(dateRange.end).getTime() / 1000 + 86400; // Include end day
      matchesDate = matchesDate && (log.timestamp?.seconds || 0) <= endDate;
    }
    
    return matchesType && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const actionCounts = {
    all: logs.length,
    create: logs.filter(l => l.actionType === 'create').length,
    update: logs.filter(l => l.actionType === 'update').length,
    delete: logs.filter(l => l.actionType === 'delete').length,
    login: logs.filter(l => l.actionType === 'login').length,
    logout: logs.filter(l => l.actionType === 'logout').length,
    approve: logs.filter(l => l.actionType === 'approve').length,
    reject: logs.filter(l => l.actionType === 'reject').length
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
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-500">Track all administrative actions and system events</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
        >
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          
          {/* Date Range */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, start: e.target.value }));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => {
                setDateRange(prev => ({ ...prev, end: e.target.value }));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>
        
        {/* Action Type Filters */}
        <div className="flex flex-wrap gap-2 mt-4">
          {(['all', 'create', 'update', 'delete', 'login', 'logout', 'approve', 'reject'] as FilterType[]).map(type => (
            <button
              key={type}
              onClick={() => {
                setFilterType(type);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                filterType === type
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type} ({actionCounts[type]})
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {paginatedLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No logs found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Timestamp</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">User</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Target</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-900">{getTimeAgo(log.timestamp)}</p>
                            <p className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${getActionColor(log.actionType)}`}>
                            {getActionIcon(log.actionType)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.action}</p>
                            <p className="text-xs text-gray-500 capitalize">{log.actionType}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-sm font-medium">
                            {log.userName?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{log.userName}</p>
                            <p className="text-xs text-gray-500 capitalize">{log.userRole}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {log.targetName ? (
                          <div>
                            <p className="text-sm text-gray-900">{log.targetName}</p>
                            <p className="text-xs text-gray-500 capitalize">{log.targetType}</p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-gray-600 max-w-xs truncate">
                          {log.details || log.ipAddress || '-'}
                        </p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                <p className="text-sm text-gray-500">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
