import { motion } from "framer-motion";
import RavenMascot from "../components/RavenMascot";

interface Props {
  setScreen: (s: string) => void;
}

export default function Welcome({ setScreen }: Props) {
  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6">
      <div className="flex-1 flex flex-col items-center justify-center pt-8">
        <RavenMascot size={150} animated={true} />
        
        <h1 className="text-white font-bold text-3xl text-center mt-6 leading-tight">
          You don't truly know it until you can explain it.
        </h1>
        
        <p className="text-classoni-yellow text-base text-center mt-3 font-semibold">
          Pass your course and graduate with less stress.
        </p>

        <div className="mt-8 space-y-4 w-full">
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="text-xl">❌</span>
            <p>Stop passively reading PDFs and watching YouTube.</p>
          </div>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="text-xl">🧠</span>
            <p>Turn your notes into a game of explaining.</p>
          </div>
          <div className="flex items-center gap-3 text-white/80 text-sm">
            <span className="text-xl">🏆</span>
            <p>Score 8/10 to unlock Teacher Mode and teach your classmates.</p>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 pb-8">
        <button
          onClick={() => setScreen("input")}
          className="w-full bg-classoni-yellow text-classoni-navy rounded-full py-4 font-bold text-lg shadow-lg"
        >
          Start Learning
        </button>
        <p className="text-white/50 text-xs text-center mt-4">
          First 10 students in your class study free.
        </p>
      </div>
    </div>
  );
      }
