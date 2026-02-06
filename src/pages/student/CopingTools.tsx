import { useState, useEffect, useRef } from 'react';
import { 
  Wind, 
  Activity, 
  Sun, 
  Play, 
  Pause, 
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart
} from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

interface BreathingExercise {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  holdAfter: number;
  color: string;
}

const breathingExercises: BreathingExercise[] = [
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'Calm your mind and reduce anxiety',
    inhale: 4,
    hold: 7,
    exhale: 8,
    holdAfter: 0,
    color: 'bg-blue-500'
  },
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Improve focus and concentration',
    inhale: 4,
    hold: 4,
    exhale: 4,
    holdAfter: 4,
    color: 'bg-purple-500'
  },
  {
    id: 'relax',
    name: 'Relaxing Breath',
    description: 'Deep relaxation for stress relief',
    inhale: 4,
    hold: 2,
    exhale: 6,
    holdAfter: 0,
    color: 'bg-green-500'
  },
  {
    id: 'energy',
    name: 'Energizing Breath',
    description: 'Quick energy boost',
    inhale: 2,
    hold: 0,
    exhale: 2,
    holdAfter: 0,
    color: 'bg-orange-500'
  }
];

const affirmations = [
  "I am capable of handling whatever comes my way",
  "This feeling is temporary and will pass",
  "I am doing the best I can, and that is enough",
  "I choose peace over worry",
  "I am stronger than I think",
  "Every breath I take calms my mind",
  "I deserve to take care of myself",
  "Progress, not perfection",
  "I am not alone in this journey",
  "My mental health matters"
];

