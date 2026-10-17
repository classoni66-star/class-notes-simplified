import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Welcome from "../screens/Welcome";
import Input from "../screens/Input";
import Source from "../screens/Source";
import Loading from "../screens/Loading";
import Player from "../screens/Player";
import PremiumPlans from "../screens/PremiumPlans";
import Paywall from "../screens/Paywall";
import Rewards from "../screens/Rewards";
import Profile from "../screens/Profile";
import ClassGate from "../screens/ClassGate";
import Search from "../screens/Search";

export default function ClassoniApp() {
  const [currentScreen, setCurrentScreen] = useState("welcome");
  const [lessonData, setLessonData] = useState<any>(null);
  const [topic, setTopic] = useState("Sliding Filament Theory");
  const [isHydrated, setIsHydrated] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

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
    loading: <Loading navigate={navigate} topic={topic} onReady={handleLessonReady} />,
    player: <Player navigate={navigate} lesson={lessonData} />,
    premiumPlans: <PremiumPlans setScreen={navigate} />,
    paywall: <Paywall setScreen={navigate} />,
    rewards: <Rewards setScreen={navigate} navigate={navigate} />,
    profile: <Profile setScreen={navigate} />,
    classGate: <ClassGate setScreen={navigate} />,
    search: <Search setScreen={navigate} />,
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
