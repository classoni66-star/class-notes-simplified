import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ThumbsUp, X, Gift, User } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
}

const CAPTION =
  "During muscle contraction, the myosin heads pull on actin filaments, causing them to slide inward.";

const QUIZ_OPTIONS = [
  "The actin and myosin filaments both shorten in length.",
  "The myosin filaments slide past the actin filaments, pulling the Z-lines closer together.",
  "The sarcomere membrane folds inward, reducing its overall length.",
  "The actin filaments dissolve and reassemble in a more compact form.",
];

const QUIZ_CORRECT_INDEX = 1; // option B

const QUIZ_EXPLANATION =
  "During contraction, the actin and myosin filaments do not change length; they slide past each other, which shortens the sarcomere.";

type Sheet = "apply" | "explain" | "quiz" | "posts" | null;

export default function Player({ navigate }: PlayerProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [applySolved, setApplySolved] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainSubmitted, setExplainSubmitted] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [shareNotice, setShareNotice] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"like" | "dislike" | null>(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const words = CAPTION.split(" ");

  // Word-by-word highlighting
  useEffect(() => {
    if (activeSheet || feedbackOpen) return;
    const timer = setInterval(() => {
      setHighlightedIndex((i) => (i + 1) % words.length);
    }, 400);
    return () => clearInterval(timer);
  }, [activeSheet, feedbackOpen, words.length]);

  // Auto-hide share notice
  useEffect(() => {
    if (!shareNotice) return;
    const timer = setTimeout(() => setShareNotice(""), 2000);
    return () => clearTimeout(timer);
  }, [shareNotice]);

  const pauseLesson = () => console.log("[Player] Lesson paused");
  const resumeLesson = () => console.log("[Player] Lesson resumed from previous position");

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

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden">
      {/* TOP BAR */}
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

      {/* CAPTIONS — word highlighting */}
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

      {/* VISUAL CANVAS — scrollable, self-contained */}
      <div className="flex-1 min-h-0 mx-4 mb-2 relative">
        <div className="h-full w-full overflow-y-auto rounded-2xl bg-white/60">
          {/* Empty canvas — the LLM's SVG will render here later */}
          <div className="h-full w-full" />
        </div>

        {/* Floating Share + Feedback */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-3">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
            aria-label="Share"
          >
            <Share2 size={18} className="text-classoni-navy" />
          </button>
          <button
            onClick={() => setFeedbackOpen(true)}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
            aria-label="Feedback"
          >
            <ThumbsUp size={18} className="text-classoni-navy" />
          </button>
        </div>

        {/* Share toast */}
        {shareNotice && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-classoni-navy text-white text-xs px-3 py-1.5 rounded-full">
            {shareNotice}
          </div>
        )}
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

      {/* BOTTOM NAV */}
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
                        The nurse needs to recognize that concentration defines how much solute is in
                        a given volume. Multiplying the target concentration (75 mmol/L) by the total
                        volume (5 L) and the molar mass of NaCl (58.44 g/mol) yields approximately
                        21.9 grams of salt to weigh out. Given the ward's time pressure, pre-measuring
                        sachets during morning rounds removes the measuring step from the staff
                        entirely.
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
                  <p className="text-classoni-navy text-sm font-semibold mb-4">
                    Which of the following best describes the mechanism by which a skeletal muscle
                    fiber shortens during contraction?
                  </p>
                  <div className="space-y-2">
                    {QUIZ_OPTIONS.map((opt, i) => {
                      const letters = ["A", "B", "C", "D"];
                      const isSelected = quizAnswer === i;
                      const isCorrect = i === QUIZ_CORRECT_INDEX;
                      let bg = "bg-classoni-lavender";
                      if (quizAnswer !== null) {
                        if (isSelected && isCorrect) bg = "bg-green-100 border-green-500";
                        else if (isSelected && !isCorrect) bg = "bg-red-100 border-red-500";
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
                  {quizAnswer !== null && (
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
                    <p className="text-classoni-navy/70 text-xs mb-3 font-semibold">
                      How did you find this explanation?
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <button className="bg-blue-500/15 text-blue-600 rounded-full px-3 py-1.5 text-xs font-semibold">
                        🔵 Helpful 3
                      </button>
                      <button className="bg-green-500/15 text-green-600 rounded-full px-3 py-1.5 text-xs font-semibold">
                        🟢 More Helpful 5
                      </button>
                      <button className="bg-purple-500/15 text-purple-600 rounded-full px-3 py-1.5 text-xs font-semibold">
                        🟣 Very Helpful 2
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
