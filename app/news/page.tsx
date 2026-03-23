"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  ChevronLeft, 
  Clock, 
  User as UserIcon,
  Calendar,
  Zap,
  Shield,
  ArrowRight,
  Pin,
  Search,
  Filter
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

export default function NewsArchivePage() {
  const supabase = createBrowserClient()
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<any[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")

  const categories = ["all", "სიახლე", "განახლება", "ტურნირი", "პრეკი"]

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

    if (error) {
      console.error("Fetch News Error:", error)
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }

  const filteredNews = news.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || 
                         item.content.toLowerCase().includes(search.toLowerCase())
    const matchesCategory = activeCategory === "all" || item.category === activeCategory
    return matchesSearch && matchesCategory
  })

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
     )
  }

  return (
    <div className="min-h-screen bg-background pb-32 pt-32 px-4 selection:bg-primary/30">
      <div className="container mx-auto max-w-6xl">
         <div className="flex flex-col md:flex-row items-center justify-between gap-12 mb-20 animate-reveal">
            <div className="max-w-xl text-center md:text-left">
               <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full glass border border-primary/20 mb-8">
                  <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] italic">Archive_Access</span>
               </div>
               <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.9] mb-8">
                  News <span className="text-primary tracking-normal">Archive</span>
               </h1>
            </div>

            <div className="w-full md:w-96 space-y-6">
               <div className="relative group">
                  <Input 
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="ძიება..." 
                    className="h-16 pl-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary/50 text-md italic"
                  />
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
               </div>
               <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                  {categories.map(cat => (
                     <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest italic transition-all border ${
                           activeCategory === cat 
                           ? 'bg-primary/10 border-primary/40 text-primary shadow-lg shadow-primary/10' 
                           : 'bg-white/5 border-white/5 text-muted-foreground hover:border-white/20'
                        }`}
                     >
                        {cat === 'all' ? 'Elite_All' : cat}
                     </button>
                  ))}
               </div>
            </div>
         </div>

         {filteredNews.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
               {filteredNews.map((item, i) => (
                  <div 
                     key={item.id} 
                     className="glass-card flex flex-col group animate-reveal border-white/5 hover:border-primary/20 transition-all duration-700 h-[600px]"
                     style={{ animationDelay: `${i * 0.05}s` }}
                  >
                     <div className="relative h-64 overflow-hidden">
                        <img 
                           src={item.image_url || 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg'} 
                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                           alt={item.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                        <div className="absolute top-4 left-4 flex gap-2">
                           <Badge className="bg-primary text-black border-0 uppercase italic font-black text-[9px] tracking-widest px-3 py-1">
                              {item.category}
                           </Badge>
                           {item.is_pinned && <div className="bg-secondary p-1 rounded-lg"><Pin className="w-3 h-3 text-white" /></div>}
                        </div>
                     </div>

                     <div className="p-8 flex-1 flex flex-col justify-between">
                        <div className="space-y-4">
                           <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2 italic">
                              <Calendar className="w-3 h-3 text-primary" />
                              {format(new Date(item.created_at), "d MMM, yyyy", { locale: ka })}
                           </div>
                           <h3 className="text-2xl font-black text-white italic tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                              {item.title}
                           </h3>
                           <p className="text-muted-foreground text-sm font-light italic line-clamp-3">
                              {item.content}
                           </p>
                        </div>

                        <div className="pt-8 mt-8 border-t border-white/5 flex items-center justify-between">
                           <Link 
                             href={`/profile/${item.profiles?.id}`} 
                             className="flex items-center gap-3 group/author"
                           >
                             <div className={`w-10 h-10 rounded-xl glass border overflow-hidden flex items-center justify-center transition-all ${item.profiles?.is_owner ? 'border-red-500/30 ring-2 ring-red-500/10' : 'border-white/10 group-hover/author:border-primary/50'}`}>
                                {item.profiles?.avatar_url ? (
                                   <img src={item.profiles.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                   <UserIcon className={`w-5 h-5 ${item.profiles?.is_owner ? 'text-red-500' : 'text-white/20'}`} />
                                )}
                             </div>
                             <div>
                                <div className={`text-[10px] font-black tracking-widest uppercase transition-colors ${item.profiles?.is_owner ? 'text-red-500' : 'text-white group-hover/author:text-primary'}`}>
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
         ) : (
            <div className="py-40 text-center animate-reveal">
               <div className="w-24 h-24 rounded-[2rem] glass border border-dashed border-white/10 flex items-center justify-center mx-auto mb-8 opacity-20">
                  <Search className="w-10 h-10" />
               </div>
               <h2 className="text-2xl font-black text-white/20 uppercase tracking-widest italic">ჩანაწერები ვერ მოიძებნა</h2>
            </div>
         )}
      </div>
    </div>
  )
}
