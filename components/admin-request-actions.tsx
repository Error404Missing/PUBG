"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { XCircle, ShieldCheck, CheckCircle2, Hash } from "lucide-react"
import { useRouter } from "next/navigation"

interface AdminRequestActionsProps {
  requestId: string
  teamId: string
}

export function AdminRequestActions({ requestId, teamId }: AdminRequestActionsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [slotNumber, setSlotNumber] = useState("")

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true)

    // 1. Update scrim_request status
    const { error } = await supabase
      .from("scrim_requests")
      .update({ status })
      .eq("id", requestId)

    if (error) {
      console.error("Request update error:", error)
      setIsLoading(false)
      alert("შეცდომა: " + error.message)
      return
    }

    // 2. If approved, also update the team status + optionally set slot
    if (status === "approved") {
      const teamUpdate: any = { status: "approved" }
      if (slotNumber && !isNaN(Number(slotNumber))) {
        teamUpdate.slot_number = Number(slotNumber)
      }
      await supabase.from("teams").update(teamUpdate).eq("id", teamId)
    }

    setIsDone(true)
    setIsLoading(false)

    // Refresh the page after a short delay
    setTimeout(() => {
      router.refresh()
    }, 800)
  }

  if (isDone) {
    return (
      <div className="flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest italic">
        <CheckCircle2 className="w-5 h-5" />
        განახლდა
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Optional slot input */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Hash className="w-4 h-4 text-blue-400" />
        </div>
        <Input
          type="number"
          value={slotNumber}
          onChange={(e) => setSlotNumber(e.target.value)}
          placeholder="სლოტი (სურვილისამებრ)"
          className="h-10 bg-black/40 border-white/10 rounded-xl text-xs font-bold focus:border-blue-500/50 w-48"
          min={1}
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <Button
          onClick={() => handleAction("approved")}
          disabled={isLoading}
          className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-black text-[10px] uppercase tracking-widest italic group transition-all active:scale-95"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
            {isLoading ? "..." : "ავტორიზება"}
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
            {isLoading ? "..." : "უარყოფა"}
          </span>
        </Button>
      </div>
    </div>
  )
}
