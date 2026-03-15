"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { Gift, Crown, Star, Sparkles, Clock, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

type Reward = {
  id: string
  name: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  icon: typeof Crown
  days: number
  probability: number
}

const rewards: Reward[] = [
  {
    id: "nothing",
    name: "ცარიელი",
    description: "იღბალი შემდეგ ჯერზე!",
    color: "text-gray-400",
    bgColor: "bg-gray-800/50",
    borderColor: "border-gray-600",
    icon: X,
    days: 0,
    probability: 80, // High chance of nothing
  },
  {
    id: "vip_1_day",
    name: "1 დღიანი VIP",
    description: "VIP სტატუსი 24 საათით",
    color: "text-green-400",
    bgColor: "bg-green-900/30",
    borderColor: "border-green-500",
    icon: Star,
    days: 1,
    probability: 15, // Medium chance
  },
  {
    id: "vip_3_days",
    name: "3 დღიანი VIP",
    description: "VIP სტატუსი 3 დღით",
    color: "text-blue-400",
    bgColor: "bg-blue-900/30",
    borderColor: "border-blue-500",
    icon: Sparkles,
    days: 3,
    probability: 4, // Low chance
  },
  {
    id: "vip_1_week",
    name: "1 კვირიანი VIP",
    description: "VIP სტატუსი 7 დღით",
    color: "text-yellow-400",
    bgColor: "bg-yellow-900/30",
    borderColor: "border-yellow-500",
    icon: Crown,
    days: 7,
    probability: 1, // Very low chance
  },
]

