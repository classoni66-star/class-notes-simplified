import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Square, Check, X, Loader2, ShieldCheck } from "lucide-react";

export default function TranscribeModal({ isOpen, onClose, navigate }: any) {
  const [consent, setConsent] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [chunks, setChunks] = useState<any[]>([]);
  const [modelStatus, setModelStatus] = useState("AI Ready (Safe Mode)");

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("smartsale_transcriptions") || "[]");
    setChunks(saved);
    
    const savedConsent = localStorage.getItem("smartsale_traffic_consent");
    if (savedConsent === "true") setConsent(true);
  }, [isOpen]);

  const saveChunks = (newChunks: any[]) => {
    localStorage.setItem("smartsale_transcriptions", JSON.stringify(newChunks));
    setChunks(newChunks);
  };

  const handleAcceptConsent = () => {
    localStorage.setItem("smartsale_traffic_consent", "true");
    setConsent(true);
  };

  const startListening = () => {
    setIsListening(true);
    // Simulate a transcription for now
    setTimeout(() => {
      const newChunk = {
        id: Date.now().toString(),
        text: "Simulated order: 2 sugars, 1 bread",
        status: "pending"
      };
      const latestSaved = JSON.parse(localStorage.getItem("smartsale_transcriptions") || "[]");
      saveChunks([...latestSaved, newChunk]);
      setIsListening(false);
    }, 3000);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleGoToSale = (chunk: any) => {
    localStorage.setItem("smartsale_current_transcription", JSON.stringify({ id: chunk.id, text: chunk.text }));
    stopListening();
    onClose();
    navigate("addSale");
  };

  const handleDelete = (id: string) => {
    const updated = chunks.filter(c => c.id !== id);
    saveChunks(updated);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => { stopListening(); onClose(); }}
            className="fixed inset-0 bg-black/60 z-[100] backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 bg-[#F3F4F6] z-[101] rounded-t-3xl shadow-2xl h-[85vh] flex flex-col"
          >
            <div className="flex justify-between items-center p-4 bg-white border-b border-gray-200 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-gray-800">Traffic Mode</h2>
                <span className={`text-[9px] font-bold px-2 py-0.5 rounded bg-green-100 text-green-700`}>
                  {modelStatus}
                </span>
              </div>
              <button onClick={() => { stopListening(); onClose(); }} className="p-1.5 bg-gray-100 rounded-full text-gray-500">
                <X size={18} />
              </button>
            </div>

            {consent && (
              <div className="bg-[#0055FF] text-white text-center py-2 px-4 shadow-sm shrink-0">
                <p className="text-[11px] font-bold tracking-wide">Transcribing your order. You are free to opt out.</p>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
              {!consent ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-4">
                  <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4 text-[#0055FF]">
                    <ShieldCheck size={32} />
                  </div>
                  <h2 className="text-lg font-extrabold text-gray-800 mb-2">Privacy First</h2>
                  <p className="text-xs text-gray-600 mb-6 leading-relaxed">
                    This feature transcribes orders directly on your phone. No audio is sent to the internet.
                    <br/><br/>
                    By continuing, you agree to inform your customers that their orders are being transcribed.
                  </p>
                  <button onClick={handleAcceptConsent} className="w-full max-w-xs bg-[#FF9800] text-white py-3 rounded-xl font-bold shadow-md active:scale-95 transition-transform">
                    I Understand & Agree
                  </button>
                </div>
              ) : chunks.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <Mic size={48} className="mb-4 opacity-20" />
                  <p className="text-xs font-medium text-center px-8">
                    Press Start to begin. The app will automatically split orders when a customer stops speaking.
                  </p>
                </div>
              ) : (
                chunks.map((chunk) => (
                  <div key={chunk.id} className={`p-3 rounded-2xl shadow-sm border flex flex-col gap-2 transition-colors ${chunk.status === 'completed' ? 'bg-green-50 border-green-200' : 'bg-white border-gray-100'}`}>
                    <p className={`text-sm font-bold leading-relaxed ${chunk.status === 'completed' ? 'text-green-800' : 'text-gray-800'}`}>
                      "{chunk.text}"
                    </p>
                    
                    <div className="flex justify-between items-center border-t border-gray-100/50 pt-2">
                      {chunk.status === 'completed' ? (
                        <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                          <Check size={12} /> Sale Recorded
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold">Pending...</span>
                      )}

                      <div className="flex gap-2">
                        <button onClick={() => handleDelete(chunk.id)} className="bg-red-50 text-red-500 p-1.5 rounded-lg active:scale-95 border border-red-100">
                          <X size={16} />
                        </button>
                        {chunk.status !== 'completed' && (
                          <button onClick={() => handleGoToSale(chunk)} className="bg-green-500 text-white px-3 py-1.5 rounded-lg active:scale-95 shadow-sm flex items-center gap-1 text-xs font-bold">
                            <Check size={14} /> Add Sale
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {consent && (
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 pb-6 z-[102]">
                {!isListening ? (
                  <button onClick={startListening} className="w-full bg-[#FF9800] text-white py-3.5 rounded-xl font-extrabold text-lg shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2">
                    <Mic size={20} /> Start Transcribing
                  </button>
                ) : (
                  <button onClick={stopListening} className="w-full bg-red-500 text-white py-3.5 rounded-xl font-extrabold text-lg shadow-md active:scale-95 transition-transform flex justify-center items-center gap-2 animate-pulse">
                    <Square size={20} fill="currentColor" /> Stop Transcribing
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
