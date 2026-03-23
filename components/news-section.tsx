"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  Clock, 
  User as UserIcon,
  Search,
  Pin,
  X,
  ArrowRight,
  Shield,
  Crown
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

export function NewsSection() {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<any[]>([])

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("news")
      .select("*, profiles(*)")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(6)

    if (error) {
      console.error("Fetch News Error:", error)
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (news.length === 0) return null

  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 right-0 w-64 h-64 bg-primary/5 blur-[100px] -z-10" />
      <div className="absolute bottom-1/4 left-0 w-64 h-64 bg-accent/5 blur-[100px] -z-10" />

      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20 animate-reveal">
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-primary/20 mb-6 group">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">Operational_Logs</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                Arena <span className="text-primary tracking-normal">Updates</span>
              </h2>
           </div>
           
           <p className="text-muted-foreground font-light italic text-lg max-w-sm border-l-2 border-primary/20 pl-6 hidden lg:block">
              მიიღე უახლესი ინფორმაცია ტურნირების, განახლებებისა და სიახლეების შესახებ პირდაპირ წყაროდან.
           </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((item, i) => (
            <div 
              key={item.id} 
              className="glass-card flex flex-col group animate-reveal border-white/5 hover:border-primary/20 transition-all duration-700 h-full"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {/* Image Area */}
              <div className="relative aspect-video overflow-hidden group">
                <img 
                  src={item.image_url || 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg'} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                  alt={item.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge className="bg-primary text-black border-0 uppercase italic font-black text-[9px] tracking-widest px-3 py-1">
                    {item.category}
                  </Badge>
                  {item.is_pinned && (
                    <div className="bg-secondary/90 backdrop-blur-md text-white px-2 py-1 rounded-lg">
                      <Pin className="w-3 h-3" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content Area */}
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4 text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">
                   <Clock className="w-3 h-3 text-primary" />
                   {format(new Date(item.created_at), "d MMMM, yyyy", { locale: ka })}
                </div>

                <h3 className="text-2xl font-black text-white italic tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-2 mb-4 leading-tight">
                   {item.title}
                </h3>
                
                <p className="text-muted-foreground text-sm font-light italic line-clamp-3 mb-8 flex-1">
                   {item.content}
                </p>

                {/* Author Card (Highlight for Owner) */}
                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                   <Link 
                     href={item.profiles?.id ? `/user/${item.profiles.id}` : '#'} 
                     className="flex items-center gap-3 group/author"
                   >
                     <div className={`w-10 h-10 rounded-xl glass border overflow-hidden flex items-center justify-center transition-all ${item.profiles?.is_owner ? 'border-red-500/30 ring-2 ring-red-500/10' : 'border-white/10 group-hover/author:border-primary/50'}`}>
                        {item.profiles?.avatar_url ? (
                           <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />
                        ) : (
                           <UserIcon className={`w-5 h-5 ${item.profiles?.is_owner ? 'text-red-500' : 'text-white/20'}`} />
                        )}
                     </div>
                     <div className="text-left">
                        <div className={`text-[10px] font-black tracking-widest uppercase transition-colors ${item.profiles?.is_owner ? 'text-red-500 group-hover/author:text-red-400' : 'text-white group-hover/author:text-primary'}`}>
                           {item.profiles?.username || 'ანონიმური'}
                        </div>
                        <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] italic leading-none mt-0.5">
                           {item.profiles?.is_owner ? 'Founder_Owner' : 'Executive_Staff'}
                        </div>
                     </div>
                   </Link>

                   <Link 
                    href={`/news/${item.id}`} 
                    className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center text-white/40 hover:text-primary hover:border-primary/40 transition-all hover:scale-110"
                   >
                      <ArrowRight className="w-5 h-5" />
                   </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* News Archive Link */}
        <div className="mt-20 text-center animate-reveal" style={{ animationDelay: '0.4s' }}>
           <Button asChild variant="outline" className="h-16 px-12 rounded-full glass border-white/10 hover:bg-primary/10 hover:text-primary hover:border-primary/40 transition-all italic font-black uppercase tracking-widest group">
              <Link href="/news" className="flex items-center gap-3">
                 მთლიანი არქივი
                 <Plus className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              </Link>
           </Button>
        </div>
      </div>
    </section>
  )
}
