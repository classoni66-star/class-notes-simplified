import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play, Pause, Share2, ThumbsUp, Gauge } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
  lesson: any;
}

// Helper to split text into ~60 character chunks (approx 2 lines on mobile)
const splitIntoChunks = (text: string) => {
  const words = text.split(" ");
  const chunks: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + word).length > 60) {
      chunks.push(current.trim());
      current = word + " ";
    } else {
      current += word + " ";
    }
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

export default function Player({ navigate, lesson }: PlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [activeSheet, setActiveSheet] = useState<"apply" | "quiz" | "posts" | "explain" | null>(null);
  
  // Audio/Typing State
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); // 0 to 100
  
  // Flash Test State
  const [showFlashTest, setShowFlashTest] = useState(false);
  const [flashTestAnswer, setFlashTestAnswer] = useState<boolean | null>(null);
  const [flashTestResult, setFlashTestResult] = useState<"correct" | "wrong" | "timeout" | null>(null);
  const [flashTestTimer, setFlashTestTimer] = useState(3);
  const [pendingDirection, setPendingDirection] = useState<0 | 1 | -1>(0);
  
  const [dailyPoints, setDailyPoints] = useState(12);
  const timerRef = useRef<any>(null);
  
  // Audio Synthesis for Typing & Whoosh
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastCharRef = useRef(-1);
  const lastChunkRef = useRef(-1);

  useEffect(() => {
    // Initialize Web Audio API for typing sounds
    audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
  }, []);

  const playClick = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  };

  const playWhoosh = () => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  if (!lesson || !lesson.micro_steps) {
    return <div className="p-4 text-white bg-classoni-navy h-screen flex items-center justify-center">Loading lesson data...</div>;
  }

  const currentStep = lesson.micro_steps[currentStepIndex];
  const fullText = currentStep.audio_segments ? currentStep.audio_segments.join(" ") : "Narrating micro concept...";
  const textChunks = splitIntoChunks(fullText);
  
  // Calculate current chunk and character based on progress
  const totalChunks = textChunks.length;
  const chunkProgress = (progress / 100) * totalChunks;
  const currentChunkIndex = Math.min(Math.floor(chunkProgress), totalChunks - 1);
  const progressInChunk = chunkProgress - currentChunkIndex;
  
  const activeChunkText = textChunks[currentChunkIndex] || "";
  const charsToShow = Math.floor(progressInChunk * activeChunkText.length);
  const visibleText = activeChunkText.substring(0, charsToShow);

  // Play sounds when characters or chunks change
  useEffect(() => {
    if (charsToShow > lastCharRef.current && charsToShow > 0) {
      playClick();
    }
    lastCharRef.current = charsToShow;
  }, [charsToShow]);

  useEffect(() => {
    if (currentChunkIndex > lastChunkRef.current && lastChunkRef.current !== -1) {
      playWhoosh();
    }
    lastChunkRef.current = currentChunkIndex;
  }, [currentChunkIndex]);

  // Playback loop
  useEffect(() => {
    let timer: any;
    if (isPlaying && !showFlashTest) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) { setIsPlaying(false); return 100; }
          return prev + 1.5; // Speed of typing
        });
      }, 100);
    }
    return () => clearInterval(timer);
  }, [isPlaying, showFlashTest]);

  const triggerNavigation = (dir: 1 | -1) => {
    if (dir === 1 && currentStepIndex === lesson.micro_steps.length - 1) return;
    if (dir === -1 && currentStepIndex === 0) return;

    setPendingDirection(dir);
    setShowFlashTest(true);
    setFlashTestResult(null);
    setFlashTestAnswer(null);
    setFlashTestTimer(3);
  };

  useEffect(() => {
    if (showFlashTest && flashTestTimer > 0 && !flashTestAnswer) {
      timerRef.current = setTimeout(() => {
        setFlashTestTimer((prev) => prev - 1);
      }, 1000);
    } else if (showFlashTest && flashTestTimer === 0 && !flashTestAnswer) {
      setFlashTestResult("timeout");
      finishFlashTest();
    }
    return () => clearTimeout(timerRef.current);
  }, [showFlashTest, flashTestTimer, flashTestAnswer]);

  const handleFlashAnswer = (val: boolean) => {
    if (flashTestAnswer !== null) return;
    setFlashTestAnswer(val);
    const isCorrect = val === (currentStep.flash_test?.answer ?? false);
    
    if (isCorrect) {
      setFlashTestResult("correct");
      setDailyPoints((prev) => prev + 1);
    } else {
      setFlashTestResult("wrong");
    }
    
    clearTimeout(timerRef.current);
    finishFlashTest();
  };

  const finishFlashTest = () => {
    setTimeout(() => {
      setShowFlashTest(false);
      setDirection(pendingDirection);
      setCurrentStepIndex((prev) => prev + pendingDirection);
      setProgress(0);
      setIsPlaying(false);
      setPendingDirection(0);
      lastChunkRef.current = -1;
      lastCharRef.current = -1;
    }, 1200); 
  };

  // Handle dragging the progress circle
  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProgress(Number(e.target.value));
  };

  const flashTest = currentStep.flash_test || {
    statement: "The nucleus is the powerhouse of the cell.",
    answer: false,
    explanation: "Mitochondria is the powerhouse."
  };

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden relative">
      
      <div className="flex-shrink-0">
        <TopBar title={lesson.keypoint_title} uploader="By You" points={dailyPoints} onProfileTap={() => navigate("profile")} onRewardsTap={() => navigate("rewards")} onPremiumTap={() => navigate("premiumPlans")} />
      </div>

      {/* 1. CAPTIONS SECTION (Typewriter Animation) */}
      <div className="flex-shrink-0 px-4 py-3 min-h-[80px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentChunkIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center text-classoni-navy text-sm font-medium leading-relaxed"
          >
            {visibleText}
            {isPlaying && <span className="animate-pulse">|</span>}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 2. AUDIO CONTROL BAR */}
      <div className="flex-shrink-0 px-4 pb-2 flex items-center gap-3">
        <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 flex items-center justify-center bg-classoni-navy rounded-full text-white">
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        
        <input 
          type="range" 
          min="0" 
          max="100" 
          value={progress} 
          onChange={handleProgressChange}
          className="flex-1 h-1 bg-classoni-navy/20 rounded-full appearance-none cursor-pointer accent-classoni-yellow"
        />
        
        <span className="text-xs font-bold text-classoni-navy/70">{Math.floor(progress)}%</span>
      </div>

      {/* 3. VISUAL SECTION */}
      <div className="flex-1 relative mx-4 my-2 flex items-center justify-center overflow-hidden">
        
        <button onClick={() => triggerNavigation(-1)} disabled={currentStepIndex === 0} className={`absolute left-1 z-20 p-2 rounded-full bg-white/90 shadow-lg ${currentStepIndex === 0 ? 'opacity-30' : 'hover:bg-white'}`}>
          <ChevronLeft size={24} className="text-classoni-navy" />
        </button>

        <div className="w-full h-full max-h-[55vh] bg-white rounded-2xl shadow-xl border border-classoni-navy/10 relative overflow-hidden">
          
          <AnimatePresence>
            {showFlashTest && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0 }}
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center ${
                  flashTestResult === "correct" ? "bg-green-500 text-white" : 
                  flashTestResult === "wrong" ? "bg-red-500 text-white" : 
                  flashTestResult === "timeout" ? "bg-orange-500 text-white" : 
                  "bg-classoni-navy text-white"
                }`}
              >
                {!flashTestResult ? (
                  <>
                    <div className="w-12 h-12 rounded-full border-4 border-white/30 flex items-center justify-center mb-4">
                      <span className="text-xl font-bold">{flashTestTimer}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-6 leading-tight">"{flashTest.statement}"</h3>
                    <div className="flex gap-4 w-full">
                      <button onClick={() => handleFlashAnswer(true)} className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl font-bold text-xl transition-colors">TRUE</button>
                      <button onClick={() => handleFlashAnswer(false)} className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl font-bold text-xl transition-colors">FALSE</button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <h2 className="text-3xl font-extrabold mb-2">
                      {flashTestResult === "correct" ? "CORRECT! +1pt" : flashTestResult === "wrong" ? "NOT QUITE" : "TIME'S UP"}
                    </h2>
                    <p className="text-sm opacity-80">{flashTestResult === "correct" ? flashTest.explanation : "Moving on..."}</p>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStepIndex}
              custom={direction}
              initial={{ x: direction > 0 ? 400 : -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -400 : 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex flex-col p-6 overflow-y-auto"
            >
              <div className="flex-1 flex flex-col">
                <h2 className="text-xl font-extrabold text-classoni-navy mb-2">{currentStep.micro_step_title}</h2>
                <p className="text-sm text-classoni-navy/60 italic mb-4">{currentStep.summary_text || "Understanding this core concept is crucial."}</p>
                <div className="bg-classoni-lavender/60 p-4 rounded-xl border-l-4 border-classoni-blue flex-1">
                  <p className="text-classoni-navy whitespace-pre-wrap leading-relaxed font-medium text-sm">{currentStep.visual_skeleton_text}</p>
                </div>
              </div>

              <div className="absolute bottom-3 right-3 flex flex-col gap-2">
                <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-classoni-navy/10"><Share2 size={18} className="text-classoni-navy" /></button>
                <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-classoni-navy/10"><ThumbsUp size={18} className="text-classoni-navy" /></button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button onClick={() => triggerNavigation(1)} disabled={currentStepIndex === lesson.micro_steps.length - 1} className={`absolute right-1 z-20 p-2 rounded-full bg-white/90 shadow-lg ${currentStepIndex === lesson.micro_steps.length - 1 ? 'opacity-30' : 'hover:bg-white'}`}>
          <ChevronRight size={24} className="text-classoni-navy" />
        </button>
      </div>

      {/* 4. BOTTOM BUTTONS */}
      <div className="flex-shrink-0 px-4 py-3 flex gap-2">
        <button onClick={() => setActiveSheet("apply")} className="flex-1 bg-gray-200 text-gray-600 rounded-full py-3 font-semibold text-sm shadow-md active:scale-95 transition-transform">Apply</button>
        <button onClick={() => setActiveSheet("explain")} className="flex-[2] bg-classoni-blue text-white rounded-full py-3 font-bold text-sm shadow-md active:scale-95 transition-transform">Explain</button>
        <button onClick={() => setActiveSheet("quiz")} className="flex-1 bg-gray-200 text-gray-600 rounded-full py-3 font-semibold text-sm shadow-md active:scale-95 transition-transform">Quiz</button>
        <button onClick={() => setActiveSheet("posts")} className="flex-1 bg-gray-200 text-gray-600 rounded-full py-3 font-semibold text-sm shadow-md active:scale-95 transition-transform">Posts</button>
      </div>

      <BottomNav active="courses" onNavigate={(tab) => {
        if (tab === "upload") navigate("input");
        if (tab === "leaderboard") navigate("classGate");
        if (tab === "search") navigate("search");
      }} />

      {/* EXPLAIN ARENA MODAL */}
      <AnimatePresence>
        {activeSheet === "explain" && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 bg-classoni-navy z-50 flex flex-col p-6 text-white">
            <button onClick={() => setActiveSheet(null)} className="self-end p-2"><X size={24} /></button>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl font-bold mb-2">Explain <span className="text-classoni-yellow">{currentStep.micro_step_title}</span></h2>
              <p className="text-white/70 mb-8">You don't truly know it until you can explain it.</p>
              
              <div className="w-full max-w-sm space-y-3">
                <button className="w-full bg-classoni-blue py-4 rounded-xl font-bold flex justify-between px-6">
                  <span>Type Explanation</span>
                  <span className="text-classoni-yellow">+2 pts</span>
                </button>
                <button className="w-full bg-classoni-yellow text-classoni-navy py-4 rounded-xl font-bold flex justify-between px-6">
                  <span>Record Audio</span>
                  <span className="text-classoni-blue">+5 pts</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BASIC BOTTOM SHEETS */}
      <AnimatePresence>
        {activeSheet && activeSheet !== "explain" && (
          <>
            <motion.div className="fixed inset-0 bg-black/40 z-40" onClick={() => setActiveSheet(null)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 min-h-[50vh]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg capitalize text-classoni-navy">{activeSheet}</h3>
                <button onClick={() => setActiveSheet(null)}><X size={20} className="text-classoni-navy" /></button>
              </div>
              
              {activeSheet === "apply" && lesson.apply && (
                <div>
                  <h4 className="font-bold text-classoni-navy mb-2">{lesson.apply.title}</h4>
                  <p className="text-sm text-classoni-navy/80 mb-4">{lesson.apply.scenario}</p>
                  <button className="w-full bg-classoni-blue text-white py-3 rounded-full font-bold">Reveal Solution</button>
                </div>
              )}

              {activeSheet === "quiz" && lesson.quiz && (
                <div>
                  <h4 className="font-bold text-classoni-navy mb-2">{lesson.quiz.question}</h4>
                  <div className="space-y-2 mt-4">
                    {lesson.quiz.options.map((opt: string, i: number) => (
                      <button key={i} className="w-full text-left p-3 rounded-xl border border-classoni-navy/20 text-classoni-navy hover:bg-classoni-lavender">{opt}</button>
                    ))}
                  </div>
                </div>
              )}

              {activeSheet === "posts" && (
                <p className="text-sm text-center text-classoni-navy/60 mt-8">No class contributions for this micro-concept yet. Be the first!</p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
    }
