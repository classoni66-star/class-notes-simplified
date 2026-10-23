import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Square, Play, Pause, ShieldCheck, Trash2, X, Activity } from "lucide-react";

export default function TrafficModal({ isOpen, onClose, navigate }: any) {
  const [isTracking, setIsTracking] = useState(false);
  const isTrackingRef = useRef(false);
  
  const [consentGiven, setConsentGiven] = useState(false);
  const [recordings, setRecordings] = useState<{ id: string, base64: string, time: string, duration: number, timestamp: number }[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState<{ id: string, progress: number } | null>(null);
  const [useAiVoice, setUseAiVoice] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const isCapturingRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);
  const wakeLockRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // 🔒 1. Load Consent & Saved Recordings on Open (with 48hr auto-delete)
  useEffect(() => {
    const savedConsent = localStorage.getItem("smartsale_traffic_consent");
    if (savedConsent === "true") {
      setConsentGiven(true);
    }

    const savedRecordings = JSON.parse(localStorage.getItem("smartsale_traffic_recordings") || "[]");
    const now = Date.now();
    const validRecordings = savedRecordings.filter((r: any) => (now - r.timestamp) < 48 * 60 * 60 * 1000);
    
    setRecordings(validRecordings);
    if (validRecordings.length !== savedRecordings.length) {
      localStorage.setItem("smartsale_traffic_recordings", JSON.stringify(validRecordings));
    }
  }, [isOpen]);

  const handleAcceptConsent = () => {
    localStorage.setItem("smartsale_traffic_consent", "true");
    setConsentGiven(true);
  };

  const requestWakeLock = async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
      }
    } catch (err) {}
  };

  const releaseWakeLock = () => {
    if (wakeLockRef.current) {
      wakeLockRef.current.release();
      wakeLockRef.current = null;
    }
  };

  // --- Voice Activity Detection (VAD) ---
  const startVAD = (stream: MediaStream) => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    
    audioContextRef.current = audioCtx;
    const dataArray = new Uint8Array(analyser.fftSize);

    const checkAudio = () => {
      if (!isTrackingRef.current) return;

      analyser.getByteTimeDomainData(dataArray);
      
      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const v = (dataArray[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / dataArray.length);
      const isSpeaking = rms > 0.015; 

      if (isSpeaking) {
        if (silenceTimeoutRef.current) {
          clearTimeout(silenceTimeoutRef.current);
          silenceTimeoutRef.current = null;
        }
        if (!isCapturingRef.current) startChunk();
      } else {
        if (isCapturingRef.current && !silenceTimeoutRef.current) {
          silenceTimeoutRef.current = setTimeout(() => stopChunk(), 1500);
        }
      }

      requestAnimationFrame(checkAudio);
    };

    checkAudio();
  };

  const startChunk = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
      isCapturingRef.current = true;
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    }
  };

  const stopChunk = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      isCapturingRef.current = false;
      mediaRecorderRef.current.stop();
    }
  };

  const startTracking = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          
          // Convert Blob to Base64 to save in localStorage
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = () => {
            const base64data = reader.result as string;
            
            const audio = new Audio(base64data);
            audio.onloadedmetadata = () => {
              const duration = audio.duration;
              
              setRecordings(prev => {
                const newRec = { 
                  id: Date.now().toString(), 
                  base64: base64data, 
                  time, 
                  duration: isNaN(duration) ? 0 : duration,
                  timestamp: Date.now()
                };
                const updated = [...prev, newRec];
                localStorage.setItem("smartsale_traffic_recordings", JSON.stringify(updated));
                return updated;
              });
            };
          };
        }
      };

      setIsTracking(true);
      isTrackingRef.current = true;
      requestWakeLock();
      startVAD(stream);
      
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
    isTrackingRef.current = false;
    
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close();
    releaseWakeLock();
  };

  const handlePlay = async (id: string, base64: string) => {
    if (playingId === id) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      setPlayingId(null);
      setAudioProgress(null);
      return;
    }

    if (audioSourceRef.current) audioSourceRef.current.stop();
    setPlayingId(id);
    setAudioProgress({ id, progress: 0 });

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Fetch from Base64
      const res = await fetch(base64);
      const arrayBuffer = await res.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      
      if (useAiVoice) {
        source.playbackRate.value = 1.5; 
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 1000;
        filter.Q.value = 0.5;
        source.connect(filter);
        filter.connect(ctx.destination);
      } else {
        source.connect(ctx.destination);
      }

      const startTime = ctx.currentTime;
      const interval = setInterval(() => {
        const elapsed = (ctx.currentTime - startTime) * (useAiVoice ? 1.5 : 1);
        let percent = (elapsed / audioBuffer.duration) * 100;
        if (percent > 100) percent = 100;
        setAudioProgress({ id, progress: percent });
      }, 100);

      source.onended = () => {
        clearInterval(interval);
        setPlayingId(null);
        setAudioProgress(null);
      };
      
      source.start();
      audioSourceRef.current = source;
      
    } catch (e) {
      console.error(e);
      setPlayingId(null);
      setAudioProgress(null);
    }
  };

  const handleDelete = (id: string) => {
    const updated = recordings.filter(rec => rec.id !== id);
    setRecordings(updated);
    localStorage.setItem("smartsale_traffic_recordings", JSON.stringify(updated));
    
    if (playingId === id) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      setPlayingId(null);
      setAudioProgress(null);
    }
  };

  const handleEnterSale = (id: string) => {
    handleDelete(id);
    onClose();
    navigate("addSale");
  };

  useEffect(() => {
    if (!isOpen) stopTracking();
  }, [isOpen]);

  const formatDuration = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/50 z-[100]" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 bg-[#F3F4F6] z-[101] rounded-t-3xl shadow-2xl h-[80vh] flex flex-col">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-3xl">
              <h2 className="text-lg font-extrabold text-gray-800">Traffic Mode</h2>
              <div className="flex items-center gap-2">
                {consentGiven && recordings.length > 0 && (
                  <button onClick={() => setUseAiVoice(!useAiVoice)} className={`text-[10px] font-bold px-2 py-1 rounded ${useAiVoice ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                    {useAiVoice ? "AI Voice ON" : "Real Voice"}
                  </button>
                )}
                <button onClick={onClose} className="p-2 bg-gray-100 text-gray-600 rounded-full">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {!consentGiven ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#0055FF]">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-2">Privacy & Consent</h2>
                  <p className="text-sm text-gray-600 mb-6 px-4">
                    Traffic Mode records short voice clips for order accuracy. Recordings are kept securely on your device for 48 hours to help you process orders, and are automatically deleted after that.
                    <br/><br/>
                    By continuing, you agree to inform your customers that their voice is being recorded for order accuracy.
                  </p>
                  <button onClick={handleAcceptConsent} className="w-full max-w-xs bg-[#FF9800] text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-transform">
                    I Understand & Agree
                  </button>
                </div>
              ) : recordings.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Activity size={48} className="mb-4 opacity-20" />
                  <p className="text-sm font-medium text-center px-8">
                    Press "Track Order" to begin. The app will automatically split recordings when a customer stops speaking. They are saved here for 48 hours.
                  </p>
                </div>
              ) : (
                recordings.map((rec, index) => (
                  <div key={rec.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handlePlay(rec.id, rec.base64)} className="w-10 h-10 rounded-full bg-orange-50 text-[#FF9800] flex items-center justify-center flex-shrink-0">
                          {playingId === rec.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                        </button>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Order {index + 1}</p>
                          <p className="text-[10px] text-gray-500">{rec.time} • {formatDuration(rec.duration)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEnterSale(rec.id)} className="bg-[#0055FF] text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md active:scale-95">
                          Enter Sale
                        </button>
                        <button onClick={() => handleDelete(rec.id)} className="bg-red-50 text-red-500 p-1.5 rounded-lg shadow-sm active:scale-95 border border-red-100">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    
                    {playingId === rec.id && audioProgress?.id === rec.id && (
                      <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div className="bg-[#FF9800] h-1.5 rounded-full transition-all duration-100 ease-linear" style={{ width: `${audioProgress.progress}%` }} />
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {consentGiven && (
              <div className="p-4 bg-white border-t border-gray-200 pb-6">
                {!isTracking ? (
                  <button onClick={startTracking} className="w-full bg-[#FF9800] text-white py-3.5 rounded-xl font-extrabold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2">
                    Track Order
                  </button>
                ) : (
                  <button onClick={stopTracking} className="w-full bg-green-500 text-white py-3.5 rounded-xl font-extrabold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 animate-pulse">
                    <Square size={20} fill="currentColor" /> Stop Tracking
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
      }
