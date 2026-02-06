import { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check, Loader2, Sparkles } from 'lucide-react';
import { saveMatchingPreferences, getMatchedPsychologists, type Psychologist } from '@/lib/firestore';
import { useAuth } from '@/contexts/AuthContext';

interface QuizOption {
  value: string;
  label: string;
  desc?: string;
}

interface QuizStep {
  question: string;
  key: string;
  multiple?: boolean;
  options: QuizOption[];
}

interface MatchingQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (matches: Psychologist[]) => void;
}

const steps: QuizStep[] = [
  {
    question: 'How would you describe your social energy?',
    key: 'personality',
    options: [
      { value: 'introvert', label: 'Introvert', desc: 'I prefer calm, one-on-one interactions' },
      { value: 'extrovert', label: 'Extrovert', desc: 'I thrive in lively, open discussions' },
      { value: 'ambivert', label: 'Ambivert', desc: "I'm flexible depending on the situation" },
    ],
  },
  {
    question: 'What communication style works best for you?',
    key: 'communicationStyle',
    options: [
      { value: 'direct', label: 'Direct', desc: 'Clear, straightforward feedback' },
      { value: 'empathetic', label: 'Empathetic', desc: 'Warm, supportive, and gentle approach' },
      { value: 'balanced', label: 'Balanced', desc: 'A mix of both depending on the topic' },
    ],
  },
  {
    question: 'What concerns would you like to address?',
    key: 'concerns',
    multiple: true,
    options: [
      { value: 'anxiety', label: 'Anxiety' },
      { value: 'depression', label: 'Depression' },
      { value: 'academic-stress', label: 'Academic Stress' },
      { value: 'relationships', label: 'Relationships' },
      { value: 'self-esteem', label: 'Self-Esteem' },
      { value: 'grief', label: 'Grief & Loss' },
      { value: 'trauma', label: 'Trauma' },
      { value: 'addiction', label: 'Addiction' },
    ],
  },
];

export default function MatchingQuizModal({ isOpen, onClose, onComplete }: MatchingQuizModalProps) {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [matches, setMatches] = useState<Psychologist[]>([]);

  if (!isOpen) return null;

  const step = steps[currentStep];
  const isMultiple = step.multiple;
  const currentAnswer = answers[step.key];

  const handleSelect = (value: string) => {
    if (isMultiple) {
      const arr = (currentAnswer as string[]) || [];
      if (arr.includes(value)) {
        setAnswers({ ...answers, [step.key]: arr.filter(v => v !== value) });
      } else {
        setAnswers({ ...answers, [step.key]: [...arr, value] });
      }
    } else {
      setAnswers({ ...answers, [step.key]: value });
      if (currentStep < steps.length - 1) {
        setTimeout(() => setCurrentStep(currentStep + 1), 300);
      }
    }
  };

  const canProceed = () => {
    if (isMultiple) return (currentAnswer as string[])?.length > 0;
    return !!currentAnswer;
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      setSubmitting(true);
      await saveMatchingPreferences({
        userId: user.uid,
        personality: answers.personality as 'introvert' | 'extrovert' | 'ambivert',
        communicationStyle: answers.communicationStyle as 'direct' | 'empathetic' | 'balanced',
        concerns: answers.concerns as string[],
      });

      const matched = await getMatchedPsychologists(user.uid);
      setMatches(matched);
      setCompleted(true);
      onComplete?.(matched);
    } catch (err) {
      console.error('Error saving preferences:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(0);
    setAnswers({});
    setCompleted(false);
    setMatches([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-[40px] w-full max-w-xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="relative p-8 pb-6 border-b border-gray-50">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-xl hover:bg-gray-50 text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-black text-text">Find Your Match</h2>
          </div>
          <p className="text-sm text-text-muted font-medium">
            Answer a few questions to find psychologists best suited for you.
          </p>
        </div>

        {/* Body */}
        {!completed ? (
          <div className="p-8">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= currentStep ? 'bg-primary' : 'bg-gray-100'
                  }`}
                />
              ))}
            </div>

            {/* Question */}
            <h3 className="text-lg font-bold text-text mb-6">{step.question}</h3>

            {/* Options */}
            <div className={`grid gap-3 ${isMultiple ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {step.options.map((opt) => {
                const isSelected = isMultiple
                  ? (currentAnswer as string[])?.includes(opt.value)
                  : currentAnswer === opt.value;

                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                        : 'bg-white border-gray-100 hover:border-primary/30 hover:bg-primary/5'
                    }`}
                  >
                    <span className="font-bold block">{opt.label}</span>
                    {opt.desc && (
                      <span className={`text-xs ${isSelected ? 'text-white/80' : 'text-text-muted'}`}>
                        {opt.desc}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-50">
              <button
                onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-sm font-bold text-text-muted hover:text-primary disabled:opacity-30 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {currentStep === steps.length - 1 ? (
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !canProceed()}
                  className="btn btn-primary px-8 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Find Matches
                </button>
              ) : (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={!canProceed()}
                  className="flex items-center gap-1 text-sm font-bold text-primary hover:underline disabled:opacity-30 transition-colors"
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
            <h3 className="text-2xl font-black text-text mb-2">Matching Complete!</h3>
            <p className="text-text-muted font-medium mb-6">
              {matches.length > 0
                ? `We found ${matches.length} psychologist${matches.length > 1 ? 's' : ''} suited for you.`
                : 'No exact matches found. Browse all psychologists below.'}
            </p>
            <button
              onClick={handleClose}
              className="btn btn-primary px-10 rounded-full"
            >
              View Results
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
