import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ThumbsUp, X, Play, RotateCcw, RotateCw } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
  initialProgress?: number;
  lesson?: Lesson | null;
  firstAudio?: FullAudioData | null;
}

type Sheet = "apply" | "explain" | "quiz" | "posts" | null;
type RatingVote = "helpful" | "more" | "very" | null;

interface VisualObject {
  svg_code: string;
  trigger_phrase: string;
  fade_out_trigger: string | null;
  caption: string;
  type: string;
  highlight: string | null;
  role: string;
}

interface Section {
  id: string;
  narration_text: string;
  visuals: VisualObject[];
}

interface Lesson {
  keypoint_title: string;
  sections: Section[];
  apply: { scenario: string; skeleton: string | null; solution: string };
  quiz: {
    type: string;
    question: string;
    options: string[] | null;
    correct_answer: string;
    explanation: string;
  };
}

interface FullAudioData {
  audio: string;
  words: { id: number; start: number; end: number; text: string; section: number }[];
  sectionBoundaries: { id: string; start: number; end: number }[];
}

const SPEED_OPTIONS = [0.75, 0.85, 1.0, 1.25, 1.5];
const CAPTION_WORDS_PER_BLOCK = 20;

function resolveTriggerPhrase(
  phrase: string,
  words: { start: number; end: number; text: string }[],
): number | null {
  if (!phrase || !words.length) return null;
  const target = phrase
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);
  if (!target.length) return null;

  for (let i = 0; i <= words.length - target.length; i++) {
    let match = true;
    for (let j = 0; j < target.length; j++) {
      const w = words[i + j].text.toLowerCase().replace(/[^\w\s]/g, "");
      if (w !== target[j]) {
        match = false;
        break;
      }
    }
    if (match) return words[i].start;
  }
  return null;
}

