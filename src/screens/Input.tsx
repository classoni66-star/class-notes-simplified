import { useState } from "react";
import RavenMascot from "../components/RavenMascot";

interface Props {
  setScreen: (s: string) => void;
  onTopicSet?: (topic: string) => void;
}

export default function Input({ setScreen, onTopicSet }: Props) {
  const [subject, setSubject] = useState("");
  const [topic, setTopic] = useState("");

  const handleStart = () => {
    // Save the topic so the AI knows what to generate later
    if (onTopicSet) {
      onTopicSet(topic || subject || "Sliding Filament Theory");
    }
    // Move to the Source screen
    setScreen("source");
  };

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-10">
      <div className="flex justify-center mb-4">
        <RavenMascot size={100} animated={true} />
      </div>

      <h2 className="text-white text-center text-xl font-bold mb-2">
        Classoni turns your notes into videos you can easily understand and apply.
      </h2>
      <p className="text-white/70 text-center text-sm mb-8">
        What would you like to learn today?
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-white/60 text-xs mb-1 block">Course unit / Subject</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g., Pharmacology"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-classoni-yellow"
          />
        </div>
        <div>
          <label className="text-white/60 text-xs mb-1 block">Topic / Section</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Pharmacokinetics"
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl px-4 py-3 focus:outline-none focus:border-classoni-yellow"
          />
        </div>
      </div>

      <div className="mt-auto pb-8 pt-8">
        <button
          onClick={handleStart}
          className="w-full bg-classoni-yellow text-classoni-navy rounded-full py-4 font-bold text-lg shadow-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
       }
