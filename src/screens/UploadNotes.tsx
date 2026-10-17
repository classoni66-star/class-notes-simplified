import { useState } from "react";

interface Props {
  setScreen: (s: string) => void;
  onNotesSet: (notes: string) => void;
}

export default function UploadNotes({ setScreen, onNotesSet }: Props) {
  const [notes, setNotes] = useState("");

  const handleGenerate = () => {
    if (!notes.trim()) {
      alert("Please paste some notes first.");
      return;
    }
    onNotesSet(notes);
    setScreen("loading");
  };

  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-10">
      <h2 className="text-white text-center text-xl font-bold mb-4">
        Paste your notes
      </h2>
      <p className="text-white/60 text-sm text-center mb-6">
        For this test, copy the text from your PDF or textbook and paste it below. The AI will extract keypoints from it.
      </p>

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Paste your notes here..."
        className="flex-1 w-full bg-white/10 border border-white/20 text-white placeholder-white/30 rounded-xl p-4 focus:outline-none focus:border-classoni-yellow resize-none"
      />

      <div className="flex-shrink-0 py-6 space-y-3">
        <button
          onClick={handleGenerate}
          className="w-full bg-classoni-yellow text-classoni-navy rounded-full py-4 font-bold text-lg shadow-lg"
        >
          Generate Lesson
        </button>
        <button
          onClick={() => setScreen("source")}
          className="w-full bg-transparent text-white/50 text-sm font-semibold py-2"
        >
          ← Back
        </button>
      </div>
    </div>
  );
}
