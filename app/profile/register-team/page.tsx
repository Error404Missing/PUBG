"use client"

import type React from "react"
import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Shield, Zap, Target, Star, ChevronLeft, ArrowRight, Hash } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

function RegisterTeamContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scheduleId = searchParams.get("schedule_id")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    teamName: "",
    teamTag: "",
    playersCount: "4",
    mapsCount: "1",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setError("გთხოვთ გაიაროთ ავტორიზაცია")
      setIsLoading(false)
      return
    }

    try {
      const { data: newTeam, error } = await supabase.from("teams").insert({
        team_name: formData.teamName,
        team_tag: formData.teamTag,
        leader_id: user.id,
        players_count: Number.parseInt(formData.playersCount),
        maps_count: Number.parseInt(formData.mapsCount),
        status: "pending",
      }).select().single()

      if (error) throw error

      // If we have a scheduleId, automatically request the game
      if (scheduleId && newTeam) {
        try {
          await fetch("/api/scrim-request", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ team_id: newTeam.id, schedule_id: scheduleId }),
          })
        } catch (e) {
          console.error("Auto request failed:", e)
        }
      }

      // Send notification
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "გუნდი რეგისტრირებულია 📝",
        message: scheduleId 
          ? `თქვენი გუნდი "${formData.teamName}" წარმატებით დარეგისტრირდა და თამაშის მოთხოვნა გაიგზავნა. გთხოვთ დაელოდოთ ადმინისტრაციის პასუხს.`
          : `თქვენი გუნდი "${formData.teamName}" წარმატებით დარეგისტრირდა და იმყოფება განხილვის პროცესში. გთხოვთ დაელოდოთ ადმინისტრაციის პასუხს.`,
        type: "info",
      })

      router.push("/profile")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "შეცდომა მოხდა")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,180,0,0.05),transparent_70%)]" />
      
      <div className="container mx-auto max-w-4xl relative">
        <Link 
          href="/profile" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">უკან დაბრუნება</span>
        </Link>

        <div className="mb-16 animate-reveal">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 rounded-[2rem] glass border border-primary/20 flex items-center justify-center relative group">
              <Users className="w-10 h-10 text-primary transition-transform group-hover:scale-110 duration-500" />
              <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                Unit <span className="text-primary tracking-normal">{scheduleId ? "Deployment" : "Enlistment"}</span>
              </h1>
              <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4">
                {scheduleId 
                  ? "შეავსეთ მონაცემები თამაშში მონაწილეობის მისაღებად" 
                  : "ახალი გუნდის რეგისტრაცია Arena-სთვის"}
              </p>
            </div>
          </div>
        </div>

        <div className="glass-card p-1 animate-reveal" style={{ animationDelay: '0.1s' }}>
           <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-12">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">გუნდის ინფორმაცია</h2>
                 <Badge variant="outline" className="border-primary/20 text-primary animate-pulse">Required_Data</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="teamName" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      გუნდის დასახელება
                    </Label>
                    <div className="relative group">
                       <Input
                         id="teamName"
                         name="teamName"
                         required
                         placeholder="შეიყვანეთ სახელი"
                         value={formData.teamName}
                         onChange={handleChange}
                         className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 transition-all font-bold pl-12"
                       />
                       <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="teamTag" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      გუნდის ტეგი (TAG)
                    </Label>
                    <div className="relative group">
                       <Input
                         id="teamTag"
                         name="teamTag"
                         required
                         placeholder="TAG"
                         value={formData.teamTag}
                         onChange={handleChange}
                         className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 transition-all font-bold pl-12 uppercase"
                       />
                       <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                  <div className="space-y-3">
                    <Label htmlFor="playersCount" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      ოპერატორების რაოდენობა
                    </Label>
                    <Select
                      value={formData.playersCount}
                      onValueChange={(value) => setFormData({ ...formData, playersCount: value })}
                    >
                      <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-2xl focus:ring-primary/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-2xl overflow-hidden p-2">
                        <SelectItem value="1" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">1 მოთამაშე</SelectItem>
                        <SelectItem value="2" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">2 მოთამაშე</SelectItem>
                        <SelectItem value="3" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">3 მოთამაშე</SelectItem>
                        <SelectItem value="4" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">4 მოთამაშე</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-3">
                    <Label htmlFor="mapsCount" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      მაპების რაოდენობა
                    </Label>
                    <Select
                      value={formData.mapsCount}
                      onValueChange={(value) => setFormData({ ...formData, mapsCount: value })}
                    >
                      <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-2xl focus:ring-primary/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-2xl overflow-hidden p-2">
                        <SelectItem value="1" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">1 მაპი</SelectItem>
                        <SelectItem value="2" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">2 მაპი</SelectItem>
                        <SelectItem value="3" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">3 მაპი</SelectItem>
                        <SelectItem value="4" className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">4 მაპი</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {error && (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                    <p className="text-sm text-red-400 italic font-bold flex items-center gap-3">
                       <Zap className="w-5 h-5" />
                       შეცდომა: {error}
                    </p>
                  </div>
                )}

                <div className="pt-8 flex flex-col items-center gap-6">
                   <div className="flex items-center gap-3 text-muted-foreground italic text-xs font-light">
                      <Shield className="w-4 h-4 text-primary" />
                      გუნდის რეგისტრაციით თქვენ ეთანხმებით Arena-ს წესებსა და პირობებს.
                   </div>
                   
                   <Button 
                     type="submit" 
                     className="w-full h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest group relative overflow-hidden transition-transform active:scale-[0.98]" 
                     disabled={isLoading}
                     variant="premium"
                   >
                     <span className="relative z-10 flex items-center gap-3">
                        {isLoading ? "რეგისტრაცია..." : "გუნდის რეგისტრაცია"}
                        {!isLoading && <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform duration-500" />}
                     </span>
                   </Button>
                </div>
              </form>
           </div>
        </div>

        {/* Tactical Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 mt-12 animate-reveal" style={{ animationDelay: '0.2s' }}>
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <Zap className="w-8 h-8 text-primary" />
              <h3 className="font-black italic text-white uppercase tracking-tighter">Fast Approval</h3>
              <p className="text-xs text-muted-foreground italic leading-relaxed">თქვენი გუნდი განიხილება ადმინისტრაციის მიერ 24 საათში.</p>
           </div>
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <Shield className="w-8 h-8 text-primary" />
              <h3 className="font-black italic text-white uppercase tracking-tighter">Secure Enlistment</h3>
              <p className="text-xs text-muted-foreground italic leading-relaxed">ყველა მონაცემი დაცულია Arena-ს უსაფრთხოების სისტემებით.</p>
           </div>
           <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
              <Star className="w-8 h-8 text-primary" />
              <h3 className="font-black italic text-white uppercase tracking-tighter">Elite Status</h3>
              <p className="text-xs text-muted-foreground italic leading-relaxed">დადასტურებული გუნდი იღებს წვდომას ექსკლუზიურ სკრიმებზე.</p>
           </div>
        </div>
      </div>
    </div>
  )
}

export default function RegisterTeamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-white italic font-black uppercase tracking-widest">იტვირთება...</div>}>
      <RegisterTeamContent />
    </Suspense>
  )
}