export default function CopingTools() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(breathingExercises[0]);
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdAfter'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [meditationTime, setMeditationTime] = useState(5);
  const [isMeditating, setIsMeditating] = useState(false);
  const [meditationProgress, setMeditationProgress] = useState(0);
  
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const meditationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathPhase('inhale');
    setBreathProgress(0);
    runBreathingCycle();
  };

  const runBreathingCycle = () => {
    let phase: 'inhale' | 'hold' | 'exhale' | 'holdAfter' = 'inhale';
    let progress = 0;
    
    const cycle = () => {
      const duration = 
        phase === 'inhale' ? selectedExercise.inhale :
        phase === 'hold' ? selectedExercise.hold :
        phase === 'exhale' ? selectedExercise.exhale :
        selectedExercise.holdAfter;
      
      if (duration === 0) {
        phase = getNextPhase(phase);
        cycle();
        return;
      }
      
      const interval = setInterval(() => {
        progress += 100 / (duration * 10);
        setBreathProgress(progress);
        
        if (progress >= 100) {
          clearInterval(interval);
          phase = getNextPhase(phase);
          progress = 0;
          setBreathPhase(phase);
          
          if (phase === 'inhale') {
            setBreathCount(c => c + 1);
          }
          
          setTimeout(cycle, 100);
        }
      }, 100);
      
      breathIntervalRef.current = interval;
    };
    
    cycle();
  };

  const getNextPhase = (current: 'inhale' | 'hold' | 'exhale' | 'holdAfter'): 'inhale' | 'hold' | 'exhale' | 'holdAfter' => {
    if (current === 'inhale') return 'hold';
    if (current === 'hold') return 'exhale';
    if (current === 'exhale') return selectedExercise.holdAfter > 0 ? 'holdAfter' : 'inhale';
    return 'inhale';
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current);
    }
    setBreathProgress(0);
    setBreathPhase('inhale');
  };

  const startMeditation = () => {
    setIsMeditating(true);
    setMeditationProgress(0);
    
    const totalSeconds = meditationTime * 60;
    let elapsed = 0;
    
    meditationIntervalRef.current = setInterval(() => {
      elapsed += 1;
      setMeditationProgress((elapsed / totalSeconds) * 100);
      
      if (elapsed >= totalSeconds) {
        stopMeditation();
      }
    }, 1000);
  };

  const stopMeditation = () => {
    setIsMeditating(false);
    if (meditationIntervalRef.current) {
      clearInterval(meditationIntervalRef.current);
    }
    setMeditationProgress(0);
  };

  useEffect(() => {
    return () => {
      if (breathIntervalRef.current) clearInterval(breathIntervalRef.current);
      if (meditationIntervalRef.current) clearInterval(meditationIntervalRef.current);
    };
  }, []);

  const getPhaseText = () => {
    switch (breathPhase) {
      case 'inhale': return 'Breathe In';
      case 'hold': return 'Hold';
      case 'exhale': return 'Breathe Out';
      case 'holdAfter': return 'Hold';
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Coping Tools</h1>
          <p className="text-text-muted">Evidence-based techniques to help you manage stress and anxiety</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Breathing Exercises */}
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text flex items-center gap-2">
                  <Wind className="w-5 h-5 text-primary" />
                  Breathing Exercises
                </h2>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-text-muted"
                >
                  {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>

              {/* Exercise Selector */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {breathingExercises.map(exercise => (
                  <button
                    key={exercise.id}
                    onClick={() => {
                      stopBreathing();
                      setSelectedExercise(exercise);
                    }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      selectedExercise.id === exercise.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium text-text">{exercise.name}</p>
                    <p className="text-xs text-text-muted mt-1">{exercise.description}</p>
                  </button>
                ))}
              </div>

              {/* Breathing Visual */}
              <div className="relative flex items-center justify-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl">
                <div 
                  className={`w-48 h-48 rounded-full flex items-center justify-center transition-all duration-1000 ${selectedExercise.color} ${
                    isBreathing ? 'opacity-100' : 'opacity-30'
                  }`}
                  style={{
                    transform: isBreathing 
                      ? breathPhase === 'inhale' 
                        ? `scale(${1 + breathProgress * 0.5})`
                        : breathPhase === 'exhale'
                        ? `scale(${1.5 - breathProgress * 0.5})`
                        : breathPhase === 'holdAfter'
                        ? 'scale(1)'
                        : 'scale(1.5)'
                      : 'scale(1)',
                    opacity: isBreathing ? 0.3 + (breathProgress * 0.4) : 0.3
                  }}
                >
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-4xl">
                      {breathPhase === 'inhale' ? '🌬️' : 
                       breathPhase === 'hold' ? '⏸️' : 
                       breathPhase === 'exhale' ? '😮‍💨' : '⏸️'}
                    </span>
                  </div>
                </div>

                {/* Phase Indicator */}
                {isBreathing && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-center">
                    <p className="text-2xl font-bold text-text">{getPhaseText()}</p>
                    <p className="text-sm text-text-muted">Breaths completed: {breathCount}</p>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={isBreathing ? stopBreathing : startBreathing}
                  className="btn btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {isBreathing ? (
                    <><Pause className="w-5 h-5" /> Stop</>
                  ) : (
                    <><Play className="w-5 h-5" /> Start</>
                  )}
                </button>
                <button
                  onClick={() => {
                    stopBreathing();
                    setBreathCount(0);
                  }}
                  className="btn btn-secondary"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Quick Grounding Technique */}
            <div className="card">
              <h3 className="font-semibold text-text mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                5-4-3-2-1 Grounding
              </h3>
              <div className="space-y-3">
                {[
                  { num: 5, text: 'things you can SEE', icon: '👁️' },
                  { num: 4, text: 'things you can TOUCH', icon: '✋' },
                  { num: 3, text: 'things you can HEAR', icon: '👂' },
                  { num: 2, text: 'things you can SMELL', icon: '👃' },
                  { num: 1, text: 'thing you can TASTE', icon: '👅' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <span className="font-bold text-primary">{item.num}</span>
                      <span className="text-text ml-2">{item.text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Meditation Timer */}
            <div className="card">
              <h2 className="text-lg font-semibold text-text mb-6 flex items-center gap-2">
                <Sun className="w-5 h-5 text-primary" />
                Quick Meditation
              </h2>

              {!isMeditating ? (
                <div className="space-y-4">
                  <label className="text-sm text-text-muted">Select duration</label>
                  <div className="grid grid-cols-4 gap-2">
                    {[3, 5, 10, 15].map(minutes => (
                      <button
                        key={minutes}
                        onClick={() => setMeditationTime(minutes)}
                        className={`p-3 rounded-xl font-medium transition-colors ${
                          meditationTime === minutes
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-text hover:bg-gray-200'
                        }`}
                      >
                        {minutes}m
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={startMeditation}
                    className="btn btn-primary w-full mt-4"
                  >
                    Start Meditation
                  </button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="relative w-40 h-40 mx-auto mb-6">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="70"
                        stroke="#2D6A4F"
                        strokeWidth="8"
                        fill="none"
                        strokeLinecap="round"
                        style={{
                          strokeDasharray: 440,
                          strokeDashoffset: 440 - (440 * meditationProgress) / 100
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-text">
                        {formatTime(Math.ceil((meditationTime * 60 * (100 - meditationProgress)) / 100))}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={stopMeditation}
                    className="btn btn-secondary"
                  >
                    End Session
                  </button>
                </div>
              )}
            </div>

            {/* Affirmations */}
            <div className="card bg-gradient-to-br from-primary/5 to-purple-50">
              <h2 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                Daily Affirmations
              </h2>
              
              <div className="min-h-[120px] flex items-center justify-center p-4 bg-white/50 rounded-xl mb-4">
                <p className="text-center text-lg text-text font-medium">
                  "{affirmations[currentAffirmation]}"
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentAffirmation((prev) => (prev - 1 + affirmations.length) % affirmations.length)}
                  className="btn btn-secondary flex-1"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentAffirmation((prev) => (prev + 1) % affirmations.length)}
                  className="btn btn-primary flex-1"
                >
                  Next
                </button>
              </div>
            </div>

            {/* Emergency Resources */}
            <div className="card border-red-200 bg-red-50">
              <h3 className="font-semibold text-red-700 mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Need Immediate Help?
              </h3>
              <p className="text-sm text-red-600 mb-4">
                If you're in crisis, please reach out to these resources:
              </p>
              <div className="space-y-2">
                <a href="tel:988" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">24/7</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">Suicide & Crisis Lifeline</p>
                    <p className="text-sm text-text-muted">Call or text 988</p>
                  </div>
                </a>
                <a href="tel:911" className="flex items-center gap-3 p-3 bg-white rounded-lg hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-bold">911</span>
                  </div>
                  <div>
                    <p className="font-medium text-text">Emergency Services</p>
                    <p className="text-sm text-text-muted">For immediate danger</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
