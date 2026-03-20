"use client"

import type React from "react"
import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users, Shield, Zap, Target, Star, ChevronLeft, ArrowRight, Hash, ImagePlus, X } from "lucide-react"
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
  const [maxAllowedMaps, setMaxAllowedMaps] = useState<number>(4)

  // Logo state
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    teamName: "",
    teamTag: "",
    playersCount: "4",
    maps_count: "1",
  })
  const [cooldown, setCooldown] = useState<{ active: boolean, timeLeft: string | null }>({ active: false, timeLeft: null })
  const [isRejected, setIsRejected] = useState(false)
  const [banInfo, setBanInfo] = useState<{ isBanned: boolean, reason?: string, expiresAt?: string } | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
      } else {
        setUserId(user.id)
        supabase.from("profiles").select("last_team_request_at").eq("id", user.id).single().then(({ data }) => {
          if (data?.last_team_request_at) {
            const lastRequest = new Date(data.last_team_request_at).getTime()
            const now = new Date().getTime()
            const diff = now - lastRequest
            const twelveHours = 12 * 60 * 60 * 1000
            
            if (diff < twelveHours) {
              const remaining = twelveHours - diff
              const hours = Math.floor(remaining / (60 * 60 * 1000))
              const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000))
              setCooldown({ 
                active: true, 
                timeLeft: `${hours} საათი და ${minutes} წუთი` 
              })
            }
          }
        })

        // Check for rejected or blocked teams
        supabase.from("teams")
          .select("status, ban_reason, ban_until")
          .eq("leader_id", user.id)
          .or("status.eq.rejected,status.eq.blocked")
          .order("created_at", { ascending: false })
          .limit(1)
          .then(({ data }) => {
            if (data && data.length > 0) {
              const latestTeam = data[0]
              if (latestTeam.status === "rejected") {
                setIsRejected(true)
              } else if (latestTeam.status === "blocked") {
                const banUntil = latestTeam.ban_until ? new Date(latestTeam.ban_until) : null
                if (!banUntil || banUntil > new Date()) {
                  setBanInfo({ 
                    isBanned: true, 
                    reason: latestTeam.ban_reason, 
                    expiresAt: latestTeam.ban_until 
                  })
                }
              }
            }
          })

        // Fetch schedule maps_count if present
        if (scheduleId) {
          supabase.from("schedules")
            .select("maps_count")
            .eq("id", scheduleId)
            .single()
            .then(({ data }) => {
              if (data?.maps_count) {
                const count = Number(data.maps_count)
                setMaxAllowedMaps(count)
                setFormData(prev => ({ ...prev, maps_count: String(count) }))
              }
            })
        }
      }
    })
  }, [router, scheduleId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("გთხოვთ ატვირთოთ მხოლოდ სურათის ფაილი")
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("ლოგოს ზომა არ უნდა აღემატებოდეს 2MB-ს")
      return
    }

    setError(null)
    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLogoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ""
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

    if (cooldown.active) {
      setError(`გთხოვთ დაელოდოთ. ახალი მოთხოვნის გაგზავნა შეგეძლებათ ${cooldown.timeLeft}-ში`)
      setIsLoading(false)
      return
    }

    if (isRejected) {
      setError("თქვენი გუნდი უარყოფილია ადმინისტრაციის მიერ და ვეღარ გააგზავნით ახალ მოთხოვნას.")
      setIsLoading(false)
      return
    }

    if (banInfo?.isBanned) {
      setError(`თქვენი გუნდი დისკვალიფიცირებულია. მიზეზი: ${banInfo.reason || "წესების დარღვევა"}. ვადა: ${banInfo.expiresAt ? new Date(banInfo.expiresAt).toLocaleString('ka-GE') : "სამუდამოდ"}`)
      setIsLoading(false)
      return
    }

    try {
      // 1. Upload logo if provided
      let logoUrl: string | null = null
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop()
        const filePath = `${user.id}/${Date.now()}.${fileExt}`
        
        const { error: uploadError } = await supabase.storage
          .from("team-logos")
          .upload(filePath, logoFile, { upsert: true })

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from("team-logos")
            .getPublicUrl(filePath)
          logoUrl = publicUrlData.publicUrl
        }
      }

      // 2. Create team in teams table
      const { data: newTeam, error: teamError } = await supabase.from("teams").insert({
        team_name: formData.teamName,
        team_tag: formData.teamTag,
        leader_id: user.id,
        players_count: Number.parseInt(formData.playersCount),
        maps_count: Number.parseInt(formData.maps_count),
        schedule_id: scheduleId,
        status: "pending",
        logo_url: logoUrl,
      }).select().single()

      if (teamError) {
        if (teamError.code === '23505') throw new Error("ეს სახელი უკვე დაკავებულია")
        throw teamError
      }

      // 3. CRITICAL: Create scrim_request (this is what the whole system depends on!)
      if (scheduleId && newTeam) {
        const { error: reqError } = await supabase.from("scrim_requests").insert({
          team_id: newTeam.id,
          schedule_id: scheduleId,
          status: "pending",
          preferred_maps: Number.parseInt(formData.maps_count),
        })
        if (reqError) {
          console.error("Scrim request creation failed:", reqError)
          // Don't block — team was created, admin can manually link
        }
      }

      // 4. Send admin notifications directly
      try {
        const { data: admins } = await supabase
          .from("profiles")
          .select("id")
          .or("is_admin.eq.true,role.eq.admin")
        if (admins && admins.length > 0) {
          await supabase.from("notifications").insert(
            admins.map(a => ({
              user_id: a.id,
              title: "ახალი თამაშის მოთხოვნა 🎮",
              message: `გუნდმა '${formData.teamName}' გამოგზავნა თამაშის მოთხოვნა.`,
              type: "info",
              is_read: false,
            }))
          )
        }
      } catch (_) {}

      // 5. Notify the user
      await supabase.from("notifications").insert({
        user_id: user.id,
        title: "მოთხოვნა გაგზავნილია ⚔️",
        message: `თქვენი გუნდი "${formData.teamName}" რეგისტრირებულია და ადმინისტრაციის განხილვაშია.`,
        type: "info",
      })

      router.push("/profile")
    } catch (error: any) {
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
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter">გუნდის ინფორმაცია</h2>
                 <Badge variant="outline" className="border-primary/20 text-primary animate-pulse">Required_Data</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Team Logo Upload */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      გუნდის ლოგო
                    </Label>
                    <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic px-2 py-0.5 rounded-full border border-white/10 bg-white/5">
                      არასავალდებულო
                    </span>
                  </div>

                  <div className="relative">
                    {logoPreview ? (
                      /* Preview Mode */
                      <div className="flex items-center gap-6 p-5 rounded-2xl bg-black/40 border border-primary/30">
                        <div className="relative flex-shrink-0">
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-[0_0_30px_-5px_rgba(255,180,0,0.3)]">
                            <img
                              src={logoPreview}
                              alt="Team Logo Preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={removeLogo}
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center transition-colors shadow-lg"
                          >
                            <X className="w-3 h-3 text-white" />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white italic">{logoFile?.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                            {logoFile ? (logoFile.size / 1024).toFixed(0) + " KB" : ""}
                          </p>
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="mt-3 text-[10px] font-black text-primary uppercase tracking-widest italic hover:text-primary/80 transition-colors"
                          >
                            შეცვლა
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Upload Button */
                      <button
                        type="button"
                        onClick={() => logoInputRef.current?.click()}
                        className="w-full h-28 rounded-2xl border-2 border-dashed border-white/10 hover:border-primary/40 bg-black/20 hover:bg-primary/5 transition-all duration-300 flex flex-col items-center justify-center gap-3 group"
                      >
                        <div className="w-12 h-12 rounded-xl glass border border-white/10 group-hover:border-primary/30 flex items-center justify-center transition-all group-hover:scale-110 duration-300">
                          <ImagePlus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-bold text-muted-foreground group-hover:text-white transition-colors italic">
                            ლოგოს ასატვირთად დააჭირეთ
                          </p>
                          <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest mt-0.5">
                            PNG, JPG, WEBP — Max 2MB
                          </p>
                        </div>
                      </button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoChange}
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-white/5" />

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
                    <Label htmlFor="maps_count" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      მაპების რაოდენობა
                    </Label>
                    <Select
                      value={formData.maps_count}
                      onValueChange={(value) => setFormData({ ...formData, maps_count: value })}
                    >
                      <SelectTrigger className="h-16 bg-black/40 border-white/10 rounded-2xl focus:ring-primary/50 font-bold px-6">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-white/10 text-white rounded-2xl overflow-hidden p-2">
                        {[1, 2, 3, 4].filter(n => n <= maxAllowedMaps).map(n => (
                          <SelectItem key={n} value={String(n)} className="rounded-xl focus:bg-primary/20 focus:text-primary transition-colors py-3">
                            {n} მაპი
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {cooldown.active && (
                  <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl">
                    <p className="text-sm text-yellow-400 italic font-bold flex items-center gap-3">
                       <Shield className="w-5 h-5" />
                       ლიმიტი: ახალი მოთხოვნის გაგზავნა შეგეძლებათ {cooldown.timeLeft}-ში
                    </p>
                  </div>
                )}

                {error && (
                  <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl animate-shake">
                    <p className="text-sm text-red-400 italic font-bold flex items-center gap-3">
                       <Zap className="w-5 h-5" />
                       შეცდომა: {error}
                    </p>
                  </div>
                )}

                <div className="pt-8 flex flex-col items-center gap-6">
                   <div className="flex items-center gap-3 text-muted-foreground italic text-xs font-light text-center px-4">
                      <Shield className="w-4 h-4 text-primary flex-shrink-0" />
                      გაითვალისწინეთ, რომ გუნდი და სტატუსი დროებითია (10 საათი).
                   </div>
                   
                   <Button 
                     type="submit" 
                     className="w-full h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest group relative overflow-hidden transition-transform active:scale-[0.98]" 
                     disabled={isLoading || cooldown.active}
                     variant="premium"
                   >
                     <span className="relative z-10 flex items-center gap-3">
                        {isLoading ? "იგზავნება..." : "მოთხოვნის გაგზავნა"}
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
