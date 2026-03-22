"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createBrowserClient } from "@/lib/supabase/client"
import { Settings, Save, Loader2, Clock, Globe, Shield, MessageSquare, ChevronLeft, Zap, Target, Activity } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { LuxuryToast } from "@/components/ui/luxury-toast"

interface Setting {
  id: string
  key: string
  value: string
  description: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null)
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  async function fetchSettings() {
    try {
      const { data, error } = await supabase.from("site_settings").select("*").order("key")
      if (error) throw error
      
      let fetchedSettings = data || []
      
      // Ensure live settings exist in the state
      const liveKeys = [
        { key: "is_live", value: "false", description: "Live Status (true/false)" },
        { key: "live_url", value: "", description: "Live Stream URL (TikTok/YouTube)" },
        { key: "live_platform", value: "youtube", description: "Live Platform (youtube/tiktok)" }
      ]
      
      liveKeys.forEach(lk => {
        if (!fetchedSettings.find(s => s.key === lk.key)) {
          fetchedSettings.push({ id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Math.random().toString(36).substring(2), ...lk })
        }
      })

      setSettings(fetchedSettings)
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    try {
      for (const setting of settings) {
        const { error } = await supabase
          .from("site_settings")
          .upsert({ 
            key: setting.key, 
            value: setting.value, 
            description: setting.description 
          }, { onConflict: 'key' })
        if (error) throw error
      }
      setToast({ message: "პარამეტრები წარმატებით შეინახა! ✅", type: 'success' })
      fetchSettings()
    } catch (error: any) {
      console.error("Error saving settings:", error)
      setToast({ message: `შეცდომა: ${error?.message || "უცნობი შეცდომა"}`, type: 'error' })
    } finally {
      setSaving(false)
    }
  }

  function updateSetting(key: string, value: string) {
    setSettings((prev) => prev.map((s) => (s.key === key ? { ...s, value } : s)))
  }

  const roomSettings = settings.filter((s) => ["room_id", "room_password", "start_time", "map"].includes(s.key))
  const otherSettings = settings.filter((s) => !["room_id", "room_password", "start_time", "map"].includes(s.key))

  if (loading) {
    return (
      <div className="min-h-screen py-32 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-6" />
          <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic font-bold">მონაცემების სინქრონიზაცია...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_0%_0%,rgba(180,0,255,0.03),transparent_70%)] -z-10" />

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
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[2rem] glass border border-primary/20 flex items-center justify-center relative group">
              <Settings className="w-10 h-10 text-primary transition-transform group-hover:rotate-90 duration-700" />
              <div className="absolute inset-0 rounded-[2rem] bg-primary/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Site <span className="text-primary tracking-normal">Config</span></h1>
              <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">გლობალური პარამეტრების მართვა</p>
            </div>
          </div>
        </div>

        <div className="grid gap-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {/* Room Info (LEGACY/REPLACED) */}
          <div className="glass-card p-1 opacity-60">
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                    <Target className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic leading-none">Match Intel Notice</h2>
                    <p className="text-xs text-muted-foreground italic mt-1 uppercase tracking-widest font-bold">Migration_Status: Per-Schedule</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-orange-500/20 text-orange-400">System_Update</Badge>
              </div>

              <div className="p-6 rounded-2xl bg-orange-500/5 border border-orange-500/10 italic">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  ოთახის ინფორმაცია (ID, პაროლი) ახლა იმართება ინდივიდუალურად თითოეული მატჩისთვის. 
                  გთხოვთ გამოიყენოთ <b><Link href="/admin/schedule" className="text-primary hover:underline font-black uppercase tracking-widest">განრიგის მართვა</Link></b> სასურველ მატჩზე ID-ს დასამატებლად.
                </p>
              </div>
            </div>
          </div>

          {/* Live Streaming Control */}
          <div className="glass-card p-1">
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic leading-none">Live Stream Intel</h2>
                    <p className="text-xs text-muted-foreground italic mt-1 uppercase tracking-widest font-bold">Broadcast_Mode_Config</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${settings.find(s => s.key === 'is_live')?.value === 'true' ? 'bg-rose-500 text-white animate-pulse' : 'bg-white/5 text-muted-foreground'}`}>
                      {settings.find(s => s.key === 'is_live')?.value === 'true' ? 'Live_Now' : 'Offline'}
                   </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Broadcast Status</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => updateSetting('is_live', 'true')}
                        className={`h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${settings.find(s => s.key === 'is_live')?.value === 'true' ? 'bg-rose-500 border-rose-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'}`}
                      >
                        Go Live
                      </button>
                      <button
                        onClick={() => updateSetting('is_live', 'false')}
                        className={`h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${settings.find(s => s.key === 'is_live')?.value === 'false' ? 'bg-white/20 border border-white/20 text-white' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'}`}
                      >
                        Turn Off
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Platform Selection</Label>
                    <div className="grid grid-cols-3 gap-3">
                      {['tiktok', 'youtube', 'other'].map(platform => (
                        <button
                          key={platform}
                          onClick={() => updateSetting('live_platform', platform)}
                          className={`h-14 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${settings.find(s => s.key === 'live_platform')?.value === platform ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-white/5 border border-white/10 text-muted-foreground hover:bg-white/10'}`}
                        >
                          {platform}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <Label htmlFor="live_url" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">Stream Destination URL</Label>
                    <div className="relative group">
                      <Input
                        id="live_url"
                        value={settings.find(s => s.key === 'live_url')?.value || ""}
                        onChange={(e) => updateSetting('live_url', e.target.value)}
                        className="h-14 bg-black/40 border-white/10 rounded-xl focus:border-primary/50 text-xs font-bold pl-12"
                        placeholder="https://tiktok.com/@user/live or youtube.com/..."
                      />
                      <Zap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    </div>
                    <p className="text-[8px] text-muted-foreground italic ml-2 mt-2">Enter the direct link to the broadcast.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Communication & Links */}
          <div className="glass-card p-1">
            <div className="p-8 lg:p-12">
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                    <Globe className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic leading-none">Intel Links</h2>
                    <p className="text-xs text-muted-foreground italic mt-1 uppercase tracking-widest font-bold">Social_And_Contact_Config</p>
                  </div>
                </div>
                <Badge variant="outline" className="border-blue-500/20 text-blue-400 font-bold">Network_Admin</Badge>
              </div>

              <div className="space-y-8">
                {otherSettings.map((setting) => (
                  <div key={setting.id} className="space-y-3">
                    <Label htmlFor={setting.key} className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">
                      {setting.description}
                    </Label>
                    <div className="relative group">
                      <Input
                        id={setting.key}
                        value={setting.value}
                        onChange={(e) => updateSetting(setting.key, e.target.value)}
                        className="h-14 bg-black/40 border-white/10 rounded-xl focus:border-primary/50 text-xs font-bold pl-12"
                      />
                      <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-12">
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  variant="premium"
                  className="h-20 w-full rounded-[2rem] font-black uppercase tracking-widest italic flex items-center gap-4 transition-all active:scale-[0.98]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-6 h-6 animate-spin" />
                      მიმდინარეობს შენახვა...
                    </>
                  ) : (
                    <>
                      <Save className="w-6 h-6" />
                      ყველა პარამეტრის დამახსოვრება
                    </>
                  )}
                </Button>

                <p className="text-center mt-6 text-[10px] text-muted-foreground uppercase tracking-[0.2em] italic font-bold">
                  Warning: Changes affect the global interface for all operators.
                </p>
              </div>
            </div>
          </div>
        </div>
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
