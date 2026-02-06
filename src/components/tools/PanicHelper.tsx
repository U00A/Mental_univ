import { useState, useEffect } from 'react';
import { X, Wind, Heart, Shield, Phone, MessageSquare } from 'lucide-react';

interface PanicHelperProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PanicHelper({ isOpen, onClose }: PanicHelperProps) {
  const [phase, setPhase] = useState<'breathe' | 'grounding' | 'emergency'>('breathe');
  const [breathStage, setBreathStage] = useState<'inhale' | 'hold' | 'exhale' | 'hold-out'>('inhale');
  const [breathProgress, setBreathProgress] = useState(0);

  // Breathing Logic (Box Breathing: 4-4-4-4)
  useEffect(() => {
    if (!isOpen || phase !== 'breathe') return;

    let timer: ReturnType<typeof setInterval>;
    const duration = 4000; // 4 seconds per stage
    const interval = 100; // Update progress every 100ms
    const steps = duration / interval;
    let currentStep = 0;

    timer = setInterval(() => {
      currentStep++;
      setBreathProgress((currentStep / steps) * 100);

      if (currentStep >= steps) {
        currentStep = 0;
        setBreathStage((prev) => {
          if (prev === 'inhale') return 'hold';
          if (prev === 'hold') return 'exhale';
          if (prev === 'exhale') return 'hold-out';
          return 'inhale';
        });
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isOpen, phase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary/20 backdrop-blur-xl animate-in fade-in duration-500" 
        onClick={onClose} 
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-xl bg-white/90 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/50 overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-500">
        
        {/* Header */}
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-text">Calm Space</h2>
              <p className="text-xs text-text-muted font-medium">You are safe. We are here with you.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 text-text-muted transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex p-2 gap-2 bg-gray-50/50">
          {[
            { id: 'breathe', icon: Wind, label: 'Breathe' },
            { id: 'grounding', icon: Heart, label: 'Ground' },
            { id: 'emergency', icon: Phone, label: 'Support' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setPhase(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl transition-all font-bold text-sm ${
                phase === tab.id 
                  ? 'bg-white text-primary shadow-sm ring-1 ring-border/50' 
                  : 'text-text-muted hover:bg-white/50'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-10">
          {phase === 'breathe' && (
            <div className="flex flex-col items-center text-center">
              {/* Breathing Circle Animation */}
              <div className="relative w-64 h-64 flex items-center justify-center mb-10">
                {/* Outer Glow */}
                <div className={`absolute inset-0 rounded-full bg-primary/10 transition-transform duration-[4000ms] ease-in-out ${
                  breathStage === 'inhale' ? 'scale-150 opacity-50' : 
                  breathStage === 'hold' ? 'scale-150 opacity-70' : 
                  breathStage === 'exhale' ? 'scale-100 opacity-30' : 'scale-100 opacity-10'
                }`} />
                
                {/* Main Circle */}
                <div 
                  className={`w-48 h-48 rounded-full bg-gradient-to-br from-primary to-primary-light shadow-2xl flex items-center justify-center transition-transform duration-[4000ms] ease-in-out ${
                    breathStage === 'inhale' ? 'scale-125' : 
                    breathStage === 'hold' ? 'scale-125' : 
                    breathStage === 'exhale' ? 'scale-100' : 'scale-100'
                  }`}
                >
                  <Wind className="w-12 h-12 text-white animate-pulse" />
                </div>

                {/* Text Indicator */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <p className="text-2xl font-black text-white drop-shadow-md uppercase tracking-widest mt-12">
                     {breathStage === 'inhale' ? 'Inhale' : 
                      breathStage === 'hold' ? 'Hold' : 
                      breathStage === 'exhale' ? 'Exhale' : 'Rest'}
                   </p>
                </div>
              </div>
              
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-primary transition-all duration-100" 
                  style={{ width: `${breathProgress}%` }}
                />
              </div>
              <p className="text-text-muted font-medium italic">Follow the visual rhythm to steady your heart rate.</p>
            </div>
          )}

          {phase === 'grounding' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-text mb-2">5-4-3-2-1 Grounding</h3>
                <p className="text-sm text-text-muted">Acknowledge these things around you right now:</p>
              </div>
              <div className="grid gap-3">
                {[
                  { n: 5, t: 'Things you can SEE', c: 'bg-blue-50 text-blue-700' },
                  { n: 4, t: 'Things you can TOUCH', c: 'bg-green-50 text-green-700' },
                  { n: 3, t: 'Things you can HEAR', c: 'bg-purple-50 text-purple-700' },
                  { n: 2, t: 'Things you can SMELL', c: 'bg-orange-50 text-orange-700' },
                  { n: 1, t: 'Thing you can TASTE', c: 'bg-red-50 text-red-700' },
                ].map((item) => (
                  <div key={item.n} className={`p-4 rounded-2xl flex items-center gap-4 border border-transparent hover:border-border transition-all cursor-default group`}>
                    <div className={`w-10 h-10 rounded-xl ${item.c} flex items-center justify-center font-black text-lg group-hover:scale-110 transition-transform`}>
                      {item.n}
                    </div>
                    <span className="font-bold text-text">{item.t}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {phase === 'emergency' && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-text mb-2">Immediate Support</h3>
                <p className="text-sm text-text-muted">You don't have to carry this alone.</p>
              </div>
              <div className="grid gap-4">
                <a href="tel:1055" className="flex items-center justify-between p-5 bg-red-50 rounded-2xl border border-red-100 hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-red-900">Emergency (Gendarmerie)</p>
                      <p className="text-xs text-red-700 font-bold uppercase tracking-widest">Call 1055</p>
                    </div>
                  </div>
                  <div className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Call Now</div>
                </a>
                
                <a href="tel:021444444" className="flex items-center justify-between p-5 bg-primary/5 rounded-2xl border border-primary/10 hover:shadow-md transition-all group">
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-text">Mental Health Helpline</p>
                      <p className="text-xs text-text-muted font-bold uppercase tracking-widest">Available 24/7</p>
                    </div>
                  </div>
                  <div className="bg-primary text-white px-4 py-2 rounded-xl text-xs font-black uppercase">Speak Now</div>
                </a>
              </div>
              <p className="text-[10px] text-center text-text-muted px-6 font-medium italic">
                If you are in immediate physical danger, please contact local emergency services immediately.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
