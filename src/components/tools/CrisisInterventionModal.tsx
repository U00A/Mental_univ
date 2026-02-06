
import { Phone, ShieldAlert, Heart, X, ArrowRight } from 'lucide-react';

interface CrisisInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPanicHelper: () => void;
}

export default function CrisisInterventionModal({ isOpen, onClose, onOpenPanicHelper }: CrisisInterventionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="card-glass max-w-lg w-full rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="relative p-8 text-center">
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 text-text-muted transition-colors"
            >
                <X className="w-5 h-5" />
            </button>

            {/* Icon */}
            <div className="w-20 h-20 rounded-3xl bg-red-100 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-200/50">
                <ShieldAlert className="w-10 h-10 text-red-600" />
            </div>

            {/* Content */}
            <h2 className="text-3xl font-bold text-text mb-4 tracking-tight">We Care About You</h2>
            <p className="text-lg text-text-muted mb-8 leading-relaxed font-medium">
                It sounds like you're going through a very difficult time right now. Please know that you're not alone and help is available immediately.
            </p>

            {/* Action Cards */}
            <div className="space-y-4">
                <a 
                    href="tel:988" 
                    className="flex items-center justify-between p-5 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-200 group active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                            <Phone className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">Call 988</p>
                            <p className="text-xs text-white/80">Suicide & Crisis Lifeline</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-50 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </a>

                <button 
                    onClick={() => {
                        onClose();
                        onOpenPanicHelper();
                    }}
                    className="w-full flex items-center justify-between p-5 rounded-2xl bg-white border border-border hover:border-primary/50 text-text hover:bg-gray-50 transition-all shadow-sm group active:scale-[0.98]"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Heart className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">Panic Relief</p>
                            <p className="text-xs text-text-muted">Guided Breathing & Grounding</p>
                        </div>
                    </div>
                    <ArrowRight className="w-5 h-5 opacity-20 group-hover:opacity-100 transform group-hover:translate-x-1 transition-all" />
                </button>
            </div>

            {/* Secondary Option */}
            <button 
                onClick={onClose}
                className="mt-8 text-sm font-bold text-text-muted hover:text-text transition-colors tracking-wide"
            >
                I'M OKAY FOR NOW
            </button>
        </div>
      </div>
    </div>
  );
}
