"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { createBrowserClient } from "@/lib/supabase/client"

interface ScheduleClientProps {
  scheduleId: string
  userTeam: any
  user: any
}

export function ScheduleClient({ scheduleId, userTeam, user }: ScheduleClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const supabase = createBrowserClient()

  const handleRequestGame = async () => {
    if (!user) {
      // Redirect to login
      window.location.href = "/auth/login"
      return
    }

    if (!userTeam) {
      setShowTeamModal(true)
      return
    }

    // User has a team, request the game
    setIsLoading(true)
    try {
      // Create scrim request
      const { error } = await supabase.from("scrim_requests").insert({
        team_id: userTeam.id,
        schedule_id: scheduleId,
        status: "pending",
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update team status to pending if it's draft
      if (userTeam.status === "draft") {
        await supabase.from("teams").update({ status: "pending" }).eq("id", userTeam.id)
      }

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("[v0] Error requesting game:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (showSuccess) {
    return (
      <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded border border-green-500/30 text-green-400 text-sm">
        <CheckCircle2 className="w-4 h-4" />
        მოთხოვნა გაიგზავნა ადმინისტრაციისთვის
      </div>
    )
  }

  return (
    <>
      <Button
        onClick={handleRequestGame}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
      >
        <Zap className="w-4 h-4 mr-2" />
        {isLoading ? "იტვირთება..." : "მოითხოვე თამაში"}
      </Button>

      <Dialog open={showTeamModal} onOpenChange={setShowTeamModal}>
        <DialogContent className="max-w-2xl bg-[#030712] border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/20">
          <div className="relative">
            {/* Design Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 blur-[100px] -z-10" />
            
            <div className="p-8 lg:p-12">
              <DialogHeader className="mb-10">
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                    <AlertCircle className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                  <div>
                    <DialogTitle className="text-4xl font-black text-white italic uppercase tracking-tighter leading-none mb-2">
                       Unit <span className="text-primary italic">Not Found</span>
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
                      სკრიმებში მონაწილეობისთვის საჭიროა აქტიური გუნდი
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid gap-4">
                  {[
                    { step: "01", text: "გადადით პროფილის გვერდზე", sub: "Profile Management" },
                    { step: "02", text: "დააჭირეთ Enlistment (რეგისტრაცია) ღილაკს", sub: "Team Registration" },
                    { step: "03", text: "შეიყვანეთ გუნდის სახელი და ტეგი", sub: "Operational Data" },
                    { step: "04", text: "გამოაგზავნეთ მოთხოვნა სკრიმზე", sub: "Final Deployment" }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="group glass p-5 rounded-2xl border border-white/5 hover:border-primary/30 transition-all duration-500 flex items-center gap-6"
                    >
                      <div className="text-2xl font-black text-primary/20 group-hover:text-primary transition-colors italic tracking-tighter">
                        {item.step}
                      </div>
                      <div>
                        <div className="text-white font-bold italic tracking-tight">{item.text}</div>
                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-50">{item.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-8 flex flex-col sm:flex-row gap-4">
                  <Button 
                    asChild 
                    className="h-16 flex-1 rounded-2xl text-md font-black uppercase tracking-widest italic animate-glow"
                    variant="premium"
                  >
                    <Link href="/profile/register-team" className="flex items-center justify-center gap-2">
                      რეგისტრაცია <ArrowRight className="w-5 h-5" />
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTeamModal(false)}
                    className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest italic"
                  >
                    დახურვა
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
