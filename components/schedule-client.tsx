"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Zap } from "lucide-react"
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
        <DialogContent className="bg-black border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              გუნდი არ არის რეგისტრირებული
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              სკრიმებში მონაწილეობისთვის უნდა გქონდეთ რეგისტრირებული გუნდი
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="text-white font-semibold mb-2">როგორ დავრეგისტრიროთ გუნდი:</h4>
              <ol className="text-gray-300 text-sm space-y-2">
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">1.</span>
                  <span>დაბრუნდით პროფილზე</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">2.</span>
                  <span>დააჭირეთ "გუნდის რეგისტრაცია" ღილაკს</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">3.</span>
                  <span>შეავსეთ გუნდის ინფორმაცია (სახელი, ტეგი, მოთამაშეები)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-blue-400 font-bold">4.</span>
                  <span>გამოიწერეთ საკუთარი მოთხოვნა სკრიმებზე</span>
                </li>
              </ol>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowTeamModal(false)}
                className="border-gray-500/50 text-gray-300 hover:bg-gray-500/10"
              >
                დახურვა
              </Button>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/profile/register-team">გუნდის რეგისტრაცია</Link>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
