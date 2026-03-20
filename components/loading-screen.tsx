"use client"

import { Activity } from "lucide-react"

export function LoadingScreen({ message = "ინფორმაცია იტვირთება..." }: { message?: string }) {
   return (
      <div className="fixed inset-0 bg-[#020204] flex flex-col items-center justify-center p-4 z-[9999]">
         <div className="relative mb-12">
            {/* Logo area */}
            <div className="flex flex-col items-center">
               <h1 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                  PUBG <span className="text-primary italic">ARENA</span>
               </h1>
               <div className="flex items-center gap-4 text-primary/20">
                  <div className="h-px w-16 bg-current" />
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] italic">Established_2024</span>
                  <div className="h-px w-16 bg-current" />
               </div>
            </div>

            {/* Glowing effect */}
            <div className="absolute inset-x-0 -inset-y-20 bg-primary/20 blur-[100px] -z-10 animate-pulse opacity-50" />
         </div>

         {/* Scanning animation */}
         <div className="space-y-6 w-full max-w-xs text-center">
            <div className="relative h-1 w-full bg-white/5 rounded-full overflow-hidden">
               <div className="absolute h-full w-1/3 bg-primary animate-progress rounded-full" />
            </div>
            
            <div className="flex flex-col items-center gap-4">
               <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
                  <span className="text-xs font-black text-white/40 uppercase tracking-[0.3em] italic animate-pulse">
                     {message}
                  </span>
               </div>
               <div className="text-[8px] font-black text-primary/30 uppercase tracking-[0.5em] italic">
                  Syncing_With_Supreme_Server...
               </div>
            </div>
         </div>

         {/* Background noise/pattern */}
         <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] z-50" />
         <style jsx global>{`
            @keyframes progress {
               0% { left: -33%; }
               100% { left: 100%; }
            }
            .animate-progress {
               animation: progress 1.5s infinite linear;
            }
         `}</style>
      </div>
   )
}
