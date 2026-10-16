import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RavenMascot from "../components/RavenMascot";

interface Props {
  navigate?: (s: string) => void;
  setScreen?: (s: string) => void;
  topic?: string;
  onReady?: (lesson: any, audio: any) => void;
}

const STEPS = [
  "🔍 Analyzing your notes...",
  "🧠 Extracting keypoints...",
  "🏗️ Structuring your lesson...",
  "🎯 Creating a real-world question first...",
  "🎨 Searching for the best visuals...",
  "🎙️ Recording your narrator...",
  "📝 Adding captions and timing...",
  "🛡️ Checking for accuracy...",
  "🎯 Creating your Apply scenario...",
  "📝 Preparing your exam quiz...",
  "🚀 BOOM... your lesson is ready!",
];

export default function Loading({ navigate, setScreen, topic, onReady }: Props) {
  const [visible, setVisible] = useState(0);
  const [status, setStatus] = useState<"lesson" | "audio" | "done" | "error">("lesson");
  const [errorMsg, setErrorMsg] = useState("");
  const go = navigate || setScreen || (() => {});
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    let mounted = true;

    async function run() {
      try {
        // Step 1 — lesson
        // Show steps 0-2 while the lesson generates
        let stepIdx = 1;
        const stepTimer = setInterval(() => {
          stepIdx = Math.min(stepIdx + 1, 3);
          if (mounted) setVisible(stepIdx);
        }, 3000);

        const lessonUrl =
          "https://classoni.classoni66.workers.dev/api/generate-lesson?topic=" +
          encodeURIComponent(topic || "Sliding Filament Theory");

        const lessonRes = await fetch(lessonUrl);
        const lesson = await lessonRes.json();
        clearInterval(stepTimer);
        if (!mounted) return;

        if (!lesson || !lesson.sections || !lesson.sections.length) {
          throw new Error("Lesson generation returned no sections");
        }

        // Show steps 4-5 while audio generates
        setVisible(5);

        // Step 2 — first audio (curiosity question)
        const firstSection = lesson.sections[0];
        const ttsRes = await fetch(
          "https://classoni.classoni66.workers.dev/api/generate-tts",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: firstSection.narration_text }),
          }
        );
        const firstAudio = await ttsRes.json();
        if (!mounted) return;

        if (!firstAudio || !firstAudio.audio) {
          throw new Error("Audio generation returned no audio");
        }

        // All remaining steps visible, then advance
        setVisible(11);
        setStatus("done");

        setTimeout(() => {
          if (!mounted) return;
          if (onReady) {
            onReady(lesson, firstAudio);
          } else {
            go("player");
          }
        }, 800);
      } catch (err) {
        if (!mounted) return;
        console.error("[Loading] error:", err);
        setErrorMsg(String(err));
        setStatus("error");
      }
    }

    run();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topic]);

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-4">
      <h1 className="text-white font-bold text-xl text-center">Building your lesson</h1>
      <p className="text-white/70 text-xs text-center mt-1">
        A little preparation. A lot of understanding.
      </p>

      <div className="flex justify-center mt-3">
        <RavenMascot size={110} animated={true} />
      </div>

      <ul className="mt-4 space-y-2 overflow-y-auto flex-1 pb-4">
        {STEPS.map((step, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: visible > i ? 1 : 0.25, x: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between text-white text-sm"
          >
            <span>{step}</span>
            {visible > i && <span className="text-classoni-yellow">✓</span>}
          </motion.li>
        ))}
      </ul>

      {status === "error" && (
        <div className="flex-shrink-0 mb-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3">
          <p className="text-red-200 text-xs font-semibold mb-1">
            Something went wrong while building your lesson.
          </p>
          <p className="text-red-200/70 text-[10px] break-all">{errorMsg}</p>
          <button
            onClick={() => {
              startedRef.current = false;
              setVisible(0);
              setStatus("lesson");
              setErrorMsg("");
              // Re-trigger by nudging state
              setVisible(0);
              setTimeout(() => {
                startedRef.current = false;
                window.location.reload();
              }, 100);
            }}
            className="mt-3 w-full bg-white text-classoni-navy rounded-full py-2 text-xs font-bold"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
