import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { logSymptomEntry } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface SymptomCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (score: number) => void;
}

const questions = [
  { id: 1, text: 'I have been feeling calm and peaceful this week.', category: 'Anxiety' },
  { id: 2, text: 'I have been able to focus on my tasks and studies.', category: 'Focus' },
  { id: 3, text: 'I have felt motivated to complete my daily activities.', category: 'Energy' },
  { id: 4, text: 'I have felt connected to friends or family.', category: 'Social' },
  { id: 5, text: 'I have been sleeping well and feeling rested.', category: 'Sleep' },
];

const ratingLabels = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

export default function SymptomCheckerModal({ isOpen, onClose, onComplete }: SymptomCheckerModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  if (!isOpen) return null;

  const handleAnswer = (rating: number) => {
    const newAnswers = [...answers];
    newAnswers[currentStep] = rating;
    setAnswers(newAnswers);

    if (currentStep < questions.length - 1) {
      setTimeout(() => setCurrentStep(currentStep + 1), 300);
    }
  };

  const calculateScore = () => {
    const totalPossible = questions.length * 4; // Max rating is 4 (index)
    const totalScore = answers.reduce((sum, a) => sum + (a >= 0 ? a : 0), 0);
    return Math.round((totalScore / totalPossible) * 100);
  };

  const handleSubmit = async () => {
    if (!user || answers.some(a => a < 0)) return;

    try {
      setSubmitting(true);
      const score = calculateScore();
      setFinalScore(score);

      await logSymptomEntry({
        userId: user.uid,
        answers: questions.map((q, i) => ({ question: q.text, rating: answers[i] })),
        score,
        notes: notes.trim() || undefined,
        date: new Date(),
      });

      setCompleted(true);
      onComplete?.(score);
    } catch (err) {
      console.error('Error saving symptom entry:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setAnswers(new Array(questions.length).fill(-1));
    setNotes('');
    setCompleted(false);
    onClose();
  };

  const allAnswered = answers.every(a => a >= 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-gray-50">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-50 text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black text-text">Wellness Check-In</h2>
          <p className="text-sm text-text-muted font-medium mt-1">
            Rate how you've been feeling this week. This is for your personal insight only.
          </p>
          
          {/* Disclaimer */}
          <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
              Non-Diagnostic Tool
            </p>
          </div>
        </div>

        {/* Body */}
        {!completed ? (
          <div className="p-8">
            {/* Progress Bar */}
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden mb-8">
              <div 
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${((currentStep + 1) / questions.length) * 100}%` }}
              />
            </div>

            {/* Question */}
            <div className="mb-8">
              <span className="text-xs font-black text-primary uppercase tracking-widest mb-3 block">
                Question {currentStep + 1} of {questions.length}
              </span>
              <p className="text-lg font-bold text-text leading-relaxed">
                {questions[currentStep].text}
              </p>
            </div>

            {/* Rating Options */}
            <div className="grid grid-cols-5 gap-2 mb-8">
              {ratingLabels.map((label, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(index)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                    answers[currentStep] === index
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-white border-gray-100 text-text-muted hover:border-primary/30 hover:bg-primary/5'
                  }`}
                >
                  <span className="text-lg font-black">{index + 1}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-center">{label}</span>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-sm font-bold text-text-muted hover:text-primary disabled:opacity-30 disabled:hover:text-text-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {currentStep === questions.length - 1 && allAnswered ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="btn btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Complete
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(Math.min(questions.length - 1, currentStep + 1))}
                  disabled={answers[currentStep] < 0}
                  className="flex items-center gap-1 text-sm font-bold text-primary hover:underline disabled:opacity-30 disabled:hover:no-underline transition-colors"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Check className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-black text-text mb-2">Check-In Complete!</h3>
            <p className="text-text-muted font-medium mb-6">Your wellness score has been recorded.</p>
            
            <div className="bg-gray-50 rounded-3xl p-6 mb-8">
              <span className="text-5xl font-black text-primary">{finalScore}</span>
              <span className="text-2xl font-bold text-text-muted">/100</span>
            </div>

            <button
              onClick={handleClose}
              className="btn btn-primary px-10 rounded-full"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
