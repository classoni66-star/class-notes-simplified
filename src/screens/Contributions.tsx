import { Back } from "@/components/ScreenUI";
import ContributionCard from "@/components/ContributionCard";
import { darkScreen,type Navigate } from "@/lib/classoni";
export default function Contributions({navigate}:{navigate:Navigate}) {return <main className={darkScreen}><Back navigate={navigate}/><h1 className="mb-5 text-center text-lg font-bold">Class Contributions</h1><div className="flex min-h-0 flex-1 flex-col gap-3"><ContributionCard dark/><ContributionCard name="Brian O." dark/></div></main>}
