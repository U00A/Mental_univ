import { useState, useEffect } from 'react';
import { 
  Calendar,
  Search,
  Eye,
  X,
  Video,
  Phone,
  MapPin,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';

interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  psychologistId: string;
  psychologistName: string;
  date: { seconds: number } | null;
  time: string;
  duration: number; // in minutes
  type: 'video' | 'phone' | 'in-person';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  reason?: string;
}

type FilterStatus = 'all' | 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchAppointments();
  }, []);

  async function fetchAppointments() {
    try {
      setLoading(true);
      const snapshot = await getDocs(collection(db, 'appointments'));
      const appts = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      
      // Sort by date (most recent first)
      appts.sort((a, b) => {
        const dateA = a.date?.seconds || 0;
        const dateB = b.date?.seconds || 0;
        return dateB - dateA;
      });
      
      setAppointments(appts);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, status: Appointment['status']) => {
    try {
      setProcessingId(id);
      await updateDoc(doc(db, 'appointments', id), { status });
      setAppointments(prev => prev.map(appt => 
        appt.id === id ? { ...appt, status } : appt
      ));
      setSelectedAppointment(null);
    } catch (err) {
      console.error('Error updating appointment:', err);
      alert('Failed to update appointment');
    } finally {
      setProcessingId(null);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    const matchesStatus = statusFilter === 'all' || appt.status === statusFilter;
    const matchesSearch = 
      appt.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.psychologistName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appt.studentEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const paginatedAppointments = filteredAppointments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'confirmed': return 'bg-green-100 text-green-700';
      case 'completed': return 'bg-gray-100 text-gray-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'no-show': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getTypeIcon = (type: Appointment['type']) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'phone': return <Phone className="w-4 h-4" />;
      case 'in-person': return <MapPin className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const formatDate = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return 'No date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStats = () => ({
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    noShow: appointments.filter(a => a.status === 'no-show').length
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
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-500">Monitor and manage all platform appointments</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-sm text-gray-500">Total</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 text-center">
          <p className="text-2xl font-bold text-blue-700">{stats.scheduled}</p>
          <p className="text-sm text-blue-600">Upcoming</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-100 p-4 text-center">
          <p className="text-2xl font-bold text-green-700">{stats.completed}</p>
          <p className="text-sm text-green-600">Completed</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-100 p-4 text-center">
          <p className="text-2xl font-bold text-red-700">{stats.cancelled}</p>
          <p className="text-sm text-red-600">Cancelled</p>
        </div>
        <div className="bg-yellow-50 rounded-xl border border-yellow-100 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-700">{stats.noShow}</p>
          <p className="text-sm text-yellow-600">No-shows</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {(['all', 'scheduled', 'confirmed', 'completed', 'cancelled', 'no-show'] as FilterStatus[]).map(status => (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${
                statusFilter === status
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {status === 'no-show' ? 'No-show' : status}
            </button>
          ))}
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search appointments..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {paginatedAppointments.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Psychologist</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {paginatedAppointments.map((appt) => (
                    <tr key={appt.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{formatDate(appt.date)}</p>
                            <p className="text-xs text-gray-500">{appt.time || 'No time'} • {appt.duration || 60} min</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{appt.studentName || 'Unknown'}</p>
                        <p className="text-xs text-gray-500">{appt.studentEmail || 'No email'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{appt.psychologistName || 'Unknown'}</p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 capitalize">
                          {getTypeIcon(appt.type)}
                          {appt.type || 'video'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(appt.status)}`}>
                          {appt.status === 'no-show' ? 'No-show' : appt.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedAppointment(appt)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {(appt.status === 'scheduled' || appt.status === 'confirmed') && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'completed')}
                                disabled={processingId === appt.id}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Mark Completed"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(appt.id, 'cancelled')}
                                disabled={processingId === appt.id}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
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
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredAppointments.length)} of {filteredAppointments.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Appointment Details Modal */}
      {selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">Appointment Details</h2>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{formatDate(selectedAppointment.date)}</p>
                    <p className="text-sm text-gray-500">{selectedAppointment.time} • {selectedAppointment.duration || 60} minutes</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedAppointment.status)}`}>
                  {selectedAppointment.status}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Student</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.studentName}</p>
                  <p className="text-sm text-gray-500">{selectedAppointment.studentEmail}</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Psychologist</p>
                  <p className="font-medium text-gray-900">{selectedAppointment.psychologistName}</p>
                </div>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-xl">
                <p className="text-xs text-gray-500 mb-1">Session Type</p>
                <div className="flex items-center gap-2 text-gray-900 capitalize">
                  {getTypeIcon(selectedAppointment.type)}
                  {selectedAppointment.type || 'Video Call'}
                </div>
              </div>
              
              {selectedAppointment.reason && (
                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Reason for Visit</p>
                  <p className="text-gray-900">{selectedAppointment.reason}</p>
                </div>
              )}
              
              {selectedAppointment.notes && (
                <div className="p-4 border border-gray-200 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-gray-900">{selectedAppointment.notes}</p>
                </div>
              )}
              
              {(selectedAppointment.status === 'scheduled' || selectedAppointment.status === 'confirmed') && (
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'completed')}
                    disabled={processingId === selectedAppointment.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-medium disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Mark Completed
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedAppointment.id, 'cancelled')}
                    disabled={processingId === selectedAppointment.id}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-medium disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
