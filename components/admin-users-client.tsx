"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Bell, Star, ShieldOff } from "lucide-react"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"
import {
  Users,
  Search,
  Shield,
  Ban,
  Unlock,
  Award,
  Zap,
  ChevronLeft,
  Activity,
  User,
  ArrowRight,
  ShieldCheck,
  Trash2,
  Edit,
  Crown
} from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserProfile {
  id: string
  username: string | null
  email?: string | null
  is_admin: boolean
  is_banned?: boolean
  ban_reason?: string | null
  ban_until?: string | null
  badge?: string | null
  role?: string | null
  created_at: string
  last_seen_at?: string | null
}

export function AdminUsersClient({
  users,
  vipMap,
}: {
  users: UserProfile[]
  vipMap: Record<string, string>
}) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [userList, setUserList] = useState(users)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [banReason, setBanReason] = useState("")
  const [banDuration, setBanDuration] = useState("permanent")
  const [badgeText, setBadgeText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [banDialogUserId, setBanDialogUserId] = useState<string | null>(null)
  const [notifTitle, setNotifTitle] = useState("")
  const [notifMessage, setNotifMessage] = useState("")
  const [notifType, setNotifType] = useState<"info" | "success" | "warning" | "error">("info")
  const [notifDialogUserId, setNotifDialogUserId] = useState<string | null>(null)
  const [localVipMap, setLocalVipMap] = useState<Record<string, string>>(vipMap)
  const [vipDuration, setVipDuration] = useState("30")
  const [vipDialogUserId, setVipDialogUserId] = useState<string | null>(null)
  const [toastContent, setToastContent] = useState<{ message: string, type: ToastType } | null>(null)

  const filteredUsers = userList.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBanUser = async (userId: string) => {
    setIsLoading(true)
    let banUntilDate = null
    if (banDuration !== "permanent") {
      const days = parseInt(banDuration)
      const date = new Date()
      date.setDate(date.getDate() + days)
      banUntilDate = date.toISOString()
    }

    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true, ban_reason: banReason || "წესების დარღვევა", ban_until: banUntilDate })
      .eq("id", userId)

    if (error) {
      console.error("Ban error:", error)
      alert("ბანის შეცდომა: " + error.message)
    } else {
      setUserList((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: true, ban_reason: banReason || "წესების დარღვევა", ban_until: banUntilDate } : u
        )
      )
      setBanReason("")
      setBanDuration("permanent")
      setBanDialogUserId(null) // close dialog
      setToastContent({ message: "მომხმარებელი დაიბლოკა", type: 'success' })
    }
    setIsLoading(false)
  }

  const handleUnbanUser = async (userId: string) => {
    setIsLoading(true)
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: false, ban_reason: null, ban_until: null })
      .eq("id", userId)
    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false, ban_reason: null, ban_until: null } : u))
      )
      setToastContent({ message: "მომხმარებელი განიბლოკა", type: 'success' })
    } else {
      setToastContent({ message: "განბლოკვა ვერ მოხერხდა", type: 'error' })
    }
    setIsLoading(false)
  }

  const handleSetBadge = async (userId: string) => {
    setIsLoading(true)
    const badgeValue = badgeText.trim() || null
    const { error } = await supabase.from("profiles").update({ badge: badgeValue }).eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, badge: badgeValue } : u))
      )
      setDialogOpen(false)
      setBadgeText("")
    }
    setIsLoading(false)
  }

  const handleGrantVip = async (userId: string, username: string) => {
    setIsLoading(true)
    const days = vipDuration === "permanent" ? 36500 : parseInt(vipDuration)
    const expiry = new Date()
    expiry.setHours(23, 59, 59, 999)
    expiry.setDate(expiry.getDate() + days)
    const expiryStr = expiry.toISOString()

    try {
      const { error: vipError } = await supabase
        .from("user_vip_status")
        .upsert({
          user_id: userId,
          vip_until: expiryStr,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' })

      if (vipError) throw vipError

      const durationText = vipDuration === "1" ? "1 დღით" :
        vipDuration === "14" ? "2 კვირით" :
          vipDuration === "30" ? "1 თვით" :
            vipDuration === "365" ? "1 წლით" : "სამუდამოდ"

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "VIP სტატუსი გააქტიურდა! 🌟",
        message: `გილოცავთ! თქვენ მოგენიჭათ VIP სტატუსი ${durationText}. ისიამოვნეთ პრივილეგიებით.`,
        type: "success"
      })

      setLocalVipMap(prev => ({ ...prev, [userId]: expiryStr }))
      setVipDialogUserId(null)
      setToastContent({ message: `${username}-ს მიენიჭა VIP სტატუსი`, type: 'success' })
    } catch (err: any) {
      console.error("VIP Error:", err)
      setToastContent({ message: "VIP-ის მინიჭება ვერ მოხერხდა: " + (err.message || ""), type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveVip = async (userId: string, username: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase
        .from("user_vip_status")
        .delete()
        .eq("user_id", userId)

      if (error) throw error

      await supabase.from("notifications").insert({
        user_id: userId,
        title: "VIP სტატუსი გაუქმდა",
        message: "თქვენი VIP სტატუსი გაუქმდა ადმინისტრაციის მიერ.",
        type: "warning"
      })

      setLocalVipMap(prev => {
        const next = { ...prev }
        delete next[userId]
        return next
      })
      setVipDialogUserId(null)
      setToastContent({ message: `${username}-ს ჩამოერთვა VIP სტატუსი`, type: 'success' })
    } catch (err: any) {
      console.error("Remove VIP Error:", err)
      setToastContent({ message: "VIP-ის ჩამორთმევა ვერ მოხერხდა", type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveBadge = async (userId: string) => {
    setIsLoading(true)
    const { error } = await supabase.from("profiles").update({ badge: null }).eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, badge: null } : u))
      )
    }
    setIsLoading(false)
  }

  const handleToggleManager = async (userId: string, currentRole: string | null | undefined) => {
    setIsLoading(true)
    const newRole = currentRole === 'manager' ? 'guest' : 'manager'
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole })
      .eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      )
      // Send notification
      await supabase.from("notifications").insert({
        user_id: userId,
        title: newRole === 'manager' ? "ადმინისტრაციამ მოგანიჭა მენეჯერის როლი შენი 🏆" : "მენეჯერის როლი გაუქმდა ❌",
        message: newRole === 'manager'
          ? "თქვენ ახლა გაქვთ Room Info გვერდზე."
          : "ადმინისტრაციამ ჩამოართა თქვენს მენეჯერის როლი და Room Info-ზე წვდომა.",
        type: newRole === 'manager' ? "success" : "warning",
      })
      setToastContent({ 
        message: newRole === 'manager' ? `${userList.find(u => u.id === userId)?.username}-ს მიენიჯა მენეჯერის როლი` : `მენეჯერის როლი ჩამოართვა`, 
        type: newRole === 'manager' ? 'success' : 'warning' as any 
      })
    } else {
      setToastContent({ message: "როლის შეცვლა ვერ მოხერხდა: " + error.message, type: 'error' })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_100%,rgba(255,180,0,0.03),transparent_70%)] -z-10" />

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
              <div className="w-20 h-20 rounded-[2rem] glass border border-primary/20 flex items-center justify-center relative group">
                <Users className="w-10 h-10 text-primary transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">User <span className="text-primary tracking-normal">Intel</span></h1>
                <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">ოპერატორების და როლების მართვა</p>
              </div>
            </div>

            <div className="flex-1 max-w-md">
              <div className="relative group">
                <Input
                  placeholder="ძიება სახელით ან ID-ით..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-16 pl-12 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-xs font-bold transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {[
            { label: "სულ", count: userList.length, color: "blue", icon: Users },
            { label: "VIP", count: Object.keys(localVipMap).length, color: "secondary", icon: Star },
            { label: "დაბანილი", count: userList.filter((u) => u.is_banned).length, color: "rose", icon: Ban },
            { label: "ადმინი", count: userList.filter((u) => u.is_admin).length, color: "emerald", icon: ShieldCheck }
          ].map((stat, i) => (
            <div key={i} className={`p-8 rounded-[2.5rem] glass border border-${stat.color === 'secondary' ? 'primary' : stat.color}-500/10 group hover:scale-[1.02] transition-all duration-500`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl bg-${stat.color === 'secondary' ? 'primary' : stat.color}-500/10 flex items-center justify-center text-${stat.color === 'secondary' ? 'primary' : stat.color}-400`}>
                  <stat.icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-4xl font-black text-white italic tracking-tighter mb-1">{stat.count}</div>
              <div className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] italic">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Users List */}
        <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.2s' }}>
          {filteredUsers.map((u) => {
            const hasVip = !!localVipMap[u.id]

            return (
              <div
                key={u.id}
                className={`glass-card p-1 transition-all duration-500 hover:scale-[1.005] ${u.is_banned ? 'opacity-60 grayscale' : ''
                  }`}
              >
                <div className="p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                          <User className="w-7 h-7 text-white/50" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter leading-none">{u.username || "უცნობი"}</h3>
                            <div className={`w-2 h-2 rounded-full ${
                               u.last_seen_at && new Date().getTime() - new Date(u.last_seen_at).getTime() < 1000 * 60 * 3
                                  ? 'bg-emerald-500 animate-pulse'
                                  : 'bg-zinc-600'
                            }`} title={u.last_seen_at && new Date(u.last_seen_at).getFullYear() > 2024 ? `ბოლოს ნანახია: ${new Date(u.last_seen_at).toLocaleString('ka-GE')}` : 'ხაზგარეშე'} />
                            <Badge variant="outline" className="border-white/5 text-white/20 px-2 py-0 text-[8px] font-black italic tracking-widest uppercase">ID: {u.id.slice(0, 8)}</Badge>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {u.is_admin && <Badge variant="secondary" className="px-2 py-0.5 text-[9px] font-black italic tracking-widest uppercase">Admin_Access_Lv3</Badge>}
                            {u.role === 'manager' && !u.is_admin && <Badge className="px-2 py-0.5 text-[9px] font-black italic tracking-widest uppercase bg-orange-500/10 text-orange-400 border border-orange-500/20">Manager_Access</Badge>}
                            {u.is_banned && <Badge variant="destructive" className="px-2 py-0.5 text-[9px] font-black italic tracking-widest uppercase">Operator_Terminated</Badge>}
                            {hasVip && <Badge variant="gold" className="px-2 py-0.5 text-[9px] font-black italic tracking-widest uppercase">Elite_Unit</Badge>}
                            {u.badge && <Badge className="bg-primary/20 text-primary border border-primary/20 px-2 py-0.5 text-[9px] font-black italic tracking-widest uppercase">{u.badge}</Badge>}
                          </div>
                        </div>
                      </div>
                      {u.is_banned && u.ban_reason && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4 text-xs italic text-rose-400 font-bold uppercase tracking-widest flex flex-col gap-1">
                          <div>Protocol Violation: {u.ban_reason}</div>
                          {u.ban_until && <div>Expires: {new Date(u.ban_until).toLocaleString('ka-GE')}</div>}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Link href={`/profile/${u.id}`} target="_blank">
                        <Button
                          variant="outline"
                          className="h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                        >
                          <User className="w-4 h-4 mr-2" />
                          პროფილი
                        </Button>
                      </Link>

                      {/* Badge Dialog */}
                      <Dialog open={dialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => {
                        setDialogOpen(open)
                        if (open) {
                          setSelectedUser(u)
                          setBadgeText(u.badge || "")
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            ბეჯის მინიჭება
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 backdrop-blur-3xl border border-white/10 p-1 rounded-3xl shadow-2xl">
                          <div className="p-8">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black text-white italic uppercase tracking-tighter">
                                ბეჯის მართვა: {u.username}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-8">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic font-bold">Badge Intel</Label>
                                <Input
                                  value={badgeText}
                                  onChange={(e) => setBadgeText(e.target.value)}
                                  placeholder="მაგ: PRO, CHAMPION..."
                                  className="h-14 bg-black/40 border-white/10 rounded-xl focus:border-primary/50 text-xs font-bold"
                                />
                              </div>
                              <div className="flex gap-4">
                                <Button
                                  onClick={() => handleSetBadge(u.id)}
                                  disabled={isLoading || !badgeText.trim()}
                                  variant="premium"
                                  className="h-14 flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest italic"
                                >
                                  {isLoading ? "Saving..." : "მინიჭება"}
                                </Button>
                                {u.badge && (
                                  <Button
                                    onClick={() => handleRemoveBadge(u.id)}
                                    disabled={isLoading}
                                    variant="outline"
                                    className="h-14 px-6 rounded-xl border-rose-500/20 text-rose-400"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Notification Dialog */}
                      <Dialog open={notifDialogUserId === u.id} onOpenChange={(open) => {
                        if (!open) setNotifDialogUserId(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 border-blue-500/20 text-blue-400 hover:bg-blue-500/5 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                            onClick={() => setNotifDialogUserId(u.id)}
                          >
                            <Bell className="w-4 h-4 mr-2" />
                            შეტყობინება
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 backdrop-blur-3xl border border-white/10 p-1 rounded-3xl shadow-2xl">
                          <div className="p-8">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black text-blue-400 italic uppercase tracking-tighter">
                                BROADCAST: {u.username}
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 pt-8">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-2 italic">სათაური</Label>
                                <Input
                                  placeholder="შეტყობინების სათაური..."
                                  value={notifTitle}
                                  onChange={(e) => setNotifTitle(e.target.value)}
                                  className="h-12 bg-black/40 border-blue-500/20 rounded-xl focus:border-blue-500/50 text-xs font-bold"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-2 italic">შეტყობინება</Label>
                                <Textarea
                                  placeholder="ტექსტი..."
                                  value={notifMessage}
                                  onChange={(e) => setNotifMessage(e.target.value)}
                                  className="h-28 bg-black/40 border-blue-500/20 rounded-xl focus:border-blue-500/50 text-xs font-bold"
                                />
                              </div>
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] ml-2 italic">ტიპი</Label>
                                <Select value={notifType} onValueChange={(v: any) => setNotifType(v)}>
                                  <SelectTrigger className="w-full h-12 bg-black/40 border-blue-500/20 rounded-xl font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-950 border-white/10">
                                    <SelectItem value="info">ℹ️ ინფო</SelectItem>
                                    <SelectItem value="success">✅ წარმატება</SelectItem>
                                    <SelectItem value="warning">⚠️ გაფრთხილება</SelectItem>
                                    <SelectItem value="error">❌ შეცდომა</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Button
                                onClick={async () => {
                                  if (!notifTitle.trim() || !notifMessage.trim()) return
                                  setIsLoading(true)
                                  const { error } = await supabase.from("notifications").insert({
                                    user_id: u.id,
                                    title: notifTitle.trim(),
                                    message: notifMessage.trim(),
                                    type: notifType,
                                  })
                                  setIsLoading(false)
                                  if (!error) {
                                    setNotifTitle("")
                                    setNotifMessage("")
                                    setNotifType("info")
                                    setNotifDialogUserId(null)
                                  } else {
                                    toast.error("შეცდომა: " + error.message)
                                  }
                                }}
                                disabled={isLoading || !notifTitle.trim() || !notifMessage.trim()}
                                className="h-14 w-full bg-blue-600 hover:bg-blue-700 rounded-2xl font-black text-[11px] uppercase tracking-widest italic"
                              >
                                {isLoading ? "იგზავნება..." : "გაგზავნა / Broadcast"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* VIP Dialog */}
                      <Dialog open={vipDialogUserId === u.id} onOpenChange={(open) => {
                        if (!open) setVipDialogUserId(null)
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="h-12 border-secondary/20 text-secondary hover:bg-secondary/5 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                            onClick={() => setVipDialogUserId(u.id)}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            VIP მინიჭება
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-black/95 backdrop-blur-3xl border border-white/10 p-1 rounded-3xl shadow-2xl overflow-hidden max-w-md">
                          <div className="p-8">
                            <DialogHeader>
                              <DialogTitle className="text-2xl font-black text-secondary italic uppercase tracking-tighter">
                                VIP_STATUS_CONTROL: {u.username}
                              </DialogTitle>
                            </DialogHeader>

                            <div className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${hasVip ? 'bg-secondary/20 text-secondary' : 'bg-white/5 text-white/20'}`}>
                                  <Star className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none">Status</div>
                                  <div className={`text-sm font-black uppercase italic ${hasVip ? 'text-secondary' : 'text-white/20'}`}>
                                    {hasVip ? 'ACTIVE_ELITE' : 'INACTIVE'}
                                  </div>
                                </div>
                              </div>
                              {hasVip && (
                                <div className="text-right">
                                  <div className="text-[10px] font-black uppercase text-white/40 tracking-widest leading-none">Expires</div>
                                  <div className="text-[10px] font-bold text-white/60">
                                    {new Date(localVipMap[u.id]).toLocaleDateString()}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="space-y-6 pt-8">
                              <div className="space-y-3">
                                <Label className="text-[10px] font-black text-secondary uppercase tracking-[0.2em] ml-2 italic">ხანგრძლივობის მინიჭება</Label>
                                <Select value={vipDuration} onValueChange={setVipDuration}>
                                  <SelectTrigger className="w-full h-14 bg-black/40 border-secondary/20 rounded-xl font-bold">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-950 border-white/10">
                                    <SelectItem value="1">1 დღე (24 საათი)</SelectItem>
                                    <SelectItem value="14">2 კვირა</SelectItem>
                                    <SelectItem value="30">1 თვე</SelectItem>
                                    <SelectItem value="365">1 წელი</SelectItem>
                                    <SelectItem value="permanent">სამუდამო (9999+)</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>

                              <div className="flex gap-3">
                                <Button
                                  onClick={() => handleGrantVip(u.id, u.username || "")}
                                  disabled={isLoading}
                                  variant="premium"
                                  className="h-14 flex-1 rounded-2xl font-black text-[11px] uppercase tracking-widest italic"
                                >
                                  {isLoading ? "..." : "Activate / Extend"}
                                </Button>
                                {hasVip && (
                                  <Button
                                    onClick={() => handleRemoveVip(u.id, u.username || "")}
                                    disabled={isLoading}
                                    variant="destructive"
                                    className="h-14 w-14 rounded-2xl flex items-center justify-center p-0"
                                    title="ჩამორთმევა"
                                  >
                                    <Trash2 className="w-5 h-5" />
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Manager Role Toggle - not for admins */}
                      {!u.is_admin && (
                        <Button
                          onClick={() => handleToggleManager(u.id, u.role)}
                          disabled={isLoading}
                          variant="outline"
                          className={`h-12 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic transition-all ${u.role === 'manager'
                              ? 'border-orange-500/30 text-orange-400 hover:bg-orange-500/10 bg-orange-500/5'
                              : 'border-orange-500/20 text-orange-400/50 hover:bg-orange-500/5'
                            }`}
                          title={u.role === 'manager' ? 'Manager-ის როლის ჩამორთმევა' : 'Manager-ის როლის მინიჭება'}
                        >
                          {u.role === 'manager' ? (
                            <><ShieldOff className="w-4 h-4 mr-2" />მენეჯერი ✕</>
                          ) : (
                            <><Shield className="w-4 h-4 mr-2" />მენეჯერი</>
                          )}
                        </Button>
                      )}

                      {/* Ban/Unban */}
                      {!u.is_admin && (
                        <>
                          {u.is_banned ? (
                            <Button
                              onClick={() => handleUnbanUser(u.id)}
                              disabled={isLoading}
                              className="h-12 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                            >
                              <Unlock className="w-4 h-4 mr-2" />
                              განბანვა
                            </Button>
                          ) : (
                            <Dialog open={banDialogUserId === u.id} onOpenChange={(open) => {
                              if (!open) setBanDialogUserId(null)
                            }}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="h-12 border-rose-500/20 text-rose-400 hover:bg-rose-500/5 rounded-xl px-6 font-black text-[10px] uppercase tracking-widest italic"
                                  onClick={() => setBanDialogUserId(u.id)}
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  დაბანვა
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-black/95 backdrop-blur-3xl border border-white/10 p-1 rounded-3xl shadow-2xl">
                                <div className="p-8">
                                  <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-rose-500 italic uppercase tracking-tighter">
                                      PROTOCOL_TERMINATION: {u.username}
                                    </DialogTitle>
                                  </DialogHeader>
                                  <div className="space-y-6 pt-8">
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-2 italic font-bold">Violation Intel</Label>
                                      <Textarea
                                        placeholder="მიუთითეთ მიზეზი..."
                                        value={banReason}
                                        onChange={(e) => setBanReason(e.target.value)}
                                        className="h-32 bg-black/40 border-rose-500/20 rounded-xl focus:border-rose-500/50 text-xs font-bold"
                                      />
                                    </div>
                                    <div className="space-y-3">
                                      <Label className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] ml-2 italic font-bold">Duration / ხანგრძლივობა</Label>
                                      <Select value={banDuration} onValueChange={setBanDuration}>
                                        <SelectTrigger className="w-full h-14 bg-black/40 border-rose-500/20 rounded-xl font-bold">
                                          <SelectValue placeholder="აირჩიეთ ხანგრძლივობა" />
                                        </SelectTrigger>
                                        <SelectContent className="glass-card border-white/10">
                                          <SelectItem value="1">1 დღე (24 საათი)</SelectItem>
                                          <SelectItem value="3">3 დღე</SelectItem>
                                          <SelectItem value="7">1 კვირა</SelectItem>
                                          <SelectItem value="30">1 თვე</SelectItem>
                                          <SelectItem value="permanent">პერმანენტული (უსასრულო)</SelectItem>
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <Button
                                      onClick={() => handleBanUser(u.id)}
                                      disabled={isLoading}
                                      className="h-16 w-full bg-rose-600 hover:bg-rose-700 rounded-2xl font-black text-[11px] uppercase tracking-widest italic"
                                    >
                                      {isLoading ? "Terminating..." : "დაბანვა / Terminate"}
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}

          {filteredUsers.length === 0 && (
            <div className="glass-card p-20 text-center">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
              <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">მომხმარებლები არ მოიძებნა</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

