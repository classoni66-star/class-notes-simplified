import { useRef } from "react";
import { BookOpen,FileUp,ChevronRight } from "lucide-react";
import { Button } from "@/components/ScreenUI";
import { darkScreen,type Navigate } from "@/lib/classoni";
export default function Source({navigate,onFile}:{navigate:Navigate;onFile:(file:File)=>void}) {
 const file=useRef<HTMLInputElement>(null);
 return <main className={darkScreen}><div className="flex flex-1 flex-col justify-center"><h1 className="text-center text-lg font-bold">How should we build your lesson?</h1><Button variant="premium" className="mt-6 h-auto w-full justify-start whitespace-normal rounded-2xl p-5 text-left" onClick={()=>navigate("loading")}><BookOpen className="size-6"/><span className="flex-1"><strong className="block text-base">Use standard curriculum notes</strong><span className="mt-1 block text-xs opacity-70">Instant, AI-generated, exam-ready</span></span><ChevronRight/></Button><Button variant="dark" className="mt-3 h-auto w-full justify-start whitespace-normal rounded-2xl p-5 text-left" onClick={()=>file.current?.click()}><FileUp className="size-6"/><span className="flex-1"><strong className="block text-base">Upload my own notes</strong><span className="mt-1 block text-xs text-dark-muted">PDF, images, or handwritten</span></span><ChevronRight/></Button><input ref={file} className="hidden" type="file" accept="application/pdf,image/*" onChange={e=>{const selected=e.target.files?.[0];if(selected){onFile(selected);navigate("loading")}}}/></div></main>
}
