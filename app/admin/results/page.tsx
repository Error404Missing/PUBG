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
  Trophy, Plus, Trash2, ChevronLeft, 
  Upload, Image as ImageIcon, X, Save, 
  ArrowRight, Activity, Calendar
} from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CustomConfirm } from "@/components/ui/custom-confirm"
import { format } from "date-fns"
import { ka } from "date-fns/locale"

type Result = {
  id: string
  title: string
  description: string | null
  image_url: string | null
  created_at: string
}

export default function AdminResultsPage() {
  const router = useRouter()
  const [results, setResults] = useState<Result[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, resultId: string | null, imageUrl: string | null }>({
    isOpen: false,
    resultId: null,
    imageUrl: null
  })

  useEffect(() => {
    checkAuth()
    fetchResults()
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

  const fetchResults = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("results").select("*").order("created_at", { ascending: false })
    setResults((data as Result[]) || [])
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const supabase = createClient()

    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `results/${fileName}`

    const { error: uploadError } = await supabase.storage.from("results").upload(filePath, file)

    if (uploadError) {
      alert("სურათის ატვირთვა ვერ მოხერხდა")
      setIsUploading(false)
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("results").getPublicUrl(filePath)

    setFormData({ ...formData, imageUrl: publicUrl })
    setIsUploading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const { error } = await supabase.from("results").insert({
      title: formData.title,
      description: formData.description || null,
      image_url: formData.imageUrl || null,
    })

    if (error) {
       console.error("Result creation error:", error)
       alert("შეცდომა შედეგის გამოქვეყნებისას: " + error.message)
    } else {
      alert("შედეგი წარმატებით გამოქვეყნდა")
      setIsAdding(false)
      setFormData({
        title: "",
        description: "",
        imageUrl: "",
      })
      fetchResults()
    }
  }

  const deleteResult = async (id: string, imageUrl: string | null) => {
    const supabase = createClient()

    if (imageUrl && imageUrl.includes("results/")) {
      const filePath = imageUrl.split("results/")[1]
      await supabase.storage.from("results").remove([`results/${filePath}`])
    }

    const { error } = await supabase.from("results").delete().eq("id", id)

    if (!error) {
      fetchResults()
    }
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_100%_0%,rgba(255,180,0,0.03),transparent_70%)] -z-10" />

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
              <div className="w-20 h-20 rounded-[2rem] glass border border-blue-500/20 flex items-center justify-center relative group">
                <Trophy className="w-10 h-10 text-blue-400 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-blue-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Match <span className="text-blue-400 tracking-normal">Results</span></h1>
                <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">შედეგების და ფოტოების ადმინისტრირება</p>
              </div>
            </div>

            <Button 
              onClick={() => setIsAdding(!isAdding)} 
              variant={isAdding ? "outline" : "premium"}
              className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest italic flex items-center gap-3 transition-all active:scale-95"
            >
              {isAdding ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {isAdding ? "გაუქმება" : "ახალი შედეგი"}
            </Button>
          </div>
        </div>

        {isAdding && (
          <div className="glass-card p-1 animate-reveal mb-12">
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">ახალი მონაცემის დამატება</h2>
                 <Badge variant="outline" className="border-blue-500/20 text-blue-400">Entry_Mode</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">სათაური</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold"
                    placeholder="მაგ: Scrims Result #42"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">აღწერა</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="h-32 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-sm italic py-4"
                    placeholder="დაწერეთ დეტალური ინფორმაცია..."
                  />
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">სურათის მართვა</Label>
                    <div className="grid md:grid-cols-2 gap-4">
                       <Input
                         value={formData.imageUrl}
                         onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                         placeholder="სურათის URL (https://...)"
                         className="h-14 bg-black/40 border-white/10 rounded-xl focus:border-primary/50 text-xs font-bold"
                       />
                       <div className="relative group overflow-hidden rounded-xl">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="bg-black/40 border-white/10 text-white h-14 cursor-pointer file:h-14 file:bg-white/5 file:border-none file:text-white file:font-black file:text-[10px] file:uppercase file:px-6"
                            disabled={isUploading}
                          />
                          {isUploading && (
                             <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-primary animate-spin" />
                             </div>
                          )}
                       </div>
                    </div>
                  </div>

                  {formData.imageUrl && (
                    <div className="relative w-full h-64 rounded-[2rem] overflow-hidden border border-white/10 glass animate-reveal">
                      <Image
                        src={formData.imageUrl || "/placeholder.svg"}
                        alt="Preview"
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-105"
                        onError={() => setFormData({ ...formData, imageUrl: "" })}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
                      <div className="absolute bottom-6 left-6">
                         <Badge variant="outline" className="bg-black/50 border-white/10 text-[9px] font-black uppercase tracking-widest italic">Live_Preview</Badge>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="h-16 w-full rounded-2xl font-black uppercase tracking-widest italic" variant="premium">
                  <Save className="w-5 h-5 mr-3" />
                  შედეგის გამოქვეყნება
                </Button>
              </form>
            </div>
          </div>
        )}

        <div className="grid gap-12 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {results.map((result, i) => (
            <div key={result.id} className="glass-card p-1 group">
               <div className="relative h-96 w-full rounded-[2.5rem] overflow-hidden">
                   {result.image_url ? (
                      <Image
                        src={result.image_url}
                        alt={result.title}
                        fill
                        className="object-cover transition-transform duration-[1.5s] group-hover:scale-110"
                      />
                   ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center">
                         <ImageIcon className="w-20 h-20 text-white/10" />
                      </div>
                   )}
                   <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                   
                   <div className="absolute bottom-0 left-0 w-full p-10 flex items-end justify-between">
                      <div className="max-w-2xl">
                         <div className="flex items-center gap-3 mb-4">
                            <Badge variant="outline" className="border-secondary/20 text-secondary bg-secondary/10 px-3 py-1 font-black text-[9px] tracking-widest uppercase italic italic">
                               <Calendar className="w-3 h-3 mr-1.5" />
                               {format(new Date(result.created_at), "PPP", { locale: ka })}
                            </Badge>
                         </div>
                         <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none">{result.title}</h2>
                         <p className="text-muted-foreground font-light italic leading-relaxed line-clamp-2">{result.description}</p>
                      </div>
                       <Button
                        onClick={() => setDeleteConfirm({ isOpen: true, resultId: result.id, imageUrl: result.image_url })}
                        variant="outline"
                        className="w-14 h-14 rounded-2xl border-rose-500/20 text-rose-400 hover:bg-rose-500/10 p-0 mb-2 transition-all active:scale-95"
                      >
                        <Trash2 className="w-6 h-6" />
                      </Button>
                   </div>
               </div>
            </div>
          ))}
          
          {results.length === 0 && (
            <div className="glass-card p-20 text-center">
               <Trophy className="w-20 h-20 text-muted-foreground mx-auto mb-6 opacity-10" />
               <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">შედეგები არ მოიძებნა</p>
            </div>
          )}
        </div>
      </div>

      <CustomConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, resultId: null, imageUrl: null })}
        onConfirm={() => deleteConfirm.resultId && deleteResult(deleteConfirm.resultId, deleteConfirm.imageUrl)}
        title="შედეგის წაშლა"
        description="დარწმუნებული ხართ რომ გსურთ ამ შედეგის წაშლა? ეს ქმედება შეუქცევადია."
        confirmText="წაშლა"
        variant="danger"
      />
    </div>
  )
}
