import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, Play, Share2, ThumbsUp } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
  lesson: any;
}

export default function Player({ navigate, lesson }: PlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right
  const [showExplain, setShowExplain] = useState(false);
  const [activeSheet, setActiveSheet] = useState<"apply" | "quiz" | "posts" | null>(null);

  if (!lesson || !lesson.micro_steps) return <div className="p-4">No lesson data</div>;

  const currentStep = lesson.micro_steps[currentStepIndex];
  const isLastStep = currentStepIndex === lesson.micro_steps.length - 1;

  const handleNext = () => {
    if (currentStepIndex < lesson.micro_steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden relative">
      
      {/* HEADER */}
      <TopBar title={lesson.keypoint_title} uploader="By You" points={12} onProfileTap={() => {}} onRewardsTap={() => {}} onPremiumTap={() => {}} />
      
      {/* LOCATION INDICATOR & TITLE */}
      <div className="flex flex-col items-center mt-2 px-4 text-center">
        <span className="text-xs font-bold text-classoni-navy/60 mb-1">Keypoint {lesson.location_indicator}</span>
        <h2 className="text-xl font-bold text-classoni-navy">{currentStep.micro_step_title}</h2>
      </div>

      {/* VISUAL SECTION (Sliding page effect) */}
      <div className="flex-1 relative mx-4 my-4 flex items-center justify-center">
        {/* Left Button */}
        <button 
          onClick={handlePrev} 
          disabled={currentStepIndex === 0}
          className={`absolute left-0 z-10 p-2 rounded-full bg-white/80 shadow-md ${currentStepIndex === 0 ? 'opacity-30' : 'hover:bg-white'}`}
        >
          <ChevronLeft size={24} className="text-classoni-navy" />
        </button>

        {/* The Slide Area */}
        <div className="w-full h-full max-w-sm bg-white rounded-2xl shadow-lg border border-classoni-navy/10 overflow-hidden relative">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentStepIndex}
              custom={direction}
              initial={{ x: direction > 0 ? 300 : -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: direction > 0 ? -300 : 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-0 flex flex-col p-6 overflow-y-auto"
            >
              {/* TEXT-BASED CONCEPT SKELETON */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="bg-classoni-lavender/50 p-4 rounded-xl border-l-4 border-classoni-blue">
                  <p className="text-classoni-navy whitespace-pre-wrap leading-relaxed font-medium">
                    {currentStep.visual_skeleton_text}
                  </p>
                </div>
              </div>

              {/* CAPTIONS (Text-first) */}
              <div className="mt-4 pt-4 border-t border-classoni-navy/10 text-center">
                <p className="text-sm text-classoni-navy/70 italic">
                  {currentStep.audio_segments?.join(" ")}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Button */}
        <button 
          onClick={handleNext} 
          disabled={isLastStep}
          className={`absolute right-0 z-10 p-2 rounded-full bg-white/80 shadow-md ${isLastStep ? 'opacity-30' : 'hover:bg-white'}`}
        >
          <ChevronRight size={24} className="text-classoni-navy" />
        </button>
      </div>

      {/* BOTTOM BUTTONS - DYNAMIC */}
      <div className="flex-shrink-0 px-4 pb-6">
        {isLastStep ? (
          <div className="flex gap-2">
            <button onClick={() => setActiveSheet("apply")} className="flex-1 bg-classoni-blue text-white rounded-full py-3 font-semibold text-sm shadow-md">Apply</button>
            <button onClick={() => setShowExplain(true)} className="flex-1 bg-classoni-yellow text-classoni-navy rounded-full py-3 font-bold text-sm shadow-md">Explain</button>
            <button onClick={() => setActiveSheet("quiz")} className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm shadow-md">Quiz</button>
            <button onClick={() => setActiveSheet("posts")} className="flex-1 bg-white border border-classoni-navy/20 text-classoni-navy rounded-full py-3 font-semibold text-sm shadow-md">Posts</button>
          </div>
        ) : (
          <div className="flex gap-2">
            {/* Centered Primary Explain Button */}
            <button onClick={() => setShowExplain(true)} className="flex-[2] bg-classoni-yellow text-classoni-navy rounded-full py-3 font-bold text-sm shadow-md">
              Explain
            </button>
            <button onClick={() => setActiveSheet("posts")} className="flex-1 bg-white border border-classoni-navy/20 text-classoni-navy rounded-full py-3 font-semibold text-sm shadow-md">
              Posts
            </button>
          </div>
        )}
      </div>

      {/* EXPLAIN ARENA MODAL (MOCKED) */}
      <AnimatePresence>
        {showExplain && (
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className="fixed inset-0 bg-classoni-navy z-50 flex flex-col p-6 text-white">
            <button onClick={() => setShowExplain(false)} className="self-end"><X size={24} /></button>
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

      {/* BASIC BOTTOM SHEETS FOR APPLY/QUIZ/POSTS */}
      <AnimatePresence>
        {activeSheet && (
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

      <BottomNav active="courses" onNavigate={(tab) => {
        if (tab === "upload") navigate("input");
        if (tab === "leaderboard") navigate("classGate");
        if (tab === "search") navigate("search");
      }} />
    </div>
  );
    }
