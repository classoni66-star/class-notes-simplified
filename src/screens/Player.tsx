import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Share2, ThumbsUp, Play } from "lucide-react";
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

  // Flash Test State
  const [showFlashTest, setShowFlashTest] = useState(false);
  const [flashTestAnswer, setFlashTestAnswer] = useState<boolean | null>(null);
  const [flashTestResult, setFlashTestResult] = useState<"correct" | "wrong" | "timeout" | null>(null);
  const [flashTestTimer, setFlashTestTimer] = useState(3);
  const [pendingDirection, setPendingDirection] = useState<0 | 1 | -1>(0);

  // Points & completion
  const [dailyPoints, setDailyPoints] = useState(12);
  const awardedStepsRef = useRef<Set<number>>(new Set());
  const [showExplainPrompt, setShowExplainPrompt] = useState(false);
  const [showApplyPrompt, setShowApplyPrompt] = useState(false);
  const hasShownExplainPrompt = useRef(false);

  const timerRef = useRef<any>(null);
  const finishTimeoutRef = useRef<any>(null);
  const walkthroughRef = useRef<HTMLDivElement>(null);

  if (!lesson || !lesson.micro_steps) {
    return (
      <div className="p-4 text-white bg-classoni-navy h-screen flex items-center justify-center">
        Loading lesson data...
      </div>
    );
  }

  const currentStep = lesson.micro_steps[currentStepIndex];

  const flashTest = currentStep.flash_test || {
    statement: `"${currentStep.micro_step_title}" is essential to understanding this keypoint.`,
    answer: true,
    explanation: "Each micro concept builds toward the full keypoint.",
  };

  const walkthroughText = currentStep.audio_segments
    ? currentStep.audio_segments.join(" ")
    : "Understanding this concept is crucial for your mastery of the topic.";

  useEffect(() => {
    if (walkthroughRef.current) walkthroughRef.current.scrollTop = 0;
  }, [currentStepIndex]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (finishTimeoutRef.current) clearTimeout(finishTimeoutRef.current);
    };
  }, []);

  const triggerNavigation = (dir: 1 | -1) => {
    if (dir === -1 && currentStepIndex === 0) return;
    setPendingDirection(dir);
    setShowFlashTest(true);
    setFlashTestResult(null);
    setFlashTestAnswer(null);
    setFlashTestTimer(3);
  };

  useEffect(() => {
    if (showFlashTest && flashTestTimer > 0 && !flashTestAnswer) {
      timerRef.current = setTimeout(() => setFlashTestTimer((p) => p - 1), 1000);
    } else if (showFlashTest && flashTestTimer === 0 && !flashTestAnswer) {
      setFlashTestResult("timeout");
      finishFlashTest();
    }
    return () => clearTimeout(timerRef.current);
  }, [showFlashTest, flashTestTimer, flashTestAnswer]);

  const handleFlashAnswer = (val: boolean) => {
    if (flashTestAnswer !== null) return;
    setFlashTestAnswer(val);
    const isCorrect = val === flashTest.answer;

    if (isCorrect) {
      setFlashTestResult("correct");
      if (!awardedStepsRef.current.has(currentStepIndex)) {
        setDailyPoints((p) => p + 1);
        awardedStepsRef.current.add(currentStepIndex);
      }
    } else {
      setFlashTestResult("wrong");
    }

    clearTimeout(timerRef.current);
    finishFlashTest();
  };

  const finishFlashTest = () => {
    finishTimeoutRef.current = setTimeout(() => {
      setShowFlashTest(false);
      const isLastStep = currentStepIndex === lesson.micro_steps.length - 1;
      const isForward = pendingDirection === 1;

      if (isLastStep && isForward) {
        if (!hasShownExplainPrompt.current) {
          hasShownExplainPrompt.current = true;
          setShowExplainPrompt(true);
        }
      } else {
        setDirection(pendingDirection);
        setCurrentStepIndex((p) => p + pendingDirection);
      }
      setPendingDirection(0);
    }, 1200);
  };

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden relative">
      {/* 1. TOP BAR (Main Topic) */}
      <div className="flex-shrink-0">
        <TopBar
          title={lesson.topic || lesson.keypoint_title || "Classoni Lesson"}
          uploader="By You"
          points={dailyPoints}
          onProfileTap={() => navigate("profile")}
          onRewardsTap={() => navigate("rewards")}
          onPremiumTap={() => navigate("premiumPlans")}
        />
      </div>

      {/* 2. SUB-BAR (Dynamic Keypoint Title & Premium) */}
      <div className="flex-shrink-0 flex justify-between items-center px-4 py-2 bg-white border-b border-classoni-navy/10 z-10 shadow-sm relative">
        <h2 className="text-sm font-bold text-classoni-navy truncate pr-2 max-w-[65%]">
          Keypoint {lesson.keypoint_number || 1}.{currentStep.step_number || currentStepIndex + 1}: {currentStep.micro_step_title}
        </h2>
        <button 
          onClick={() => navigate("premiumPlans")} 
          className="bg-classoni-yellow text-classoni-navy px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap active:scale-95 transition-transform flex-shrink-0"
        >
          Go Premium
        </button>
      </div>

      {/* 3. CAPTIONS / WALKTHROUGH (Yellow Box) - Fixed height so it doesn't steal space */}
      <div className="mx-4 mt-2 mb-1 flex flex-col bg-[#FFFCE8] rounded-xl border border-classoni-yellow/40 overflow-hidden shadow-sm flex-shrink-0 h-[18vh]">
        <div ref={walkthroughRef} className="overflow-y-auto p-4 h-full">
          <p className="text-classoni-navy/90 text-sm leading-relaxed font-medium">{walkthroughText}</p>
        </div>
      </div>

      {/* 4. AUDIO PLAYER */}
      <div className="flex items-center gap-3 px-6 py-2 flex-shrink-0">
        <button className="w-10 h-10 rounded-full bg-classoni-navy text-white flex items-center justify-center flex-shrink-0 shadow-md active:scale-95">
          <Play size={18} fill="currentColor" className="ml-1" />
        </button>
        <div className="flex-1 h-1.5 bg-classoni-navy/10 rounded-full relative">
          <div className="absolute left-0 top-0 h-full w-1/4 bg-classoni-yellow rounded-full" />
          <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-classoni-yellow rounded-full border-2 border-white shadow" />
        </div>
        <span className="text-xs text-classoni-navy/60 font-semibold">1.00x</span>
      </div>

      {/* 5. VISUAL BLOCK (Now takes up ALL remaining space) */}
      <div className="flex-1 min-h-0 relative mx-4 mb-2">
        <button
          onClick={() => triggerNavigation(-1)}
          disabled={currentStepIndex === 0}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg ${
            currentStepIndex === 0 ? "opacity-30" : "hover:bg-white"
          }`}
        >
          <ChevronLeft size={24} className="text-classoni-navy" />
        </button>

        <div className="w-full h-full bg-white rounded-2xl shadow-sm border border-classoni-navy/10 relative overflow-hidden">
          
          {/* FLOATING SHARE & FEEDBACK (Moved inside visual card, right side, above bottom edge) */}
          <div className="absolute right-2 bottom-16 z-40 flex flex-col gap-2">
            <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-classoni-navy/10 active:scale-95 transition-transform">
              <Share2 size={18} className="text-classoni-navy" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center border border-classoni-navy/10 active:scale-95 transition-transform">
              <ThumbsUp size={18} className="text-classoni-navy" />
            </button>
          </div>

          <AnimatePresence>
            {showFlashTest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 z-50 flex flex-col items-center justify-center p-6 text-center ${
                  flashTestResult === "correct"
                    ? "bg-green-500 text-white"
                    : flashTestResult === "wrong"
                    ? "bg-red-500 text-white"
                    : flashTestResult === "timeout"
                    ? "bg-orange-500 text-white"
                    : "bg-classoni-navy text-white"
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
              className="absolute inset-0 flex flex-col overflow-y-auto p-6 pb-24" 
            >
              <div className="flex flex-col space-y-4">
                <h2 className="text-xl font-extrabold text-classoni-navy pr-12">{currentStep.micro_step_title}</h2>
                <p className="text-sm text-classoni-navy/60 italic leading-relaxed">{currentStep.summary_text || "Understanding this core concept is crucial."}</p>
                <div className="bg-classoni-lavender/60 p-4 rounded-xl border-l-4 border-classoni-blue">
                  <p className="text-classoni-navy whitespace-pre-wrap leading-relaxed font-medium text-sm">{currentStep.visual_skeleton_text}</p>
                </div>
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl h-32 flex flex-col items-center justify-center">
                   <span className="text-xs text-gray-400 font-medium">Visual / OpenVerse</span>
                   <span className="text-[10px] text-gray-400">Coming Soon</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => triggerNavigation(1)}
          className="absolute right-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg hover:bg-white"
        >
          <ChevronRight size={24} className="text-classoni-navy" />
        </button>
      </div>

      {/* 6. ACTION BUTTONS */}
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

      {/* MODALS (Apply, Quiz, Explain, etc.) */}
      {/* EXPLAIN ARENA MODAL */}
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
      
      {/* PROMPTS (Explain, Apply) */}
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
    </div>
  );
    }
