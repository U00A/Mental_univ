import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MessageSquare, ClipboardList, Target, MessageCircle, Save, Loader2, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAppointmentById, updateAppointmentNotes, type Appointment } from '@/lib/firestore';

export default function VideoCall() {
  const { roomId } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showNotes, setShowNotes] = useState(profile?.role === 'psychologist');
  const [callDuration, setCallDuration] = useState(0);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [notes, setNotes] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    if (roomId) {
        const fetchApt = async () => {
            const data = await getAppointmentById(roomId);
            if (data) {
                setAppointment(data);
                setNotes(data.followUpNotes || '');
            }
        };
        fetchApt();
    }

    const initCall = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        setTimeout(() => setIsConnected(true), 2000);
      } catch (err) {
        console.error('Failed to access media devices:', err);
      }
    };
    initCall();

    return () => {
      localStreamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [roomId]);

  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(interval);
  }, [isConnected]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const endCall = () => {
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    navigate('/appointments');
  };

  const handleSaveNotes = async () => {
    if (!roomId || !notes.trim()) return;
    try {
        setSaveLoading(true);
        await updateAppointmentNotes(roomId, { followUpNotes: notes });
        setLastSaved(new Date());
    } catch (err) {
        console.error('Error saving live notes:', err);
    } finally {
        setSaveLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-gray-800">
        <div>
          <h1 className="text-white font-medium">Video Consultation</h1>
          <p className="text-sm text-gray-400">
            {isConnected ? `Duration: ${formatDuration(callDuration)}` : 'Connecting...'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isConnected ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'} animate-pulse`} />
            {isConnected ? 'Connected' : 'Connecting'}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative p-4">
          {/* Remote Video Placeholder */}
          <div className="w-full h-full rounded-2xl bg-gray-800 flex items-center justify-center">
            {!isConnected ? (
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white">Waiting for other participant...</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                  <span className="text-4xl font-bold text-primary">
                      {appointment ? (profile?.role === 'student' ? appointment.psychologistName[0] : appointment.studentName[0]) : 'P'}
                  </span>
                </div>
                <p className="text-white text-lg">
                    {appointment ? (profile?.role === 'student' ? appointment.psychologistName : appointment.studentName) : 'Other Participant'}
                </p>
                <p className="text-gray-400">Connected</p>
              </div>
            )}
          </div>

          {/* Local Video */}
          <div className="absolute bottom-8 right-8 w-48 h-36 rounded-xl overflow-hidden bg-gray-800 shadow-2xl border border-gray-700">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
            />
            {!videoEnabled && (
              <div className="w-full h-full flex items-center justify-center text-white">
                Camera Off
              </div>
            )}
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 className="font-medium text-white">Chat</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-white">
                 <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 p-4 overflow-y-auto">
              <p className="text-gray-400 text-sm text-center">No messages yet</p>
            </div>
            <div className="p-4 border-t border-gray-700">
              <input
                type="text"
                placeholder="Type a message..."
                className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-400 border-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        )}

        {/* Live Notes Sidebar (Psychologist Only) */}
        {showNotes && profile?.role === 'psychologist' && (
          <div className="w-96 bg-gray-800 border-l border-gray-700 flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h3 className="font-medium text-white">Live Session Notes</h3>
              </div>
              <button onClick={() => setShowNotes(false)} className="text-gray-400 hover:text-white">
                 <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto space-y-6">
              {/* Prep Review */}
              {(appointment?.preSessionConcerns || appointment?.goals) && (
                <div className="space-y-3">
                   <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Preparation</h4>
                   {appointment.preSessionConcerns && (
                      <div className="p-3 rounded-xl bg-gray-700/50 border border-gray-600">
                         <span className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase mb-1">
                            <MessageCircle className="w-3 h-3" /> Concerns
                         </span>
                         <p className="text-xs text-gray-200 italic">"{appointment.preSessionConcerns}"</p>
                      </div>
                   )}
                   {appointment.goals && (
                      <div className="p-3 rounded-xl bg-gray-700/50 border border-gray-600">
                         <span className="flex items-center gap-1.5 text-[9px] font-bold text-primary uppercase mb-1">
                            <Target className="w-3 h-3" /> Goal
                         </span>
                         <p className="text-xs text-gray-200 italic">"{appointment.goals}"</p>
                      </div>
                   )}
                </div>
              )}

              {/* Notes Area */}
              <div className="space-y-3">
                 <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Clinical Documentation</h4>
                 <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Capture key points, observations, or breakthroughs..."
                    className="w-full h-[400px] p-4 rounded-xl bg-gray-900 text-gray-200 text-sm border-none focus:ring-1 focus:ring-primary resize-none placeholder-gray-600"
                 />
              </div>
            </div>

            <div className="p-4 border-t border-gray-700 bg-gray-800/50">
               <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-500">
                    {lastSaved ? `Last saved at ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
                  </span>
                  {saveLoading && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
               </div>
               <button 
                onClick={handleSaveNotes}
                disabled={saveLoading}
                className="btn btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
               >
                  <Save className="w-4 h-4" />
                  Save Notes
               </button>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="px-6 py-4 bg-gray-800">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors ${
              audioEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'
            }`}
          >
            {audioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>

          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors ${
              videoEnabled ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-red-500 text-white'
            }`}
          >
            {videoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>

          <button
            onClick={() => setIsScreenSharing(!isScreenSharing)}
            className={`p-4 rounded-full transition-colors ${
              isScreenSharing ? 'bg-primary text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <Monitor className="w-6 h-6" />
          </button>

          <button
            onClick={() => setShowChat(!showChat)}
            className={`p-4 rounded-full transition-colors ${
              showChat ? 'bg-primary text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
            }`}
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {profile?.role === 'psychologist' && (
             <button
                onClick={() => setShowNotes(!showNotes)}
                className={`p-4 rounded-full transition-colors ${
                    showNotes ? 'bg-primary text-white' : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
            >
                <ClipboardList className="w-6 h-6" />
            </button>
          )}

          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
}
