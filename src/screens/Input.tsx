import { useState } from "react";
import RavenMascot from "@/components/RavenMascot";
import { Button } from "@/components/ScreenUI";
import { darkScreen,fieldClass,type Navigate } from "@/lib/classoni";
export default function Input({navigate,onSubject}:{navigate:Navigate;onSubject:(subject:string,topic:string)=>void}) {
 const [subject,setSubject]=useState(""); const [topic,setTopic]=useState("");
 return <main className={darkScreen}><div className="flex min-h-0 flex-1 flex-col justify-center"><div className="flex justify-center"><RavenMascot size={100} animated/></div><p className="mt-4 text-center text-base leading-relaxed text-on-dark/80">Classoni turns your notes into videos you can easily understand and apply.</p><h1 className="mt-5 text-center text-xl font-bold">What would you like to learn today?</h1><form onSubmit={e=>{e.preventDefault();onSubject(subject,topic);navigate("source")}}><input aria-label="Course unit / Subject" placeholder="Course unit / Subject" value={subject} onChange={e=>setSubject(e.target.value)} className={`${fieldClass} mt-5`}/><input aria-label="Topic / Section" placeholder="Topic / Section" value={topic} onChange={e=>setTopic(e.target.value)} className={`${fieldClass} mt-3`}/><Button variant="premium" className="mt-6 h-14 w-full rounded-full text-base font-bold" type="submit" onClick={()=>{}}>Start</Button></form></div></main>
}
