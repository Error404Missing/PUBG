"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Activity, Search, ChevronLeft, RefreshCcw, 
  User, Database, Clock, Terminal, Filter,
  Trash2, AlertCircle, Shield, ArrowRight
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { LuxuryToast } from "@/components/ui/luxury-toast"

type Log = {
  id: string
  user_id: string | null
  action: string
  entity_type: string | null
  entity_id: string | null
  details: any
  created_at: string
  profiles?: {
    username: string
    email: string
  }
}

export default function AdminLogsPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<Log[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)

  useEffect(() => {
    checkAuth()
    fetchLogs()
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

  const fetchLogs = async () => {
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("logs")
      .select(`
        *,
        profiles(username, email)
      `)
      .order("created_at", { ascending: false })
      .limit(100)

    const { data, error } = await query

    if (error) {
      setToast({ message: "ლოგების წამოღების შეცდომა: " + error.message, type: 'error' })
    } else {
      setLogs((data as any[]) || [])
    }
    setIsLoading(false)
  }

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.profiles?.username?.toLowerCase().includes(search.toLowerCase()) ||
      log.entity_type?.toLowerCase().includes(search.toLowerCase())
    
    if (filterType === "all") return matchesSearch
    return matchesSearch && log.entity_type === filterType
  })

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.05),transparent_70%)] -z-10" />

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
                <Terminal className="w-10 h-10 text-blue-400 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none italic">System <span className="text-blue-400 tracking-normal">Logs</span></h1>
                <div className="flex items-center gap-4 mt-4">
                  <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs italic">ყველა აქტივობის მონიტორინგი</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLogs}
                    className="h-7 border-blue-500/20 text-blue-400 text-[8px] font-black uppercase tracking-widest px-3 rounded-lg hover:bg-blue-500/5 transition-all"
                  >
                    <RefreshCcw className={`w-3 h-3 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 glass p-4 rounded-2xl border border-white/5">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-blue-400 transition-colors" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ფილტრაცია (მოქმედება, მომხმარებელი...)"
                  className="h-12 w-64 md:w-80 bg-black/40 border-white/10 rounded-xl focus:border-blue-500/50 pl-11 text-xs font-bold"
                />
              </div>
              
              <div className="flex gap-2">
                {['all', 'team', 'schedule', 'user', 'settings'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic border ${
                      filterType === type 
                      ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                      : 'border-transparent text-muted-foreground hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-32 text-center animate-reveal">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic italic">სისტემური ლოგების წაკითხვა...</p>
          </div>
        ) : (
          <div className="grid gap-4 animate-reveal">
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="glass-card p-1 transition-all duration-300 hover:translate-x-1"
                >
                  <div className="p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                        log.entity_type === 'team' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        log.entity_type === 'schedule' ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' :
                        log.entity_type === 'user' ? 'bg-blue-500/10 border-blue-500/20 text-blue-400' :
                        'bg-zinc-500/10 border-zinc-500/20 text-zinc-400'
                      }`}>
                        {log.entity_type === 'team' ? <Shield className="w-6 h-6" /> :
                         log.entity_type === 'schedule' ? <Clock className="w-6 h-6" /> :
                         log.entity_type === 'user' ? <User className="w-6 h-6" /> :
                         <Database className="w-6 h-6" />}
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-black text-white italic uppercase tracking-tight">{log.action}</h3>
                          <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest bg-white/5 border-white/10">{log.entity_type || 'system'}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">
                          <span className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-blue-400" />
                            {log.profiles?.username || 'System'}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-purple-400" />
                            {format(new Date(log.created_at), "PPP p", { locale: ka })}
                          </span>
                          {log.entity_id && (
                            <span className="flex items-center gap-1.5">
                              <Database className="w-3 h-3 text-zinc-400" />
                              ID: {log.entity_id.slice(0, 8)}...
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="md:text-right">
                      {log.details && Object.keys(log.details).length > 0 && (
                        <div className="glass p-3 rounded-lg border border-white/5 text-[9px] font-mono text-white/40 max-w-xs overflow-hidden">
                          {JSON.stringify(log.details)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-card p-20 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic italic">ლოგები არ მოიძებნა</p>
              </div>
            )}
          </div>
        )}
      </div>

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
