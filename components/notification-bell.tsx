"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bell, CheckCheck, X, Info, CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

interface Notification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  is_read: boolean
  created_at: string
}

export function NotificationBell({ userId }: { userId: string }) {
  const supabase = createClient()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20)
    setNotifications((data as Notification[]) || [])
  }

  useEffect(() => {
    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel("notifications:" + userId)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [isOpen])

  const markAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.is_read).map((n) => n.id)
    if (unreadIds.length === 0) return
    await supabase.from("notifications").update({ is_read: true }).in("id", unreadIds)
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
  }

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)))
  }

  const iconForType = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
      case "warning": return <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
      case "error": return <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
      default: return <Info className="w-4 h-4 text-blue-400 flex-shrink-0" />
    }
  }

  const colorForType = (type: string) => {
    switch (type) {
      case "success": return "border-l-emerald-500/50"
      case "warning": return "border-l-yellow-500/50"
      case "error": return "border-l-rose-500/50"
      default: return "border-l-blue-500/50"
    }
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => { setIsOpen(!isOpen); if (!isOpen) markAllRead() }}
        className="relative w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center hover:border-primary/50 transition-all group"
      >
        <Bell className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-black text-black animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute top-14 right-0 w-80 sm:w-96 bg-[#080c14]/95 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl shadow-black/50 z-[200] overflow-hidden animate-reveal">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-primary" />
              <span className="text-sm font-black text-white uppercase tracking-widest italic">შეტყობინებები</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-primary/20 text-primary text-[9px] font-black rounded-full border border-primary/20">
                  {unreadCount} ახალი
                </span>
              )}
            </div>
            <button
              onClick={markAllRead}
              className="flex items-center gap-1 text-[9px] font-black text-muted-foreground hover:text-primary transition-colors uppercase tracking-widest"
            >
              <CheckCheck className="w-3 h-3" />
              ყველა წაკითხული
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 text-center">
                <Bell className="w-8 h-8 text-white/10 mx-auto mb-3" />
                <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest italic">შეტყობინებები არ არის</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markRead(n.id)}
                  className={`flex gap-3 p-4 border-b border-white/3 border-l-2 ${colorForType(n.type)} cursor-pointer transition-all hover:bg-white/3 ${
                    !n.is_read ? "bg-white/3" : "opacity-60"
                  }`}
                >
                  <div className="pt-0.5">{iconForType(n.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-black text-white leading-tight">{n.title}</p>
                      {!n.is_read && (
                        <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0 mt-1" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                    <p className="text-[9px] text-white/20 mt-1.5 font-black uppercase tracking-widest">
                      {format(new Date(n.created_at), "d MMM, HH:mm", { locale: ka })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
