import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, ThumbsUp, X, Play, RotateCcw, RotateCw } from "lucide-react";
import TopBar from "../components/TopBar";
import BottomNav from "../components/BottomNav";

interface PlayerProps {
  navigate: (screen: string) => void;
  initialProgress?: number;
  lesson?: Lesson | null;
  firstAudio?: AudioData | null;
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

interface AudioData {
  audio: string;
  words: { id: number; start: number; end: number; text: string }[];
}

const SPEED_OPTIONS = [0.75, 0.85, 1.0, 1.25, 1.5];
const CAPTION_WORDS_PER_BLOCK = 20;

const FALLBACK_LESSON: Lesson = {
  keypoint_title: "Sliding Filament Theory",
  sections: [
    {
      id: "curiosity_question",
      narration_text:
        "Why does a muscle shorten without any of its protein threads actually getting shorter? Let's find out why!",
      visuals: [],
    },
    {
      id: "keypoint_identity",
      narration_text: "Keypoint: Sliding Filament Theory",
      visuals: [],
    },
    {
      id: "emotional_hook",
      narration_text:
        "This is the concept that lets you lift a hand to wave. It powers every step you take. It is how your heart pumps blood without you thinking about it.",
      visuals: [],
    },
    {
      id: "walkthrough",
      narration_text:
        "The sarcomere is the basic unit of muscle contraction. It contains thin actin filaments and thick myosin filaments. When a nerve signal arrives, calcium is released and exposes binding sites on the actin. The myosin heads attach and pull, then detach, re-cock, and attach again. Each cycle pulls the actin filaments closer together, shortening the sarcomere. The muscle does not squeeze itself. The filaments just slide past each other.",
      visuals: [],
    },
    {
      id: "mental_anchor",
      narration_text:
        "Here is a way to remember the four pillars of muscle contraction: MAPS. Myosin, Actin, Power stroke, Sarcomere.",
      visuals: [],
    },
    {
      id: "common_confusion",
      narration_text:
        "One thing to watch out for is thinking the filaments themselves shorten. The actin and myosin filaments do not change length; they slide past each other, which shortens the sarcomere.",
      visuals: [],
    },
  ],
  apply: {
    scenario:
      "A physiotherapist at Mulago Hospital in Kampala is explaining to a post-surgery patient why muscles stiffen after prolonged immobility. Since you have studied the sliding filament theory, help the physiotherapist describe the mechanism clearly to the patient.",
    skeleton: null,
    solution:
      "The physiotherapist needs to explain that prolonged immobility keeps the myosin heads stuck in their bound state, preventing the filaments from sliding back to their resting length. Because ATP is required to detach the myosin heads, muscle relaxation also requires energy.",
  },
  quiz: {
    type: "mcq",
    question:
      "Which of the following best describes the mechanism by which a skeletal muscle fiber shortens during contraction?",
    options: [
      "The actin and myosin filaments both shorten in length.",
      "The myosin filaments slide past the actin filaments, pulling the Z-lines closer together.",
      "The sarcomere membrane folds inward, reducing its overall length.",
      "The actin filaments dissolve and reassemble in a more compact form.",
    ],
    correct_answer: "B",
    explanation:
      "During contraction, the actin and myosin filaments do not change length; they slide past each other, which shortens the sarcomere.",
  },
};

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
      const w = words[i + j].text
        .toLowerCase()
        .replace(/[^\w\s]/g, "");
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
  lesson: lessonProp = null,
  firstAudio = null,
}: PlayerProps) {
  const [lesson, setLesson] = useState<Lesson | null>(lessonProp);
  const [loadingLesson, setLoadingLesson] = useState(!lessonProp);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentAudio, setCurrentAudio] = useState<AudioData | null>(firstAudio);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [activeVisualIndex, setActiveVisualIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPausedOverlay, setShowPausedOverlay] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [speedMenuOpen, setSpeedMenuOpen] = useState(false);
  const [progress, setProgress] = useState(initialProgress);
  const [audioCurrent, setAudioCurrent] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
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
  const progressRef = useRef(progress);
  const visualTimersRef = useRef<number[]>([]);
  const overlayTimerRef = useRef<number | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; startedAt: number } | null>(null);
  const didSwipeRef = useRef(false);

  // Fetch the lesson on mount (skip if passed in)
  useEffect(() => {
    if (lessonProp) {
      setLoadingLesson(false);
      return;
    }
    let mounted = true;
    async function loadLesson() {
      try {
        const topic = encodeURIComponent("Sliding Filament Theory");
        const res = await fetch(
          "https://classoni.classoni66.workers.dev/api/generate-lesson?topic=" + topic
        );
        const data = await res.json();
        if (mounted && data && data.sections) setLesson(data);
        else if (mounted) setLesson(FALLBACK_LESSON);
      } catch {
        if (mounted) setLesson(FALLBACK_LESSON);
      } finally {
        if (mounted) setLoadingLesson(false);
      }
    }
    loadLesson();
    return () => {
      mounted = false;
    };
  }, [lessonProp]);

  // Fetch audio for the current section (skip section 0 if firstAudio passed in)
  useEffect(() => {
    if (!lesson) return;

    if (currentSectionIndex === 0 && firstAudio) {
      setCurrentAudio(firstAudio);
      setLoadingAudio(false);
      return;
    }

    const section = lesson.sections[currentSectionIndex];
    if (!section) return;

    let mounted = true;
    async function loadAudio() {
      setLoadingAudio(true);
      setCurrentAudio(null);
      setActiveVisualIndex(null);
      try {
        const res = await fetch(
          "https://classoni.classoni66.workers.dev/api/generate-tts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: section.narration_text }),
          }
        );
        const data = await res.json();
        if (mounted && data.audio) setCurrentAudio(data);
      } catch {
        // silent fail
      } finally {
        if (mounted) setLoadingAudio(false);
      }
    }
    loadAudio();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, currentSectionIndex, firstAudio]);

  // Play audio + schedule visuals
  useEffect(() => {
    if (!currentAudio || !lesson) return;
    const section = lesson.sections[currentSectionIndex];
    if (!section) return;

    visualTimersRef.current.forEach((t) => window.clearTimeout(t));
    visualTimersRef.current = [];

    const audio = audioRef.current;
    if (!audio) return;

    const timeline: { at: number; visualIndex: number }[] = [];
    const fadeOuts: { at: number; visualIndex: number }[] = [];

    section.visuals.forEach((v, i) => {
      const startMs = resolveTriggerPhrase(v.trigger_phrase, currentAudio.words);
      if (startMs !== null) timeline.push({ at: startMs * 1000, visualIndex: i });
      if (v.fade_out_trigger) {
        const endMs = resolveTriggerPhrase(v.fade_out_trigger, currentAudio.words);
        if (endMs !== null) fadeOuts.push({ at: endMs * 1000, visualIndex: i });
      }
    });

    timeline.sort((a, b) => a.at - b.at);
    fadeOuts.sort((a, b) => a.at - b.at);

    if (timeline.length === 0 && section.visuals.length > 0) setActiveVisualIndex(0);

    timeline.forEach((entry) => {
      const t = window.setTimeout(() => {
        setActiveVisualIndex(entry.visualIndex);
      }, entry.at);
      visualTimersRef.current.push(t);
    });

    fadeOuts.forEach((entry) => {
      const t = window.setTimeout(() => {
        setActiveVisualIndex((current) =>
          current === entry.visualIndex ? null : current
        );
      }, entry.at);
      visualTimersRef.current.push(t);
    });

    audio.src = currentAudio.audio;
    audio.playbackRate = playbackSpeed;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));

    return () => {
      visualTimersRef.current.forEach((t) => window.clearTimeout(t));
      visualTimersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentAudio, lesson]);

  // Playback speed
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = playbackSpeed;
  }, [playbackSpeed]);

  // Track progress + advance sections
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      setAudioCurrent(audio.currentTime);
      if (audio.duration && isFinite(audio.duration)) {
        setAudioDuration(audio.duration);
        setProgress(audio.currentTime / audio.duration);
      }
    };
    const onEnded = () => {
      if (lesson && currentSectionIndex < lesson.sections.length - 1) {
        setCurrentSectionIndex((i) => i + 1);
      } else {
        setIsPlaying(false);
      }
    };
    const onLoaded = () => {
      if (audio.duration && isFinite(audio.duration)) setAudioDuration(audio.duration);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("loadedmetadata", onLoaded);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [lesson, currentSectionIndex]);

  // Persist progress
  useEffect(() => {
    progressRef.current = progress;
    try {
      localStorage.setItem("classoni_lastProgress", progress.toFixed(4));
    } catch {
      // ignore
    }
  }, [progress]);

  // Auto-hide the paused overlay after 1.5s so the student can study the visual
  useEffect(() => {
    if (overlayTimerRef.current) window.clearTimeout(overlayTimerRef.current);
    if (!isPlaying && !loadingAudio && currentAudio) {
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
  }, [isPlaying, loadingAudio, currentAudio]);

  const togglePlay = () => {
    setSpeedMenuOpen(false);
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
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

  const seekToFraction = (fraction: number) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const newTime = fraction * audio.duration;
    audio.currentTime = newTime;
    setAudioCurrent(newTime);
    setProgress(fraction);
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
      } else {
        throw new Error("no share");
      }
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

  // Swipe gestures on the visual canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, startedAt: Date.now() };
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
      // Right swipe = forward 5s, left swipe = back 5s
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

  const currentSection = lesson?.sections[currentSectionIndex];
  const currentVisual =
    currentSection && activeVisualIndex !== null
      ? currentSection.visuals[activeVisualIndex]
      : null;

  // Compute the caption block (20 words at a time) and the active word index
  const wordTimings = currentAudio?.words || [];
  const totalWords = wordTimings.length;
  const currentWordIndex = (() => {
    if (!totalWords) return -1;
    for (let i = 0; i < totalWords; i++) {
      const w = wordTimings[i];
      if (audioCurrent >= w.start && audioCurrent < w.end) return i;
    }
    // If past the last word, stay on the last
    if (audioCurrent >= wordTimings[totalWords - 1]?.end) return totalWords - 1;
    return -1;
  })();

  const blockStartIndex =
    currentWordIndex >= 0
      ? Math.floor(currentWordIndex / CAPTION_WORDS_PER_BLOCK) * CAPTION_WORDS_PER_BLOCK
      : 0;
  const blockEndIndex = Math.min(blockStartIndex + CAPTION_WORDS_PER_BLOCK, totalWords);
  const currentBlockWords = wordTimings.slice(blockStartIndex, blockEndIndex);

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
          title={lesson?.keypoint_title || "Loading..."}
          uploader="By You"
          points={12}
          onProfileTap={() => navigate("profile")}
          onRewardsTap={() => navigate("rewards")}
          onPremiumTap={() => navigate("premiumPlans")}
        />
      </div>

      {/* CAPTION — one 20-word block at a time with word-level highlight */}
      <div className="flex-shrink-0 px-4 py-2 min-h-[64px] flex items-center justify-center">
        {loadingLesson ? (
          <p className="text-center text-classoni-navy/60 text-sm">
            Generating your lesson...
          </p>
        ) : loadingAudio ? (
          <p className="text-center text-classoni-navy/60 text-sm">
            Preparing narrator...
          </p>
        ) : currentBlockWords.length > 0 ? (
          <p className="text-center text-classoni-navy text-base leading-relaxed">
            {currentBlockWords.map((w, i) => {
              const globalIndex = blockStartIndex + i;
              const isActive = globalIndex === currentWordIndex;
              return (
                <span
                  key={globalIndex}
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
          <p className="text-center text-classoni-navy text-base leading-relaxed">
            {currentSection?.narration_text || ""}
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
          {loadingAudio && (
            <div className="text-classoni-navy/60 text-xs">
              Generating narrator...
            </div>
          )}

          {!loadingAudio && currentVisual && (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              dangerouslySetInnerHTML={{ __html: currentVisual.svg_code }}
            />
          )}

          {!loadingAudio && !currentVisual && currentSection && (
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
                  <Play
                    size={28}
                    className="text-classoni-navy ml-1"
                    fill="currentColor"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Speed pill */}
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

      {/* PROGRESS BAR + SEEK BUTTONS */}
      <div className="flex-shrink-0 px-4 pt-1 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              seekBy(-5);
            }}
            className="w-7 h-7 flex items-center justify-center text-classoni-navy/70"
            aria-label="Back 5 seconds"
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
            {/* Yellow draggable dot */}
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-classoni-yellow border-2 border-white shadow-md transition-all duration-100"
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
            aria-label="Forward 5 seconds"
          >
            <RotateCw size={16} />
          </button>
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
                    Explain this concept in your own words, score 8/10 or more to unlock
                    teacher mode and more rewards...
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
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">
                    Question 1 of 1
                  </h3>
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
                  <h3 className="text-classoni-navy font-bold text-lg mb-3">
                    Class Contributions
                  </h3>
                  <p className="text-classoni-navy text-sm text-center mb-4">
                    No contributions from your class for this concept yet. You can be the
                    first!
                  </p>
                  <div className="bg-classoni-lavender rounded-2xl p-4">
                    <p className="text-classoni-navy font-bold text-sm mb-2">
                      Explained by Amina K.
                    </p>
                    <p className="text-classoni-navy text-sm mb-4 leading-relaxed">
                      The myosin heads grab the actin and pull it inward, like rowing a boat.
                      When ATP comes in, they let go and reset.
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
