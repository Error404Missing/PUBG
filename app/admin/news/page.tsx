"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Save, 
  ChevronLeft, 
  Clock, 
  User as UserIcon,
  Search,
  Pin,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

export default function AdminNewsPage() {
  const supabase = createBrowserClient()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [news, setNews] = useState<any[]>([])
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  const [isAddingNews, setIsAddingNews] = useState(false)

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image_url: "",
    category: "სიახლე",
    is_pinned: false
  })

  useEffect(() => {
    fetchNews()
  }, [])

  const fetchNews = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("news")
      .select("*, profiles(username)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch News Error:", error)
      setToast({ message: "სიახლეების ჩატვირთვა ვერ მოხერხდა", type: 'error' })
    } else {
      setNews(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from("news")
      .insert({
        title: formData.title,
        content: formData.content,
        image_url: formData.image_url,
        category: formData.category,
        is_pinned: formData.is_pinned,
        author_id: user.id
      })

    if (error) {
      setToast({ message: "შეცდომა შენახვისას: " + error.message, type: 'error' })
    } else {
      setToast({ message: "სიახლე წარმატებით დაემატა", type: 'success' })
      setFormData({
        title: "",
        content: "",
        image_url: "",
        category: "სიახლე",
        is_pinned: false
      })
      setIsAddingNews(false)
      fetchNews()
    }
    setIsSubmitting(false)
  }

  const deleteNews = async (id: string) => {
    const { error } = await supabase.from("news").delete().eq("id", id)
    if (error) {
      setToast({ message: "წაშლა ვერ მოხერხდა", type: 'error' })
    } else {
      setToast({ message: "სიახლე წაიშალა", type: 'success' })
      fetchNews()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="container mx-auto max-w-6xl pt-32 px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="animate-reveal">
            <Link 
              href="/admin" 
              className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-4 group"
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              <span className="text-[10px] font-black uppercase tracking-widest italic">უკან პანელში</span>
            </Link>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase leading-none">
              News <span className="text-primary tracking-normal">Management</span>
            </h1>
          </div>
          
          <Button 
            onClick={() => setIsAddingNews(!isAddingNews)} 
            variant={isAddingNews ? "outline" : "premium"}
            className="h-14 px-8 rounded-2xl animate-reveal"
            style={{ animationDelay: '0.1s' }}
          >
            {isAddingNews ? <X className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
            {isAddingNews ? "გაუქმება" : "ახალი სიახლე"}
          </Button>
        </div>

        {isAddingNews && (
          <div className="glass-card p-8 lg:p-12 mb-12 animate-reveal border-primary/20">
            <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter mb-8 italic">Add_New_Update</h2>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest italic ml-2">სათაური</label>
                  <Input 
                    required 
                    value={formData.title} 
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    placeholder="შეიყვანეთ სათაური"
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-primary uppercase tracking-widest italic ml-2">კატეგორია</label>
                  <select 
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white focus:border-primary outline-none"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                  >
                    <option value="სიახლე">სიახლე</option>
                    <option value="განახლება">განახლება</option>
                    <option value="ტურნირი">ტურნირი</option>
                    <option value="პრეკი">პრეკი</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest italic ml-2">სურათის ლინკი (URL)</label>
                <div className="relative">
                  <Input 
                    value={formData.image_url} 
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    placeholder="https://..."
                    className="h-14 bg-white/5 border-white/10 rounded-2xl focus:border-primary pl-12"
                  />
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black text-primary uppercase tracking-widest italic ml-2">სიახლის ტექსტი</label>
                <textarea 
                  required
                  className="w-full h-48 bg-white/5 border border-white/10 rounded-3xl p-6 text-white text-md focus:border-primary outline-none italic"
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  placeholder="რამე საინტერესო..."
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 w-fit">
                <input 
                  type="checkbox" 
                  id="pinned" 
                  checked={formData.is_pinned}
                  onChange={e => setFormData({...formData, is_pinned: e.target.checked})}
                  className="w-5 h-5 rounded border-white/20 bg-black/40 text-primary focus:ring-primary/50"
                />
                <label htmlFor="pinned" className="text-[10px] font-black text-white uppercase tracking-widest italic cursor-pointer">Pin to Top / პინი</label>
              </div>

              <Button 
                type="submit" 
                disabled={isSubmitting} 
                variant="premium" 
                className="h-16 w-full md:w-64 rounded-2xl text-md font-black uppercase tracking-widest italic"
              >
                {isSubmitting ? "ინახება..." : "სიახლის გამოქვეყნება"}
              </Button>
            </form>
          </div>
        )}

        <div className="grid gap-6">
          {news.length > 0 ? (
            news.map((item, i) => (
              <div 
                key={item.id} 
                className="glass-card p-6 flex flex-col md:flex-row items-center gap-8 animate-reveal border-white/5 group"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {item.image_url && (
                  <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shadow-lg shadow-black/40">
                    <img src={item.image_url} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" alt={item.title} />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className="bg-primary/20 text-primary border-primary/20 uppercase italic text-[8px] tracking-widest">{item.category}</Badge>
                    {item.is_pinned && <Pin className="w-3 h-3 text-secondary" />}
                    <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em] italic ml-auto flex items-center gap-2">
                       <Clock className="w-3 h-3" />
                       {format(new Date(item.created_at), "d MMMM, HH:mm", { locale: ka })}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white italic uppercase tracking-tight mb-2">{item.title}</h3>
                  <p className="text-muted-foreground text-sm font-light italic line-clamp-2">{item.content}</p>
                  
                  <div className="flex items-center gap-6 mt-4 pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full glass border border-white/10 flex items-center justify-center">
                        <UserIcon className="w-3 h-3 text-white/40" />
                      </div>
                      <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{item.profiles?.username}</span>
                    </div>
                    <Button 
                      onClick={() => deleteNews(item.id)} 
                      variant="outline" 
                      className="h-10 px-4 rounded-xl border-rose-500/20 text-rose-500 hover:bg-rose-500/10 ml-auto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-20 text-center border-dashed border-white/10 opacity-30">
               <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
               <p className="text-sm font-black uppercase tracking-widest">სიახლეები ჯერ არ არის</p>
            </div>
          )}
        </div>
      </div>

      {toast && <LuxuryToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
