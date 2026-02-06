import React, { useState } from 'react';
import { X, Target, Heart, MessageCircle, Info, Loader2 } from 'lucide-react';
import { updateAppointmentPrep } from '@/lib/firestore';

interface PreSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  onSuccess: () => void;
}

export default function PreSessionModal({ isOpen, onClose, appointmentId, onSuccess }: PreSessionModalProps) {
  const [concerns, setConcerns] = useState('');
  const [goals, setGoals] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await updateAppointmentPrep(appointmentId, {
        preSessionConcerns: concerns,
        goals: goals
      });
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error saving session prep:', err);
      alert('Failed to save session preparation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="card-glass max-w-xl w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8 text-left">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-text">Session Preparation</h2>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-text-muted transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-text-muted mb-8 leading-relaxed">
            Taking a few minutes to reflect before your session can help you get the most out of your time with your therapist.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-text uppercase tracking-wider">
                <Heart className="w-4 h-4 text-primary" />
                How are you feeling right now?
              </label>
              <textarea
                value={concerns}
                onChange={(e) => setConcerns(e.target.value)}
                placeholder="Share any major concerns or events since your last session..."
                className="input min-h-[120px] py-4"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-bold text-text uppercase tracking-wider">
                <MessageCircle className="w-4 h-4 text-primary" />
                What's your primary goal for today?
              </label>
              <input
                type="text"
                value={goals}
                onChange={(e) => setGoals(e.target.value)}
                placeholder="e.g., Managing exam anxiety, improving sleep..."
                className="input"
                required
              />
            </div>

            <div className="bg-primary/5 rounded-2xl p-4 flex gap-3 items-start border border-primary/10">
              <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-primary font-medium">
                Your psychologist will review this before your call to better understand how to support you today.
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex-1 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Ready for Session'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
