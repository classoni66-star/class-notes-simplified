import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Mic, Square, Play, Pause, ShieldCheck, Trash2 } from "lucide-react";
import { PitchShifter } from "soundtouchjs";

export default function TrafficMode({ navigate, language }: any) {
  const [isRecording, setIsRecording] = useState(false);
  const [consentGiven, setConsentGiven] = useState(false);
  const [recordings, setRecordings] = useState<{ id: string, url: string, time: string, blob: Blob }[]>([]);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [useAiVoice, setUseAiVoice] = useState(true);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const wakeLockRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const silenceTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

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

  const startVAD = (stream: MediaStream) => {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const microphone = audioContext.createMediaStreamSource(stream);
    microphone.connect(analyser);
    
    analyser.fftSize = 512;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    audioContextRef.current = audioContext;
    analyserRef.current = analyser;

    const checkSilence = () => {
      if (!analyserRef.current || mediaRecorderRef.current?.state !== "recording") return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
      const averageVolume = sum / bufferLength;

      if (averageVolume < 10) {
        if (!silenceTimerRef.current) {
          silenceTimerRef.current = setTimeout(() => {
            stopChunkAndSave();
          }, 2500); // 2.5 seconds of silence
        }
      } else {
        if (silenceTimerRef.current) {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
      }
      
      if (mediaRecorderRef.current?.state === "recording") {
        requestAnimationFrame(checkSilence);
      }
    };
    
    requestAnimationFrame(checkSilence);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        setRecordings(prev => [...prev, { id: Date.now().toString(), url: audioUrl, time, blob: audioBlob }]);
        
        if (mediaRecorderRef.current && streamRef.current?.active) {
           startChunk();
        }
      };

      startChunk();
      startVAD(stream);
      setIsRecording(true);
      requestWakeLock();
      
    } catch (err) {
      alert("Microphone access denied or unavailable.");
    }
  };

  const startChunk = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "recording") {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
    }
  };

  const stopChunkAndSave = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); 
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
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

  const handlePlay = async (id: string, blob: Blob) => {
    if (playingId === id) {
      if (audioSourceRef.current) audioSourceRef.current.stop();
      setPlayingId(null);
      return;
    }

    // Stop any currently playing audio
    if (audioSourceRef.current) audioSourceRef.current.stop();

    setPlayingId(id);

    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const arrayBuffer = await blob.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      if (useAiVoice) {
        // 🎙️ PITCH SHIFT (Synthetic Female Voice)
        const shifter = new PitchShifter(ctx, audioBuffer, 1024);
        shifter.tempo = 1.0;
        shifter.pitch = 1.4; // Raise pitch for female tone
        shifter.connect(ctx.destination);
        shifter.on('play', () => setPlayingId(null));
        shifter.play();
      } else {
        // 🔈 ORIGINAL VOICE
        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingId(null);
        source.start();
        audioSourceRef.current = source;
      }
    } catch (e) {
      console.error(e);
      setPlayingId(null);
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure? All audio will be permanently deleted.")) {
      stopRecording();
      setRecordings([]);
      navigate("home");
    }
  };

  useEffect(() => {
    return () => stopRecording();
  }, []);

  if (!consentGiven) {
    return (
      <div className="h-[100dvh] flex flex-col p-6 bg-[#F3F4F6]">
        <header className="flex items-center gap-3 mb-10">
          <button onClick={() => navigate("home")} className="text-gray-500"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-extrabold text-gray-800">Traffic Mode Setup</h1>
        </header>
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-[#0055FF]">
            <ShieldCheck size={40} />
          </div>
          <h2 className="text-xl font-extrabold text-gray-800 mb-4">Privacy & Consent</h2>
          <p className="text-sm text-gray-600 mb-8 px-4 leading-relaxed">
            Traffic Mode records short voice clips to help you remember customer orders. 
            <br/><br/>
            <strong>Privacy Guarantee:</strong> These recordings are kept ONLY in the app's temporary memory and are permanently deleted the moment you close this screen. Nothing is saved to the cloud.
            <br/><br/>
            By continuing, you agree to inform your customers that their voice is being recorded for order accuracy.
          </p>
          <button 
            onClick={() => setConsentGiven(true)}
            className="w-full max-w-xs bg-[#FF9800] text-white py-4 rounded-xl font-bold text-lg shadow-lg active:scale-95 transition-transform"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] flex flex-col bg-[#F3F4F6]">
      
      <header className="bg-white px-4 py-3 flex justify-between items-center shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("home")} className="text-gray-500"><ArrowLeft size={24} /></button>
          <h1 className="text-lg font-extrabold text-gray-800">Traffic Mode</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setUseAiVoice(!useAiVoice)} 
            className={`text-[10px] font-bold px-2 py-1 rounded ${useAiVoice ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
          >
            {useAiVoice ? "AI Voice ON" : "Real Voice"}
          </button>
          {recordings.length > 0 && (
            <button onClick={handleClearAll} className="text-red-500 p-2 bg-red-50 rounded-full">
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-32">
        {recordings.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-400">
            <Mic size={48} className="mb-4 opacity-20" />
            <p className="text-sm font-medium text-center px-8">
              Press Start to begin. The app will automatically split recordings when a customer stops speaking.
            </p>
          </div>
        )}

        {recordings.map((rec, index) => (
          <div key={rec.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => handlePlay(rec.id, rec.blob)}
                className="w-10 h-10 rounded-full bg-orange-50 text-[#FF9800] flex items-center justify-center flex-shrink-0"
              >
                {playingId === rec.id ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
              </button>
              <div>
                <p className="text-sm font-bold text-gray-800">Order {index + 1}</p>
                <p className="text-[10px] text-gray-500">{rec.time}</p>
              </div>
            </div>
            
            <button 
              onClick={() => {
                alert("Opening Add Sale screen to record this order.");
                navigate("addSale");
              }}
              className="bg-[#0055FF] text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md active:scale-95"
            >
              Enter Sale
            </button>
          </div>
        ))}
      </div>

      {/* FLOATING ACTION BUTTON */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        {!isRecording ? (
          <button 
            onClick={startRecording}
            className="w-full bg-[#FF9800] text-white py-4 rounded-2xl font-extrabold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2"
          >
            <Mic size={22} /> Start Recording Traffic
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            className="w-full bg-red-500 text-white py-4 rounded-2xl font-extrabold text-lg shadow-lg active:scale-95 transition-transform flex justify-center items-center gap-2 animate-pulse"
          >
            <Square size={22} fill="currentColor" /> Pause / Stop Traffic Mode
          </button>
        )}
      </div>

    </div>
  );
    }
