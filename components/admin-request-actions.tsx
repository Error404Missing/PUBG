"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle2, XCircle, Zap, ShieldCheck } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminRequestActions({ requestId }: { requestId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true)
    const { error } = await supabase
      .from("scrim_requests")
      .update({ status })
      .eq("id", requestId)

    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col sm:flex-row items-center gap-3">
      <Button
        onClick={() => handleAction("approved")}
        disabled={isLoading}
        className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest italic group transition-all active:scale-95"
      >
        <span className="flex items-center gap-2">
           <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
           ავტორიზება
        </span>
      </Button>
      
      <Button
        onClick={() => handleAction("rejected")}
        disabled={isLoading}
        variant="outline"
        className="w-full sm:w-auto h-14 px-8 rounded-2xl border-rose-500/10 text-rose-400 hover:bg-rose-500/5 font-black text-[10px] uppercase tracking-widest italic group transition-all active:scale-95"
      >
        <span className="flex items-center gap-2">
           <XCircle className="w-4 h-4 group-hover:rotate-90 transition-transform duration-500" />
           უარყოფა
        </span>
      </Button>
    </div>
  )
}
