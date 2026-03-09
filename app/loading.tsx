"use client"

import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-xl">
      <div className="absolute inset-0 bg-mesh -z-10 opacity-30" />
      
      <div className="relative">
         {/* Outter Orbit */}
         <div className="w-24 h-24 rounded-full border border-primary/20 border-t-primary animate-spin" />
         
         {/* Inner Logo/Icon */}
         <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-primary/10 rounded-xl border border-primary/30 flex items-center justify-center backdrop-blur-md animate-pulse">
               <span className="text-primary font-black italic tracking-tighter text-xl">A</span>
            </div>
         </div>
      </div>
      
      <div className="mt-8 flex flex-col items-center gap-2">
         <div className="text-white font-black italic tracking-[0.5em] uppercase text-sm animate-pulse">
            Loading_Arena
         </div>
         <div className="flex gap-1">
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-1 h-1 rounded-full bg-primary animate-bounce" />
         </div>
      </div>
      
      <div className="absolute bottom-10 text-[8px] font-black text-white/10 uppercase tracking-[0.3em]">
         Establishing Secure Connection...
      </div>
    </div>
  )
}
