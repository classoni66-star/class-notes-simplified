import RavenMascot from "@/components/RavenMascot";
import { Button } from "@/components/ScreenUI";
import { darkScreen,type Navigate } from "@/lib/classoni";
export default function Welcome({navigate}:{navigate:Navigate}) {
 return <main className={darkScreen}><div className="flex items-center justify-center gap-2 pt-2 text-sm font-bold"><span className="size-2 rounded-full bg-classoni-yellow"/>classoni<span className="text-classoni-yellow">.</span></div><div className="flex min-h-0 flex-1 flex-col items-center justify-center pb-8"><RavenMascot size={180} animated/><h1 className="mt-8 text-center text-[28px] font-bold">Hi, I'm Raven.</h1><p className="mt-4 max-w-sm px-2 text-center text-base leading-relaxed text-on-dark/80">I'm here to help you pass your course and graduate with less stress.</p></div><Button variant="premium" className="mb-4 h-14 w-full rounded-full text-base font-bold" onClick={()=>navigate("input")}>Start Learning</Button></main>
}
