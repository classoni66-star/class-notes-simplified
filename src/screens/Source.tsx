interface Props {
  setScreen: (s: string) => void;
}

export default function Source({ setScreen }: Props) {
  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden px-6 pt-12">
      <h2 className="text-white text-center text-xl font-bold mb-8">
        How should we build your lesson?
      </h2>

      <div className="space-y-4 flex-1">
        {/* Primary Option */}
        <button
          onClick={() => setScreen("loading")}
          className="w-full bg-classoni-yellow text-classoni-navy rounded-2xl p-6 text-left shadow-lg active:scale-95 transition-transform"
        >
          <h3 className="font-bold text-lg mb-1">Use standard curriculum notes</h3>
          <p className="text-classoni-navy/70 text-sm">
            Instant, AI-generated, exam-ready.
          </p>
        </button>

        {/* Secondary Option */}
        <button
          onClick={() => setScreen("loading")}
          className="w-full bg-white/10 border border-white/20 text-white rounded-2xl p-6 text-left active:scale-95 transition-transform"
        >
          <h3 className="font-bold text-lg mb-1">Upload my own notes</h3>
          <p className="text-white/60 text-sm">
            PDF, images, or handwritten.
          </p>
        </button>
      </div>

      <div className="flex-shrink-0 pb-8">
        <button
          onClick={() => setScreen("input")}
          className="w-full bg-transparent text-white/50 text-sm font-semibold py-4"
        >
          ← Back
        </button>
      </div>
    </div>
  );
           }
