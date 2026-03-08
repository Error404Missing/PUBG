"use client"

import { LogOut, AlertTriangle, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

export function BannedScreen({ reason, until }: { reason?: string | null, until?: string | null }) {
  const supabase = createClient()
  
  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }
  
  const untilDate = until ? new Date(until) : null

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(225,29,72,0.1),transparent_70%)] -z-10" />
      
      <div className="glass-card max-w-lg w-full p-8 relative border-rose-500/20 text-center animate-reveal">
         <div className="w-24 h-24 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-rose-500" />
         </div>
         
         <h1 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-4">
           ACCESS_DENIED
         </h1>
         
         <p className="text-muted-foreground font-bold text-sm tracking-widest uppercase mb-8">
           თქვენი ანგარიში შეზღუდულია!
         </p>
         
         <div className="space-y-4 mb-8 bg-black/40 p-6 rounded-2xl border border-white/5 text-left">
           <div>
             <div className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-1 italic">Reason / მიზეზი</div>
             <div className="text-white font-bold">{reason || "წესების დარღვევა"}</div>
           </div>
           
           <div>
             <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-1 italic">Duration / ხანგრძლივობა</div>
             <div className="text-white font-bold">
               {untilDate ? `ექვემდებარება განბანვას: ${untilDate.toLocaleString('ka-GE')}` : "პერმანენტული (უსასრულო) ბანი"}
             </div>
           </div>
         </div>
         
         <div className="flex flex-col gap-4">
           <Button onClick={handleLogout} variant="outline" className="w-full h-14 border-white/10 text-white rounded-xl font-black uppercase tracking-widest">
             <LogOut className="w-4 h-4 mr-2" /> ანგარიშიდან გასვლა
           </Button>
           <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-4">შეგიძლიათ მიმართოთ მხარდაჭერას ეკრანის ქვედა მარჯვენა კუთხიდან</p>
         </div>
      </div>
    </div>
  )
}
