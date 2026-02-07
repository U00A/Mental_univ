import { useState, useCallback } from 'react';

interface UseDoubleTapOptions {
  onDoubleTap: () => void;
  onSingleTap?: () => void;
  delay?: number;
}

export function useDoubleTap({ onDoubleTap, onSingleTap, delay = 300 }: UseDoubleTapOptions) {
  const [lastTap, setLastTap] = useState<number>(0);
  const [tapTimeout, setTapTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  const handleTap = useCallback(() => {
    const now = Date.now();
    
    if (now - lastTap < delay) {
      // Double tap detected
      if (tapTimeout) {
        clearTimeout(tapTimeout);
        setTapTimeout(null);
      }
      onDoubleTap();
      setLastTap(0);
    } else {
      // Potential single tap - wait for second tap
      setLastTap(now);
      const timeout = setTimeout(() => {
        if (onSingleTap) {
          onSingleTap();
        }
        setTapTimeout(null);
      }, delay);
      setTapTimeout(timeout);
    }
  }, [lastTap, delay, onDoubleTap, onSingleTap, tapTimeout]);

  return handleTap;
}
