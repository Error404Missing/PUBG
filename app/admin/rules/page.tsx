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
  BookOpen, Plus, Trash2, Edit, ChevronLeft, 
  ShieldCheck, ArrowRight, Save, X, Hash,
  MoveUp, MoveDown
} from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { CustomConfirm } from "@/components/ui/custom-confirm"

type Rule = {
  id: string
  title: string
  content: string
  order_number: number
}

export default function AdminRulesPage() {
  const router = useRouter()
  const [rules, setRules] = useState<Rule[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    orderNumber: "",
  })
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean, ruleId: string | null }>({
    isOpen: false,
    ruleId: null
  })

  useEffect(() => {
    checkAuth()
    fetchRules()
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

  const fetchRules = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("rules").select("*").order("order_number", { ascending: true })
    setRules((data as Rule[]) || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    if (editingId) {
      const { error } = await supabase
        .from("rules")
        .update({
          title: formData.title,
          content: formData.content,
          order_number: Number.parseInt(formData.orderNumber),
        })
        .eq("id", editingId)

      if (!error) {
        setEditingId(null)
        resetForm()
        fetchRules()
        setIsAdding(false)
      }
    } else {
      const { error } = await supabase.from("rules").insert({
        title: formData.title,
        content: formData.content,
        order_number: Number.parseInt(formData.orderNumber),
      })

      if (!error) {
        setIsAdding(false)
        resetForm()
        fetchRules()
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      orderNumber: (rules.length + 1).toString(),
    })
  }

  const startEdit = (rule: Rule) => {
    setEditingId(rule.id)
    setIsAdding(true)
    setFormData({
      title: rule.title,
      content: rule.content,
      orderNumber: rule.order_number.toString(),
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setIsAdding(false)
    resetForm()
  }

  const deleteRule = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("rules").delete().eq("id", id)

    if (!error) {
      fetchRules()
    }
  }

  return (
    <div className="min-h-screen py-32 px-4 relative overflow-hidden bg-background">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,0,0,0.03),transparent_70%)] -z-10" />

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
              <div className="w-20 h-20 rounded-[2rem] glass border border-red-500/20 flex items-center justify-center relative group">
                <BookOpen className="w-10 h-10 text-red-400 transition-transform group-hover:scale-110 duration-500" />
                <div className="absolute inset-0 rounded-[2rem] bg-red-500/20 blur-xl -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div>
                <h1 className="text-5xl lg:text-7xl font-black text-white italic tracking-tighter uppercase leading-none">Rules <span className="text-red-400 tracking-normal">Directives</span></h1>
                <p className="text-muted-foreground font-light tracking-[0.3em] uppercase text-xs mt-4 italic">Arena-ს წესების და სტანდარტების მართვა</p>
              </div>
            </div>

            {!isAdding && (
              <Button 
                onClick={() => { resetForm(); setIsAdding(true); }} 
                variant="premium"
                className="h-16 px-8 rounded-2xl font-black uppercase tracking-widest italic flex items-center gap-3 active:scale-95 transition-all"
              >
                <Plus className="w-5 h-5" />
                ახალი წესი
              </Button>
            )}
          </div>
        </div>

        {isAdding && (
          <div className="glass-card p-1 animate-reveal mb-12">
            <div className="p-8 lg:p-12 space-y-8">
              <div className="flex items-center justify-between">
                 <h2 className="text-2xl font-black text-white italic uppercase tracking-tighter italic">
                    {editingId ? "Directive-ს რედაქტირება" : "ახალი Directive-ს დამატება"}
                 </h2>
                 <Badge variant="outline" className="border-red-500/20 text-red-400">Security_Protocol_Edit</Badge>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-3 gap-8">
                   <div className="md:col-span-2 space-y-3">
                      <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">სათაური / Protocol Title</Label>
                      <Input
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold"
                        placeholder="მაგ: Anti-Cheat Policy"
                      />
                   </div>
                   <div className="space-y-3">
                      <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">პრიორიტეტი / Order</Label>
                      <div className="relative">
                         <Input
                           type="number"
                           required
                           value={formData.orderNumber}
                           onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                           className="h-16 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-md font-bold pl-12"
                         />
                         <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] ml-2 italic">შინაარსი / Content</Label>
                  <Textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="h-48 bg-black/40 border-white/10 rounded-2xl focus:border-primary/50 text-sm italic py-4 leading-relaxed"
                    placeholder="აღწერეთ წესი დეტალურად..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <Button type="submit" variant="premium" className="h-16 flex-1 rounded-2xl font-black uppercase tracking-widest italic group">
                    <Save className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" />
                    {editingId ? "პროტოკოლის შენახვა" : "პროტოკოლის დამატება"}
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant="outline"
                    className="h-16 px-10 rounded-2xl border-white/10 hover:bg-white/5 font-black uppercase tracking-widest italic"
                  >
                    <X className="w-5 h-5 mr-3" />
                    გაუქმება
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="space-y-6 animate-reveal" style={{ animationDelay: '0.1s' }}>
          {rules.length > 0 ? (
            rules.map((rule, index) => (
              <div key={rule.id} className="glass-card p-1 group">
                 <div className="p-8 lg:p-10">
                    <div className="flex items-start justify-between gap-8">
                       <div className="flex-1 space-y-6">
                          <div className="flex items-center gap-4">
                             <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-bold italic">
                                {rule.order_number}
                             </div>
                             <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase">{rule.title}</h3>
                             <div className="h-px flex-1 bg-white/5 mx-4 hidden md:block" />
                          </div>
                          
                          <div className="p-8 rounded-[2rem] glass border border-white/5 relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                                <ShieldCheck className="w-24 h-24 text-white" />
                             </div>
                             <p className="text-muted-foreground font-light leading-relaxed italic whitespace-pre-wrap relative z-10 text-lg">
                                {rule.content}
                             </p>
                          </div>
                       </div>

                       <div className="flex flex-col gap-3">
                          <Button
                            onClick={() => startEdit(rule)}
                            variant="outline"
                            className="w-12 h-12 rounded-xl border-blue-500/20 text-blue-400 hover:bg-blue-500/10 p-0 transition-all active:scale-95"
                          >
                            <Edit className="w-5 h-5" />
                          </Button>
                           <Button
                            onClick={() => setDeleteConfirm({ isOpen: true, ruleId: rule.id })}
                            variant="outline"
                            className="w-12 h-12 rounded-xl border-rose-500/20 text-rose-400 hover:bg-rose-500/10 p-0 transition-all active:scale-95"
                          >
                            <Trash2 className="w-5 h-5" />
                          </Button>
                       </div>
                    </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="glass-card p-20 text-center">
               <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-6 opacity-10" />
               <p className="text-muted-foreground font-black text-[10px] tracking-widest uppercase italic">წესები არ მოიძებნა</p>
            </div>
          )}
        </div>
      </div>

      <CustomConfirm
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, ruleId: null })}
        onConfirm={() => deleteConfirm.ruleId && deleteRule(deleteConfirm.ruleId)}
        title="Directive-ს წაშლა"
        description="დარწმუნებული ხართ რომ გსურთ ამ პროტოკოლის წაშლა? ეს ქმედება შეუქცევადია."
        confirmText="წაშლა"
        variant="danger"
      />
    </div>
  )
}
