import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  MessageSquare, 
  Calendar, 
  Filter,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments } from '@/lib/firestore';

interface Patient {
  id: string;
  name: string;
  email: string;
  lastSession: string;
  nextSession?: string;
  totalSessions: number;
  status: 'active' | 'inactive';
}

export default function Patients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    async function fetchPatients() {
      if (!user) return;
      try {
        const appointments = await getAppointments(user.uid, 'psychologist');
        
        // Group by student to create patient list
        const patientMap = new Map<string, Patient>();
        appointments.forEach(apt => {
          const existing = patientMap.get(apt.studentId);
          const aptDateStr = apt.date instanceof Date ? apt.date.toISOString() : String(apt.date);
          if (existing) {
            existing.totalSessions++;
            if (new Date(aptDateStr) > new Date(existing.lastSession)) {
              existing.lastSession = aptDateStr;
            }
          } else {
            patientMap.set(apt.studentId, {
              id: apt.studentId,
              name: apt.studentName,
              email: `${apt.studentName.toLowerCase().replace(' ', '.')}@student.edu`,
              lastSession: aptDateStr,
              totalSessions: 1,
              status: 'active'
            });
          }
        });
        
        setPatients(Array.from(patientMap.values()));
      } catch (error) {
        console.error('Error fetching patients:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Patients</h1>
          <p className="text-gray-500 mt-1">Manage and view your patient records</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-4 py-2 bg-primary/10 text-primary font-medium rounded-xl">
            {patients.length} Total Patients
          </span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search patients by name or email..."
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'active' | 'inactive')}
            className="px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">All Patients</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
          <p className="text-gray-500">Start accepting appointments to build your patient list.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20 transition-all cursor-pointer group"
              onClick={() => navigate(`/psychologist/patients/${patient.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary transition-colors">
                      {patient.name}
                    </h3>
                    <p className="text-sm text-gray-500">{patient.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="hidden sm:block text-center">
                    <p className="text-2xl font-bold text-gray-900">{patient.totalSessions}</p>
                    <p className="text-xs text-gray-500">Sessions</p>
                  </div>
                  <div className="hidden md:block text-center">
                    <p className="text-sm font-medium text-gray-700">
                      {new Date(patient.lastSession).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">Last Session</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                    patient.status === 'active' 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {patient.status}
                  </span>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100">
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/psychologist/messages'); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" />
                  Message
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); navigate('/psychologist/calendar'); }}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="w-4 h-4" />
                  Schedule
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
