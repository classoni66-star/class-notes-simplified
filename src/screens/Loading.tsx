import { useEffect,useState } from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import { darkScreen,type Navigate } from "@/lib/classoni";
const steps=["🔍 Analyzing your notes...","🧠 Extracting keypoints...","🏗️ Structuring your lesson...","🎯 Creating a real-world question first...","🎨 Searching for the best visuals...","🎙️ Recording your narrator...","📝 Adding captions and timing...","🛡️ Checking for accuracy...","🎯 Creating your Apply scenario...","📝 Preparing your exam quiz...","🚀 BOOM... your lesson is ready!"];
export default function Loading({navigate}:{navigate:Navigate}) {
 const [elapsed,setElapsed]=useState(0);
 useEffect(()=>{const start=Date.now();const timer=setInterval(()=>setElapsed(Date.now()-start),100);const finish=setTimeout(()=>navigate("player"),14000);return ()=>{clearInterval(timer);clearTimeout(finish)}},[navigate]);
 return <main className={darkScreen}><h1 className="mt-6 text-center text-xl font-bold">Building your lesson</h1><p className="mt-2 text-center text-sm text-dark-muted">A little preparation. A lot of understanding.</p><div className="flex min-h-0 flex-1 flex-col justify-center gap-3">{steps.map((step,i)=><motion.div key={step} initial={{opacity:0,y:5}} animate={{opacity:elapsed>=i*1200?1:0,y:elapsed>=i*1200?0:5}} className="flex items-center gap-3 text-sm"><span className="flex-1">{step}</span>{elapsed>=i*1200+1000&&<Check className="size-4 shrink-0 text-classoni-yellow"/>}</motion.div>)}</div><div className="mb-5 h-1 overflow-hidden rounded-full bg-dark-surface"><motion.div className="h-full bg-classoni-yellow" initial={{width:0}} animate={{width:"100%"}} transition={{duration:14,ease:"linear"}}/></div></main>
}
