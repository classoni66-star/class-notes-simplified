import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Share2, ThumbsUp } from "lucide-react";
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

  // Per-concept flash test — falls back per micro concept if backend misses it
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

  const handleExplainPromptSkip = () => {
    setShowExplainPrompt(false);
    setShowApplyPrompt(true);
  };

  const handleExplainPromptStart = () => {
    setShowExplainPrompt(false);
    setActiveSheet("explain");
  };

  const handleApplyPromptSkip = () => {
    setShowApplyPrompt(false);
    navigate("courses");
  };

  const handleApplyPromptStart = () => {
    setShowApplyPrompt(false);
    setActiveSheet("apply");
  };

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden relative">
      <div className="flex-shrink-0">
        <TopBar
          title={currentStep.micro_step_title}
          uploader="By You"
          points={dailyPoints}
          onProfileTap={() => navigate("profile")}
          onRewardsTap={() => navigate("rewards")}
          onPremiumTap={() => navigate("premiumPlans")}
        />
      </div>

      {/* 1. WALKTHROUGH — above visuals, scrollable */}
      <div className="flex-1 min-h-0 mx-4 mt-2 mb-2 flex flex-col bg-white rounded-2xl shadow-sm border border-classoni-navy/10 overflow-hidden">
        <div className="bg-classoni-navy/5 px-4 py-2 border-b border-classoni-navy/10">
          <h3 className="text-xs font-bold text-classoni-navy tracking-wider uppercase">Walkthrough</h3>
        </div>
        <div ref={walkthroughRef} className="flex-1 overflow-y-auto p-4">
          <p className="text-classoni-navy/80 text-sm leading-relaxed">{walkthroughText}</p>
        </div>
      </div>

      {/* 2. VISUAL — memory part */}
      <div className="flex-shrink-0 relative mx-4 mb-2 h-[42vh]">
        <button
          onClick={() => triggerNavigation(-1)}
          disabled={currentStepIndex === 0}
          className={`absolute left-1 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/90 shadow-lg ${
            currentStepIndex === 0 ? "opacity-30" : "hover:bg-white"
          }`}
        >
          <ChevronLeft size={24} className="text-classoni-navy" />
        </button>

        <div className="w-full h-full bg-white rounded-2xl shadow-xl border border-classoni-navy/10 relative overflow-hidden">
          <AnimatePresence>
            {showFlashTest && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-6 text-center ${
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
                      <button
                        onClick={() => handleFlashAnswer(true)}
                        className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl font-bold text-xl transition-colors"
                      >
                        TRUE
                      </button>
                      <button
                        onClick={() => handleFlashAnswer(false)}
                        className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-xl font-bold text-xl transition-colors"
                      >
                        FALSE
                      </button>
                    </div>
                  </>
                ) : (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex flex-col items-center">
                    <h2 className="text-3xl font-extrabold mb-2">
                      {flashTestResult === "correct" ? "CORRECT! +1pt" : flashTestResult === "wrong" ? "NOT QUITE" : "TIME'S UP"}
                    </h2>
                    <p className="text-sm opacity-80">
                      {flashTestResult === "correct" ? flashTest.explanation : "Moving on..."}
                    </p>
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
                <p className="text-sm text-classoni-navy/60 italic mb-4">
                  {currentStep.summary_text || "Understanding this core concept is crucial."}
                </p>
                <div className="bg-classoni-lavender/60 p-4 rounded-xl border-l-4 border-classoni-blue flex-1">
                  <p className="text-classoni-navy whitespace-pre-wrap leading-relaxed font-medium text-sm">
                    {currentStep.visual_skeleton_text}
                  </p>
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

        {/* Floating share & feedback — outside motion.div, won't animate */}
        <div className="absolute bottom-3 right-3 z-20 flex flex-col gap-2">
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-classoni-navy/10">
            <Share2 size={18} className="text-classoni-navy" />
          </button>
          <button className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center border border-classoni-navy/10">
            <ThumbsUp size={18} className="text-classoni-navy" />
          </button>
        </div>
      </div>

      {/* 3. ACTION BUTTONS */}
      <div className="flex-shrink-0 px-4 py-3 flex gap-2">
        <button
          onClick={() => setActiveSheet("apply")}
          className="flex-1 bg-white text-classoni-navy rounded-full py-3 font-semibold text-sm shadow-sm border border-classoni-navy/10 active:scale-95 transition-transform"
        >
          Apply
        </button>
        <button
          onClick={() => setActiveSheet("explain")}
          className="flex-[2] bg-classoni-blue text-white rounded-full py-3 font-bold text-sm shadow-md active:scale-95 transition-transform"
        >
          Explain
        </button>
        <button
          onClick={() => setActiveSheet("quiz")}
          className="flex-1 bg-white text-classoni-navy rounded-full py-3 font-semibold text-sm shadow-sm border border-classoni-navy/10 active:scale-95 transition-transform"
        >
          Quiz
        </button>
        <button
          onClick={() => setActiveSheet("posts")}
          className="flex-1 bg-white text-classoni-navy rounded-full py-3 font-semibold text-sm shadow-sm border border-classoni-navy/10 active:scale-95 transition-transform"
        >
          Posts
        </button>
      </div>

      <BottomNav
        active="courses"
        onNavigate={(tab) => {
          if (tab === "upload") navigate("input");
          if (tab === "leaderboard") navigate("classGate");
          if (tab === "search") navigate("search");
        }}
      />

      {/* EXPLAIN ARENA MODAL */}
      <AnimatePresence>
        {activeSheet === "explain" && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            className="fixed inset-0 bg-classoni-navy z-50 flex flex-col p-6 text-white"
          >
            <button onClick={() => setActiveSheet(null)} className="self-end p-2">
              <X size={24} />
            </button>
            <div className="flex-1 flex flex-col justify-center items-center text-center">
              <h2 className="text-2xl font-bold mb-2">
                Explain <span className="text-classoni-yellow">{currentStep.micro_step_title}</span>
              </h2>
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
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              onClick={() => setActiveSheet(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 min-h-[50vh]"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg capitalize text-classoni-navy">{activeSheet}</h3>
                <button onClick={() => setActiveSheet(null)}>
                  <X size={20} className="text-classoni-navy" />
                </button>
              </div>

              {activeSheet === "apply" && lesson.apply && (
                <div>
                  <h4 className="font-bold text-classoni-navy mb-2">{lesson.apply.title}</h4>
                  <p className="text-sm text-classoni-navy/80 mb-4">{lesson.apply.scenario}</p>
                  <button className="w-full bg-classoni-blue text-white py-3 rounded-full font-bold">
                    Reveal Solution
                  </button>
                </div>
              )}

              {activeSheet === "quiz" && lesson.quiz && (
                <div>
                  <h4 className="font-bold text-classoni-navy mb-2">{lesson.quiz.question}</h4>
                  <div className="space-y-2 mt-4">
                    {lesson.quiz.options.map((opt: string, i: number) => (
                      <button
                        key={i}
                        className="w-full text-left p-3 rounded-xl border border-classoni-navy/20 text-classoni-navy hover:bg-classoni-lavender"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {activeSheet === "posts" && (
                <p className="text-sm text-center text-classoni-navy/60 mt-8">
                  No class contributions for this micro-concept yet. Be the first!
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* EXPLAIN COMPLETION PROMPT */}
      <AnimatePresence>
        {showExplainPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-classoni-blue/10 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎓</span>
              </div>
              <h2 className="text-xl font-extrabold text-classoni-navy mb-2">
                Explain "{lesson.keypoint_title}" in your own words
              </h2>
              <p className="text-sm text-classoni-navy/70 mb-6">
                Score 8/10 to unlock teacher mode. You don't know it until you can explain it...
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleExplainPromptStart}
                  className="w-full bg-classoni-blue text-white py-3 rounded-full font-bold"
                >
                  Start Explaining
                </button>
                <button
                  onClick={handleExplainPromptSkip}
                  className="w-full text-classoni-navy/60 py-2 text-sm font-semibold"
                >
                  Maybe Later
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* APPLY COMPLETION PROMPT */}
      <AnimatePresence>
        {showApplyPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full text-center"
            >
              <div className="w-16 h-16 rounded-full bg-classoni-yellow/20 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🛠️</span>
              </div>
              <h2 className="text-xl font-extrabold text-classoni-navy mb-2">
                Don't just memorize knowledge
              </h2>
              <p className="text-sm text-classoni-navy/70 mb-6">
                Put "{lesson.keypoint_title}" to work to solve a real problem...
              </p>
              <div className="space-y-2">
                <button
                  onClick={handleApplyPromptStart}
                  className="w-full bg-classoni-yellow text-classoni-navy py-3 rounded-full font-bold"
                >
                  Practice Now
                </button>
                <button
                  onClick={handleApplyPromptSkip}
                  className="w-full text-classoni-navy/60 py-2 text-sm font-semibold"
                >
                  Skip for Now
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
