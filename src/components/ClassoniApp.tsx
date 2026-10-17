import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Welcome from "../screens/Welcome";
import Input from "../screens/Input";
import Source from "../screens/Source";
import UploadNotes from "../screens/UploadNotes"; // 👈 Import new screen
import Loading from "../screens/Loading";
import Player from "../screens/Player";
// ... (keep all your other imports)

export default function ClassoniApp() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [lessonData, setLessonData] = useState<any>(null);
  const [topic, setTopic] = useState("Sliding Filament Theory");
  const [customNotes, setCustomNotes] = useState(""); // 👈 Add state for notes
  const [isHydrated, setIsHydrated] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => { setIsHydrated(true); }, []);

  const navigate = useCallback((screen: string) => {
    setCurrentScreen(screen);
  }, []);

  const handleLessonReady = useCallback((lesson: any) => {
    setLessonData(lesson);
    navigate("player");
  }, [navigate]);

  const screens: Record<string, React.ReactNode> = {
    welcome: <Welcome setScreen={navigate} />,
    input: <Input setScreen={navigate} onTopicSet={setTopic} />,
    source: <Source setScreen={navigate} />,
    uploadNotes: <UploadNotes setScreen={navigate} onNotesSet={setCustomNotes} />, // 👈 Register
    loading: <Loading navigate={navigate} topic={topic} customNotes={customNotes} onReady={handleLessonReady} />, // 👈 Pass notes to Loading
    player: <Player navigate={navigate} lesson={lessonData} />,
    // ... (keep the rest of your screens)
  };

  if (!isHydrated) return <div className="h-screen bg-classoni-navy" />;

  return (
    <div className="mx-auto h-[100dvh] w-full max-w-lg overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduced ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {screens[currentScreen] || <div>Screen not found</div>}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