export default function CaseOpeningPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canOpen, setCanOpen] = useState(false)
  const [nextOpenTime, setNextOpenTime] = useState<Date | null>(null)
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningIndex, setSpinningIndex] = useState(0)
  const [wonReward, setWonReward] = useState<Reward | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [vipStatus, setVipStatus] = useState<{ vip_until: string } | null>(null)
  const [countdown, setCountdown] = useState("")

  const supabase = createBrowserClient()

  const checkCanOpen = useCallback(async (userId: string) => {
    try {
      const { data: lastOpen, error } = await supabase
        .from("case_openings")
        .select("opened_at")
        .eq("user_id", userId)
        .order("opened_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code === 'PGRST116') {
        setCanOpen(true)
        setNextOpenTime(null)
        return
      }

      if (!lastOpen) {
        setCanOpen(true)
        setNextOpenTime(null)
        return
      }

      const lastOpenDate = new Date(lastOpen.opened_at)
      const twoWeeksLater = new Date(lastOpenDate.getTime() + 14 * 24 * 60 * 60 * 1000)
      const now = new Date()

      if (now >= twoWeeksLater) {
        setCanOpen(true)
        setNextOpenTime(null)
      } else {
        setCanOpen(false)
        setNextOpenTime(twoWeeksLater)
      }
    } catch (err) {
      setCanOpen(true)
      setNextOpenTime(null)
    }
  }, [supabase])

  const fetchVipStatus = useCallback(async (userId: string) => {
    const { data } = await supabase.from("user_vip_status").select("vip_until").eq("user_id", userId).single()

    if (data && new Date(data.vip_until) > new Date()) {
      setVipStatus(data)
    } else {
      setVipStatus(null)
    }
  }, [supabase])

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await checkCanOpen(user.id)
        await fetchVipStatus(user.id)
      }

      setLoading(false)
    }

    checkUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        await checkCanOpen(session.user.id)
        await fetchVipStatus(session.user.id)
      }
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [supabase, checkCanOpen, fetchVipStatus])

  useEffect(() => {
    if (!nextOpenTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = nextOpenTime.getTime() - now.getTime()

      if (diff <= 0) {
        setCanOpen(true)
        setNextOpenTime(null)
        setCountdown("")
        return
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setCountdown(`${days}d ${hours}h ${minutes}m ${seconds}s`)
    }, 1000)

    return () => clearInterval(interval)
  }, [nextOpenTime])

  const getRandomReward = (): Reward => {
    const random = Math.random() * 100
    let cumulative = 0

    for (const reward of rewards) {
      cumulative += reward.probability
      if (random <= cumulative) {
        return reward
      }
    }

    return rewards[0]
  }

  const handleOpenCase = async () => {
    if (!user || isSpinning || !canOpen) return

    setIsSpinning(true)
    setShowResult(false)
    setWonReward(null)

    const finalReward = getRandomReward()

    try {
      // 1. Save the opening record immediately to start the cooldown
      const { error: saveError } = await supabase.from("case_openings").insert({
        user_id: user.id,
        reward: finalReward.id,
      })

      if (saveError) {
        console.error("Error saving case opening:", saveError)
        setIsSpinning(false)
        alert("შეცდომაა: ვერ მოხერხდა Case-ის შენახვა. სცადეთ მოგვიანებით.")
        return
      }

      // 2. Set cooldown on frontend immediately
      setCanOpen(false)
      const nextDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      setNextOpenTime(nextDate)

      // 3. Start the animation
      let spinCount = 0
      const maxSpins = 30
      const spinInterval = setInterval(() => {
        setSpinningIndex((prev) => (prev + 1) % rewards.length)
        spinCount++

        if (spinCount >= maxSpins) {
          clearInterval(spinInterval)

          let slowCount = 0
          const slowInterval = setInterval(() => {
            setSpinningIndex((prev) => (prev + 1) % rewards.length)
            slowCount++

            if (slowCount >= 10) {
              clearInterval(slowInterval)
              setSpinningIndex(rewards.findIndex((r) => r.id === finalReward.id))
              setWonReward(finalReward)
              setShowResult(true)
              setIsSpinning(false)
              
              // 4. Finally update VIP status if applicable
              if (finalReward.days > 0) {
                updateVipStatus(finalReward)
              }
            }
          }, 100 + slowCount * 50)
        }
      }, 50)
    } catch (err) {
      console.error("Unexpected error:", err)
      setIsSpinning(false)
    }
  }

  const updateVipStatus = async (reward: Reward) => {
    if (!user) return

    try {
      const { data: existingVip } = await supabase
        .from("user_vip_status")
        .select("vip_until")
        .eq("user_id", user.id)
        .maybeSingle()

      let newVipUntil: Date
      if (existingVip && existingVip.vip_until && new Date(existingVip.vip_until) > new Date()) {
        newVipUntil = new Date(new Date(existingVip.vip_until).getTime() + reward.days * 24 * 60 * 60 * 1000)
      } else {
        newVipUntil = new Date(Date.now() + reward.days * 24 * 60 * 60 * 1000)
      }

      const { error: upsertError } = await supabase.from("user_vip_status").upsert({
        user_id: user.id,
        vip_until: newVipUntil.toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (upsertError) {
        console.error("Error updating VIP status:", upsertError)
      } else {
        setVipStatus({ vip_until: newVipUntil.toISOString() })
      }
    } catch (err) {
      console.error("Error in updateVipStatus:", err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-card p-12 max-w-md w-full text-center animate-reveal">
            <Gift className="w-20 h-20 text-primary mx-auto mb-8 animate-float-subtle" />
            <h2 className="text-3xl font-black text-white italic mb-6 uppercase tracking-tighter">Case Opening</h2>
            <p className="text-muted-foreground font-light mb-10 text-lg">გთხოვთ გაიაროთ ავტორიზაცია Case-ის გასახსნელად</p>
            <Button asChild variant="premium" className="w-full py-6 text-lg">
              <Link href="/auth/login">შესვლა</Link>
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-32 px-4 overflow-hidden">
      {/* Background Decorative Circles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-mesh opacity-20" />
      
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-20 animate-reveal">
           <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-8">
              <Sparkles className="w-3 h-3" /> Exclusive Rewards
           </div>
          <h1 className="text-6xl md:text-8xl font-black mb-6 text-white tracking-tighter italic">
            MYSTERY <span className="text-primary tracking-normal">CASE</span>
          </h1>
          <p className="text-xl text-muted-foreground font-light max-w-3xl mx-auto">
            გახსენი Case და მოიგე <span className="text-secondary font-bold">VIP სტატუსი</span> სრულიად უფასოდ!
          </p>
        </div>

        <div className="relative mb-24 lg:mb-32">
          <div className="max-w-xl mx-auto">
             <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-primary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 ${isSpinning ? 'animate-pulse' : ''}`} />
                
                <div className={`glass-card p-4 relative overflow-hidden transition-all duration-700 ${
                  showResult && wonReward ? 'ring-2 ring-primary shadow-[0_0_50px_rgba(255,170,0,0.2)]' : ''
                }`}>
                   <div className="aspect-square flex items-center justify-center p-8 lg:p-16">
                      {isSpinning && !showResult ? (
                         <div className="text-center animate-bounce">
                             <div className={`w-36 h-36 mx-auto mb-8 rounded-[2.5rem] glass border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-300`}>
                                {(() => {
                                  const Icon = rewards[spinningIndex].icon
                                  return <Icon className={`w-16 h-16 ${rewards[spinningIndex].color}`} />
                                })()}
                             </div>
                             <p className={`text-3xl font-black uppercase italic tracking-widest ${rewards[spinningIndex].color}`}>
                                {rewards[spinningIndex].name}
                             </p>
                         </div>
                      ) : showResult && wonReward ? (
                         <div className="text-center animate-reveal">
                             <div className="absolute inset-0 bg-primary/5 animate-pulse" />
                             <div className={`w-44 h-44 mx-auto mb-10 rounded-[3rem] glass border-4 ${wonReward.borderColor} flex items-center justify-center shadow-[0_0_80px_rgba(255,170,0,0.3)] animate-float-subtle`}>
                                {(() => {
                                  const Icon = wonReward.icon
                                  return <Icon className={`w-24 h-24 ${wonReward.color}`} />
                                })()}
                             </div>
                             <p className={`text-4xl font-black italic tracking-tighter mb-4 ${wonReward.color}`}>{wonReward.name}</p>
                             <p className="text-lg text-muted-foreground font-light uppercase tracking-widest">{wonReward.description}</p>
                         </div>
                      ) : (
                         <div className="text-center group">
                            <div className="w-52 h-52 mx-auto mb-12 rounded-[3.5rem] glass border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 group-hover:border-primary/50 relative">
                               <Gift className="w-24 h-24 text-primary animate-float-subtle" />
                               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full blur-3xl transition-opacity" />
                            </div>
                            <div className="space-y-2">
                               <p className="text-3xl font-black text-white italic tracking-tighter uppercase">Mystery Case</p>
                               <p className="text-muted-foreground text-sm font-light tracking-[0.4em] uppercase">Ready to Unveil</p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>

          <div className="text-center mt-12">
             {canOpen ? (
                <Button
                  onClick={handleOpenCase}
                  disabled={isSpinning}
                  variant="premium"
                  className="h-20 px-16 text-2xl group relative overflow-hidden"
                >
                  {isSpinning ? 'იხსნება...' : 'გახსენი Case'}
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                </Button>
             ) : (
                <div className="glass-card p-8 inline-block">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center">
                         <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                         <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">Next Opening Hand In</div>
                         <div className="text-3xl font-black text-white italic tracking-tight">{countdown}</div>
                      </div>
                   </div>
                </div>
             )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
            {rewards.map((reward, idx) => (
              <div
                key={reward.id}
                className={`glass-card p-8 text-center group animate-reveal hover:scale-105 transition-all`}
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl glass border border-white/5 flex items-center justify-center group-hover:border-primary/50 transition-colors`}>
                   {(() => {
                      const Icon = reward.icon
                      return <Icon className={`w-8 h-8 ${reward.color}`} />
                   })()}
                </div>
                <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">{reward.probability}% Chance</div>
                <div className={`text-lg font-black italic tracking-tighter ${reward.color}`}>{reward.name}</div>
              </div>
            ))}
        </div>

        {vipStatus && (
           <div className="mb-12 animate-reveal">
              <div className="glass p-8 rounded-3xl border border-secondary/30 bg-secondary/5 flex items-center gap-6 justify-between flex-wrap">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl glass border border-secondary/20 flex items-center justify-center shadow-[0_0_30px_rgba(255,200,0,0.1)]">
                       <Crown className="w-8 h-8 text-secondary animate-pulse-soft" />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-white italic tracking-tight">VIP STATUS ACTIVE</h3>
                       <p className="text-muted-foreground font-light">მოქმედებს: <span className="text-white font-bold">{new Date(vipStatus.vip_until).toLocaleDateString("ka-GE")}</span></p>
                    </div>
                 </div>
                 <Badge variant="gold" className="py-2 px-6 text-sm italic">PREMIUM MEMBER</Badge>
              </div>
           </div>
        )}

        <div className="grid lg:grid-cols-2 gap-12 animate-reveal">
           <div className="glass-card p-12">
              <h3 className="text-3xl font-black text-white italic tracking-tighter mb-8 uppercase">Rules & Guidelines</h3>
              <ul className="space-y-6">
                {[
                  "Case-ის გახსნა შესაძლებელია 2 კვირაში ერთხელ",
                  "მოგებული VIP სტატუსი ავტომატურად აქტიურდება",
                  "თუ უკვე გაქვთ VIP, ახალი მოგება დაემატება არსებულ დროს",
                  "VIP სტატუსი გაძლევთ პრიორიტეტულ მონაწილეობას სკრიმებში"
                ].map((rule, i) => (
                   <li key={i} className="flex items-center gap-4 text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-lg font-light">{rule}</span>
                   </li>
                ))}
              </ul>
           </div>
           
           <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full glass border border-white/5 flex items-center justify-center mb-6">
                 <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">WANT MORE?</h3>
              <p className="text-muted-foreground font-light mb-8 max-w-sm">Join our elite community for higher chances and exclusive rewards.</p>
              <Button asChild variant="outline" className="rounded-2xl px-12 h-14 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">
                 <Link href="/help">Learn More</Link>
              </Button>
           </div>
        </div>
      </div>
    </div>
  )
}
