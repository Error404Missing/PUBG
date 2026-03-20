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
  ArrowRight, Activity, Shield, Zap
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
  maps_count: number
  is_active: boolean
  registration_open?: boolean
  registration_status: 'open' | 'vip_only' | 'closed'
  logo_required: boolean
  room_id?: string | null
  room_password?: string | null
}

export default function AdminSchedulePage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    mapName: "",
    maxTeams: "100",
    mapsCount: "4",
    logoRequired: false,
    registrationStatus: "open" as 'open' | 'vip_only' | 'closed',
    roomId: "",
    roomPassword: "",
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

    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(formData.time)) {
      setToast({ message: "გთხოვთ შეიყვანოთ დრო სწორი ფორმატით (მაგ: 22:00)", type: 'error' })
      return
    }

    // Construct date string with explicit Georgia timezone (+04:00)
    const dateTime = `${formData.date}T${formData.time}:00+04:00`

    const payload = {
      title: formData.title,
      description: formData.description || null,
      date: dateTime,
      map_name: formData.mapName || null,
      max_teams: Number.parseInt(formData.maxTeams),
      maps_count: Number.parseInt(formData.mapsCount),
      is_active: true,
      logo_required: formData.logoRequired,
      registration_status: formData.registrationStatus,
      room_id: formData.roomId || null,
      room_password: formData.roomPassword || null,
    }

    let error;
    if (isEditing && editId) {
      const { error: updateError } = await supabase
        .from("schedules")
        .update(payload)
        .eq("id", editId)
      error = updateError
    } else {
      const { error: insertError } = await supabase
        .from("schedules")
        .insert(payload)
      error = insertError
    }

    if (error) {
      console.error("Schedule action error:", error)
      setToast({ message: `შეცდომა განრიგის ${isEditing ? 'განახლებისას' : 'შექმნისას'}: ` + error.message, type: 'error' })
    } else {
      // 📝 Log Action
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: `${isEditing ? 'მატჩის რედაქტირება' : 'ახალი მატჩის შექმნა'}: ${formData.title}`,
          entity_type: "schedule",
          details: {
            title: formData.title,
            date: dateTime,
            map: formData.mapName,
            max_teams: formData.maxTeams,
            logo_required: formData.logoRequired,
            registration_status: formData.registrationStatus,
            room_id: formData.roomId,
            room_password: formData.roomPassword,
            is_edit: isEditing
          }
        })
      }

      setToast({ message: isEditing ? "განრიგი განახლდა" : "განრიგი წარმატებით შეიქმნა", type: 'success' })
      setIsAdding(false)
      setIsEditing(false)
      setEditId(null)
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        mapName: "",
        maxTeams: "100",
        mapsCount: "4",
        logoRequired: false,
        registrationStatus: "open",
        roomId: "",
        roomPassword: "",
      })
      fetchSchedules()
    }
  }

  const handleEdit = (schedule: Schedule) => {
    const d = new Date(schedule.date)
    // Adjust for Georgia Timezone for the input fields
    const formattedDate = format(d, "yyyy-MM-dd")
    const formattedTime = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Tbilisi',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d)

    setFormData({
      title: schedule.title,
      description: schedule.description || "",
      date: formattedDate,
      time: formattedTime,
      mapName: schedule.map_name || "",
      maxTeams: String(schedule.max_teams),
      mapsCount: String(schedule.maps_count || 4),
      logoRequired: schedule.logo_required || false,
      registrationStatus: schedule.registration_status || "open",
      roomId: schedule.room_id || "",
      roomPassword: schedule.room_password || "",
    })
    setIsEditing(true)
    setEditId(schedule.id)
    setIsAdding(true)
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancel = () => {
    setIsAdding(false)
    setIsEditing(false)
    setEditId(null)
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      mapName: "",
      maxTeams: "100",
      mapsCount: "4",
      logoRequired: false,
      registrationStatus: "open",
      roomId: "",
      roomPassword: "",
    })
  }

  const deleteSchedule = async (id: string) => {
    const supabase = createClient()

    // Use count: 'exact' to check if anything was actually deleted
    // If RLS prevents deletion, Supabase returns error: null but count: 0
    const { error, count } = await supabase
      .from("schedules")
      .delete({ count: 'exact' })
      .eq("id", id)

    if (error) {
      console.error("Schedule deletion error:", error)
      setToast({
        message: "წაშლა ვერ მოხერხდა. შესაძლოა სისტემური შეცდომაა.",
        type: 'error'
      })
    } else if (count === 0) {
      console.warn("No rows deleted. Likely RLS policy issue.")
      setToast({
        message: "წაშლა ვერ მოხერხდა. შესაძლოა არ გაქვთ საკმარისი უფლებები.",
        type: 'error'
      })
    } else {
      // 📝 Log Action
      const { data: { user } } = await supabase.auth.getUser()
      const schedule = schedules.find(s => s.id === id)
      if (user) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: `მატჩის წაშლა: ${schedule?.title || id}`,
          entity_type: "schedule",
          entity_id: id,
          details: {
            title: schedule?.title
          }
        })
      }

      setToast({ message: "მატჩი წარმატებით წაიშალა", type: 'success' })
      fetchSchedules()
    }
    setDeleteConfirm({ isOpen: false, scheduleId: null })
  }

  const updateRegistrationStatus = async (id: string, status: 'open' | 'vip_only' | 'closed') => {
    const supabase = createClient()
    const { error } = await supabase
      .from("schedules")
      .update({ registration_status: status })
      .eq("id", id)

    if (error) {
      console.error("Update registration status error:", error)
      setToast({ message: "სტატუსის შეცვლა ვერ მოხერხდა", type: 'error' })
    } else {
      // 📝 Log Action
      const { data: { user } } = await supabase.auth.getUser()
      const schedule = schedules.find(s => s.id === id)
      if (user) {
        await supabase.from("logs").insert({
          user_id: user.id,
          action: `რეგისტრაციის სტატუსის შეცვლა: ${status}`,
          entity_type: "schedule",
          entity_id: id,
          details: {
            title: schedule?.title,
            registration_status: status
          }
        })
      }

      setToast({
        message: status === 'open' ? "რეგისტრაცია გაიხსნა" : status === 'vip_only' ? "რეგისტრაცია მხოლოდ VIP-თვის" : "რეგისტრაცია დაიხურა",
        type: 'success'
      })
      fetchSchedules()
    }
  }

  const handleQuickRoomUpdate = async (id: string, roomId: string | null, roomPassword: string | null) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("schedules")
      .update({ room_id: roomId, room_password: roomPassword })
      .eq("id", id)

    if (error) {
       console.error("Quick update error:", error)
       setToast({ message: "შეცდომა ოთახის მონაცემების განახლებისას", type: 'error' })
    } else {
       setToast({ message: "ოთახის მონაცემები განახლდა", type: 'success' })
       fetchSchedules()
    }
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
                <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">
                  {isEditing ? 'ოპერაციის რედაქტირება' : 'ახალი ოპერაციის დამატება'}
                </h2>
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
                        type="text"
                        required
                        placeholder="22:00"
                        maxLength={5}
                        value={formData.time}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9:]/g, "")
                          // Auto-add colon after 2 digits
                          if (val.length === 2 && !val.includes(":") && formData.time.length < 2) {
                            val += ":"
                          }
                          // Prevent multiple colons
                          if ((val.match(/:/g) || []).length > 1) {
                            val = val.slice(0, -1)
                          }
                          setFormData({ ...formData, time: val })
                        }}
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

                {/* Room Info Section */}
                <div className="p-8 rounded-3xl bg-primary/5 border border-primary/10 space-y-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                       <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white italic uppercase tracking-widest">Match Room Intel</h3>
                      <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest leading-none mt-1">ეს ინფორმაცია მხოლოდ ტესტირებულ და დადასტურებულ გუნდებს გამოუჩნდებათ</p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Room ID</Label>
                      <div className="relative">
                        <Input
                          value={formData.roomId}
                          onChange={(e) => setFormData({ ...formData, roomId: e.target.value })}
                          placeholder="კონკრეტული ოთახის ID"
                          className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                        />
                        <Target className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Room Password</Label>
                      <div className="relative">
                        <Input
                          value={formData.roomPassword}
                          onChange={(e) => setFormData({ ...formData, roomPassword: e.target.value })}
                          placeholder="კონკრეტული ოთახის პაროლი"
                          className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                        />
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Logo & Status Settings */}
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Logo Requirement */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic flex items-center gap-2">
                       გუნდის ლოგო / Team Logo
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoRequired: true })}
                        className={`h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border ${
                          formData.logoRequired
                            ? 'bg-rose-500/20 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/20'
                            : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        სავალდებულო (Mandatory)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, logoRequired: false })}
                        className={`h-16 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 border ${
                          !formData.logoRequired
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500 shadow-lg shadow-emerald-500/20'
                            : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        არ არის სავალდებულო
                      </button>
                    </div>
                  </div>

                  {/* Initial Registration Status */}
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic flex items-center gap-2">
                      რეგისტრაციის სტატუსი / Reg Status
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['open', 'vip_only', 'closed'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setFormData({ ...formData, registrationStatus: s })}
                          className={`h-16 rounded-xl font-black text-[10px] uppercase tracking-tighter transition-all active:scale-95 border ${
                            formData.registrationStatus === s
                              ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                              : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                          }`}
                        >
                          {s === 'open' ? 'გახსნილი' : s === 'vip_only' ? 'მხოლოდ VIP' : 'დახურული'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Maps Count Selector */}
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" />
                    მაპების რაოდენობა / Maps Count
                  </Label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 2, 3, 4].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setFormData({ ...formData, mapsCount: String(n) })}
                        className={`h-16 rounded-2xl font-black text-xl uppercase tracking-widest transition-all active:scale-95 border ${
                          formData.mapsCount === String(n)
                            ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/20'
                            : 'bg-black/40 border-white/10 text-white/40 hover:border-white/30 hover:text-white'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground italic ml-2">
                    * გუნდები ამ მაპების რაოდნეობის გარეშე ვერ მოხვდებიან
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" variant="premium" className="h-16 flex-1 rounded-2xl font-black uppercase tracking-widest italic flex items-center gap-3">
                    <Save className="w-5 h-5" />
                    {isEditing ? 'ცვლილებების შენახვა' : 'ოპერაციის გააქტიურება'}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
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
          {schedules.map((schedule) => (
            <ScheduleListItem 
              key={schedule.id} 
              schedule={schedule} 
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirm({ isOpen: true, scheduleId: id })}
              onUpdateStatus={updateRegistrationStatus}
              onQuickUpdate={handleQuickRoomUpdate}
            />
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

function ScheduleListItem({ 
  schedule, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  onQuickUpdate 
}: { 
  schedule: Schedule, 
  onEdit: (s: Schedule) => void, 
  onDelete: (id: string) => void,
  onUpdateStatus: (id: string, status: 'open' | 'vip_only' | 'closed') => void,
  onQuickUpdate: (id: string, roomId: string, roomPass: string) => void
}) {
  const [roomId, setRoomId] = useState(schedule.room_id || "")
  const [roomPass, setRoomPass] = useState(schedule.room_password || "")
  const [isUpdating, setIsUpdating] = useState(false)

  // Sync state with props when schedule changes (e.g. after refresh)
  useEffect(() => {
    setRoomId(schedule.room_id || "")
    setRoomPass(schedule.room_password || "")
  }, [schedule])

  const handleSave = async () => {
    setIsUpdating(true)
    await onQuickUpdate(schedule.id, roomId, roomPass)
    setIsUpdating(false)
  }

  return (
    <div className="glass-card p-1 group">
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
                <div className="text-sm font-bold text-white italic">
                  {new Intl.DateTimeFormat('ka-GE', { 
                    timeZone: 'Asia/Tbilisi', 
                    hour: '2-digit', 
                    minute: '2-digit', 
                    hour12: false 
                  }).format(new Date(schedule.date))}
                </div>
              </div>
              <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Sector</div>
                <div className="text-sm font-bold text-secondary italic font-black uppercase">{schedule.map_name || "Unknown"}</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-white/5 space-y-1">
                <div className="text-[9px] font-black text-muted-foreground uppercase tracking-widest italic">Max_Units</div>
                <div className="text-sm font-bold text-white italic">{schedule.max_teams} Teams</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-primary/10 space-y-1">
                <div className="text-[9px] font-black text-primary/60 uppercase tracking-widest italic">Maps_Count</div>
                <div className="text-sm font-bold text-primary italic">{schedule.maps_count || 4} Maps</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-rose-500/10 space-y-1">
                <div className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest italic">Logo_Req</div>
                <div className={`text-sm font-bold italic ${schedule.logo_required ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {schedule.logo_required ? 'დიახ' : 'არა'}
                </div>
              </div>
              <div className="glass p-4 rounded-2xl border border-sky-500/10 space-y-1">
                <div className="text-[9px] font-black text-sky-500/60 uppercase tracking-widest italic">Reg_Status</div>
                <div className="text-sm font-bold text-sky-400 italic uppercase">
                  {schedule.registration_status === 'open' ? 'ღიაა' : schedule.registration_status === 'vip_only' ? 'VIP UNit' : 'დახურული'}
                </div>
              </div>
            </div>

            {/* Quick Room Intel Update */}
            <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-4">
               <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">Quick_Room_Intel</h4>
                  { (roomId !== (schedule.room_id || "") || roomPass !== (schedule.room_password || "")) && (
                     <Button 
                        size="sm" 
                        onClick={handleSave} 
                        disabled={isUpdating}
                        className="h-7 px-4 rounded-lg bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 text-[9px] font-black uppercase italic"
                     >
                        {isUpdating ? "..." : "Save_Changes"}
                     </Button>
                  )}
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <div className="text-[8px] font-black text-white/20 uppercase ml-2">Room_ID</div>
                     <Input 
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        placeholder="ID"
                        className="h-10 bg-black/60 border-white/5 rounded-xl text-xs font-bold focus:border-primary/40"
                     />
                  </div>
                  <div className="space-y-1">
                     <div className="text-[8px] font-black text-white/20 uppercase ml-2">Room_Pass</div>
                     <Input 
                        value={roomPass}
                        onChange={(e) => setRoomPass(e.target.value)}
                        placeholder="Pass"
                        className="h-10 bg-black/60 border-white/5 rounded-xl text-xs font-bold focus:border-primary/40"
                     />
                  </div>
               </div>
            </div>
          </div>

          <div className="flex lg:flex-col gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  onClick={() => onUpdateStatus(schedule.id, 'open')}
                  variant="outline"
                  className={`w-10 h-10 rounded-xl border p-0 transition-all active:scale-95 ${schedule.registration_status === 'open' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/5 text-white/20'}`}
                  title="რეგისტრაციის გახსნა ყველასთვის"
                >
                  <Activity className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => onUpdateStatus(schedule.id, 'vip_only')}
                  variant="outline"
                  className={`w-10 h-10 rounded-xl border p-0 transition-all active:scale-95 ${schedule.registration_status === 'vip_only' ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'border-white/5 text-white/20'}`}
                  title="რეგისტრაციის გახსნა მხოლოდ VIP-თვის"
                >
                  <Zap className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => onUpdateStatus(schedule.id, 'closed')}
                  variant="outline"
                  className={`w-10 h-10 rounded-xl border p-0 transition-all active:scale-95 ${schedule.registration_status === 'closed' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'border-white/5 text-white/20'}`}
                  title="რეგისტრაციის დახურვა ყველასთვის"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => onEdit(schedule)}
                  variant="outline"
                  className="w-14 h-14 rounded-2xl border-sky-500/20 text-sky-400 hover:bg-sky-500/10 p-0 transition-all active:scale-95"
                  title="რედაქტირება"
                >
                  <Save className="w-6 h-6" />
                </Button>
                <Button
                  onClick={() => onDelete(schedule.id)}
                  variant="outline"
                  className="w-14 h-14 rounded-2xl border-rose-500/20 text-rose-400 hover:bg-rose-500/10 p-0 transition-all active:scale-95"
                >
                  <Trash2 className="w-6 h-6" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

