import { Clock, Video, MessageCircle, Check, X } from 'lucide-react';
import type { Appointment } from '@/lib/firestore';

interface AppointmentCardProps {
  appointment: Appointment;
  isStudent?: boolean;
  isPsychologist?: boolean;
  onStatusUpdate: (id: string, status: Appointment['status']) => void;
}

const statusColors = { 
  pending: 'bg-amber-100 text-amber-700', 
  confirmed: 'bg-[#D8F3DC] text-[#2D6A4F]', 
  completed: 'bg-blue-100 text-blue-600', 
  cancelled: 'bg-[#FFB4B4]/50 text-[#D84A4A]' 
};

export default function AppointmentCard({ appointment, isStudent, isPsychologist, onStatusUpdate }: AppointmentCardProps) {
  const isPast = appointment.date < new Date();

  return (
    <div className="bg-white rounded-2xl p-5 border border-[#E0E0E0] shadow-sm">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-20 h-20 rounded-2xl bg-[#D8F3DC] flex flex-col items-center justify-center shrink-0">
          <span className="text-2xl font-bold text-[#2D6A4F]">{appointment.date.getDate()}</span>
          <span className="text-xs text-[#7F8C8D]">{appointment.date.toLocaleDateString('en', { month: 'short' })}</span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div>
              <h3 className="font-semibold text-[#2C3E50]" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {isStudent ? appointment.psychologistName : appointment.studentName}
              </h3>
              <div className="flex items-center gap-3 text-sm text-[#7F8C8D]">
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{appointment.time}</span>
                <span className="flex items-center gap-1">
                  {appointment.type === 'video' ? <Video className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                  {appointment.type === 'video' ? 'Video Call' : 'Chat'}
                </span>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${statusColors[appointment.status]}`}>
              {appointment.status}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {appointment.status === 'confirmed' && !isPast && (
              <button className="btn-primary text-sm py-2 flex items-center gap-1">
                {appointment.type === 'video' ? <><Video className="w-4 h-4" />Join Call</> : <><MessageCircle className="w-4 h-4" />Open Chat</>}
              </button>
            )}
            {isPsychologist && appointment.status === 'pending' && (
              <>
                <button onClick={() => onStatusUpdate(appointment.id!, 'confirmed')} className="px-4 py-2 rounded-xl bg-[#D8F3DC] text-[#2D6A4F] text-sm font-medium hover:bg-[#95D5B2] flex items-center gap-1">
                  <Check className="w-4 h-4" />Confirm
                </button>
                <button onClick={() => onStatusUpdate(appointment.id!, 'cancelled')} className="px-4 py-2 rounded-xl bg-[#FFB4B4]/30 text-[#D84A4A] text-sm font-medium hover:bg-[#FFB4B4]/50 flex items-center gap-1">
                  <X className="w-4 h-4" />Decline
                </button>
              </>
            )}
            {isStudent && appointment.status !== 'cancelled' && appointment.status !== 'completed' && !isPast && (
              <button onClick={() => onStatusUpdate(appointment.id!, 'cancelled')} className="px-4 py-2 rounded-xl text-sm text-[#7F8C8D] hover:bg-[#D8F3DC]/30">
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
