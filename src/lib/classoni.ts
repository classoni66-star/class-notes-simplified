export type Screen = "welcome" | "input" | "source" | "loading" | "player" | "premiumPlans" | "paywall" | "rewards" | "profile" | "classGate" | "search" | "contributions";
export type Navigate = (screen: Screen) => void;
export type Sheet = "apply" | "explain" | "quiz" | "posts";
export const nextGlow = (sheet: Sheet): Sheet | null => ({ apply: "explain", explain: "quiz", quiz: "posts", posts: null } as const)[sheet];
export const plans = [{name:"Daily Plan",price:1000,period:"day",saving:null},{name:"Weekly Plan",price:4000,period:"week",saving:43},{name:"Monthly Plan",price:10000,period:"month",saving:67}];
export const quizCorrect = (answer: string) => answer === "B";
export const fieldClass = "w-full rounded-xl border border-dark-border bg-dark-surface px-4 py-3 text-on-dark placeholder:text-dark-muted focus:outline-none focus:ring-2 focus:ring-classoni-yellow";
export const darkScreen = "h-screen h-dvh overflow-hidden flex flex-col bg-classoni-navy text-on-dark px-6 py-5";
export const lessonNames = ["Pharmacokinetics — Drug Absorption", "Sliding Filament Theory — Muscle Contraction", "Cardiac Cycle — Systole and Diastole"];
