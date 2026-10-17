import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import RavenMascot from "../components/RavenMascot";

interface Props {
  navigate?: (s: string) => void;
  setScreen?: (s: string) => void;
  topic?: string;
  onReady?: (lesson: any) => void; // Notice: No audio passed here anymore
}

const STEPS = [
  "🔍 Analyzing your notes...",
  "🧠 Extracting keypoints...",
  "🏗️ Structuring your lesson...",
  "🎯 Creating a real-world question first...",
  "🎨 Searching for the best visuals...",
  "🛡️ Checking for accuracy...",
  "🚀 BOOM... your lesson is ready!",
];

export default function Loading({ navigate, setScreen, topic, onReady }: Props) {
  const [visible, setVisible] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");
  const go = navigate || setScreen || (() => {});
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    let cancelled = false;

    async function run() {
      try {
        let stepIdx = 1;
        const stepTimer = setInterval(() => {
          stepIdx = Math.min(stepIdx + 1, 5);
          if (!cancelled) setVisible(stepIdx);
        }, 2000);

        const lessonUrl = "https://classoni.classoni66.workers.dev/api/generate-lesson?topic=" + encodeURIComponent(topic || "Sliding Filament Theory");
        const lessonRes = await fetch(lessonUrl);
        const lesson = await lessonRes.json();
        clearInterval(stepTimer);
        
        if (cancelled) return;

        if (!lessonRes.ok || lesson.error) throw new Error(lesson.error || "Unknown server error");
        if (!lesson.sections || !lesson.sections.length) {
          const dump = JSON.stringify(lesson).slice(0, 200);
          throw new Error("Missing 'sections'. LLM returned: " + dump);
        }

        setVisible(7);
        setTimeout(() => {
          if (onReady) onReady(lesson);
          else go("player");
        }, 800);
        
      } catch (err) {
        if (cancelled) return;
        setErrorMsg(String(err));
      }
    }

    run();
    return () => { cancelled = true; };
  }, [topic]);

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-4">
      <h1 className="text-white font-bold text-xl text-center">Building your lesson</h1>
      <div className="flex justify-center mt-4"><RavenMascot size={100} animated={true} /></div>
      
      <ul className="mt-6 space-y-3 overflow-y-auto flex-1 pb-4">
        {STEPS.map((step, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: visible > i ? 1 : 0.25, x: 0 }} className="flex items-center justify-between text-white text-sm">
            <span>{step}</span>
            {visible > i && <span className="text-classoni-yellow">✓</span>}
          </motion.li>
        ))}
      </ul>

      {errorMsg && (
        <div className="flex-shrink-0 mb-4 bg-red-500/20 border border-red-500/40 rounded-xl p-3">
          <p className="text-red-200/70 text-[10px] break-all">{errorMsg}</p>
          <button onClick={() => window.location.reload()} className="mt-3 w-full bg-white text-classoni-navy rounded-full py-2 text-xs font-bold">Try again</button>
        </div>
      )}
    </div>
  );
      }
