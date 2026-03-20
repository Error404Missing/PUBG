"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, Zap, ArrowRight, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"

interface ScheduleClientProps {
  scheduleId: string
  userTeam: any
  user: any
  registrationOpen?: boolean
  registrationStatus?: 'open' | 'vip_only' | 'closed'
  logoRequired?: boolean
  mapsCount?: number
  isUserVip?: boolean
  scheduleTitle?: string
}

export function ScheduleClient({ 
  scheduleId, 
  userTeam, 
  user, 
  registrationOpen = true, 
  registrationStatus = 'open',
  logoRequired = false,
  mapsCount = 4,
  isUserVip = false,
  scheduleTitle = "მატჩი"
}: ScheduleClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showMapModal, setShowMapModal] = useState(false)
  const [preferredMaps, setPreferredMaps] = useState<number>(mapsCount)
  const [showBanModal, setShowBanModal] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  const handleRequestGame = async () => {
    if (!user) {
      window.location.href = "/auth/login"
      return
    }

    if (!userTeam) {
      setShowTeamModal(true)
      return
    }

    // User has a team, request the game via API
    setIsLoading(true)
    try {
      const res = await fetch("/api/scrim-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          team_id: userTeam.id, 
          schedule_id: scheduleId,
          preferred_maps: preferredMaps
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 409) {
          setToast({ message: "მოთხოვნა უკვე გამოგზავნილია", type: 'info' })
          return
        }
        throw new Error(data.error || "შეცდომა")
      }

      setShowMapModal(false)
      setToast({ message: "მოთხოვნა წარმატებით გაიგზავნა ადმინისტრაციისთვის", type: 'success' })
    } catch (error: any) {
      console.error("[v0] Error requesting game:", error)
      setToast({ message: "შეცდომა: " + (error.message || "მოთხოვნა ვერ გაიგზავნა"), type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenMapModal = () => {
    if (!user) {
      window.location.href = "/auth/login"
      return
    }
    if (!userTeam) {
      setShowTeamModal(true)
      return
    }

    // Check for Ban
    if (userTeam.status === 'blocked') {
      const banUntil = userTeam.ban_until ? new Date(userTeam.ban_until) : null
      const now = new Date()
      
      if (!banUntil || banUntil > now) {
        setShowBanModal(true)
        return
      }
    }

    // Set default selection to schedule's max
    setPreferredMaps(mapsCount)
    setShowMapModal(true)
  }

  return (
    <>
      <Button
        onClick={handleOpenMapModal}
        disabled={isLoading || registrationStatus === 'closed' || (registrationStatus === 'vip_only' && !isUserVip)}
        className={`whitespace-nowrap transition-all active:scale-95 ${
          registrationStatus === 'closed'
            ? "bg-neutral-800 text-neutral-400 cursor-not-allowed border border-white/5"
            : registrationStatus === 'vip_only' && !isUserVip
            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20"
        }`}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : registrationStatus === 'vip_only' ? (
          <Zap className="w-4 h-4 mr-2" />
        ) : (
          <Zap className="w-4 h-4 mr-2" />
        )}
        {registrationStatus === 'closed'
          ? "რეგისტრაცია დახურულია"
          : registrationStatus === 'vip_only' && !isUserVip
          ? "მხოლოდ VIP მომხმარებლებისთვის"
          : isLoading
          ? "იტვირთება..."
          : "მოითხოვე თამაში"}
      </Button>

      {/* Maps Confirmation Modal */}
      <Dialog open={showMapModal} onOpenChange={setShowMapModal}>
        <DialogContent className="max-w-lg bg-[#030712] border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-primary/20">
          <div className="p-8 lg:p-10 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black text-white italic uppercase tracking-tighter">
                {scheduleTitle}
                <div className="text-primary text-sm tracking-widest mt-1">მაპების არჩევანი</div>
              </DialogTitle>
            </DialogHeader>

            {/* Schedule maps info banner */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
              <Zap className="w-5 h-5 text-primary shrink-0" />
              <p className="text-primary text-sm font-bold">
                ამ პრეკი ტარდება <span className="underline">{mapsCount} მაპით</span>. მაქსიმალურად {mapsCount} მაპის არჩევაა შესაძლებელი.
              </p>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {[1, 2, 3, 4].filter(n => n <= mapsCount).map(n => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPreferredMaps(n)}
                  className={`h-16 rounded-2xl font-black text-xl transition-all active:scale-95 border relative ${
                    preferredMaps === n
                      ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                      : 'bg-black/40 border-white/10 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>

            {/* Hard block warning */}
            {preferredMaps > mapsCount && (
              <div className="flex items-center gap-3 p-4 bg-red-500/10 rounded-2xl border border-red-500/20">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
                <p className="text-red-400 text-sm font-bold">
                  არჩეული {preferredMaps} მაპი დაუშვებელია! ამ პრეკი {mapsCount}-მაპიანია. გთხოვთ, აირჩიეთ {mapsCount} ან ნაკლები.
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={handleRequestGame}
                disabled={isLoading || preferredMaps > mapsCount}
                variant="premium"
                className="h-14 flex-1 rounded-2xl font-black uppercase tracking-widest"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "გაგზავნა"}
              </Button>
              <Button
                onClick={() => setShowMapModal(false)}
                variant="outline"
                className="h-14 px-8 rounded-2xl border-white/10"
              >
                გაუქმება
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
                    <Link href={`/profile/register-team${scheduleId ? `?schedule_id=${scheduleId}` : ''}`} className="flex items-center justify-center gap-2">
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
      <Dialog open={showBanModal} onOpenChange={setShowBanModal}>
        <DialogContent className="max-w-lg bg-[#030712] border-white/5 p-0 overflow-hidden rounded-[2.5rem] shadow-2xl shadow-rose-500/20">
          <div className="relative p-8 lg:p-12">
            {/* Red glow backdrop */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-[100px] -z-10" />
            
            <DialogHeader className="mb-8">
              <div className="flex items-center gap-6 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                  <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
                </div>
                <div>
                  <DialogTitle className="text-4xl font-black text-rose-500 italic uppercase tracking-tighter leading-none mb-2">
                    Unit <span className="text-white italic">Suspended</span>
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px]">
                    თქვენი გუნდი დისკვალიფიცირებულია
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6">
              <div className="glass p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black text-rose-500/50 uppercase tracking-widest italic leading-none">დაბლოკვის მიზეზი</div>
                  <div className="text-white font-bold italic tracking-tight uppercase">
                    {userTeam?.ban_reason || "წესების დარღვევა"}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="space-y-1">
                    <div className="text-[10px] font-black text-white/20 uppercase tracking-widest italic leading-none">ვადის ამოწურვა</div>
                    <div className="text-sm font-black text-rose-400 italic">
                      {userTeam?.ban_until 
                        ? new Intl.DateTimeFormat('ka-GE', { 
                            dateStyle: 'medium', 
                            timeStyle: 'short' 
                          }).format(new Date(userTeam.ban_until))
                        : "სამუდამოდ"}
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-muted-foreground italic font-medium leading-relaxed px-2">
                თქვენს გუნდს შეზღუდული აქვს პრეკებზე რეგისტრაცია დადასტურებულ ვადამდე. გთხოვთ დაიცვათ წესები სამომავლოდ.
              </p>

              <Button
                variant="outline"
                onClick={() => setShowBanModal(false)}
                className="w-full h-16 rounded-2xl border-white/10 hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest italic"
              >
                გაგზავნა
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {toast && (
        <LuxuryToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  )
}
