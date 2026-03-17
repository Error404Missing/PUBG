"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { createBrowserClient } from "@/lib/supabase/client"
import { Gift, Crown, Star, Sparkles, Clock, X, Package, Box, Wallet } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"

type Reward = {
  id: string
  name: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  icon: any
  days: number
  probability: number
}

type CaseConfig = {
  id: string
  name: string
  price: number
  description: string
  themeColor: string
  icon: any
  rewards: Reward[]
}

const casesData: CaseConfig[] = [
  {
    id: "free",
    name: "Mystery Case",
    price: 0,
    themeColor: "primary",
    description: "უფასო 2 კვირაში ერთხელ",
    icon: Gift,
    rewards: [
      { id: "nothing", name: "ცარიელი", description: "იღბალი შემდეგ ჯერზე!", color: "text-gray-400", bgColor: "bg-gray-800/50", borderColor: "border-gray-600", icon: X, days: 0, probability: 70 },
      { id: "vip_1_day", name: "1 დღიანი VIP", description: "VIP სტატუსი 24 საათით", color: "text-green-400", bgColor: "bg-green-900/30", borderColor: "border-green-500", icon: Star, days: 1, probability: 20 },
      { id: "vip_3_days", name: "3 დღიანი VIP", description: "VIP სტატუსი 3 დღით", color: "text-blue-400", bgColor: "bg-blue-900/30", borderColor: "border-blue-500", icon: Sparkles, days: 3, probability: 8 },
      { id: "vip_1_week", name: "1 კვირიანი VIP", description: "VIP სტატუსი 7 დღით", color: "text-yellow-400", bgColor: "bg-yellow-900/30", borderColor: "border-yellow-500", icon: Crown, days: 7, probability: 2 },
    ]
  },
  {
    id: "starter",
    name: "Starter Case",
    price: 3,
    themeColor: "emerald-400", 
    description: "3 ₾ • უკეთესი შანსები",
    icon: Box,
    rewards: [
      { id: "nothing", name: "ცარიელი", description: "იღბალი შემდეგ ჯერზე!", color: "text-gray-400", bgColor: "bg-gray-800/50", borderColor: "border-gray-600", icon: X, days: 0, probability: 45 },
      { id: "vip_3_days", name: "3 დღიანი VIP", description: "VIP სტატუსი 3 დღით", color: "text-blue-400", bgColor: "bg-blue-900/30", borderColor: "border-blue-500", icon: Sparkles, days: 3, probability: 35 },
      { id: "vip_1_week", name: "1 კვირიანი VIP", description: "VIP სტატუსი 7 დღით", color: "text-yellow-400", bgColor: "bg-yellow-900/30", borderColor: "border-yellow-500", icon: Crown, days: 7, probability: 15 },
      { id: "vip_2_weeks", name: "2 კვირიანი VIP", description: "VIP სტატუსი 14 დღით", color: "text-orange-400", bgColor: "bg-orange-900/30", borderColor: "border-orange-500", icon: Crown, days: 14, probability: 5 },
    ]
  },
  {
    id: "pro",
    name: "Pro Case",
    price: 5,
    themeColor: "purple-400", 
    description: "5 ₾ • მაღალი მოგება",
    icon: Package,
    rewards: [
      { id: "nothing", name: "ცარიელი", description: "იღბალი შემდეგ ჯერზე!", color: "text-gray-400", bgColor: "bg-gray-800/50", borderColor: "border-gray-600", icon: X, days: 0, probability: 45 },
      { id: "vip_1_week", name: "1 კვირიანი VIP", description: "VIP სტატუსი 7 დღით", color: "text-yellow-400", bgColor: "bg-yellow-900/30", borderColor: "border-yellow-500", icon: Crown, days: 7, probability: 25 },
      { id: "vip_2_weeks", name: "2 კვირიანი VIP", description: "VIP სტატუსი 14 დღით", color: "text-orange-400", bgColor: "bg-orange-900/30", borderColor: "border-orange-500", icon: Crown, days: 14, probability: 20 },
      { id: "vip_1_month", name: "1 თვიანი VIP", description: "VIP სტატუსი 30 დღით", color: "text-red-400", bgColor: "bg-red-900/30", borderColor: "border-red-500", icon: Crown, days: 30, probability: 10 },
    ]
  },
  {
    id: "elite",
    name: "Elite Case",
    price: 7,
    themeColor: "amber-400", 
    description: "7 ₾ • ლეგენდარული",
    icon: Crown,
    rewards: [
      { id: "nothing", name: "ცარიელი", description: "იღბალი შემდეგ ჯერზე!", color: "text-gray-400", bgColor: "bg-gray-800/50", borderColor: "border-gray-600", icon: X, days: 0, probability: 45 },
      { id: "vip_2_weeks", name: "2 კვირიანი VIP", description: "VIP სტატუსი 14 დღით", color: "text-orange-400", bgColor: "bg-orange-900/30", borderColor: "border-orange-500", icon: Crown, days: 14, probability: 10 },
      { id: "vip_1_month", name: "1 თვიანი VIP", description: "VIP სტატუსი 30 დღით", color: "text-red-400", bgColor: "bg-red-900/30", borderColor: "border-red-500", icon: Crown, days: 30, probability: 35 },
      { id: "vip_1_year", name: "1 წლიანი VIP", description: "VIP სტატუსი 365 დღით", color: "text-rose-400", bgColor: "bg-rose-900/30", borderColor: "border-rose-500", icon: Crown, days: 365, probability: 10 },
    ]
  }
]

