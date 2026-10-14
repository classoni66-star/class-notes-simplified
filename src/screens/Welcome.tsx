import RavenMascot from "../components/RavenMascot";

interface Props {
  setScreen: (s: string) => void;
}

export default function Welcome({ setScreen }: Props) {
  return (
    <div className="h-[100dvh] bg-classoni-navy flex flex-col overflow-hidden">
      {/* Mascot area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <RavenMascot size={180} animated={true} />
        <h1 className="text-white font-bold text-3xl mt-6 text-center">
          Hi, I'm Raven.
        </h1>
        <p className="text-white/80 text-base mt-4 text-center leading-relaxed">
          I'm here to help you pass your course and graduate with less stress.
        </p>
      </div>

      {/* Button pinned at bottom */}
      <div className="flex-shrink-0 px-6 pb-6">
        <button
          onClick={() => setScreen("input")}
          className="w-full bg-classoni-yellow text-classoni-navy rounded-full py-4 font-bold text-base"
        >
          Start Learning
        </button>
      </div>
    </div>
  );
}
