import { Upload,BookOpen,Trophy,Search } from "lucide-react";
import { Button } from "./ui/button";
export type Tab = "upload"|"courses"|"leaderboard"|"search";
export default function BottomNav({active="courses",onNavigate}:{active?:Tab;onNavigate:(tab:Tab)=>void}) {
 const tabs=[{id:"upload",label:"Upload",icon:Upload},{id:"courses",label:"Courses",icon:BookOpen},{id:"leaderboard",label:"Leaderboard",icon:Trophy},{id:"search",label:"Search",icon:Search}] as const;
 return <nav aria-label="Main navigation" className="grid h-16 shrink-0 grid-cols-4 border-t border-border bg-background">{tabs.map(({id,label,icon:Icon})=><Button key={id} variant="ghost" className={`h-16 flex-col gap-1 rounded-none px-1 text-[10px] ${active===id?"text-primary":"text-muted-foreground"}`} aria-current={active===id?"page":undefined} onClick={()=>onNavigate(id)}><Icon className="size-5"/>{label}</Button>)}</nav>
}
