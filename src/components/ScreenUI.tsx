import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Navigate } from "@/lib/classoni";
export function Back({navigate}:{navigate:Navigate}) {return <Button variant="ghost" size="icon" className="shrink-0 self-start rounded-full" aria-label="Back to lesson" title="Back to lesson" onClick={()=>navigate("player")}><ArrowLeft/></Button>}
export { Button };
export function Notice({children}:{children:React.ReactNode}) {return <p role="status" className="mt-3 text-center text-sm leading-snug">{children}</p>}
