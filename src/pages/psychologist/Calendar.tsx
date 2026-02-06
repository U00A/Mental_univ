import { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  User, 
  Video, 
  Calendar as CalendarIcon,
  Plus,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointments, updateAppointmentStatus } from '@/lib/firestore';
import type { Appointment } from '@/lib/firestore';

export default function PsychologistCalendar() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAppointments() {
      if (!user) return;
      try {
        const data = await getAppointments(user.uid, 'psychologist');
        setAppointments(data);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, [user]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1));
      return newDate;
    });
  };

  const handleStatusUpdate = async (appointmentId: string, status: Appointment['status']) => {
    try {
      await updateAppointmentStatus(appointmentId, status);
      setAppointments(appointments.map(apt => 
        apt.id === appointmentId ? { ...apt, status } : apt
      ));
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const today = new Date();
  const selectedDateAppointments = selectedDate ? getAppointmentsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text">Calendar</h1>
            <p className="text-text-muted mt-1">Manage your schedule and appointments</p>
          </div>
          <button
            onClick={() => setShowAddSlot(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Availability
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-text">
                  {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {weekDays.map(day => (
                  <div key={day} className="text-center text-sm font-medium text-text-muted py-2">
                    {day}
                  </div>
                ))}
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="aspect-square" />;
                  }

                  const dayAppointments = getAppointmentsForDate(date);
                  const hasAppointments = dayAppointments.length > 0;
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = selectedDate?.toDateString() === date.toDateString();

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`aspect-square p-2 rounded-lg flex flex-col items-center justify-start transition-all ${
                        isSelected
                          ? 'bg-primary text-white'
                          : isToday
                          ? 'bg-primary/10 text-primary'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`text-sm font-medium ${isSelected ? 'text-white' : 'text-text'}`}>
                        {date.getDate()}
                      </span>
                      {hasAppointments && (
                        <div className={`flex gap-0.5 mt-1 ${isSelected ? 'opacity-100' : ''}`}>
                          {dayAppointments.slice(0, 3).map((_, i) => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-white' : 'bg-primary'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming Overview */}
            <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-text mb-4">Upcoming This Week</h3>
              <div className="space-y-3">
                {appointments
                  .filter(apt => new Date(apt.date) >= new Date())
                  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                  .slice(0, 5)
                  .map(apt => (
                    <div key={apt.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {apt.studentName.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-text">{apt.studentName}</p>
                        <p className="text-sm text-text-muted">
                          {new Date(apt.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} at {apt.time}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Sidebar - Selected Date Details */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
              <h3 className="font-semibold text-text mb-4">
                {selectedDate 
                  ? selectedDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })
                  : 'Select a date'
                }
              </h3>

              {selectedDate && (
                <div className="space-y-3">
                  {selectedDateAppointments.length === 0 ? (
                    <div className="text-center py-8 text-text-muted">
                      <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No appointments</p>
                      <p className="text-sm">This day is clear</p>
                    </div>
                  ) : (
                    selectedDateAppointments.map(apt => (
                      <div key={apt.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-semibold text-text">{apt.time}</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            apt.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            apt.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            apt.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {apt.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                          <User className="w-4 h-4 text-text-muted" />
                          <span className="text-sm text-text">{apt.studentName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-muted mb-3">
                          <Video className="w-4 h-4" />
                          <span>{apt.type} • {apt.duration} min</span>
                        </div>
                        
                        {apt.status === 'pending' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleStatusUpdate(apt.id!, 'confirmed')}
                              className="flex-1 py-1.5 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleStatusUpdate(apt.id!, 'cancelled')}
                              className="flex-1 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600"
                            >
                              Decline
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Availability Modal */}
      {showAddSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-text">Add Availability</h3>
              <button onClick={() => setShowAddSlot(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-text-muted mb-4">
              Set your available time slots for students to book appointments.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-text-muted mb-1 block">Date</label>
                <input type="date" className="input w-full" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-text-muted mb-1 block">Start Time</label>
                  <input type="time" className="input w-full" />
                </div>
                <div>
                  <label className="text-sm text-text-muted mb-1 block">End Time</label>
                  <input type="time" className="input w-full" />
                </div>
              </div>
              <button
                onClick={() => setShowAddSlot(false)}
                className="btn btn-primary w-full"
              >
                Add Time Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
