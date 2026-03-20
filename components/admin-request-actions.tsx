"use client"
// Vercel Build Trigger: Final access fix deployment.

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

export function AdminRequestActions({ requestId, teamId: initialTeamId }: AdminRequestActionsProps) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isDone, setIsDone] = useState(false)
  const [slotNumber, setSlotNumber] = useState("")

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true)
    
    // 0. Define final status
    const finalStatus = status.toLowerCase()

    // 1. Fetch team ID for this request
    const { data: requestData, error: fetchError } = await supabase
      .from("scrim_requests")
      .select("team_id")
      .eq("id", requestId)
      .single()

    if (fetchError) {
      console.error("Error fetching request details:", fetchError)
      alert(`Error fetching request details: ${fetchError.message}`)
      setIsLoading(false)
      return
    }

    const teamId = requestData.team_id

    // 2. Update the scrim_request status
    const { error: requestError } = await supabase
      .from("scrim_requests")
      .update({ status: finalStatus })
      .eq("id", requestId)

    if (requestError) {
      console.error("Request update error:", requestError)
      alert(`Error updating request status: ${requestError.message}`)
      setIsLoading(false)
      return
    }

    // 3. If approved, handle slot number and final team status
    if (finalStatus === "approved") {
      const slot = slotNumber && !isNaN(Number(slotNumber)) ? Number(slotNumber) : null
      
      if (slot !== null) {
          // Find schedule_id for this request
          const { data: reqData, error: scheduleFetchError } = await supabase
            .from("scrim_requests")
            .select("schedule_id")
            .eq("id", requestId)
            .single()

          if (scheduleFetchError) {
            console.error("Error fetching schedule_id:", scheduleFetchError)
            alert(`Error fetching schedule ID: ${scheduleFetchError.message}`)
            setIsLoading(false)
            return
          }

          if (reqData?.schedule_id) {
            // Check if slot is taken in this schedule by another APPROVED request
            const { data: existingSlotReq, error: existingSlotError } = await supabase
              .from("scrim_requests")
              .select("id")
              .eq("schedule_id", reqData.schedule_id)
              .eq("slot_number", slot)
              .eq("status", "approved")
              .neq("id", requestId)
              .maybeSingle()

            if (existingSlotError) {
              console.error("Error checking existing slot:", existingSlotError)
              alert(`Error checking existing slot: ${existingSlotError.message}`)
              setIsLoading(false)
              return
            }

            if (existingSlotReq) {
              alert(`სლოტი #${slot} უკვე დაკავებულია სხვა გუნდის მიერ ამ მატჩზე!`)
              setIsLoading(false)
              return
            }

            const { error: slotUpdateError } = await supabase
              .from("scrim_requests")
              .update({ slot_number: slot })
              .eq("id", requestId)

            if (slotUpdateError) {
               console.error("Slot update error:", slotUpdateError)
               alert(`Error updating slot: ${slotUpdateError.message}`)
               // Do not return here, as the request status was already updated successfully
            }
          }
      }

      // Also update team status to approved (global verification)
      const { error: teamUpdateError } = await supabase
        .from("teams")
        .update({ status: "approved" })
        .eq("id", teamId)

      if (teamUpdateError) {
         console.error("Team status update error:", teamUpdateError)
         alert(`Error updating team status: ${teamUpdateError.message}`)
         // Do not return here, as the request status was already updated successfully
      }
    }

    // 4. Send notification to team leader + Update Role
    try {
      // Get team leader id and team name
      const { data: teamData, error: teamLeaderFetchError } = await supabase
        .from("teams")
        .select("leader_id, team_name")
        .eq("id", teamId)
        .maybeSingle()

      if (teamLeaderFetchError) {
        console.error("Error fetching team leader details:", teamLeaderFetchError)
        // Continue without notification if leader fetch fails
      } else if (teamData?.leader_id) {
        const isApproved = finalStatus === "approved"
        
        if (isApproved) {
            // Update role to manager
            const { error: roleUpdateError } = await supabase.from("profiles").update({ role: 'manager' }).eq("id", teamData.leader_id)
            if (roleUpdateError) {
              console.warn("Error updating user role:", roleUpdateError)
            }
        }

        const slotMsg = slotNumber && isApproved ? ` სლოტი: #${slotNumber}` : ""
        const { error: notificationError } = await supabase.from("notifications").insert({
          user_id: teamData.leader_id,
          title: isApproved ? "გუნდი დადასტურდა ✅" : "გუნდი უარყოფილდა ❌",
          message: isApproved
            ? `თქვენი გუნდი "${teamData.team_name}" დადასტურდა!${slotMsg} ახლა შეგიძლიათ "Room Info" ნავიგაციაში ნახოთ.`
            : `სამწუხაროდ, თქვენი გუნდის "${teamData.team_name}" მოთხოვნა უარყოფილიკია ადმინისტრაციის მიერ.`,
          type: isApproved ? "success" : "error",
        })
        if (notificationError) {
          console.warn("Error sending notification:", notificationError)
        }
      }
    } catch (e) {
      console.warn("Notification/Role update failed:", e)
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