export default function CaseOpeningPage() {
  const [user, setUser] = useState<any>(null)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [canOpenFreeCase, setCanOpenFreeCase] = useState(false)
  const [nextOpenTime, setNextOpenTime] = useState<Date | null>(null)
  
  const [selectedCaseId, setSelectedCaseId] = useState<string>("free")
  const [isSpinning, setIsSpinning] = useState(false)
  const [spinningIndex, setSpinningIndex] = useState(0)
  const [wonReward, setWonReward] = useState<Reward | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [vipStatus, setVipStatus] = useState<{ vip_until: string } | null>(null)
  const [countdown, setCountdown] = useState("")
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  const supabase = createBrowserClient()

  const selectedCase = casesData.find(c => c.id === selectedCaseId) || casesData[0]

  const checkCanOpenFreeCase = useCallback(async (userId: string) => {
    try {
      const { data: lastOpen, error } = await supabase
        .from("case_openings")
        .select("opened_at")
        .eq("user_id", userId)
        .order("opened_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code === 'PGRST116') {
        setCanOpenFreeCase(true)
        setNextOpenTime(null)
        return
      }

      if (!lastOpen) {
        setCanOpenFreeCase(true)
        setNextOpenTime(null)
        return
      }

      const lastOpenDate = new Date(lastOpen.opened_at)
      const twoWeeksLater = new Date(lastOpenDate.getTime() + 14 * 24 * 60 * 60 * 1000)
      const now = new Date()

      if (now >= twoWeeksLater) {
        setCanOpenFreeCase(true)
        setNextOpenTime(null)
      } else {
        setCanOpenFreeCase(false)
        setNextOpenTime(twoWeeksLater)
      }
    } catch (err) {
      setCanOpenFreeCase(true)
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

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single()
    setUserProfile(data)
  }, [supabase])

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        await checkCanOpenFreeCase(user.id)
        await fetchVipStatus(user.id)
        await fetchUserProfile(user.id)
      }

      setLoading(false)
    }

    checkUser()
  }, [supabase, checkCanOpenFreeCase, fetchVipStatus, fetchUserProfile])

  useEffect(() => {
    if (!nextOpenTime) return

    const interval = setInterval(() => {
      const now = new Date()
      const diff = nextOpenTime.getTime() - now.getTime()

      if (diff <= 0) {
        setCanOpenFreeCase(true)
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

  const getRandomReward = (rewardsPool: Reward[]): Reward => {
    const random = Math.random() * 100
    let cumulative = 0

    for (const reward of rewardsPool) {
      cumulative += reward.probability
      if (random <= cumulative) {
        return reward
      }
    }

    return rewardsPool[0]
  }

  const handleOpenCase = async () => {
    if (!user || isSpinning) return

    // Case validation
    if (selectedCase.price > 0) {
       if (!userProfile || (userProfile.balance || 0) < selectedCase.price) {
          setToast({ message: "არასაკმარისი ბალანსი!", type: 'error' })
          return
       }
    } else {
       if (!canOpenFreeCase) {
          setToast({ message: "უფასო ქეისი ჯერ არ არის ხელმისაწვდომი", type: 'error' })
          return
       }
    }

    setIsSpinning(true)
    setShowResult(false)
    setWonReward(null)

    const finalReward = getRandomReward(selectedCase.rewards)

    try {
      // 1. Handle Balance Deduction for paid
      if (selectedCase.price > 0) {
        const { error: deductError } = await supabase.rpc('deduct_balance', {
          user_id: user.id,
          amount: selectedCase.price
        })

        if (deductError) {
          setToast({ message: "ბალანსის ჩამოჭრა ვერ მოხერხდა", type: 'error' })
          setIsSpinning(false)
          return
        }
        
        // optimistic update
        setUserProfile((prev: any) => ({ ...prev, balance: (prev.balance || 0) - selectedCase.price }))
      }

      // 2. Save the opening record
      const { error: saveError } = await supabase.from("case_openings").insert({
        user_id: user.id,
        reward: finalReward.id,
      })

      if (saveError) {
        console.error("Error saving case opening:", saveError)
        setIsSpinning(false)
        setToast({ message: "შეცდომა ქეისის შენახვისას", type: 'error' })
        return
      }

      // 3. Set cooldown on frontend immediately for free case
      if (selectedCase.price === 0) {
        setCanOpenFreeCase(false)
        const nextDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        setNextOpenTime(nextDate)
      }

      // 4. Start the animation
      let spinCount = 0
      const maxSpins = 30
      const spinInterval = setInterval(() => {
        setSpinningIndex((prev) => (prev + 1) % selectedCase.rewards.length)
        spinCount++

        if (spinCount >= maxSpins) {
          clearInterval(spinInterval)

          let slowCount = 0
          const slowInterval = setInterval(() => {
            setSpinningIndex((prev) => (prev + 1) % selectedCase.rewards.length)
            slowCount++

            if (slowCount >= 10) {
              clearInterval(slowInterval)
              setSpinningIndex(selectedCase.rewards.findIndex((r) => r.id === finalReward.id))
              setWonReward(finalReward)
              setShowResult(true)
              setIsSpinning(false)
              
              // 5. Finally update VIP status if applicable
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
            <p className="text-muted-foreground font-light mb-10 text-lg">გთხოვთ გაიაროთ ავტორიზაცია ქეისების გასახსნელად</p>
            <Button asChild variant="premium" className="w-full py-6 text-lg">
              <Link href="/auth/login">შესვლა</Link>
            </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-32 px-4 overflow-hidden relative">
      {toast && <LuxuryToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      
      {/* Background Decorative Circles */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 bg-mesh opacity-20" />
      
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6 animate-reveal">
          <div>
            <h1 className="text-5xl md:text-7xl font-black mb-2 text-white tracking-tighter italic uppercase">
              Mystery <span className="text-primary tracking-normal">Cases</span>
            </h1>
            <p className="text-muted-foreground font-bold tracking-widest uppercase text-xs italic">გახსენი ქეისები და მიიღე VIP სტატუსები</p>
          </div>
          
          {userProfile && (
             <div className="glass-card px-8 py-4 flex items-center gap-4 border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.1)] group hover:scale-105 transition-all">
                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-400 group-hover:bg-green-500/20 transition-colors">
                   <Wallet className="w-6 h-6" />
                </div>
                <div>
                   <div className="text-[10px] font-black uppercase text-green-400/50 tracking-widest italic">ბალანსი</div>
                   <div className="text-2xl font-black text-white italic">{userProfile.balance || 0} ₾</div>
                </div>
             </div>
          )}
        </div>

        {/* Case Selector Tabs */}
        <div className="flex flex-wrap gap-4 mb-16 justify-center animate-reveal" style={{ animationDelay: '0s' }}>
           {casesData.map(c => {
             const Icon = c.icon
             const isSelected = selectedCaseId === c.id
             
             return (
               <button
                  key={c.id}
                  onClick={() => {
                     setSelectedCaseId(c.id)
                     setShowResult(false)
                     setWonReward(null)
                     setIsSpinning(false)
                     setSpinningIndex(0)
                  }}
                  className={`relative p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-center gap-2 group overflow-hidden ${
                     isSelected 
                     ? `border-${c.themeColor} bg-${c.themeColor}/10 scale-105 shadow-[0_0_30px_rgba(var(--${c.themeColor}-rgb),0.2)]` 
                     : `border-white/5 bg-black/40 hover:bg-white/5 hover:border-white/10`
                  }`}
               >
                  <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform ${isSelected ? `text-${c.themeColor}` : 'text-muted-foreground'}`}>
                     <Icon className="w-8 h-8" />
                  </div>
                  <div className="text-center mt-2">
                     <h3 className={`font-black uppercase tracking-tighter italic text-lg ${isSelected ? `text-${c.themeColor}` : 'text-white'}`}>{c.name}</h3>
                     <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-white/70' : 'text-white/40'}`}>
                        {c.price === 0 ? 'FREE' : `${c.price} GEL`}
                     </span>
                  </div>
               </button>
             )
           })}
        </div>

        <div className="relative mb-24 lg:mb-32">
          <div className="max-w-xl mx-auto">
             <div className="relative group">
                <div className={`absolute -inset-1 bg-gradient-to-r from-primary via-${selectedCase.themeColor} to-primary rounded-[3rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000 ${isSpinning ? 'animate-pulse' : ''}`} />
                
                <div className={`glass-card p-4 relative overflow-hidden transition-all duration-700 ${
                  showResult && wonReward ? `ring-2 ring-${selectedCase.themeColor} shadow-[0_0_50px_rgba(var(--${selectedCase.themeColor}-rgb),0.3)]` : ''
                }`}>
                   <div className="aspect-square flex items-center justify-center p-8 lg:p-16">
                      {isSpinning && !showResult ? (
                         <div className="text-center animate-bounce">
                             <div className={`w-36 h-36 mx-auto mb-8 rounded-[2.5rem] glass border border-white/10 flex items-center justify-center shadow-2xl transition-all duration-300 bg-${selectedCase.themeColor}/5`}>
                                {(() => {
                                  const Icon = selectedCase.rewards[spinningIndex].icon
                                  return <Icon className={`w-16 h-16 ${selectedCase.rewards[spinningIndex].color}`} />
                                })()}
                             </div>
                             <p className={`text-3xl font-black uppercase italic tracking-widest ${selectedCase.rewards[spinningIndex].color}`}>
                                {selectedCase.rewards[spinningIndex].name}
                             </p>
                         </div>
                      ) : showResult && wonReward ? (
                         <div className="text-center animate-reveal">
                             <div className={`absolute inset-0 bg-${selectedCase.themeColor}/5 animate-pulse`} />
                             <div className={`w-44 h-44 mx-auto mb-10 rounded-[3rem] glass border-4 ${wonReward.borderColor} flex items-center justify-center shadow-[0_0_80px_rgba(255,255,255,0.1)] animate-float-subtle`}>
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
                            <div className={`w-52 h-52 mx-auto mb-12 rounded-[3.5rem] glass border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-700 group-hover:border-${selectedCase.themeColor}/50 relative`}>
                               {(() => {
                                  const Icon = selectedCase.icon
                                  return <Icon className={`w-24 h-24 text-${selectedCase.themeColor} animate-float-subtle`} />
                               })()}
                               <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 rounded-full blur-3xl transition-opacity" />
                            </div>
                            <div className="space-y-2 relative z-10">
                               <p className={`text-3xl font-black italic tracking-tighter uppercase text-${selectedCase.themeColor}`}>{selectedCase.name}</p>
                               <p className="text-muted-foreground text-sm font-bold tracking-[0.4em] uppercase">{selectedCase.description}</p>
                            </div>
                         </div>
                      )}
                   </div>
                </div>
             </div>
          </div>

          <div className="text-center mt-12 flex flex-col items-center">
             {selectedCase.price === 0 && !canOpenFreeCase ? (
                <div className="glass-card p-8 inline-block animate-reveal">
                   <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-12 h-12 rounded-2xl glass border border-white/10 flex items-center justify-center">
                         <Clock className="w-6 h-6 text-primary" />
                      </div>
                      <div className="text-left">
                         <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">შემდეგი გახსნა</div>
                         <div className="text-3xl font-black text-white italic tracking-tight">{countdown}</div>
                      </div>
                   </div>
                </div>
             ) : (
                <Button
                  onClick={handleOpenCase}
                  disabled={isSpinning || (selectedCase.price > 0 && (!userProfile || (userProfile?.balance || 0) < selectedCase.price))}
                  className={`h-20 px-16 text-2xl group relative overflow-hidden font-black italic uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-white shadow-[0_0_40px_rgba(16,185,129,0.4)] disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isSpinning ? 'იხსნება...' : `გახსენი (${selectedCase.price === 0 ? 'FREE' : `${selectedCase.price} ₾`})`}
                  <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-[100%] transition-all duration-1000" />
                </Button>
             )}

             {selectedCase.price > 0 && userProfile && (userProfile?.balance || 0) < selectedCase.price && !isSpinning && (
                <div className="mt-6 text-red-400 font-bold uppercase tracking-widest text-xs italic animate-pulse">
                   არასაკმარისი ბალანსი. (მიმდინარე: {userProfile.balance || 0} ₾)
                </div>
             )}
          </div>
        </div>

        <div className="mt-20">
           <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-8 text-center">ალბათობები / Rewards</h3>
           <div className={`grid grid-cols-2 md:grid-cols-4 gap-6`}>
               {selectedCase.rewards.map((reward, idx) => (
                 <div
                   key={reward.id}
                   className={`glass-card p-8 text-center group animate-reveal hover:scale-105 transition-all`}
                   style={{ animationDelay: `${idx * 0.1}s` }}
                 >
                   <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl glass border border-white/5 flex items-center justify-center group-hover:border-${selectedCase.themeColor}/50 transition-colors`}>
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
        </div>

        {vipStatus && (
           <div className="mt-24 mb-12 animate-reveal">
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
      </div>
    </div>
  )
}
