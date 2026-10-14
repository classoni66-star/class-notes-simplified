import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share2, ThumbsUp, X, Mic, FileText } from "lucide-react";
import TopBar from "@/components/TopBar";
import BottomNav from "@/components/BottomNav";
import ContributionCard from "@/components/ContributionCard";
import { Button, Notice } from "@/components/ScreenUI";
import { quizCorrect, type Navigate, type Sheet } from "@/lib/classoni";

const words = "During muscle contraction, the myosin heads pull on actin filaments, causing them to slide inward.".split(" ");
const options = [
  "The actin and myosin filaments both shorten in length.",
  "The myosin filaments slide past the actin filaments, pulling the Z-lines closer together.",
  "The sarcomere membrane folds inward, reducing its overall length.",
  "The actin filaments dissolve and reassemble in a more compact form.",
];
const explanation = "During contraction, the actin and myosin filaments do not change length; they slide past each other, which shortens the sarcomere.";

export default function Player({ navigate }: { navigate: Navigate }) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [applySolved, setApplySolved] = useState(false);
  const [explainText, setExplainText] = useState("");
  const [explainSubmitted, setExplainSubmitted] = useState(false);
  const [audioNotice, setAudioNotice] = useState(false);
  const [quizMode, setQuizMode] = useState<"mcq" | "typed">("mcq");
  const [answer, setAnswer] = useState<string | null>(null);
  const [typed, setTyped] = useState("");
  const [typedSubmitted, setTypedSubmitted] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(null);
  const [reason, setReason] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [shareNotice, setShareNotice] = useState("");

  useEffect(() => {
    if (isSheetOpen || feedbackOpen) return;
    const timer = setInterval(() => setHighlightedIndex(i => (i + 1) % words.length), 400);
    return () => clearInterval(timer);
  }, [isSheetOpen, feedbackOpen]);
  useEffect(() => {
    if (!shareNotice) return;
    const timer = setTimeout(() => setShareNotice(""), 2000);
    return () => clearTimeout(timer);
  }, [shareNotice]);

  function pauseLesson() { console.log("[Player] Lesson paused"); }
  function resumeLesson() { console.log("[Player] Lesson resumed from previous position"); }
  function closeSheet() {
    setSheet(null); setIsSheetOpen(false); resumeLesson();
  }
  async function share() {
    try {
      if (!navigator.share) throw new Error("Share unavailable");
      await navigator.share({ title: "Classoni", text: "Check out this lesson!", url: window.location.href });
    } catch {
      try { await navigator.clipboard.writeText(window.location.href); setShareNotice("Link copied!"); }
      catch { setShareNotice("Could not copy link. Please try again."); }
    }
  }

  return <main className="flex h-screen h-dvh flex-col overflow-hidden bg-classoni-lavender text-classoni-navy">
    <TopBar title="Sliding Filament Theory" uploader="By You" points={12} onProfileTap={() => navigate("profile")} onRewardsTap={() => navigate("rewards")} onPremiumTap={() => navigate("premiumPlans")} />
    <section aria-label="Lesson clip" className="relative flex min-h-0 flex-1 flex-col pt-3">
      <div className="h-24 shrink-0 px-4 text-center text-base leading-relaxed sm:h-20">
        {words.map((word, i) => <span key={i} data-highlighted={i === highlightedIndex} className={`transition-all duration-150 ${i === highlightedIndex ? "rounded-md bg-classoni-yellow px-1 text-classoni-navy" : ""}`}>{word}{" "}</span>)}
      </div>
      <div aria-label="Lesson visual canvas" className="relative mx-4 mb-3 min-h-0 flex-1 rounded-2xl bg-background shadow-sm">
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <Button aria-label="Share lesson" title="Share lesson" variant="outline" size="icon" className="size-9 rounded-full bg-background/70 opacity-80 shadow-md backdrop-blur-sm transition-opacity hover:opacity-100" onClick={share}><Share2 /></Button>
          <Button aria-label="Give feedback" title="Give feedback" variant="outline" size="icon" className="size-9 rounded-full bg-background/70 opacity-80 shadow-md backdrop-blur-sm transition-opacity hover:opacity-100" onClick={() => {setFeedbackOpen(true);setFeedbackSent(false);setFeedback(null);setReason("")}}><ThumbsUp /></Button>
        </div>
      </div>
      {shareNotice && <p role="status" className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-classoni-navy px-4 py-2 text-xs text-on-dark">{shareNotice}</p>}
    </section>
    <div className="grid shrink-0 grid-cols-4 gap-2 px-4 pb-3 pt-1">
      {(["apply", "explain", "quiz", "posts"] as const).map(id => <Button key={id} variant={id === "apply" ? "default" : "lesson"} className="h-11 rounded-full py-3 font-semibold" onClick={() => openSheet(id)}>{id.charAt(0).toUpperCase() + id.slice(1)}</Button>)}
    </div>
    <BottomNav active="courses" onNavigate={tab => { if (tab === "upload") navigate("input"); if (tab === "leaderboard") navigate("classGate"); if (tab === "search") navigate("search"); }} />

    <AnimatePresence>
      {sheet && <div className="fixed inset-0 z-30 flex items-end bg-classoni-navy/50" onClick={closeSheet}>
        <motion.section id={sheet} role="dialog" aria-modal="true" aria-label={sheet === "posts" ? "Class Contributions" : sheet.charAt(0).toUpperCase() + sheet.slice(1)} initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 32, stiffness: 280 }} className="mx-auto flex h-[80dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-background p-5 text-classoni-navy" onClick={e => e.stopPropagation()}>
          <div className="mb-4 flex shrink-0 items-center justify-between"><h2 className="text-xl font-bold">{sheet === "quiz" ? "Question 1 of 1" : sheet === "posts" ? "Class Contributions" : sheet.charAt(0).toUpperCase() + sheet.slice(1)}</h2><Button variant="ghost" size="icon" className="rounded-full" aria-label="Close sheet" title="Close sheet" onClick={closeSheet}><X /></Button></div>
          {sheet === "apply" && <div className="flex min-h-0 flex-1 flex-col gap-4"><p className="text-sm leading-relaxed">A nurse in Mulago Hospital is preparing oral rehydration solution for a cholera outbreak and needs to calculate the exact sodium concentration. The ward has run out of pre-measured sachets, and the nursing staff are unsure of the correct ratio.</p>{applySolved && <div className="rounded-xl bg-secondary p-4"><p className="mb-2 text-xs font-bold text-primary">SOLUTION</p><p className="text-sm leading-relaxed">The nurse needs to recognize that concentration defines how much solute is in a given volume. Multiplying the target concentration (75 mmol/L) by the total volume (5 L) and the molar mass of NaCl (58.44 g/mol) yields approximately 21.9 grams of salt to weigh out. Given the ward's time pressure, pre-measuring sachets during morning rounds removes the measuring step from the staff entirely.</p></div>}<div className="flex-1"/>{!applySolved && <Button className="h-12 w-full rounded-full" onClick={() => setApplySolved(true)}>Solve</Button>}</div>}
          {sheet === "explain" && <div className="flex min-h-0 flex-1 flex-col gap-4"><p className="whitespace-pre-line text-sm leading-relaxed">{"Explain this concept in your own words.\nScore 8/10 to unlock teacher mode.\nEarn more rewards when posted.\nIt's your turn now...."}</p><div className="flex gap-2"><Button size="sm" onClick={() => setAudioNotice(false)}><FileText />Text</Button><Button variant="outline" size="sm" onClick={() => setAudioNotice(true)}><Mic />Audio</Button></div>{audioNotice && <Notice>Audio recording coming soon.</Notice>}<textarea aria-label="Your explanation" placeholder="Type your explanation..." className="h-28 shrink-0 resize-none rounded-xl border border-primary p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary" value={explainText} onChange={e => setExplainText(e.target.value)} />{explainSubmitted ? <><Notice>7/10 — You missed the role of ATP in myosin detachment. Try again.</Notice><Button className="h-11 rounded-full" onClick={() => { setExplainText(""); setExplainSubmitted(false); }}>Try Again</Button></> : <Button className="h-11 rounded-full" disabled={!explainText.trim()} onClick={() => setExplainSubmitted(true)}>Submit</Button>}</div>}
          {sheet === "quiz" && <div className="flex min-h-0 flex-1 flex-col gap-2"><div className="mb-1 flex gap-2">{(["mcq", "typed"] as const).map(mode => <Button key={mode} size="sm" variant={quizMode === mode ? "default" : "outline"} aria-pressed={quizMode === mode} onClick={() => setQuizMode(mode)}>{mode === "mcq" ? "MCQ" : "Typed"}</Button>)}</div><p className="mb-1 text-sm font-semibold leading-snug">Which of the following best describes the mechanism by which a skeletal muscle fiber shortens during contraction?</p>{quizMode === "mcq" ? options.map((option, i) => {const letter = String.fromCharCode(65 + i);return <Button key={letter} variant="ghost" disabled={answer !== null} className={`h-auto w-full justify-start whitespace-normal rounded-xl p-3 text-left text-xs leading-snug ${answer && letter === "B" ? "bg-success-soft text-success disabled:opacity-100" : answer === letter ? "bg-error-soft text-error disabled:opacity-100" : "bg-secondary"}`} onClick={() => setAnswer(letter)}>{letter}) {option}</Button>}) : <><textarea aria-label="Typed quiz answer" inputMode="text" placeholder="Type your answer..." value={typed} onChange={e => setTyped(e.target.value)} className="h-28 resize-none rounded-xl border border-primary p-3 text-sm"/><Button className="rounded-full" disabled={!typed.trim()} onClick={() => setTypedSubmitted(true)}>Check answer</Button></>}{((quizMode === "mcq" && answer) || (quizMode === "typed" && typedSubmitted)) && <div role="status" className="rounded-xl bg-secondary p-3 text-xs leading-snug"><strong className="mb-1 block">{quizMode === "mcq" ? quizCorrect(answer ?? "") ? "Correct!" : "Not quite — B is correct." : "Compare your answer"}</strong>{explanation}</div>}</div>}
          {sheet === "posts" && <div className="flex min-h-0 flex-1 flex-col gap-4"><p className="text-center text-sm leading-relaxed">No contributions from your class for this concept yet. You can be the first!</p><ContributionCard /><Button variant="lesson" className="mt-auto rounded-full" onClick={() => {closeSheet();navigate("contributions")}}>View class contributions</Button></div>}
        </motion.section>
      </div>}
      {feedbackOpen && <div className="fixed inset-0 z-40 flex items-center justify-center bg-classoni-navy/50 px-6"><motion.section role="dialog" aria-modal="true" aria-label="Lesson feedback" initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .95 }} className="relative w-full max-w-sm rounded-2xl bg-background p-5"><Button variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="Close feedback" onClick={() => setFeedbackOpen(false)}><X /></Button>{feedbackSent ? <p role="status" className="pr-5 text-sm leading-relaxed">Thank you! Your feedback has been sent.</p> : <><h2 className="mb-4 pr-6 font-bold">How was this explanation?</h2><div className="flex gap-2"><Button variant={feedback === "like" ? "default" : "outline"} onClick={() => setFeedback("like")}>👍 Like</Button><Button variant={feedback === "dislike" ? "default" : "outline"} onClick={() => setFeedback("dislike")}>👎 Dislike</Button></div>{feedback && <><textarea aria-label="Feedback reason" placeholder={feedback === "like" ? "Tell us more" : "Please tell us what went wrong"} value={reason} onChange={e => setReason(e.target.value)} className="mt-4 h-24 w-full resize-none rounded-xl border border-border p-3 text-sm"/><Button className="mt-3 w-full rounded-full" onClick={() => {console.log(feedback + ": " + reason);setFeedbackSent(true)}}>Submit</Button></>}</>}</motion.section></div>}
    </AnimatePresence>
  </main>;
}
