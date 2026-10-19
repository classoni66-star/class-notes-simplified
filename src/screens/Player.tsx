import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Share2, ThumbsUp, Play, Image as ImageIcon } from "lucide-react";
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

  const [dailyPoints, setDailyPoints] = useState(12);
  const [showExplainPrompt, setShowExplainPrompt] = useState(false);
  const [showApplyPrompt, setShowApplyPrompt] = useState(false);
  const hasShownExplainPrompt = useRef(false);

  const [showToast, setShowToast] = useState(false);
  const toastTimeoutRef = useRef<any>(null);

  const [imgError, setImgError] = useState<Record<number, boolean>>({});

  const walkthroughRef = useRef<HTMLDivElement>(null);

  if (!lesson || !lesson.micro_steps) {
    return (
      <div className="p-4 text-white bg-classoni-navy h-screen flex items-center justify-center">
        Loading lesson data...
      </div>
    );
  }

  const currentStep = lesson.micro_steps[currentStepIndex];

  const walkthroughText = currentStep.audio_segments
    ? currentStep.audio_segments.join(" ")
    : "Understanding this concept is crucial for your mastery of the topic.";

  useEffect(() => {
    if (walkthroughRef.current) walkthroughRef.current.scrollTop = 0;
  }, [currentStepIndex]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  const handleNext = () => {
    if (currentStepIndex < lesson.micro_steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex((p) => p + 1);
    } else {
      if (!hasShownExplainPrompt.current) {
        hasShownExplainPrompt.current = true;
        setShowExplainPrompt(true);
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((p) => p - 1);
    }
  };

  const handlePlayClick = () => {
    setShowToast(true);
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    toastTimeoutRef.current = setTimeout(() => {
      setShowToast(false);
    }, 2000);
  };

  const mainKeypointTitle = `Keypoint ${lesson.keypoint_number || 1}: ${lesson.keypoint_title || "Primary Data Collection"}`;
  const microConceptTitle = `Keypoint ${lesson.keypoint_number || 1}.${currentStep.step_number || currentStepIndex + 1}: ${currentStep.micro_step_title}`;

  // The image URL is now sent directly from the backend!
  const visualImage = currentStep.visual_image_url;
  const isImgBroken = imgError[currentStepIndex];

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden relative">
      
      <div className="flex-shrink-0">
        <TopBar
          title={lesson.topic || lesson.subject || "Classoni Lesson"}
          uploader="By You"
          points={dailyPoints}
          keypointTitle={mainKeypointTitle}
          microConceptTitle={microConceptTitle}
          onProfileTap={() => navigate("profile")}
          onRewardsTap={() => navigate("rewards")}
          onPremiumTap={() => navigate("premiumPlans")}
        />
      </div>

      <div className="mx-4 mt-2 mb-1 flex flex-col bg-[#FFFCE8] rounded-xl border border-classoni-yellow/40 overflow-hidden shadow-sm flex-shrink-0 h-[18vh]">
        <div className="bg-classoni-yellow/20 px-4 py-1.5 border-b border-classoni-yellow/30">
          <h3 className="text-xs font-bold text-classoni-navy tracking-wider uppercase">The Underlying Logic</h3>
        </div>
        <div ref={walkthroughRef} className="overflow-y-auto p-4 h-full">
          <p className="text-classoni-navy/90 text-sm leading-relaxed font-medium">{walkthroughText}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 px-6 py-2 flex-shrink-0 relative">
        <button 
          onClick={handlePlayClick}
          className="w-10 h-10 rounded-full bg-classoni-navy text-white flex items-center justify-center flex-shrink-0 shadow-md active:scale-95 transition-transform"
        >
          <Play size={18} fill="currentColor" className="ml-1" />
        </button>
        
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -10, x: "-50%" }}
              className="absolute left-1/2 top-0 bg-classoni-navy text-white text-xs px-3 py-1.5 rounded-full shadow-lg z-50 pointer-events-none whitespace-nowrap"
            >
              Voice coming soon...
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 h-1.5 bg-classoni-navy/10 rounded-full relative">
          <div className="absolute left-0 top-0 h-full w-1/4 bg-classoni-yellow rounded-full" />
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-classoni-yellow rounded-full border-2 border-white shadow" />
        </div>
        <span className="text-xs text-classoni-navy/60 font-semibold">1.00x</span>
      </div>

      <div className="flex-1 min-h-0 relative mx-4 mb-2">
        <button
          onClick={handlePrev}
          disabled={currentStepIndex === 0}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg ${
            currentStepIndex === 0 ? "opacity-30" : "hover:bg-white"
          }`}
        >
          <ChevronLeft size={24} className="text-classoni-navy" />
        </button>

        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-classoni-navy/10 relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStepIndex}
              custom={direction}
              initial={{ x: direction > 0 ? 400 : -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -400 : 400, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex flex-col overflow-y-auto p-6 pb-20" 
            >
              <div className="flex flex-col">
                <h2 className="text-xl font-extrabold text-classoni-navy mb-2">{currentStep.micro_step_title}</h2>
                
                <p className="text-sm text-classoni-navy/60 italic leading-relaxed mb-3">
                  {currentStep.summary_text || "Understanding this core concept is crucial."}
                </p>
                
                <p className="text-classoni-navy whitespace-pre-wrap leading-relaxed font-medium text-sm mb-5">
                  {currentStep.visual_skeleton_text}
                </p>

                <div className="w-full rounded-xl overflow-hidden bg-classoni-lavender/30 border border-classoni-navy/5 flex flex-col items-center justify-center min-h-[160px]">
                  {isImgBroken || !visualImage ? (
                    <div className="flex flex-col items-center text-classoni-navy/50 p-6 text-center">
                      <ImageIcon size={32} className="mb-2 opacity-50" />
                      <span className="text-xs font-bold uppercase tracking-wider">{currentStep.micro_step_title}</span>
                      <span className="text-[10px] mt-1">Visual representation unavailable</span>
                    </div>
                  ) : (
                    <img 
                      src={visualImage} 
                      alt={currentStep.micro_step_title} 
                      className="w-full h-auto object-cover" 
                      loading="lazy"
                      onError={() => setImgError(prev => ({ ...prev, [currentStepIndex]: true }))} 
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={handleNext}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white"
        >
          <ChevronRight size={24} className="text-classoni-navy" />
        </button>
      </div>

      <div className="absolute bottom-[130px] right-3 z-40 flex flex-col gap-2">
        <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-classoni-navy/10 active:scale-95 transition-transform">
          <Share2 size={18} className="text-classoni-navy" />
        </button>
        <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-classoni-navy/10 active:scale-95 transition-transform">
          <ThumbsUp size={18} className="text-classoni-navy" />
        </button>
      </div>

      <div className="flex-shrink-0 px-4 py-3 flex gap-2 relative z-30">
        <button onClick={() => setActiveSheet("apply")} className="flex-1 bg-classoni-blue text-white rounded-full py-2.5 font-bold text-sm shadow-md active:scale-95 transition-transform">Apply</button>
        <button onClick={() => setActiveSheet("explain")} className="flex-1 bg-classoni-yellow text-classoni-navy rounded-full py-2.5 font-bold text-sm shadow-md active:scale-95 transition-transform">Explain</button>
        <button onClick={() => setActiveSheet("quiz")} className="flex-1 bg-white text-classoni-blue border border-classoni-blue rounded-full py-2.5 font-bold text-sm shadow-sm active:scale-95 transition-transform">Quiz</button>
        <button onClick={() => setActiveSheet("posts")} className="flex-1 bg-white text-classoni-navy border border-classoni-navy/20 rounded-full py-2.5 font-bold text-sm shadow-sm active:scale-95 transition-transform">Posts</button>
      </div>

      <BottomNav
        active="courses"
        onNavigate={(tab) => {
          if (tab === "upload") navigate("input");
          if (tab === "leaderboard") navigate("classGate");
          if (tab === "search") navigate("search");
        }}
      />

      {/* MODALS */}
      <AnimatePresence>
        {activeSheet === "explain" && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 bg-classoni-navy z-50 flex flex-col p-6 text-white">
            <button onClick={() => setActiveSheet(null)} className="self-end p-2"><X size={24} /></button>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl font-bold mb-2">Explain <span className="text-classoni-yellow">{currentStep.micro_step_title}</span></h2>
              <p className="text-white/70 mb-8">You don't truly know it until you can explain it.</p>
              <div className="w-full max-w-sm space-y-3">
                <button className="w-full bg-classoni-blue py-4 rounded-xl font-bold flex justify-between px-6"><span>Type Explanation</span><span className="text-classoni-yellow">+2 pts</span></button>
                <button className="w-full bg-classoni-yellow text-classoni-navy py-4 rounded-xl font-bold flex justify-between px-6"><span>Record Audio</span><span className="text-classoni-blue">+5 pts</span></button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
      
      <AnimatePresence>
        {showExplainPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
              <h2 className="text-xl font-extrabold text-classoni-navy mb-2">Explain "{lesson.keypoint_title}" in your own words</h2>
              <p className="text-sm text-classoni-navy/70 mb-6">Score 8/10 to unlock teacher mode...</p>
              <div className="space-y-2">
                <button onClick={() => { setShowExplainPrompt(false); setActiveSheet("explain"); }} className="w-full bg-classoni-blue text-white py-3 rounded-full font-bold">Start Explaining</button>
                <button onClick={() => { setShowExplainPrompt(false); setShowApplyPrompt(true); }} className="w-full text-classoni-navy/60 py-2 text-sm font-semibold">Maybe Later</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showApplyPrompt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl p-6 max-w-sm w-full text-center">
              <h2 className="text-xl font-extrabold text-classoni-navy mb-2">Don't just memorize knowledge</h2>
              <p className="text-sm text-classoni-navy/70 mb-6">Put "{lesson.keypoint_title}" to work to solve a real problem...</p>
              <div className="space-y-2">
                <button onClick={() => { setShowApplyPrompt(false); setActiveSheet("apply"); }} className="w-full bg-classoni-yellow text-classoni-navy py-3 rounded-full font-bold">Practice Now</button>
                <button onClick={() => { setShowApplyPrompt(false); navigate("courses"); }} className="w-full text-classoni-navy/60 py-2 text-sm font-semibold">Skip for Now</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
  }
