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
  Search, Filter, Activity, Save
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

type Team = {
  id: string
  team_name: string
  team_tag: string
  status: string
  is_vip: boolean
  slot_number: number | null
  players_count: number
  maps_count: number
  profiles: {
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

  const fetchTeams = async () => {
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase.from("teams").select("*, profiles(username)").order("created_at", {
      ascending: false,
    })

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data } = await query
    setTeams((data as Team[]) || [])
    setIsLoading(false)
  }

  const updateTeamStatus = async (teamId: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("teams").update({ status }).eq("id", teamId)

    if (!error) {
      fetchTeams()
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
    if (!confirm("დარწმუნებული ხართ რომ გსურთ გუნდის წაშლა?")) return

    const supabase = createClient()
    const { error } = await supabase.from("teams").delete().eq("id", teamId)

    if (!error) {
      fetchTeams()
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
                <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">გუნდების რეგისტრაცია და სტატუსები</p>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 glass p-2 rounded-2xl border border-white/5">
              {[
                { id: "all", label: "ყველა", color: "blue" },
                { id: "pending", label: "განხილვაში", color: "yellow" },
                { id: "approved", label: "დადასტურებული", color: "emerald" },
                { id: "rejected", label: "უარყოფილი", color: "rose" },
                { id: "blocked", label: "დაბლოკილი", color: "red" }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setFilter(f.id)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic border ${
                    filter === f.id 
                      ? `bg-${f.color}-500/10 border-${f.color}-500/30 text-${f.color}-400` 
                      : 'border-transparent text-muted-foreground hover:text-white hover:bg-white/5'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
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
                             <User className="w-3 h-3 text-primary" />
                             ლიდერი: <span className="text-white">{
                               Array.isArray(team.profiles) 
                                 ? (team.profiles[0]?.username || "დაუკავშირებელი") 
                                 : (team.profiles?.username || "დაუკავშირებელი")
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
                        {team.slot_number && (
                           <Badge variant="outline" className="border-blue-500/20 text-blue-400 italic font-black text-[9px] tracking-widest">
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
                             <Button
                               onClick={() => {
                                 setEditingSlot(team.id)
                                 setSlotValue(team.slot_number?.toString() || "")
                               }}
                               variant="outline"
                               className="h-full border-blue-500/20 text-blue-400 hover:bg-blue-500/5 font-black text-[10px] uppercase tracking-widest rounded-xl"
                             >
                               {team.slot_number ? "სლოტის შეცვლა" : "სლოტის მინიჭება"}
                             </Button>
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
                          onClick={() => deleteTeam(team.id)}
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
    </div>
  )
}

function User(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
