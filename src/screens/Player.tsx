import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ThumbsUp, X, Play } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
  initialProgress?: number;
}

const CAPTION =
  "During muscle contraction, the myosin heads pull on actin filaments, causing them to slide inward.";

const QUIZ_OPTIONS = [
  "The actin and myosin filaments both shorten in length.",
  "The myosin filaments slide past the actin filaments, pulling the Z-lines closer together.",
  "The sarcomere membrane folds inward, reducing its overall length.",
  "The actin filaments dissolve and reassemble in a more compact form.",
];

const QUIZ_CORRECT_INDEX = 1;

const QUIZ_EXPLANATION =
  "During contraction, the actin and myosin filaments do not change length; they slide past each other, which shortens the sarcomere.";

const SPEED_OPTIONS = [0.75, 0.85, 1.0, 1.25, 1.5];

// Real clip length in seconds — this is what the progress bar fills to.
const CLIP_DURATION_SECONDS = 30;

type Sheet = "apply" | "explain" | "quiz" | "posts" | null;
type RatingVote = "helpful" | "more" | "very" | null;

const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export default function Player({ navigate, initialProgress = 0 }: PlayerProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(0.85);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [progress, setProgress] = useState(initialProgress);

  // Apply
  const [applySolved, setApplySolved] = useState(false);

  // Explain
  const [explainText, setExplainText] = useState("");
  const [explainSubmitted, setExplainSubmitted] = useState(false);

  // Quiz
  const [quizMode, setQuizMode] = useState<"mcq" | "type">("mcq");
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [typedAnswer, setTypedAnswer] = useState("");
  const [typedSubmitted, setTypedSubmitted] = useState(false);

  // Posts rating
  const [ratingVote, setRatingVote] = useState<RatingVote>(null);

  // Share
  const [shareNotice, setShareNotice] = useState("");

  // Feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"like" | "dislike" | null>(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);
  const lastSavedRef = useRef(0);
  const progressRef = useRef(progress);
  const speedRef = useRef(playbackSpeed);

  const words = CAPTION.split(" ");

  // Keep refs in sync so the interval always reads the LATEST values,
  // regardless of when the effect last re-ran.
  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    speedRef.current = playbackSpeed;
  }, [playbackSpeed]);

  // Progress advances while playing. Uses refs so changing speed
  // takes effect immediately without needing to restart the interval.
  useEffect(() => {
    if (!isPlaying || activeSheet || feedbackOpen) return;
    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 1) return 0;
        const perTick = (speedRef.current / CLIP_DURATION_SECONDS) * 0.1;
        return Math.min(1, p + perTick);
      });
    }, 100);
    return () => clearInterval(timer);
  }, [isPlaying, activeSheet, feedbackOpen]);

  // Word-by-word caption highlighting synced to progress
  useEffect(() => {
    if (activeSheet || feedbackOpen) return;
    const newIndex = Math.min(words.length - 1, Math.floor(progress * words.length));
    setHighlightedIndex(newIndex);
  }, [progress, words.length, activeSheet, feedbackOpen]);

  // Throttled save of progress to localStorage
  useEffect(() => {
    const now = Date.now();
    if (now - lastSavedRef.current > 800) {
      localStorage.setItem("classoni_lastProgress", progress.toFixed(4));
      lastSavedRef.current = now;
    }
  }, [progress]);

  // Save on app hide / page hide so we don't lose state when they close
  useEffect(() => {
    const save = () => {
      localStorage.setItem("classoni_lastProgress", progressRef.current.toFixed(4));
    };
    document.addEventListener("visibilitychange", save);
    window.addEventListener("pagehide", save);
    return () => {
      save();
      document.removeEventListener("visibilitychange", save);
      window.removeEventListener("pagehide", save);
    };
  }, []);

  // Auto-hide share notice
  useEffect(() => {
    if (!shareNotice) return;
    const timer = setTimeout(() => setShareNotice(""), 2000);
    return () => clearTimeout(timer);
  }, [shareNotice]);

  const togglePlay = () => {
    setSpeedMenuOpen(false);
    setIsPlaying((p) => !p);
  };

  const pauseLesson = () => console.log("[Player] Lesson paused");
  const resumeLesson = () => console.log("[Player] Lesson resumed at speed", playbackSpeed);

  const openSheet = (id: Exclude<Sheet, null>) => {
    setActiveSheet(id);
    pauseLesson();
  };

  const closeSheet = () => {
    setActiveSheet(null);
    resumeLesson();
    setApplySolved(false);
    setExplainSubmitted(false);
    setQuizAnswer(null);
    setTypedAnswer("");
    setTypedSubmitted(false);
    setQuizMode("mcq");
    setRatingVote(null);
  };

  const selectSpeed = (s: number) => {
    setPlaybackSpeed(s);
    setSpeedMenuOpen(false);
    console.log("[Player] Speed set to", s);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
    didSwipeRef.current = false;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (absDx > 50 && absDx > absDy * 1.5) {
      didSwipeRef.current = true;
      const delta = dx > 0 ? 0.1 : -0.1;
      setProgress((p) => Math.max(0, Math.min(1, p + delta)));
    }

    touchStartRef.current = null;
  };

  const handleCanvasClick = () => {
    if (didSwipeRef.current) {
      didSwipeRef.current = false;
      return;
    }
    togglePlay();
  };

  const handleShare = async () => {
    const shareData = {
      title: "Classoni",
      text: "Check out this lesson!",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error("Share not supported");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareNotice("Link copied!");
      } catch {
        setShareNotice("Could not copy link");
      }
    }
  };

  const submitFeedback = () => {
    console.log("[Feedback]", { type: feedbackType, reason: feedbackReason });
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackOpen(false);
      setFeedbackSent(false);
      setFeedbackType(null);
      setFeedbackReason("");
    }, 1500);
  };

  const currentSeconds = progress * CLIP_DURATION_SECONDS;

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden">
      <div className="flex-shrink-0">
        <TopBar
          title="Sliding Filament Theory"
          uploader="By You"
          points={12}
          onProfileTap={() => navigate("profile")}
          onRewardsTap={() => navigate("rewards")}
          onPremiumTap={() => navigate("premiumPlans")}
        />
      </div>

      <div className="flex-shrink-0 px-4 py-2">
        <p className="text-center text-classoni-navy text-base leading-relaxed">
          {words.map((word, i) => (
            <span
              key={i}
              className={
                i === highlightedIndex
                  ? "bg-classoni-yellow text-classoni-navy rounded-md px-1 transition-all duration-150"
                  : "transition-all duration-150"
              }
            >
              {word}{" "}
            </span>
          ))}
        </p>
      </div>

      {/* VISUAL CANVAS */}
      <div className="flex-1 min-h-0 mx-4 mb-2 relative">
        <div
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="h-full w-full overflow-y-auto rounded-2xl bg-white/60 relative cursor-pointer"
        >
          <div className="h-full w-full" />

          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl pointer-events-none"
              >
                <div className="w-20 h-20 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play size={34} className="text-classoni-navy ml-1" fill="currentColor" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSpeedMenuOpen((open) => !open);
          }}
          className="absolute top-3 right-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md text-xs font-semibold text-classoni-navy z-30"
        >
          {playbackSpeed.toFixed(2)}x
        </button>

        <AnimatePresence>
          {speedMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-14 right-3 bg-white rounded-xl shadow-lg p-1 z-40"
            >
              {SPEED_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={(e) => {
                    e.stopPropagation();
                    selectSpeed(s);
                  }}
                  className={`block w-full px-4 py-2 text-xs text-left rounded-lg whitespace-nowrap ${
                    playbackSpeed === s
                      ? "bg-classoni-blue text-white font-semibold"
                      : "text-classoni-navy"
                  }`}
                >
                  {s.toFixed(2)}x
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute bottom-3 right-3 flex flex-col gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleShare();
            }}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
            aria-label="Share"
          >
            <Share2 size={18} className="text-classoni-navy" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFeedbackOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
            aria-label="Feedback"
          >
            <ThumbsUp size={18} className="text-classoni-navy" />
          </button>
        </div>

        {shareNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-classoni-navy text-white text-xs px-3 py-1.5 rounded-full">
            {shareNotice}
          </div>
        )}
      </div>

      {/* PROGRESS BAR */}
      <div className="flex-shrink-0 px-4 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-classoni-navy/60 font-medium w-9 text-right">
            {formatTime(currentSeconds)}
          </span>
          <div className="flex-1 h-1 bg-classoni-navy/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-classoni-yellow transition-all duration-100"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <span className="text-[10px] text-classoni-navy/60 font-medium w-9">
            {formatTime(CLIP_DURATION_SECONDS)}
          </span>
        </div>
      </div>

      {/* PILL BUTTONS */}
      <div className="flex-shrink-0 px-4 pb-2 flex gap-2">
        <button
          onClick={() => openSheet("apply")}
          className="flex-1 bg-classoni-blue text-white rounded-full py-3 font-semibold text-sm"
        >
          Apply
        </button>
        <button
          onClick={() => openSheet("explain")}
          className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm"
        >
          Explain
        </button>
        <button
          onClick={() => openSheet("quiz")}
          className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm"
        >
          Quiz
        </button>
        <button
          onClick={() => openSheet("posts")}
          className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm"
        >
          Posts
        </button>
      </div>

      <div className="flex-shrink-0">
        <BottomNav
          active="courses"
          onNavigate={(tab) => {
            if (tab === "upload") navigate("input");
            if (tab === "leaderboard") navigate("classGate");
            if (tab === "search") navigate("search");
          }}
        />
      </div>

      {/* BOTTOM SHEETS */}
      <AnimatePresence>
        {activeSheet && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSheet}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6 overflow-y-auto"
              style={{ height: "80vh" }}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <button
                onClick={closeSheet}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} className="text-classoni-navy" />
              </button>

              {activeSheet === "apply" && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Apply</h3>
                  <p className="text-classoni-navy text-sm leading-relaxed mb-4">
                    A nurse in Mulago Hospital is preparing oral rehydration solution for a cholera
                    outbreak and needs to calculate the exact sodium concentration. The ward has run
                    out of pre-measured sachets, and the nursing staff are unsure of the correct
                    ratio.
                  </p>
                  {!applySolved ? (
                    <button
                      onClick={() => setApplySolved(true)}
                      className="w-full bg-classoni-blue text-white rounded-full py-3 font-semibold"
                    >
                      Solve
                    </button>
                  ) : (
                    <div className="bg-classoni-lavender rounded-xl p-4">
                      <p className="text-classoni-navy text-sm leading-relaxed">
                        The nurse needs to recognize that concentration defines how much solute is
                        in a given volume. Multiplying the target concentration (75 mmol/L) by the
                        total volume (5 L) and the molar mass of NaCl (58.44 g/mol) yields
                        approximately 21.9 grams of salt to weigh out. Given the ward's time
                        pressure, pre-measuring sachets during morning rounds removes the measuring
                        step from the staff entirely.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSheet === "explain" && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Explain</h3>
                  <p className="text-classoni-navy text-sm leading-relaxed mb-4">
                    Explain this concept in your own words, score 8/10 or more to unlock teacher
                    mode and more rewards...
                  </p>
                  <textarea
                    value={explainText}
                    onChange={(e) => setExplainText(e.target.value)}
                    placeholder="Type your explanation..."
                    className="w-full h-28 border border-classoni-blue rounded-xl p-3 text-sm text-classoni-navy mb-3"
                  />
                  <button
                    onClick={() => setExplainSubmitted(true)}
                    className="w-full bg-classoni-blue text-white rounded-full py-3 font-semibold"
                  >
                    Submit
                  </button>
                  {explainSubmitted && (
                    <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                      <p className="text-red-700 text-sm font-semibold">7/10</p>
                      <p className="text-red-700 text-xs mt-1">
                        You missed the role of ATP in myosin detachment. Try again.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSheet === "quiz" && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Question 1 of 1</h3>
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setQuizMode("mcq")}
                      className={`flex-1 rounded-full py-2 text-xs font-semibold ${
                        quizMode === "mcq"
                          ? "bg-classoni-blue text-white"
                          : "bg-classoni-lavender text-classoni-navy"
                      }`}
                    >
                      MCQ
                    </button>
                    <button
                      onClick={() => setQuizMode("type")}
                      className={`flex-1 rounded-full py-2 text-xs font-semibold ${
                        quizMode === "type"
                          ? "bg-classoni-blue text-white"
                          : "bg-classoni-lavender text-classoni-navy"
                      }`}
                    >
                      Type
                    </button>
                  </div>
                  <p className="text-classoni-navy text-sm font-semibold mb-4">
                    Which of the following best describes the mechanism by which a skeletal muscle
                    fiber shortens during contraction?
                  </p>
                  {quizMode === "mcq" && (
                    <div className="space-y-2">
                      {QUIZ_OPTIONS.map((opt, i) => {
                        const letters = ["A", "B", "C", "D"];
                        const isSelected = quizAnswer === i;
                        const isCorrect = i === QUIZ_CORRECT_INDEX;
                        let bg = "bg-classoni-lavender";
                        if (quizAnswer !== null) {
                          if (isSelected && isCorrect)
                            bg = "bg-green-100 border-green-500";
                          else if (isSelected && !isCorrect)
                            bg = "bg-red-100 border-red-500";
                          else if (isCorrect) bg = "bg-green-50 border-green-300";
                        }
                        return (
                          <button
                            key={i}
                            disabled={quizAnswer !== null}
                            onClick={() => setQuizAnswer(i)}
                            className={`w-full text-left rounded-xl p-3 text-sm text-classoni-navy border-2 border-transparent transition-all ${bg}`}
                          >
                            <span className="font-bold mr-2">{letters[i]})</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  )}
                  {quizMode === "type" && (
                    <div>
                      <textarea
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        placeholder="Type your answer here..."
                        inputMode="text"
                        className="w-full h-28 border border-classoni-blue rounded-xl p-3 text-sm text-classoni-navy mb-3"
                      />
                      <button
                        onClick={() => setTypedSubmitted(true)}
                        className="w-full bg-classoni-blue text-white rounded-full py-3 font-semibold"
                      >
                        Submit Answer
                      </button>
                      {typedSubmitted && (
                        <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-3">
                          <p className="text-green-700 text-sm font-semibold">Correct!</p>
                          <p className="text-green-700 text-xs mt-1">{QUIZ_EXPLANATION}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {quizAnswer !== null && quizMode === "mcq" && (
                    <div className="mt-4 bg-classoni-lavender rounded-xl p-3">
                      <p className="text-classoni-navy text-xs leading-relaxed">
                        {QUIZ_EXPLANATION}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSheet === "posts" && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">
                    Class Contributions
                  </h3>
                  <p className="text-classoni-navy text-sm text-center mb-4">
                    No contributions from your class for this concept yet. You can be the first!
                  </p>
                  <div className="bg-classoni-lavender rounded-2xl p-4">
                    <p className="text-classoni-navy font-bold text-sm mb-2">
                      Explained by Amina K.
                    </p>
                    <p className="text-classoni-navy text-sm mb-4 leading-relaxed">
                      The myosin heads grab the actin and pull it inward, like rowing a boat. When
                      ATP comes in, they let go and reset. That's why muscles need energy to relax
                      too.
                    </p>
                    <div className="flex gap-4 items-center justify-between">
                      <button
                        onClick={() => setRatingVote("helpful")}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span
                          className={
                            ratingVote === "helpful"
                              ? "text-classoni-blue font-semibold"
                              : "text-classoni-navy"
                          }
                        >
                          Helpful
                        </span>
                        <span className="text-classoni-navy/40">
                          · {ratingVote === "helpful" ? 4 : 3}
                        </span>
                      </button>
                      <button
                        onClick={() => setRatingVote("more")}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span
                          className={
                            ratingVote === "more"
                              ? "text-green-700 font-semibold"
                              : "text-classoni-navy"
                          }
                        >
                          More helpful
                        </span>
                        <span className="text-classoni-navy/40">
                          · {ratingVote === "more" ? 6 : 5}
                        </span>
                      </button>
                      <button
                        onClick={() => setRatingVote("very")}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span
                          className={
                            ratingVote === "very"
                              ? "text-purple-700 font-semibold"
                              : "text-classoni-navy"
                          }
                        >
                          Very helpful
                        </span>
                        <span className="text-classoni-navy/40">
                          · {ratingVote === "very" ? 3 : 2}
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FEEDBACK MODAL */}
      <AnimatePresence>
        {feedbackOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFeedbackOpen(false)}
            />
            <motion.div
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 p-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
            >
              <button
                onClick={() => setFeedbackOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center"
                aria-label="Close"
              >
                <X size={20} className="text-classoni-navy" />
              </button>

              {!feedbackSent ? (
                <>
                  <h3 className="text-classoni-navy font-bold text-lg mb-4 pt-2">
                    How was this explanation?
                  </h3>
                  <div className="flex gap-3 mb-4">
                    <button
                      onClick={() => setFeedbackType("like")}
                      className={`flex-1 rounded-xl py-3 font-semibold text-sm ${
                        feedbackType === "like"
                          ? "bg-green-100 border-2 border-green-500 text-green-700"
                          : "bg-classoni-lavender border-2 border-transparent text-classoni-navy"
                      }`}
                    >
                      👍 Like
                    </button>
                    <button
                      onClick={() => setFeedbackType("dislike")}
                      className={`flex-1 rounded-xl py-3 font-semibold text-sm ${
                        feedbackType === "dislike"
                          ? "bg-red-100 border-2 border-red-500 text-red-700"
                          : "bg-classoni-lavender border-2 border-transparent text-classoni-navy"
                      }`}
                    >
                      👎 Dislike
                    </button>
                  </div>
                  {feedbackType && (
                    <>
                      <textarea
                        value={feedbackReason}
                        onChange={(e) => setFeedbackReason(e.target.value)}
                        placeholder={
                          feedbackType === "like"
                            ? "Tell us more (optional)"
                            : "Please tell us what went wrong"
                        }
                        className="w-full h-24 border border-classoni-blue rounded-xl p-3 text-sm text-classoni-navy mb-3"
                      />
                      <button
                        onClick={submitFeedback}
                        className="w-full bg-classoni-blue text-white rounded-full py-3 font-semibold"
                      >
                        Submit
                      </button>
                    </>
                  )}
                </>
              ) : (
                <p className="text-classoni-navy text-center py-8 font-semibold">
                  Thank you! Your feedback has been sent.
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
  }
