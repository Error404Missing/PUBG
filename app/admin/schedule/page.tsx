"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Calendar, Plus, Trash2, ChevronLeft, 
  Clock, MapPin, Users, Target, Save, X,
  ArrowRight, Activity, Shield
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CustomConfirm } from "@/components/ui/custom-confirm"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"

type Schedule = {
  id: string
  title: string
  description: string | null
  date: string
  map_name: string | null
  max_teams: number
  is_active: boolean
}

export default function AdminSchedulePage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    mapName: "",
    maxTeams: "100",
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, scheduleId: string | null }>({
    isOpen: false,
    scheduleId: null
  })
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)

  useEffect(() => {
    checkAuth()
    fetchSchedules()
  }, [])

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

  const fetchSchedules = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("schedules").select("*").order("date", { ascending: false })
    setSchedules((data as Schedule[]) || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const dateTime = `${formData.date}T${formData.time}:00`

    const { error } = await supabase.from("schedules").insert({
      title: formData.title,
      description: formData.description || null,
      date: dateTime,
      map_name: formData.mapName || null,
      max_teams: Number.parseInt(formData.maxTeams),
      is_active: true,
    })

    if (error) {
       console.error("Schedule creation error:", error)
       setToast({ message: "შეცდომა განრიგის შექმნისას: " + error.message, type: 'error' })
    } else {
      setToast({ message: "განრიგი წარმატებით შეიქმნა", type: 'success' })
      setIsAdding(false)
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        mapName: "",
        maxTeams: "100",
      })
      fetchSchedules()
    }
  }

  const deleteSchedule = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("schedules").delete().eq("id", id)

    if (error) {
      console.error("Schedule deletion error:", error)
      setToast({ 
        message: "წაშლა ვერ მოხერხდა. შესაძლოა ამ მატჩზე რეგისტრირებულები არიან გუნდები.", 
        type: 'error' 
      })
    } else {
      setToast({ message: "მატჩი წარმატებით წაიშალა", type: 'success' })
      fetchSchedules()
    }
    setDeleteConfirm({ isOpen: false, scheduleId: null })
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(0,180,255,0.03),transparent_70%)] -z-10" />

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
              <div className="w-20 h-20 rounded-[2rem] glass border border-sky-500/20 flex items-center justify-center relative group">
                <Calendar className="w-10 h-10 text-sky-400 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-sky-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Match <span className="text-sky-400 tracking-normal">Schedule</span></h1>
                <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">განრიგის და ტურნირების ადმინისტრირება</p>
              </div>
            </div>

            {!isAdding && (
              <Button 
                onClick={() => setIsAdding(true)} 
                variant="premium"
                className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest italic flex items-center gap-3 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                ახალი მატჩი
              </Button>
            )}
          </div>
        </div>

        {isAdding && (
          <div className="glass-card p-1 animate-reveal mb-12">
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">ახალი ოპერაციის დამატება</h2>
                 <Badge variant="outline" className="border-sky-500/20 text-sky-400">Tactical_Planning</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">სათაური / Operation Title</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold"
                    placeholder="მაგ: Daily Scrims #12"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">აღწერა / Mission Intel</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-32 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-sm italic py-4"
                    placeholder="დაწერეთ მატჩის დეტალები..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">თარიღი / Deployment Date</Label>
                    <div className="relative">
                       <Input
                         type="date"
                         required
                         value={formData.date}
                         onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                         className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                       />
                       <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">დრო / Deployment Time</Label>
                    <div className="relative">
                       <Input
                         type="time"
                         required
                         value={formData.time}
                         onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                         className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                       />
                       <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">რუკა / Sector (Map)</Label>
                    <div className="relative">
                       <Input
                         value={formData.mapName}
                         onChange={(e) => setFormData({ ...formData, mapName: e.target.value })}
                         placeholder="Erangel, Miramar..."
                         className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                       />
                       <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">გუნდები / Max Units</Label>
                    <div className="relative">
                       <Input
                         type="number"
                         required
                         value={formData.maxTeams}
                         onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
                         className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                       />
                       <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" variant="premium" className="h-16 flex-1 rounded-2xl font-black uppercase tracking-widest italic flex items-center gap-3">
                    <Save className="w-5 h-5" />
                    ოპერაციის გააქტიურება
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    variant="outline"
                    className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest italic"
                  >
                    <X className="w-5 h-5 mr-3" />
                    გაუქმება
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {schedules.map((schedule, i) => (
            <div key={schedule.id} className="glass-card p-1 group">
               <div className="p-8 lg:p-10">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                     <div className="flex-1 space-y-6">
                        <div className="flex items-center gap-6">
                           <div className="w-14 h-14 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center relative">
                              <Shield className="w-7 h-7 text-sky-400" />
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
                           </div>
                           <div>
                              <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-none mb-1">{schedule.title}</h3>
                              <div className="flex items-center gap-2">
                                 <Badge variant="outline" className="border-white/5 text-muted-foreground bg-white/5 text-[9px] font-black uppercase tracking-widest italic italic">Match_ID: {schedule.id.slice(0, 8)}</Badge>
                              </div>
                           </div>
                        </div>

                        {schedule.description && (
                           <p className="text-muted-foreground font-light italic leading-relaxed border-l-2 border-sky-500/20 pl-6 py-2">
                              {schedule.description}
                           </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                           <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Deployment</div>
                              <div className="text-sm font-bold text-white italic">{format(new Date(schedule.date), "PPP", { locale: ka })}</div>
                           </div>
                           <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Time_H-M</div>
                              <div className="text-sm font-bold text-white italic">{format(new Date(schedule.date), "p", { locale: ka })}</div>
                           </div>
                           <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Sector</div>
                              <div className="text-sm font-bold text-secondary italic font-black uppercase">{schedule.map_name || "Unknown"}</div>
                           </div>
                           <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                              <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Max_Units</div>
                              <div className="text-sm font-bold text-white italic">{schedule.max_teams} Teams</div>
                           </div>
                        </div>
                     </div>

                     <div className="flex lg:flex-col gap-3">
                        <Button
                          onClick={() => setDeleteConfirm({ isOpen: true, scheduleId: schedule.id })}
                          variant="outline"
                          className="w-14 h-14 rounded-2xl border-rose-500/20 text-rose-400 hover:bg-rose-500/10 p-0 transition-all active:scale-95"
                        >
                          <Trash2 className="w-6 h-6" />
                        </Button>
                     </div>
                  </div>
               </div>
            </div>
          ))}
          
          {schedules.length === 0 && (
            <div className="glass-card p-20 text-center">
               <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
               <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">განრიგი ცარიელია</p>
            </div>
          )}
        </div>
      </div>

      <CustomConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, scheduleId: null })}
        onConfirm={() => deleteConfirm.scheduleId && deleteSchedule(deleteConfirm.scheduleId)}
        title="მატჩის წაშლა"
        description="დარწმუნებული ხართ რომ გსურთ ამ მატჩის წაშლა განრიგიდან? ეს მოქმედება შეუქცევადია."
        confirmText="წაშლა"
        variant="danger"
      />

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
