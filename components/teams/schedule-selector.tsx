"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Gamepad2, Zap } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { LoadingScreen } from "@/components/loading-screen"

interface Schedule {
  id: string
  title: string
  date: string
}

export function ScheduleSelector({ schedules }: { schedules: Schedule[] }) {
   const router = useRouter()
   const [isPending, startTransition] = useTransition()
   const [selectedId, setSelectedId] = useState<string | null>(null)

   const handleSelect = (id: string) => {
      setSelectedId(id)
      startTransition(() => {
         router.push(`/teams?schedule=${id}`)
      })
   }

   return (
      <>
         {isPending && <LoadingScreen message="დეტალები იტვირთება..." />}
         <div className="grid gap-6">
            {schedules.map((s, i) => (
               <div 
                  key={s.id} 
                  onClick={() => handleSelect(s.id)}
                  className={`glass-card p-1 group animate-reveal block cursor-pointer transition-all ${
                     selectedId === s.id ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.1}s` }}
               >
                  <div className="p-8 flex items-center gap-8">
                     <div className="w-16 h-16 rounded-2xl glass border border-white/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform bg-primary/5">
                        <Gamepad2 className="w-8 h-8 text-primary" />
                     </div>
                     <div className="flex-1 min-w-0">
                        <h3 className="text-3xl font-black text-white group-hover:text-primary transition-colors italic tracking-tighter uppercase">
                           {s.title}
                        </h3>
                        <div className="flex items-center gap-3 text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">
                           <span>{format(new Date(s.date), "PPP", { locale: ka })}</span>
                           <span className="w-1 h-1 rounded-full bg-primary" />
                           <span className="text-primary">
                              {new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(s.date))}
                           </span>
                        </div>
                     </div>
                     <div className="hidden sm:flex items-center gap-3 px-6 py-3 rounded-2xl glass border border-white/5 opacity-0 group-hover:opacity-100 transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest">DEPLOY_VIEW</span>
                        <Zap className="w-4 h-4 text-primary animate-pulse" />
                     </div>
                  </div>
               </div>
            ))}
         </div>
      </>
   )
}
