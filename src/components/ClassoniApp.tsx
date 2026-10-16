import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Screen } from "@/lib/classoni";
import Welcome from "@/screens/Welcome";
import Input from "@/screens/Input";
import Source from "@/screens/Source";
import Loading from "@/screens/Loading";
import Player from "@/screens/Player";
import PremiumPlans from "@/screens/PremiumPlans";
import Paywall from "@/screens/Paywall";
import Rewards from "@/screens/Rewards";
import Profile from "@/screens/Profile";
import ClassGate from "@/screens/ClassGate";
import Search from "@/screens/Search";
import Contributions from "@/screens/Contributions";

export default function ClassoniApp() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("welcome");
  const [lessonRequest, setLessonRequest] = useState({ subject: "", topic: "" });
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [initialProgress, setInitialProgress] = useState<number>(0);
  const [isHydrated, setIsHydrated] = useState(false);

  // Lesson + first audio, fetched on the Loading screen and passed to Player
  const [lessonData, setLessonData] = useState<any>(null);
  const [firstAudio, setFirstAudio] = useState<any>(null);

  const reduced = useReducedMotion();

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const hasVisited = localStorage.getItem("classoni_hasVisited");
      const saved = parseFloat(localStorage.getItem("classoni_lastProgress") || "0");
      if (hasVisited === "true") {
        setInitialProgress(Number.isNaN(saved) ? 0 : saved);
        setCurrentScreen("player");
      }
    } catch {
      // ignore
    }
    setIsHydrated(true);
  }, []);

  const navigate = useCallback((screen: Screen) => {
    if (typeof window !== "undefined") {
      try {
        if (screen === "loading") {
          localStorage.setItem("classoni_lastProgress", "0");
          setInitialProgress(0);
          // Clear any prior lesson so the Loading screen fetches fresh
          setLessonData(null);
          setFirstAudio(null);
        }
        if (screen === "player") {
          localStorage.setItem("classoni_hasVisited", "true");
        }
      } catch {
        // ignore
      }
    }
    setCurrentScreen(screen);
  }, []);

  const handleLessonReady = useCallback(
    (lesson: any, audio: any) => {
      setLessonData(lesson);
      setFirstAudio(audio);
      navigate("player");
    },
    [navigate],
  );

  const props = { navigate };

  const screens: Record<Screen, React.ReactNode> = {
    welcome: <Welcome {...props} />,
    input: (
      <Input
        {...props}
        onSubject={(subject: string, topic: string) => setLessonRequest({ subject, topic })}
      />
    ),
    source: <Source {...props} onFile={setNotesFile} />,
    loading: (
      <Loading
        {...props}
        topic={lessonRequest.topic || "Sliding Filament Theory"}
        onReady={handleLessonReady}
      />
    ),
    player: (
      <Player
        {...props}
        initialProgress={initialProgress}
        lesson={lessonData}
        firstAudio={firstAudio}
      />
    ),
    premiumPlans: <PremiumPlans {...props} />,
    paywall: <Paywall {...props} />,
    rewards: <Rewards {...props} />,
    profile: <Profile {...props} />,
    classGate: <ClassGate {...props} />,
    search: <Search {...props} />,
    contributions: <Contributions {...props} />,
  };

  if (!isHydrated) {
    return (
      <div className="mx-auto h-screen h-dvh w-full max-w-lg overflow-hidden bg-classoni-navy" />
    );
  }

  return (
    <div
      className="mx-auto h-screen h-dvh w-full max-w-lg overflow-hidden"
      data-course={lessonRequest.subject}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: reduced ? 1 : 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: reduced ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="h-full w-full"
        >
          {screens[currentScreen]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
    }
