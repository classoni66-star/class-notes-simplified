import { Gift, UserRound } from "lucide-react";
import { Button } from "./ui/button";
export default function TopBar({title,uploader,points,onProfileTap,onRewardsTap,onPremiumTap}:{title:string;uploader:string;points:number;onProfileTap:()=>void;onRewardsTap:()=>void;onPremiumTap:()=>void}) {
 return <header className="shrink-0 border-b border-classoni-navy/10 px-4 pt-3 pb-2">
  <div className="flex items-center gap-2"><Button variant="ghost" size="icon" aria-label="Rewards" title="Rewards" onClick={onRewardsTap}><Gift/></Button><div className="min-w-0 flex-1 text-center"><h1 className="text-sm font-bold">{title}</h1><p className="text-xs text-muted-foreground">{uploader.startsWith("By ")?uploader:`By ${uploader}`}</p></div><span className="whitespace-nowrap rounded-full bg-classoni-yellow px-2 py-1 text-xs font-bold">{points} pts</span><Button variant="ghost" size="icon" aria-label="Profile" title="Profile" onClick={onProfileTap}><UserRound/></Button></div>
  <div className="mt-1 flex items-center justify-between gap-2"><p className="min-w-0 truncate text-xs font-bold">Keypoint: Sliding Filament Theory</p><Button variant="premium" size="sm" className="shrink-0 rounded-full" onClick={onPremiumTap}>Go Premium</Button></div>
 </header>;
}
