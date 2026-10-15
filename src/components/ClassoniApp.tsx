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
  const reduced = useReducedMotion();

  // On mount: detect a returning user and resume their last lesson
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
      // localStorage unavailable — continue as a fresh user
    }
    setIsHydrated(true);
  }, []);

  const navigate = useCallback((screen: Screen) => {
    if (typeof window !== "undefined") {
      try {
        if (screen === "loading") {
          // A new generation is starting → reset saved progress
          localStorage.setItem("classoni_lastProgress", "0");
          setInitialProgress(0);
        }
        if (screen === "player") {
          // Reached the player → remember this user for next time
          localStorage.setItem("classoni_hasVisited", "true");
        }
      } catch {
        // Silently ignore storage failures
      }
    }
    setCurrentScreen(screen);
  }, []);

  const props = { navigate };

  const screens: Record<Screen, React.ReactNode> = {
    welcome: <Welcome {...props} />,
    input: (
      <Input
        {...props}
        onSubject={(subject, topic) => setLessonRequest({ subject, topic })}
      />
    ),
    source: <Source {...props} onFile={setNotesFile} />,
    loading: <Loading {...props} />,
    player: <Player {...props} initialProgress={initialProgress} />,
    premiumPlans: <PremiumPlans {...props} />,
    paywall: <Paywall {...props} />,
    rewards: <Rewards {...props} />,
    profile: <Profile {...props} />,
    classGate: <ClassGate {...props} />,
    search: <Search {...props} />,
    contributions: <Contributions {...props} />,
  };

  // Pre-hydration splash — avoids a flash of the wrong screen
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
