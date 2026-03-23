"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  ChevronLeft, 
  Clock, 
  User as UserIcon,
  Calendar,
  Zap,
  Shield,
  ArrowRight,
  Pin
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

export default function SingleNewsPage() {
  const { id } = useParams()
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [news, setNews] = useState<any>(null)

  useEffect(() => {
    if (id) fetchNews()
  }, [id])

  const fetchNews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("news")
      .select("*, profiles(*)")
      .eq("id", id)
      .single()

    if (error) {
      console.error("Fetch News Error:", error)
      router.push("/news")
    } else {
      setNews(data)
    }
    setLoading(false)
  }

  if (loading) {
     return (
        <div className="min-h-screen flex items-center justify-center bg-background">
           <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
     )
  }

  if (!news) return null

  return (
    <div className="min-h-screen bg-background pb-32 selection:bg-primary/30">
      {/* Hero Header */}
      <div className="relative h-[60vh] md:h-[70vh] w-full overflow-hidden">
         <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[2s] hover:scale-110" 
            style={{ backgroundImage: `url(${news.image_url || 'https://i.ibb.co/vYm0C2M/default-banner-dark.jpg'})` }} 
         />
         <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
         
         <div className="absolute top-10 left-10 z-20">
            <Button onClick={() => router.back()} variant="outline" className="h-12 px-6 rounded-2xl glass border-white/10 text-white italic uppercase tracking-widest text-[10px] font-black group">
               <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> უკან დაბრუნება
            </Button>
         </div>

         <div className="absolute bottom-0 left-0 w-full p-8 md:p-20">
            <div className="container mx-auto max-w-6xl">
               <div className="flex items-center gap-4 mb-6">
                  <Badge className="bg-primary text-black border-0 px-4 py-2 font-black italic tracking-widest text-[11px] uppercase">
                     {news.category}
                  </Badge>
                  {news.is_pinned && <Pin className="w-5 h-5 text-secondary animate-pulse" />}
                  <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em] italic px-4 py-2 rounded-full glass border border-white/5 flex items-center gap-2">
                     <Clock className="w-4 h-4 text-primary" />
                     {format(new Date(news.created_at), "d MMMM, yyyy", { locale: ka })}
                  </div>
               </div>
               <h1 className="text-5xl md:text-8xl font-black text-white italic tracking-tighter uppercase leading-[0.9] max-w-4xl animate-reveal drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                  {news.title}
               </h1>
            </div>
         </div>
      </div>

      <div className="container mx-auto max-w-4xl mt-20 px-8">
         <div className="glass-card p-10 md:p-20 border-white/5 relative overflow-hidden leading-relaxed">
            {/* Design accents */}
            <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
               <Zap className="w-[400px] h-[400px] text-primary" />
            </div>

            <div className="relative z-10 space-y-8">
               <div className="text-xl md:text-2xl text-white font-light italic whitespace-pre-line group">
                  {news.content}
               </div>

               <div className="pt-20 mt-20 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-12">
                  {/* Author Card */}
                  <div className="space-y-4">
                     <div className="text-[10px] font-black text-white/30 uppercase tracking-[0.4em] italic leading-none">News_Transmission_Author</div>
                     <Link 
                       href={`/profile/${news.profiles?.id}`} 
                       className="flex items-center gap-4 group/author"
                     >
                       <div className={`w-14 h-14 rounded-2xl glass border overflow-hidden flex items-center justify-center transition-all ${news.profiles?.is_owner ? 'border-red-500/30' : 'border-white/10 group-hover/author:border-primary/50'}`}>
                          {news.profiles?.avatar_url ? (
                             <img src={news.profiles.avatar_url} className="w-full h-full object-cover" />
                          ) : (
                             <UserIcon className={`w-6 h-6 ${news.profiles?.is_owner ? 'text-red-500' : 'text-white/20'}`} />
                          )}
                       </div>
                       <div className="text-left">
                          <div className={`text-xl font-black italic tracking-tight transition-colors uppercase ${news.profiles?.is_owner ? 'text-red-600' : 'text-white group-hover/author:text-primary'}`}>
                             {news.profiles?.username || 'ანონიმური'}
                          </div>
                          <div className="text-[10px] font-black text-white/30 uppercase tracking-widest italic leading-none mt-1">
                             {news.profiles?.is_owner ? 'Founder_Owner_Elite' : 'Sector_Manager'}
                          </div>
                       </div>
                     </Link>
                  </div>

                  <div className="flex gap-4">
                     <Button asChild variant="outline" className="h-16 px-10 rounded-[2rem] border-white/10 hover:bg-white/5 uppercase italic font-black text-xs tracking-widest">
                        <Link href="/news">ყველა სიახლე</Link>
                     </Button>
                     <Button onClick={() => router.push("/")} variant="premium" className="h-16 px-10 rounded-[2rem] uppercase italic font-black text-xs tracking-widest">
                        მთავარი გვერდი
                     </Button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}
