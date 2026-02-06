import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface VoicePlayerProps {
  url: string;
  duration: string;
  isMe: boolean;
}

export default function VoicePlayer({ url, duration, isMe }: VoicePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio(url);
    audioRef.current = audio;

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setProgress(0);
    };

    audio.addEventListener('timeupdate', updateProgress);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateProgress);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
  }, [url]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 min-w-[200px] py-1 cursor-default">
      <button
        onClick={togglePlay}
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 ${
          isMe 
            ? 'bg-white/20 text-white hover:bg-white/30' 
            : 'bg-primary/10 text-primary hover:bg-primary/20'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5 fill-current" />
        ) : (
          <Play className="w-5 h-5 fill-current ml-0.5" />
        )}
      </button>

      <div className="flex-1 flex flex-col gap-1.5">
        <div className={`h-1.5 rounded-full w-full overflow-hidden ${isMe ? 'bg-white/30' : 'bg-gray-100'}`}>
          <div 
            className={`h-full rounded-full transition-all duration-150 ${isMe ? 'bg-white' : 'bg-primary'}`} 
            style={{ width: `${progress}%` }} 
          />
        </div>
        <div className="flex items-center justify-between">
            <span className={`text-[10px] font-bold uppercase tracking-wider opacity-70 ${isMe ? 'text-white' : 'text-text-muted'}`}>
                Voice Message
            </span>
            <span className={`text-[10px] font-bold font-mono ${isMe ? 'text-white/80' : 'text-text-muted'}`}>
                {duration}
            </span>
        </div>
      </div>
    </div>
  );
}
