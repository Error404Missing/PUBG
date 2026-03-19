"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Trophy, Plus, Trash2, ChevronLeft, 
  Users, User, Save, X, Edit2, 
  ArrowUpCircle, Medal, Star, Zap, Upload, Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type ClanEntry = {
  id: string
  name: string
  logo_url: string | null
  wins: number
  rank: number | null
}

type PlayerEntry = {
  id: string
  name: string
  avatar_url: string | null
  wins: number
  rank: number | null
}

export default function AdminLeaderboardPage() {
  const router = useRouter()
  const [clans, setClans] = useState<ClanEntry[]>([])
  const [players, setPlayers] = useState<PlayerEntry[]>([])
  const [isAddingClan, setIsAddingClan] = useState(false)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  
  const [clanForm, setClanForm] = useState({
    name: "",
    logo_url: "",
    wins: "0",
    rank: "",
  })

  const [playerForm, setPlayerForm] = useState({
    name: "",
    avatar_url: "",
    wins: "0",
    rank: "",
  })

  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    checkAuth()
    fetchData()
  }, [])

  const checkAuth = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
      return
    }
    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
    if (!profile?.is_admin) {
      router.push("/")
    }
  }

  const fetchData = async () => {
    const supabase = createClient()
    const [clansRes, playersRes] = await Promise.all([
      supabase.from("leaderboard_clans").select("*").order("wins", { ascending: false }),
      supabase.from("leaderboard_players").select("*").order("wins", { ascending: false })
    ])
    setClans(clansRes.data || [])
    setPlayers(playersRes.data || [])
  }

  const handleClanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const payload = {
      name: clanForm.name,
      logo_url: clanForm.logo_url || null,
      wins: Number.parseInt(clanForm.wins),
      rank: clanForm.rank ? Number.parseInt(clanForm.rank) : null,
    }

    let error
    if (editId) {
      const { error: updateError } = await supabase.from("leaderboard_clans").update(payload).eq("id", editId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("leaderboard_clans").insert(payload)
      error = insertError
    }

    if (error) {
      setToast({ message: "შეცდომა: " + error.message, type: 'error' })
    } else {
      setToast({ message: editId ? "კლანი განახლდა" : "კლანი დაემატა", type: 'success' })
      resetForms()
      fetchData()
    }
  }

  const handlePlayerSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    const payload = {
      name: playerForm.name,
      avatar_url: playerForm.avatar_url || null,
      wins: Number.parseInt(playerForm.wins),
      rank: playerForm.rank ? Number.parseInt(playerForm.rank) : null,
    }

    let error
    if (editId) {
      const { error: updateError } = await supabase.from("leaderboard_players").update(payload).eq("id", editId)
      error = updateError
    } else {
      const { error: insertError } = await supabase.from("leaderboard_players").insert(payload)
      error = insertError
    }

    if (error) {
      setToast({ message: "შეცდომა: " + error.message, type: 'error' })
    } else {
      setToast({ message: editId ? "მოთამაშე განახლდა" : "მოთამაშე დაემატა", type: 'success' })
      resetForms()
      fetchData()
    }
  }

  const handleFileUpload = async (file: File, type: 'clan' | 'player') => {
    if (!file) return
    
    setIsUploading(true)
    const supabase = createClient()
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
    const filePath = `${type}s/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('leaderboard')
      .upload(filePath, file)

    if (uploadError) {
      setToast({ message: "ატვირთვა ვერ მოხერხდა: " + uploadError.message, type: 'error' })
      setIsUploading(false)
      return null
    }

    const { data: { publicUrl } } = supabase.storage.from('leaderboard').getPublicUrl(filePath)
    
    if (type === 'clan') {
      setClanForm({ ...clanForm, logo_url: publicUrl })
    } else {
      setPlayerForm({ ...playerForm, avatar_url: publicUrl })
    }
    
    setIsUploading(false)
    setToast({ message: "ფოტო წარმატებით აიტვირთა", type: 'success' })
    return publicUrl
  }

  const deleteEntry = async (id: string, table: 'leaderboard_clans' | 'leaderboard_players') => {
    if (!confirm("დარწმუნებული ხართ?")) return
    const supabase = createClient()
    const { error } = await supabase.from(table).delete().eq("id", id)
    if (error) {
      setToast({ message: "წაშლა ვერ მოხერხდა", type: 'error' })
    } else {
      setToast({ message: "წარმატებით წაიშალა", type: 'success' })
      fetchData()
    }
  }

  const resetForms = () => {
    setIsAddingClan(false)
    setIsAddingPlayer(false)
    setEditId(null)
    setClanForm({ name: "", logo_url: "", wins: "0", rank: "" })
    setPlayerForm({ name: "", avatar_url: "", wins: "0", rank: "" })
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,180,0,0.03),transparent_70%)] -z-10" />

      <div className="container mx-auto max-w-5xl relative">
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
              <div className="w-20 h-20 rounded-[2rem] glass border border-amber-500/20 flex items-center justify-center relative group">
                <Trophy className="w-10 h-10 text-amber-400 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-amber-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Leader <span className="text-amber-400 tracking-normal">Board</span></h1>
                <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">რეიტინგების ადმინისტრირება</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="clans" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 h-16 rounded-2xl w-full grid grid-cols-2">
            <TabsTrigger value="clans" className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black font-black uppercase italic tracking-widest transition-all">
              <Users className="w-4 h-4 mr-2" /> Clans
            </TabsTrigger>
            <TabsTrigger value="players" className="rounded-xl data-[state=active]:bg-amber-500 data-[state=active]:text-black font-black uppercase italic tracking-widest transition-all">
              <User className="w-4 h-4 mr-2" /> Players
            </TabsTrigger>
          </TabsList>

          <TabsContent value="clans" className="space-y-8">
            {!isAddingClan ? (
              <Button onClick={() => setIsAddingClan(true)} variant="premium" className="h-16 w-full rounded-2xl font-black uppercase italic tracking-widest gap-2">
                <Plus className="w-5 h-5" /> ახალი კლანის დამატება
              </Button>
            ) : (
              <Card className="glass border-white/10 p-8 rounded-[2.5rem] animate-reveal">
                <form onSubmit={handleClanSubmit} className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">კლანის სახელი</Label>
                         <Input required value={clanForm.name} onChange={e => setClanForm({...clanForm, name: e.target.value})} className="h-14 rounded-xl bg-black/40 border-white/10" />
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">კლანის ლოგო</Label>
                         <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                               {clanForm.logo_url ? (
                                 <img src={clanForm.logo_url} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <Upload className="w-6 h-6 text-white/20" />
                               )}
                            </div>
                            <div className="flex-1">
                               <Input 
                                 type="file" 
                                 accept="image/*" 
                                 onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'clan')}
                                 className="h-12 bg-black/40 border-white/10"
                                 disabled={isUploading}
                               />
                               <p className="text-[9px] text-muted-foreground mt-2 italic">* პირდაპირი ატვირთვა</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">მოგებები</Label>
                         <Input type="number" value={clanForm.wins} onChange={e => setClanForm({...clanForm, wins: e.target.value})} className="h-14 rounded-xl bg-black/40 border-white/10" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">პოზიცია (Rank)</Label>
                         <Input type="number" value={clanForm.rank} onChange={e => setClanForm({...clanForm, rank: e.target.value})} className="h-14 rounded-xl bg-black/40 border-white/10" placeholder="ნებ." />
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <Button type="submit" variant="premium" className="h-14 flex-1 rounded-xl font-black uppercase tracking-widest italic">
                        <Save className="w-5 h-5 mr-2" /> შენახვა
                      </Button>
                      <Button type="button" onClick={resetForms} variant="outline" className="h-14 px-8 rounded-xl border-white/10 font-bold uppercase italic">
                        <X className="w-5 h-5" />
                      </Button>
                   </div>
                </form>
              </Card>
            )}

            <div className="space-y-4">
               {clans.map((clan, i) => (
                 <div key={clan.id} className="glass border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="text-2xl font-black text-white/20 italic tracking-tighter w-8">{i + 1}</div>
                       <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                          {clan.logo_url && <img src={clan.logo_url} className="w-full h-full object-cover" alt="" />}
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-white italic truncate max-w-[200px]">{clan.name}</h4>
                          <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-[9px] font-black italic uppercase">{clan.wins} Wins</Badge>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="flex gap-2">
                          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 rounded-xl" onClick={() => {
                            setEditId(clan.id)
                            setClanForm({
                              name: clan.name,
                              logo_url: clan.logo_url || "",
                              wins: String(clan.wins),
                              rank: String(clan.rank || ""),
                            })
                            setIsAddingClan(true)
                          }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-10 w-10 border-rose-500/20 text-rose-500 rounded-xl" onClick={() => deleteEntry(clan.id, 'leaderboard_clans')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </TabsContent>

          <TabsContent value="players" className="space-y-8">
            {!isAddingPlayer ? (
              <Button onClick={() => setIsAddingPlayer(true)} variant="premium" className="h-16 w-full rounded-2xl font-black uppercase italic tracking-widest gap-2">
                <Plus className="w-5 h-5" /> ახალი მოთამაშის დამატება
              </Button>
            ) : (
              <Card className="glass border-white/10 p-8 rounded-[2.5rem] animate-reveal">
                <form onSubmit={handlePlayerSubmit} className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">სახელი</Label>
                         <Input required value={playerForm.name} onChange={e => setPlayerForm({...playerForm, name: e.target.value})} className="h-14 rounded-xl bg-black/40 border-white/10" />
                      </div>
                      <div className="space-y-4">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">მოთამაშის ავატარი</Label>
                         <div className="flex items-center gap-4">
                            <div className="w-20 h-20 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden">
                               {playerForm.avatar_url ? (
                                 <img src={playerForm.avatar_url} className="w-full h-full object-cover" alt="" />
                               ) : (
                                 <Upload className="w-6 h-6 text-white/20" />
                               )}
                            </div>
                            <div className="flex-1">
                               <Input 
                                 type="file" 
                                 accept="image/*" 
                                 onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'player')}
                                 className="h-12 bg-black/40 border-white/10"
                                 disabled={isUploading}
                               />
                               <p className="text-[9px] text-muted-foreground mt-2 italic">* პირდაპირი ატვირთვა</p>
                            </div>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">მოგებები</Label>
                         <Input type="number" value={playerForm.wins} onChange={e => setPlayerForm({...playerForm, wins: e.target.value})} className="h-14 rounded-xl bg-black/40 border-white/10" />
                      </div>
                      <div className="space-y-2">
                         <Label className="text-[10px] font-black uppercase text-amber-400 italic">Rank</Label>
                         <Input type="number" value={playerForm.rank} onChange={e => setPlayerForm({...playerForm, rank: e.target.value})} className="h-14 rounded-xl bg-black/40 border-white/10" />
                      </div>
                   </div>
                   <div className="flex gap-4 pt-4">
                      <Button type="submit" variant="premium" className="h-14 flex-1 rounded-xl font-black uppercase tracking-widest italic">
                        <Save className="w-5 h-5 mr-2" /> შენახვა
                      </Button>
                      <Button type="button" onClick={resetForms} variant="outline" className="h-14 px-8 rounded-xl border-white/10 font-bold uppercase italic">
                        <X className="w-5 h-5" />
                      </Button>
                   </div>
                </form>
              </Card>
            )}

            <div className="space-y-4">
               {players.map((player, i) => (
                 <div key={player.id} className="glass border-white/5 p-6 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
                    <div className="flex items-center gap-6">
                       <div className="text-2xl font-black text-white/20 italic tracking-tighter w-8">{i + 1}</div>
                       <div className="w-12 h-12 rounded-xl bg-white/5 overflow-hidden border border-white/10">
                          {player.avatar_url && <img src={player.avatar_url} className="w-full h-full object-cover" alt="" />}
                       </div>
                       <div>
                          <h4 className="text-xl font-black text-white italic truncate max-w-[200px]">{player.name}</h4>
                          <Badge variant="outline" className="border-amber-500/20 text-amber-400 text-[9px] font-black italic uppercase">{player.wins} Wins</Badge>
                       </div>
                    </div>
                    <div className="flex items-center gap-8">
                       <div className="flex gap-2">
                          <Button variant="outline" size="icon" className="h-10 w-10 border-white/10 rounded-xl" onClick={() => {
                            setEditId(player.id)
                            setPlayerForm({
                              name: player.name,
                              avatar_url: player.avatar_url || "",
                              wins: String(player.wins),
                              rank: String(player.rank || ""),
                            })
                            setIsAddingPlayer(true)
                          }}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-10 w-10 border-rose-500/20 text-rose-500 rounded-xl" onClick={() => deleteEntry(player.id, 'leaderboard_players')}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {toast && (
        <LuxuryToast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
