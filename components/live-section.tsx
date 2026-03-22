"use client"

import { useEffect, useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Play, ExternalLink, Radio, Disc as Discord } from "lucide-react"
import Link from "next/link"

export function LiveSection() {
  const [liveInfo, setLiveInfo] = useState<{
    isLive: boolean
    url: string
    platform: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createBrowserClient()

  useEffect(() => {
    async function fetchLiveStatus() {
      try {
        const { data, error } = await supabase
          .from("site_settings")
          .select("key, value")
          .in("key", ["is_live", "live_url", "live_platform"])

        if (!error && data) {
          const info = {
            isLive: data.find(s => s.key === "is_live")?.value === "true",
            url: data.find(s => s.key === "live_url")?.value || "",
            platform: data.find(s => s.key === "live_platform")?.value || "youtube"
          }
          setLiveInfo(info)
        }
      } catch (err) {
        console.error("Failed to fetch live status", err)
      } finally {
        setLoading(false)
      }
    }

    fetchLiveStatus()

    // Real-time subscription to site_settings
    const channel = supabase
      .channel('live-status')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'site_settings' 
      }, () => {
        fetchLiveStatus()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  if (loading || !liveInfo?.isLive) return null

  return (
    <section className="py-12 px-4 animate-reveal">
      <div className="container mx-auto">
        <div className="relative group overflow-hidden rounded-[2.5rem] glass-darker border border-rose-500/20 shadow-[0_0_50px_rgba(244,63,94,0.1)]">
          {/* Animated Glow */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-rose-500/10 to-transparent -z-10" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500/20 to-orange-500/20 blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-8">
              <div className="relative">
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-rose-500 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.4)] animate-pulse-soft">
                  <Radio className="w-10 h-10 md:w-12 md:h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white text-rose-500 text-[10px] font-black px-2 py-1 rounded-full shadow-lg uppercase tracking-widest border border-rose-500/20">
                  Live
                </div>
              </div>
              
              <div className="text-left">
                <div className="flex items-center gap-3 mb-2">
                   <div className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                   <span className="text-rose-500 text-[10px] font-black uppercase tracking-[0.3em] italic">Live Broadcast Protocol</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-none mb-4">
                  SCRIMS <span className="text-rose-500">ON AIR</span>
                </h2>
                <p className="text-muted-foreground text-sm font-light max-w-md italic border-l-2 border-rose-500/20 pl-4">
                  ჩვენი სკრიმები ახლა პირდაპირ ეთერშია {liveInfo.platform === 'tiktok' ? 'TikTok' : 'YouTube'}-ზე. 
                  შემოგვიერთდი და უყურე საუკეთესო ქართულ გუნდებს.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button asChild className="h-16 px-10 rounded-2xl bg-rose-500 text-white hover:bg-rose-600 shadow-[0_0_30px_rgba(244,63,94,0.3)] active:scale-95 transition-all text-sm font-black uppercase tracking-widest italic group">
                <Link href={liveInfo.url} target="_blank" className="flex items-center gap-3">
                  <Play className="w-5 h-5 group-hover:scale-125 transition-transform" />
                  Watch Stream
                </Link>
              </Button>
              <Button variant="outline" asChild className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 text-muted-foreground hover:text-white transition-all text-sm font-black uppercase tracking-widest italic">
                 <Link href={liveInfo.url} target="_blank" className="flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    Open Platform
                 </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
