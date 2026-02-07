import { useState, useEffect } from 'react';
import { Calendar, Clock, Video, MessageSquare, X, Loader2, Target, Check, ClipboardList } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments, cancelAppointment, type Appointment } from '@/lib/firestore';
import PreSessionModal from '@/components/tools/PreSessionModal';
import SessionNotesModal from '@/components/tools/SessionNotesModal';
import { useNavigate } from 'react-router-dom';

export default function Appointments() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('upcoming');
  const [error, setError] = useState('');
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [showPreSession, setShowPreSession] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!profile?.uid) return;
      try {
        setLoading(true);
        const data = await getAppointments(profile.uid, profile.role as 'student' | 'psychologist');
        setAppointments(data);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to load appointments. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [profile]);

  const filteredAppointments = appointments.filter(apt => {
    const isPast = new Date(apt.date) < new Date();
    if (filter === 'upcoming') return !isPast;
    if (filter === 'past') return isPast;
    return true;
  });

  const handleCancel = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await cancelAppointment(id);
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      alert('Failed to cancel appointment. Please try again.');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">My Appointments</h1>
          <p className="text-text-muted">Manage your scheduled sessions</p>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {(['all', 'upcoming', 'past'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
                filter === f 
                  ? 'bg-primary text-white' 
                  : 'bg-white border border-border text-text-muted hover:border-primary'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Status Messages */}
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
            <p className="text-text-muted">Loading your schedule...</p>
          </div>
        ) : (
          <>
            {/* Appointments List */}
            <div className="space-y-4">
              {filteredAppointments.map((apt) => (
                <div key={apt.id} className="card flex flex-col sm:flex-row gap-4 group">
                  {/* Date Box */}
                  <div className="w-20 h-20 rounded-xl bg-success/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-2xl font-bold text-primary">{new Date(apt.date).getDate()}</span>
                    <span className="text-xs text-text-muted">
                      {new Date(apt.date).toLocaleDateString('en', { month: 'short' })}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-text truncate">
                        {profile?.role === 'student' ? apt.psychologistName : apt.studentName}
                      </h3>
                      <span className={`badge ${
                        apt.status === 'confirmed' ? 'badge-green' : 
                        apt.status === 'pending' ? 'badge-amber' : 
                        apt.status === 'cancelled' ? 'badge-red' : 'badge-gray'
                      } capitalize`}>
                        {apt.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-text-muted">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {apt.time}
                      </div>
                      <div className="flex items-center gap-1">
                        {apt.type === 'video' ? <Video className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
                        {apt.type === 'video' ? 'Video Call' : 'Chat'}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-4 flex-wrap">
                      {apt.status === 'confirmed' && (
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => apt.type === 'video' ? navigate(`/call/${apt.id}`) : navigate('/messages')}
                            className="btn btn-primary btn-sm"
                          >
                            {apt.type === 'video' ? <><Video className="w-4 h-4" /> Join Call</> : <><MessageSquare className="w-4 h-4" /> Open Chat</>}
                          </button>
                          
                          {profile?.role === 'student' && !apt.preSessionConcerns && (
                            <button 
                              onClick={() => {
                                setSelectedAppointmentId(apt.id!);
                                setShowPreSession(true);
                              }}
                              className="btn btn-secondary btn-sm bg-success/10 text-primary border-primary/20"
                            >
                                <Target className="w-4 h-4" />
                                Preparation
                            </button>
                          )}

                          {profile?.role === 'psychologist' && (
                            <button 
                                onClick={() => {
                                    setActiveAppointment(apt);
                                    setShowNotes(true);
                                }}
                                className="btn btn-secondary btn-sm bg-primary/10 text-primary border-primary/20"
                            >
                                <ClipboardList className="w-4 h-4" />
                                Session Notes
                            </button>
                          )}

                          {apt.preSessionConcerns && (
                             <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/10">
                                <Check className="w-3.5 h-3.5" />
                                PREPARED
                             </div>
                          )}
                        </div>
                      )}

                      {(apt.status === 'completed' || apt.followUpNotes) && (
                         <button 
                            onClick={() => {
                                setActiveAppointment(apt);
                                setShowNotes(true);
                            }}
                            className="btn btn-secondary btn-sm border-primary/20 text-text"
                         >
                            <ClipboardList className="w-4 h-4" />
                            {profile?.role === 'student' ? 'View Notes' : 'Edit Notes'}
                         </button>
                      )}

                      {apt.status !== 'cancelled' && apt.status !== 'completed' && (
                        <button 
                          onClick={() => handleCancel(apt.id!)}
                          className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50 border-red-100"
                        >
                          <X className="w-4 h-4" />
                          Cancel Message
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredAppointments.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-border">
                  <Calendar className="w-12 h-12 mx-auto text-border mb-4" />
                  <p className="text-text-muted">No appointments found</p>
                  {profile?.role === 'student' && (
                    <button 
                      onClick={() => navigate('/psychologists')}
                      className="mt-4 btn btn-primary"
                    >
                      Book Your First Session
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

      {selectedAppointmentId && (
        <PreSessionModal 
          isOpen={showPreSession}
          onClose={() => {
            setShowPreSession(false);
            setSelectedAppointmentId(null);
          }}
          appointmentId={selectedAppointmentId}
          onSuccess={() => {
            setAppointments(prev => prev.map(a => 
              a.id === selectedAppointmentId ? { ...a, preSessionConcerns: 'Done' } : a
            ));
          }}
        />
      )}

      {activeAppointment && (
          <SessionNotesModal 
            isOpen={showNotes}
            onClose={() => {
                setShowNotes(false);
                setActiveAppointment(null);
            }}
            appointment={activeAppointment}
            onSuccess={() => {
                const fetchData = async () => {
                    if (!profile?.uid) return;
                    const data = await getAppointments(profile.uid, profile.role as 'student' | 'psychologist');
                    setAppointments(data);
                };
                fetchData();
            }}
          />
      )}
    </div>
  );
}
