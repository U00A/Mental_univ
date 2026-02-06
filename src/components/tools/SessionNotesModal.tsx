import { useState } from 'react';
import { X, ClipboardList, Target, MessageCircle, Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { updateAppointmentNotes, type Appointment } from '@/lib/firestore';

interface SessionNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: Appointment;
  onSuccess: () => void;
}

export default function SessionNotesModal({ isOpen, onClose, appointment, onSuccess }: SessionNotesModalProps) {
  const [notes, setNotes] = useState(appointment.followUpNotes || '');
  const [homework, setHomework] = useState<string[]>(appointment.homework || []);
  const [newHomework, setNewHomework] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleAddHomework = () => {
    if (!newHomework.trim()) return;
    setHomework([...homework, newHomework.trim()]);
    setNewHomework('');
  };

  const removeHomework = (index: number) => {
    setHomework(homework.filter((_, i) => i !== index));
  };

  const handleSubmit = async (complete: boolean = false) => {
    try {
      setLoading(true);
      await updateAppointmentNotes(appointment.id!, {
        followUpNotes: notes,
        homework: homework,
        status: complete ? 'completed' : appointment.status
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving session notes:', err);
      alert('Failed to save session notes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="card-glass max-w-2xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b border-border flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
                <h2 className="text-xl font-bold text-text">Session Notes & Follow-up</h2>
                <p className="text-xs text-text-muted font-medium">Student: {appointment.studentName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-left">
          {/* Pre-Session Review */}
          {(appointment.preSessionConcerns || appointment.goals) && (
            <div className="space-y-4">
               <h3 className="text-xs font-black text-text-muted uppercase tracking-widest">Student Preparation</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {appointment.preSessionConcerns && (
                    <div className="p-4 rounded-2xl bg-success/5 border border-primary/10">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase mb-2">
                            <MessageCircle className="w-3 h-3" />
                            Current Concerns
                        </label>
                        <p className="text-sm text-text leading-relaxed italic">"{appointment.preSessionConcerns}"</p>
                    </div>
                  )}
                  {appointment.goals && (
                    <div className="p-4 rounded-2xl bg-success/5 border border-primary/10">
                        <label className="flex items-center gap-2 text-[10px] font-bold text-primary uppercase mb-2">
                            <Target className="w-3 h-3" />
                            Session Goal
                        </label>
                        <p className="text-sm text-text leading-relaxed italic">"{appointment.goals}"</p>
                    </div>
                  )}
               </div>
            </div>
          )}

          {/* Follow-up Notes */}
          <div className="space-y-3">
            <label className="text-xs font-black text-text-muted uppercase tracking-widest block">Clinical Notes & Summary</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary of today's session, breakthroughs, or areas for focus next time..."
              className="input min-h-[150px] py-4 bg-gray-50 border-none rounded-2xl"
            />
          </div>

          {/* Homework / Goals */}
          <div className="space-y-4">
            <label className="text-xs font-black text-text-muted uppercase tracking-widest block">Actionable Homework</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newHomework}
                onChange={(e) => setNewHomework(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddHomework()}
                placeholder="Add a task or goal for the student..."
                className="input"
              />
              <button
                onClick={handleAddHomework}
                className="btn btn-primary px-4 shrink-0"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {homework.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white border border-border group animate-in slide-in-from-left-2 transition-all">
                  <span className="text-sm text-text font-medium">{item}</span>
                  <button
                    onClick={() => removeHomework(i)}
                    className="p-1 px-2 rounded-lg text-text-muted hover:text-red-600 hover:bg-red-50 transition-colors md:opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {homework.length === 0 && (
                <p className="text-center py-4 text-sm text-text-muted italic border border-dashed border-border rounded-xl">No homework items added yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-white flex flex-col gap-3 shrink-0">
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={loading}
              className="btn btn-secondary flex-1"
            >
              Save Draft
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={loading}
              className="btn btn-primary flex-1 shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Complete Session
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] text-center text-text-muted font-medium">
            Completing the session will notify the student and allow them to view your summary.
          </p>
        </div>
      </div>
    </div>
  );
}
