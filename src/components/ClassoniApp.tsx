import { useCallback, useState } from "react";
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
  const reduced = useReducedMotion();
  const navigate = useCallback((screen: Screen) => setCurrentScreen(screen), []);
  const props = { navigate };
  const screens = {
    welcome: <Welcome {...props} />,
    input: <Input {...props} onSubject={(subject, topic) => setLessonRequest({ subject, topic })} />,
    source: <Source {...props} onFile={setNotesFile} />,
    loading: <Loading {...props} />,
    player: <Player {...props} />,
    premiumPlans: <PremiumPlans {...props} />,
    paywall: <Paywall {...props} />,
    rewards: <Rewards {...props} />,
    profile: <Profile {...props} />,
    classGate: <ClassGate {...props} />,
    search: <Search {...props} />,
    contributions: <Contributions {...props} />,
  };
  // Preserve the supplied inputs for a future lesson-generation integration; the preview uses the specified mock lesson.
  return <div className="mx-auto h-screen h-dvh w-full max-w-lg overflow-hidden" data-course={lessonRequest.subject} data-topic={lessonRequest.topic} data-notes={notesFile?.name}>
    <AnimatePresence mode="wait"><motion.div key={currentScreen} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} exit={{ opacity: reduced ? 1 : 0 }} transition={{ duration: .15 }}>{screens[currentScreen]}</motion.div></AnimatePresence>
  </div>;
}
