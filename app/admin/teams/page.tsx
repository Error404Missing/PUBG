"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Check, X, Ban, Crown, Trash2, Users, 
  MapPin, ChevronLeft, Target, Shield, 
  Search, Filter, Activity, Save, RefreshCcw, ArrowRight, Settings2, Loader2, CheckCircle2, AlertCircle, Zap
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { CustomConfirm } from "@/components/ui/custom-confirm"
import { LuxuryToast } from "@/components/ui/luxury-toast"

type Team = {
  id: string
  team_name: string
  team_tag: string
  status: string
  is_vip: boolean
  slot_number: number | null
  players_count: number
  maps_count: number
  leader?: {
    username: string
  }
  profiles?: {
    username: string
  }
}

export default function AdminTeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const [slotValue, setSlotValue] = useState<string>("")
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, teamId: string | null }>({
    isOpen: false,
    teamId: null
  })
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)


  useEffect(() => {
    checkAuth()
    fetchTeams()
  }, [filter])

  const checkAuth = async () => {
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

    if (!profile?.is_admin) {
      router.push("/")
    }
  }

  const [isSettingUp, setIsSettingUp] = useState(false)

  const handleSystemSetup = async () => {
    setIsSettingUp(true)
    try {
      // 1. Fix Storage
      console.log("Starting Storage Setup...")
      const storageRes = await fetch("/api/admin/setup-storage")
      const storageData = await storageRes.json()
      
      if (!storageData.success) {
        throw new Error(storageData.error || "Storage setup failed")
      }

      // 2. Fix RLS
      console.log("Starting RLS Sync...")
      const rlsRes = await fetch("/api/admin/fix-rls", { method: 'POST' })
      const rlsData = await rlsRes.json()

      if (storageData.success && rlsData.success) {
        setToast({ message: "სისტემა წარმატებით განახლდა და გასწორდა", type: 'success' })
        fetchTeams()
      } else {
        setToast({ message: "ზოგიერთი კომპონენტი ვერ გასწორდა: " + (rlsData.error || ""), type: 'error' })
      }
    } catch (error: any) {
       console.error("System Setup Error:", error)
       setToast({ message: "შეცდომა: " + (error.message || "სერვერთან კავშირის პრობლემა"), type: 'error' })
    } finally {
      setIsSettingUp(false)
    }
  }

  const fetchTeams = async () => {
    setIsLoading(true)
    const supabase = createClient()

    console.log("Admin: Fetching teams with filter:", filter)

    // Robust fetch using explicit relationship syntax
    let query = supabase.from("teams").select(`
      *,
      profiles(username)
    `).order("created_at", {
      ascending: false,
    })

    if (filter === "vip") {
      query = query.eq("is_vip", true)
    } else if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data, error } = await query

    if (error) {
       console.error("Admin Teams fetch error:", error)
       setToast({ message: "გუნდების წამოღების შეცდომა: " + error.message, type: 'error' })
       setIsLoading(false)
       return
    }

    console.log("Admin Teams Raw Data:", JSON.stringify(data, null, 2))
    
    if (data && data.length === 0) {
      console.log("Warning: Query returned 0 teams. Filter:", filter)
    }

    setTeams((data as any[]) || [])
    setIsLoading(false)
  }

  const updateTeamStatus = async (teamId: string, status: string) => {
    const supabase = createClient()
    
    // Get team info for notification
    const { data: teamData } = await supabase
      .from("teams")
      .select("leader_id, team_name")
      .eq("id", teamId)
      .single()

    const { error } = await supabase.from("teams").update({ status }).eq("id", teamId)

    if (!error && teamData) {
      // Send notification
      const isApproved = status === "approved"
      const isRejected = status === "rejected"
      const isBlocked = status === "blocked"
      
      if (isApproved || isRejected || isBlocked) {
        await supabase.from("notifications").insert({
          user_id: teamData.leader_id,
          title: isApproved ? "თამაში დადასტურდა! ✅" : isBlocked ? "თამაში დაიბლოკა 🚫" : "თამაში უარყოფილია ❌",
          message: isApproved 
            ? `თქვენი მოთხოვნა პრეკზე თამაშზე დადასტურდა. დაელოდეთ Team List-ს, რომელსაც ნახავთ გუნდების სექციაში.`
            : isBlocked ? `თქვენი გუნდის "${teamData.team_name}" მოთხოვნა დაბლოკილია ადმინისტრაციის მიერ.` 
            : `სამწუხაროდ, თქვენი გუნდის "${teamData.team_name}" მოთხოვნა უარყოფილია ადმინისტრაციის მიერ.`,
          type: isApproved ? "success" : "error",
        })
      }
      
      fetchTeams()
    } else if (error) {
       console.error("Status update error:", error)
       setToast({ message: "შეცდომა სტატუსის განახლებისას: " + error.message, type: 'error' })
    }
  }

  const toggleVIP = async (teamId: string, currentVipStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("teams").update({ is_vip: !currentVipStatus }).eq("id", teamId)

    if (!error) {
      fetchTeams()
    }
  }

  const updateSlot = async (teamId: string) => {
    const supabase = createClient()
    const slot = slotValue ? Number.parseInt(slotValue) : null
    const { error } = await supabase.from("teams").update({ slot_number: slot }).eq("id", teamId)

    if (!error) {
      setEditingSlot(null)
      setSlotValue("")
      fetchTeams()
    }
  }

  const deleteTeam = async (teamId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("teams").delete().eq("id", teamId)

    if (!error) {
      setToast({ message: "გუნდი წარმატებით წაიშალა", type: 'success' })
      fetchTeams()
    } else {
       console.error("Delete team error:", error)
       setToast({ message: "წაშლის შეცდომა: " + error.message, type: 'error' })
    }
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-7xl relative">
        <Link 
          href="/admin" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-12 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">მართვის პანელი</span>
        </Link>

        {/* Header */}
        <div className="mb-16 animate-reveal">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] glass border border-blue-500/20 flex items-center justify-center relative group">
                <Users className="w-10 h-10 text-blue-400 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Unit <span className="text-blue-400 tracking-normal">Control</span></h1>
                <div className="flex items-center gap-4 mt-4">
                  <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs italic">გუნდების რეგისტრაცია და სტატუსები</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={fetchTeams}
                    className="h-7 border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest px-3 rounded-lg hover:bg-blue-500/5"
                  >
                    <RefreshCcw className="w-3 h-3 mr-1.5" /> Force Sync
                  </Button>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 glass p-2 rounded-2xl border border-white/5">
              {[
                { id: "all", label: "ყველა", color: "blue" },
                { id: "pending", label: "განხილვაში", color: "yellow" },
                { id: "approved", label: "დადასტურებული", color: "emerald" },
                { id: "vip", label: "VIP", color: "secondary" },
                { id: "rejected", label: "უარყოფილი", color: "rose" },
                { id: "blocked", label: "დაბლოკილი", color: "red" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border ${
                    filter === f.id 
                      ? f.id === 'vip' ? 'bg-secondary/10 border-secondary/30 text-secondary' : `bg-${f.color}-500/10 border-${f.color}-500/30 text-${f.color}-400` 
                      : 'border-transparent text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center gap-4 mt-8">
            <Button 
              onClick={handleSystemSetup}
              disabled={isSettingUp}
              variant="outline"
              className="h-16 px-8 rounded-2xl border-white/5 hover:bg-white/5 text-muted-foreground font-black uppercase tracking-widest italic flex items-center gap-3 active:scale-95 transition-all"
            >
              {isSettingUp ? <Loader2 className="w-5 h-5 animate-spin" /> : <Settings2 className="w-5 h-5" />}
              {isSettingUp ? "Initializing..." : "System Setup"}
            </Button>
            <button 
              onClick={fetchTeams}
              className="w-16 h-16 rounded-2xl glass border border-white/5 flex items-center justify-center text-muted-foreground hover:text-primary transition-all active:scale-95"
            >
              <Activity className="w-6 h-6" />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 text-center animate-reveal">
             <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
             <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">მონაცემების სინქრონიზაცია...</p>
          </div>
        ) : (
          <div className="grid gap-8 animate-reveal" style={{ animationDelay: '0.1s' }}>
            {teams.length > 0 ? (
              teams.map((team) => (
                <div
                  key={team.id}
                  className={`glass-card p-1 transition-all duration-500 hover:scale-[1.01] ${
                    team.is_vip ? 'shadow-[0_0_50px_-12px_rgba(255,180,0,0.15)]' : ''
                  }`}
                >
                  <div className="p-8 lg:p-10">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-10">
                      <div className="flex items-center gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border ${
                          team.is_vip ? 'bg-secondary/10 border-secondary/20' : 'bg-blue-500/10 border-blue-500/20'
                        }`}>
                           {team.is_vip ? <Crown className="w-8 h-8 text-secondary animate-pulse-soft" /> : <Shield className="w-8 h-8 text-blue-400" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                             <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none">{team.team_name}</h2>
                             <span className="text-xl font-black text-white/20 italic tracking-[0.2em]">[{team.team_tag}]</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                             <Users className="w-3 h-3 text-primary" />
                              ლიდერი: <span className="text-white">{
                                team.leader?.username || 
                                team.profiles?.username || 
                                "Anonymous"
                              }</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <Badge className={`px-4 py-1.5 uppercase italic font-black text-[9px] tracking-widest border ${
                          team.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                          team.status === 'pending' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {team.status === 'approved' ? 'Auth_Verified' : team.status === 'pending' ? 'Pending_Review' : 'Denied'}
                        </Badge>
                        {team.is_vip && <Badge variant="gold" className="px-4 py-1.5 font-black text-[9px] tracking-widest">Elite_Unit</Badge>}
                        {team.slot_number !== null && (
                           <Badge variant="outline" className="border-blue-500/20 text-blue-400 italic font-black text-[9px] tracking-widest bg-blue-500/5">
                              Slot #{team.slot_number}
                           </Badge>
                        )}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-10">
                       <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">ოპერატორები</div>
                          <div className="text-2xl font-black text-white italic flex items-center gap-3">
                             <Users className="w-5 h-5 text-blue-400" />
                             {team.players_count} / 4
                          </div>
                       </div>
                       <div className="glass p-6 rounded-2xl border border-white/5 space-y-2">
                          <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">მაპების რაოდენობა</div>
                          <div className="text-2xl font-black text-white italic flex items-center gap-3">
                             <Target className="w-5 h-5 text-purple-400" />
                             {team.maps_count} Maps
                          </div>
                       </div>
                       <div className="glass p-6 rounded-2xl border border-white/5 flex flex-col justify-center">
                          {editingSlot === team.id ? (
                             <div className="flex gap-2">
                                <Input
                                  type="number"
                                  value={slotValue}
                                  onChange={(e) => setSlotValue(e.target.value)}
                                  placeholder="Slot #"
                                  className="h-10 bg-black/40 border-white/10 rounded-xl focus:border-primary/50 text-xs font-bold"
                                />
                                <Button onClick={() => updateSlot(team.id)} size="sm" className="h-10 px-4 rounded-xl bg-blue-600 font-bold">
                                   <Save className="w-4 h-4" />
                                </Button>
                                <Button onClick={() => setEditingSlot(null)} size="sm" variant="outline" className="h-10 px-4 rounded-xl border-white/10">
                                   <X className="w-4 h-4" />
                                </Button>
                             </div>
                          ) : (
                             <div className="flex flex-col gap-2 h-full">
                                {team.slot_number !== null && (
                                   <div className="text-center py-1 bg-blue-500/10 rounded-lg mb-1">
                                      <span className="text-[10px] font-black text-blue-400 uppercase italic">Active Slot: #{team.slot_number}</span>
                                   </div>
                                )}
                                <Button
                                  onClick={() => {
                                    setEditingSlot(team.id)
                                    setSlotValue(team.slot_number?.toString() || "")
                                  }}
                                  variant="outline"
                                  className="flex-1 border-blue-500/20 text-blue-400 hover:bg-blue-500/5 font-black text-[10px] uppercase tracking-widest rounded-xl"
                                >
                                  {team.slot_number !== null ? "სლოტის შეცვლა" : "სლოტის მინიჭება"}
                                </Button>
                             </div>
                          )}
                       </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-10 border-t border-white/5">
                      <div className="flex flex-wrap gap-2 text-white">
                        {team.status !== "approved" && (
                          <Button
                            onClick={() => updateTeamStatus(team.id, "approved")}
                            className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            დადასტურება
                          </Button>
                        )}
                        {team.status !== "rejected" && (
                          <Button
                            onClick={() => updateTeamStatus(team.id, "rejected")}
                            className="bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                          >
                            <X className="w-4 h-4 mr-2" />
                            უარყოფა
                          </Button>
                        )}
                        {team.status !== "blocked" && (
                          <Button
                            onClick={() => updateTeamStatus(team.id, "blocked")}
                            className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                          >
                            <Ban className="w-4 h-4 mr-2" />
                            დაბლოკვა
                          </Button>
                        )}
                        {team.status !== "pending" && (
                          <Button
                            onClick={() => updateTeamStatus(team.id, "pending")}
                            className="bg-zinc-500/10 hover:bg-zinc-500/20 text-zinc-400 border border-zinc-500/20 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                          >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            აღდგენა
                          </Button>
                        )}
                      </div>

                      <div className="flex gap-2 text-white">
                        <Button
                          onClick={() => toggleVIP(team.id, team.is_vip)}
                          variant="outline"
                          className="border-secondary/20 text-secondary hover:bg-secondary/5 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          {team.is_vip ? "VIP ამოღება" : "VIP სტატუსი"}
                        </Button>
                         <Button
                           onClick={() => setDeleteConfirm({ isOpen: true, teamId: team.id })}
                           variant="outline"
                           className="border-red-500/20 text-red-400 hover:bg-red-500/5 rounded-xl w-12 p-0"
                         >
                           <Trash2 className="w-4 h-4" />
                         </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-20 text-center animate-reveal">
                 <Search className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                 <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">გუნდები არ მოიძებნა</p>
              </div>
            )}
          </div>
        )}
      </div>

      <CustomConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, teamId: null })}
        onConfirm={() => deleteConfirm.teamId && deleteTeam(deleteConfirm.teamId)}
        title="გუნდის წაშლა (ADMIN)"
        description="დარწმუნებული ხართ რომ გსურთ გუნდის წაშლა? ეს ქმედება შეუქცევადია."
        confirmText="წაშლა"
        variant="danger"
      />

      {toast && (
        <LuxuryToast 
          message={toast.message} 
          type={toast.type as any} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}
