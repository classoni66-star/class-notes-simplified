import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import RavenMascot from "../components/RavenMascot";

interface Props {
  navigate?: (s: string) => void;
  setScreen?: (s: string) => void;
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

export default function Loading({ navigate, setScreen }: Props) {
  const [visible, setVisible] = useState(0);

  // Use whichever navigation prop the parent supplies
  const go = navigate || setScreen || (() => {});

  useEffect(() => {
    const timers = STEPS.map((_, i) =>
      setTimeout(() => setVisible(i + 1), (i + 1) * 900),
    );
    const done = setTimeout(
      () => go("player"),
      STEPS.length * 900 + 1500,
    );
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [go]);

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-4">
      <h1 className="text-white font-bold text-xl text-center">
        Building your lesson
      </h1>
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
            animate={{
              opacity: visible > i ? 1 : 0.25,
              x: 0,
            }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-between text-white text-sm"
          >
            <span>{step}</span>
            {visible > i && (
              <span className="text-classoni-yellow">✓</span>
            )}
          </motion.li>
        ))}
      </ul>
    </div>
  );
        }