export default function Player({
  navigate,
  initialProgress = 0,
  lesson = null,
  firstAudio = null,
}: PlayerProps) {
  const [audioData] = useState<FullAudioData | null>(firstAudio);
  const [scaledWords, setScaledWords] = useState<any[]>(firstAudio?.words || []);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPausedOverlay, setShowPausedOverlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [activeVisualIndex, setActiveVisualIndex] = useState<number | null>(null);
  const [activeSheet, setActiveSheet] = useState<Sheet>(null);
  const [applySolved, setApplySolved] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainSubmitted, setExplainSubmitted] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [ratingVote, setRatingVote] = useState<RatingVote>(null);
  const [shareNotice, setShareNotice] = useState("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"like" | "dislike" | null>(null);
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const visualTimersRef = useRef<number[]>([]);
  const overlayTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const didSwipeRef = useRef(false);

  // Determine current section from boundaries
  const currentSectionIndex = (() => {
    if (!audioData) return 0;
    for (let i = 0; i < audioData.sectionBoundaries.length; i++) {
      const b = audioData.sectionBoundaries[i];
      if (audioCurrent >= b.start && audioCurrent < b.end) return i;
    }
    return Math.max(0, audioData.sectionBoundaries.length - 1);
  })();

  const currentSection = lesson?.sections[currentSectionIndex];

  // Measure actual audio duration and scale word timings to match
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioData) return;
    const onLoaded = () => {
      const estimated =
        audioData.words.length > 0
          ? audioData.words[audioData.words.length - 1].end
          : 0;
      const actual = audio.duration;
      if (estimated > 0 && actual > 0 && Math.abs(actual - estimated) > 0.3) {
        const scale = actual / estimated;
        setScaledWords(
          audioData.words.map((w) => ({
            ...w,
            start: w.start * scale,
            end: w.end * scale,
          })),
        );
      } else {
        setScaledWords(audioData.words);
      }
      setAudioDuration(actual);
      audio.currentTime = initialProgress * actual;
    };
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => audio.removeEventListener("loadedmetadata", onLoaded);
  }, [audioData, initialProgress]);

  // Load audio src once
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioData) return;
    audio.src = audioData.audio;
    audio.playbackRate = playbackSpeed;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioData]);

  // Schedule visual timeline based on scaled words + current section
  useEffect(() => {
    if (!audioData || !lesson || !currentSection) return;

    visualTimersRef.current.forEach((t) => window.clearTimeout(t));
    visualTimersRef.current = [];

    const sectionWords = scaledWords.filter((w) => w.section === currentSectionIndex);
    if (!sectionWords.length) return;

    const sectionStart = audioData.sectionBoundaries[currentSectionIndex]?.start || 0;

    const timeline: { at: number; visualIndex: number }[] = [];
    const fadeOuts: { at: number; visualIndex: number }[] = [];

    currentSection.visuals.forEach((v, i) => {
      const startMs = resolveTriggerPhrase(v.trigger_phrase, sectionWords);
      if (startMs !== null)
        timeline.push({ at: (startMs - sectionStart) * 1000, visualIndex: i });
      if (v.fade_out_trigger) {
        const endMs = resolveTriggerPhrase(v.fade_out_trigger, sectionWords);
        if (endMs !== null)
          fadeOuts.push({ at: (endMs - sectionStart) * 1000, visualIndex: i });
      }
    });

    timeline.sort((a, b) => a.at - b.at);
    fadeOuts.sort((a, b) => a.at - b.at);

    if (timeline.length === 0 && currentSection.visuals.length > 0) {
      setActiveVisualIndex(0);
    } else {
      setActiveVisualIndex(null);
    }

    timeline.forEach((entry) => {
      const t = window.setTimeout(() => {
        setActiveVisualIndex(entry.visualIndex);
      }, entry.at);
      visualTimersRef.current.push(t);
    });
    fadeOuts.forEach((entry) => {
      const t = window.setTimeout(() => {
        setActiveVisualIndex((cur) => (cur === entry.visualIndex ? null : cur));
      }, entry.at);
      visualTimersRef.current.push(t);
    });

    return () => {
      visualTimersRef.current.forEach((t) => window.clearTimeout(t));
      visualTimersRef.current = [];
    };
  }, [currentSectionIndex, audioData, lesson, scaledWords, currentSection]);

  // Playback speed
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Track progress
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setAudioCurrent(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setProgress(audio.currentTime / audio.duration);
      }
    };
    audio.addEventListener("timeupdate", onTime);
    return () => audio.removeEventListener("timeupdate", onTime);
  }, []);

  // Persist progress
  useEffect(() => {
    try {
      localStorage.setItem("classoni_lastProgress", progress.toFixed(4));
    } catch {}
  }, [progress]);

  // Auto-hide paused overlay after 1.5s
  useEffect(() => {
    if (overlayTimerRef.current) window.clearTimeout(overlayTimerRef.current);
    if (!isPlaying) {
      setShowPausedOverlay(true);
      overlayTimerRef.current = window.setTimeout(() => {
        setShowPausedOverlay(false);
      }, 1500);
    } else {
      setShowPausedOverlay(false);
    }
    return () => {
      if (overlayTimerRef.current) window.clearTimeout(overlayTimerRef.current);
    };
  }, [isPlaying]);

  const togglePlay = () => {
    setSpeedMenuOpen(false);
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const seekBy = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
    audio.currentTime = newTime;
    setAudioCurrent(newTime);
    if (audio.duration) setProgress(newTime / audio.duration);
  };

  const seekToFraction = (frac: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = frac * audio.duration;
    audio.currentTime = newTime;
    setAudioCurrent(newTime);
    setProgress(frac);
  };

  const openSheet = (id: Exclude<Sheet, null>) => {
    if (audioRef.current) audioRef.current.pause();
    setIsPlaying(false);
    setActiveSheet(id);
  };

  const closeSheet = () => {
    setActiveSheet(null);
    setApplySolved(false);
    setExplainSubmitted(false);
    setQuizAnswer(null);
    setRatingVote(null);
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
      } else throw new Error("no share");
    } catch {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareNotice("Link copied!");
        setTimeout(() => setShareNotice(""), 2000);
      } catch {
        setShareNotice("Could not copy");
        setTimeout(() => setShareNotice(""), 2000);
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
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      didSwipeRef.current = true;
      seekBy(dx > 0 ? 5 : -5);
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

  const currentVisual =
    currentSection && activeVisualIndex !== null
      ? currentSection.visuals[activeVisualIndex]
      : null;

  // Word-level caption with 20-word blocks
  const sectionWords = scaledWords.filter((w) => w.section === currentSectionIndex);
  const currentWordIndex = (() => {
    if (!sectionWords.length) return -1;
    for (let i = 0; i < sectionWords.length; i++) {
      if (audioCurrent >= sectionWords[i].start && audioCurrent < sectionWords[i].end)
        return i;
    }
    if (audioCurrent >= sectionWords[sectionWords.length - 1].end)
      return sectionWords.length - 1;
    return -1;
  })();

  const blockStart =
    currentWordIndex >= 0
      ? Math.floor(currentWordIndex / CAPTION_WORDS_PER_BLOCK) * CAPTION_WORDS_PER_BLOCK
      : 0;
  const blockEnd = Math.min(blockStart + CAPTION_WORDS_PER_BLOCK, sectionWords.length);
  const blockWords = sectionWords.slice(blockStart, blockEnd);

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-[100dvh] bg-classoni-lavender flex flex-col overflow-hidden">
      <audio ref={audioRef} hidden />

      <div className="flex-shrink-0">
        <TopBar
          title={lesson?.keypoint_title || "Classoni"}
          uploader="By You"
          points={12}
          onProfileTap={() => navigate("profile")}
          onRewardsTap={() => navigate("rewards")}
          onPremiumTap={() => navigate("premiumPlans")}
        />
      </div>

      {/* CAPTION */}
      <div className="flex-shrink-0 px-4 py-2 min-h-[64px] flex items-center justify-center">
        {blockWords.length > 0 ? (
          <p className="text-center text-classoni-navy text-base leading-relaxed">
            {blockWords.map((w, i) => {
              const globalIdx = blockStart + i;
              const isActive = globalIdx === currentWordIndex;
              return (
                <span
                  key={globalIdx}
                  className={
                    isActive
                      ? "bg-classoni-yellow text-classoni-navy rounded-md px-1 transition-all duration-100"
                      : "transition-all duration-100"
                  }
                >
                  {w.text}{" "}
                </span>
              );
            })}
          </p>
        ) : (
          <p className="text-center text-classoni-navy/60 text-sm">
            {currentSection?.narration_text || "Loading..."}
          </p>
        )}
      </div>

      {/* VISUAL CANVAS */}
      <div className="flex-1 min-h-0 mx-4 mb-2 relative">
        <div
          onClick={handleCanvasClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="h-full w-full overflow-y-auto rounded-2xl bg-white/60 relative cursor-pointer flex items-center justify-center"
        >
          {currentVisual ? (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: currentVisual.svg_code }}
            />
          ) : (
            <div className="text-classoni-navy/40 text-xs">—</div>
          )}

          <AnimatePresence>
            {showPausedOverlay && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-2xl pointer-events-none"
              >
                <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play size={28} className="text-classoni-navy ml-1" fill="currentColor" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setSpeedMenuOpen((o) => !o);
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
                    setPlaybackSpeed(s);
                    setSpeedMenuOpen(false);
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
          >
            <Share2 size={18} className="text-classoni-navy" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFeedbackOpen(true);
            }}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center"
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
          <button
            onClick={(e) => {
              e.stopPropagation();
              seekBy(-5);
            }}
            className="w-7 h-7 flex items-center justify-center text-classoni-navy/70"
          >
            <RotateCcw size={16} />
          </button>
          <span className="text-[10px] text-classoni-navy/60 font-medium w-9 text-right">
            {formatTime(audioCurrent)}
          </span>
          <div
            className="flex-1 relative h-3 flex items-center cursor-pointer"
            onClick={(e) => {
              const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
              const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
              seekToFraction(frac);
            }}
          >
            <div className="w-full h-1 bg-classoni-navy/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-classoni-yellow transition-all duration-100"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-classoni-yellow border-2 border-white shadow-md"
              style={{ left: `calc(${progress * 100}% - 6px)` }}
            />
          </div>
          <span className="text-[10px] text-classoni-navy/60 font-medium w-9">
            {formatTime(audioDuration)}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              seekBy(5);
            }}
            className="w-7 h-7 flex items-center justify-center text-classoni-navy/70"
          >
            <RotateCw size={16} />
          </button>
        </div>
      </div>

      {/* PILL BUTTONS */}
      <div className="flex-shrink-0 px-4 pb-2 flex gap-2">
        <button onClick={() => openSheet("apply")} className="flex-1 bg-classoni-blue text-white rounded-full py-3 font-semibold text-sm">
          Apply
        </button>
        <button onClick={() => openSheet("explain")} className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm">
          Explain
        </button>
        <button onClick={() => openSheet("quiz")} className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm">
          Quiz
        </button>
        <button onClick={() => openSheet("posts")} className="flex-1 bg-white border border-classoni-blue text-classoni-blue rounded-full py-3 font-semibold text-sm">
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
              >
                <X size={20} className="text-classoni-navy" />
              </button>

              {activeSheet === "apply" && lesson && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Apply</h3>
                  <p className="text-classoni-navy text-sm leading-relaxed mb-4">
                    {lesson.apply.scenario}
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
                        {lesson.apply.solution}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSheet === "explain" && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Explain</h3>
                  <p className="text-classoni-navy text-sm leading-relaxed mb-4">
                    Explain this concept in your own words, score 8/10 or more to unlock teacher mode and more rewards...
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

              {activeSheet === "quiz" && lesson && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Question 1 of 1</h3>
                  <p className="text-classoni-navy text-sm font-semibold mb-4">
                    {lesson.quiz.question}
                  </p>
                  {lesson.quiz.options && (
                    <div className="space-y-2">
                      {lesson.quiz.options.map((opt, i) => {
                        const letters = ["A", "B", "C", "D"];
                        const isSelected = quizAnswer === i;
                        const isCorrect = letters[i] === lesson.quiz.correct_answer;
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
                  )}
                  {quizAnswer !== null && (
                    <div className="mt-4 bg-classoni-lavender rounded-xl p-3">
                      <p className="text-classoni-navy text-xs leading-relaxed">
                        {lesson.quiz.explanation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeSheet === "posts" && (
                <div className="pt-6">
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">Class Contributions</h3>
                  <p className="text-classoni-navy text-sm text-center mb-4">
                    No contributions from your class for this concept yet. You can be the first!
                  </p>
                  <div className="bg-classoni-lavender rounded-2xl p-4">
                    <p className="text-classoni-navy font-bold text-sm mb-2">Explained by Amina K.</p>
                    <p className="text-classoni-navy text-sm mb-4 leading-relaxed">
                      The myosin heads grab the actin and pull it inward, like rowing a boat. When ATP comes in, they let go and reset.
                    </p>
                    <div className="flex gap-4 items-center justify-between">
                      <button
                        onClick={() => setRatingVote("helpful")}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                        <span className={ratingVote === "helpful" ? "text-classoni-blue font-semibold" : "text-classoni-navy"}>
                          Helpful
                        </span>
                        <span className="text-classoni-navy/40">· {ratingVote === "helpful" ? 4 : 3}</span>
                      </button>
                      <button
                        onClick={() => setRatingVote("more")}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                        <span className={ratingVote === "more" ? "text-green-700 font-semibold" : "text-classoni-navy"}>
                          More helpful
                        </span>
                        <span className="text-classoni-navy/40">· {ratingVote === "more" ? 6 : 5}</span>
                      </button>
                      <button
                        onClick={() => setRatingVote("very")}
                        className="flex items-center gap-1.5 text-xs font-medium"
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                        <span className={ratingVote === "very" ? "text-purple-700 font-semibold" : "text-classoni-navy"}>
                          Very helpful
                        </span>
                        <span className="text-classoni-navy/40">· {ratingVote === "very" ? 3 : 2}</span>
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
