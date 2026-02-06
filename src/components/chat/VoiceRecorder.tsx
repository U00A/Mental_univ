import { useState, useRef, useEffect } from 'react';
import { Mic, Trash2, Send } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: string) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const startRecording = async () => {
    try {
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setStream(audioStream);
      
      const recorder = new MediaRecorder(audioStream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = formatTime(recordingTime);
        onSend(audioBlob, duration);
      };

      recorder.start();
      setIsRecording(true);
      
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not access microphone. Please ensure permissions are granted.');
      onCancel();
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex items-center gap-4 bg-primary/5 p-4 rounded-3xl animate-in slide-in-from-bottom-2 duration-300 w-full border border-primary/10 shadow-sm">
      <div className="flex items-center gap-3 flex-1">
        <div className="relative">
          <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center text-red-600 shadow-inner">
            <Mic className={`w-6 h-6 ${isRecording ? 'animate-pulse' : ''}`} />
          </div>
          {isRecording && (
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-600 rounded-full border-2 border-white animate-ping" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text uppercase tracking-wider">Recording...</span>
          <span className="text-xl font-black text-red-600 font-mono tracking-tighter leading-none">{formatTime(recordingTime)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onCancel}
          className="p-3.5 rounded-2xl hover:bg-white text-text-muted hover:text-red-600 transition-all duration-300 hover:shadow-sm"
          title="Cancel"
        >
          <Trash2 className="w-6 h-6" />
        </button>
        <button
          onClick={stopRecording}
          className="w-14 h-14 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark transition-all duration-300 active:scale-95 group"
          title="Stop & Send"
        >
          <Send className="w-6 h-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
