import { useState, useEffect, useCallback } from 'react';
import { Heart } from 'lucide-react';

interface HeartAnimationProps {
  show: boolean;
  onComplete: () => void;
}

export default function HeartAnimation({ show, onComplete }: HeartAnimationProps) {
  const [visible, setVisible] = useState(false);

  const startAnimation = useCallback(() => {
    setVisible(true);
  }, []);

  useEffect(() => {
    if (show) {
      startAnimation();
      const timer = setTimeout(() => {
        setVisible(false);
        onComplete();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [show, startAnimation, onComplete]);

  if (!visible) return null;

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
      <Heart 
        className="w-16 h-16 text-red-500 fill-red-500"
        style={{
          animation: 'heartPop 0.8s ease-out forwards'
        }}
      />
      <style>{`
        @keyframes heartPop {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}
