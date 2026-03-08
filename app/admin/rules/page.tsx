"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BookOpen, Plus, Trash2, Edit } from "lucide-react"
import { useRouter } from "next/navigation"

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
      orderNumber: "",
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
    if (!confirm("დარწმუნებული ხართ რომ გსურთ წესის წაშლა?")) return

    const supabase = createClient()
    const { error } = await supabase.from("rules").delete().eq("id", id)

    if (!error) {
      fetchRules()
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <BookOpen className="w-10 h-10" />
              წესების მართვა
            </h1>
            <p className="text-gray-400">დაამატე, შეცვალე ან წაშალე წესები</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              ახალი წესი
            </Button>
          )}
        </div>

        {isAdding && (
          <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-blue-400">
                {editingId ? "წესის რედაქტირება" : "ახალი წესის დამატება"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label className="text-gray-200">სათაური</Label>
                  <Input
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">შინაარსი</Label>
                  <Textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="bg-gray-900/50 border-blue-500/30 text-white min-h-32"
                  />
                </div>
                <div>
                  <Label className="text-gray-200">რიგითი ნომერი</Label>
                  <Input
                    type="number"
                    required
                    value={formData.orderNumber}
                    onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    {editingId ? "შენახვა" : "დამატება"}
                  </Button>
                  <Button
                    type="button"
                    onClick={cancelEdit}
                    variant="outline"
                    className="border-gray-500/50 bg-transparent"
                  >
                    გაუქმება
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {rules.map((rule, index) => (
            <Card key={rule.id} className="bg-black/50 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">
                      {index + 1}. {rule.title}
                    </h3>
                    <p className="text-gray-300">{rule.content}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => startEdit(rule)}
                      size="sm"
                      variant="outline"
                      className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => deleteRule(rule.id)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {rules.length === 0 && (
            <Card className="bg-black/50 border-blue-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">წესები ჯერ არ არის დამატებული</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
