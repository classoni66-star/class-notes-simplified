import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play, Pause, Share2, ThumbsUp, Gauge } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
  lesson: any;
}

export default function Player({ navigate, lesson }: PlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0); 
  const [activeSheet, setActiveSheet] = useState<"apply" | "quiz" | "posts" | "explain" | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0); 
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  if (!lesson || !lesson.micro_steps) {
    return <div className="p-4 text-white bg-classoni-navy h-screen flex items-center justify-center">Loading lesson data...</div>;
  }

  const currentStep = lesson.micro_steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < lesson.micro_steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
      setProgress(0);
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(timer);
  }, [isPlaying]);

  const cycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const currentIndex = speeds.indexOf(playbackSpeed);
    setPlaybackSpeed(speeds[(currentIndex + 1) % speeds.length]);
  };

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden relative">
      
      <div className="flex-shrink-0">
        <TopBar title={lesson.keypoint_title} uploader="By You" points={12} onProfileTap={() => navigate("profile")} onRewardsTap={() => navigate("rewards")} onPremiumTap={() => navigate("premiumPlans")} />
      </div>

      {/* 1. CAPTIONS SECTION (Strictly Top) */}
      <div className="flex-shrink-0 px-4 py-3 min-h-[60px] flex items-center justify-center">
        <p className="text-center text-classoni-navy text-sm font-medium leading-relaxed bg-classoni-yellow/30 px-2 py-1 rounded-md">
          {currentStep.audio_segments && currentStep.audio_segments.length > 0 
            ? currentStep.audio_segments.join(" ") 
            : "Narrating micro concept..."}
        </p>
      </div>

      {/* 2. AUDIO CONTROL BAR (Between Captions and Visual) */}
      <div className="flex-shrink-0 px-4 pb-2 flex items-center gap-3">
        <button onClick={() => setIsPlaying(!isPlaying)} className="w-8 h-8 flex items-center justify-center bg-classoni-navy rounded-full text-white">
          {isPlaying ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
        </button>
        
        <div className="flex-1 relative h-6 flex items-center cursor-pointer">
          <div className="w-full h-1 bg-classoni-navy/20 rounded-full overflow-hidden">
            <div className="h-full bg-classoni-yellow transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-classoni-yellow border-2 border-white shadow-md" style={{ left: `calc(${progress}% - 7px)` }} />
        </div>

        <button onClick={cycleSpeed} className="flex items-center gap-1 text-xs font-bold text-classoni-navy/70">
          <Gauge size={14} />
          {playbackSpeed.toFixed(2)}x
        </button>
      </div>

      {/* 3. VISUAL SECTION (Sliding page effect) */}
      <div className="flex-1 relative mx-4 my-2 flex items-center justify-center overflow-hidden">
        
        <button onClick={handlePrev} disabled={currentStepIndex === 0} className={`absolute left-1 z-20 p-2 rounded-full bg-white/90 shadow-lg ${currentStepIndex === 0 ? 'opacity-30' : 'hover:bg-white'}`}>
          <ChevronLeft size={24} className="text-classoni-navy" />
        </button>

        <div className="w-full h-full max-h-[55vh] bg-white rounded-2xl shadow-xl border border-classoni-navy/10 relative overflow-hidden">
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

        <button onClick={handleNext} disabled={currentStepIndex === lesson.micro_steps.length - 1} className={`absolute right-1 z-20 p-2 rounded-full bg-white/90 shadow-lg ${currentStepIndex === lesson.micro_steps.length - 1 ? 'opacity-30' : 'hover:bg-white'}`}>
          <ChevronRight size={24} className="text-classoni-navy" />
        </button>
      </div>

      {/* 4. BOTTOM BUTTONS (Always Uniform) */}
      <div className="flex-shrink-0 px-4 py-3 flex gap-2">
        <button onClick={() => setActiveSheet("apply")} className="flex-1 bg-classoni-blue text-white rounded-full py-3 font-semibold text-sm shadow-md active:scale-95 transition-transform">Apply</button>
        <button onClick={() => setActiveSheet("explain")} className="flex-1 bg-classoni-yellow text-classoni-navy rounded-full py-3 font-bold text-sm shadow-md active:scale-95 transition-transform">Explain</button>
        <button onClick={() => setActiveSheet("quiz")} className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm shadow-md active:scale-95 transition-transform">Quiz</button>
        <button onClick={() => setActiveSheet("posts")} className="flex-1 bg-white border border-classoni-navy/20 text-classoni-navy rounded-full py-3 font-semibold text-sm shadow-md active:scale-95 transition-transform">Posts</button>
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
