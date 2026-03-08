"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, Plus, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

type Schedule = {
  id: string
  title: string
  description: string | null
  date: string
  map_name: string | null
  max_teams: number
  is_active: boolean
}

export default function AdminSchedulePage() {
  const router = useRouter()
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    mapName: "",
    maxTeams: "100",
  })

  useEffect(() => {
    checkAuth()
    fetchSchedules()
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

  const fetchSchedules = async () => {
    const supabase = createClient()
    const { data } = await supabase.from("schedules").select("*").order("date", { ascending: false })
    setSchedules((data as Schedule[]) || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    const dateTime = `${formData.date}T${formData.time}:00`

    const { error } = await supabase.from("schedules").insert({
      title: formData.title,
      description: formData.description || null,
      date: dateTime,
      map_name: formData.mapName || null,
      max_teams: Number.parseInt(formData.maxTeams),
      is_active: true,
    })

    if (!error) {
      setIsAdding(false)
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        mapName: "",
        maxTeams: "100",
      })
      fetchSchedules()
    }
  }

  const deleteSchedule = async (id: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ მატჩის წაშლა?")) return

    const supabase = createClient()
    const { error } = await supabase.from("schedules").delete().eq("id", id)

    if (!error) {
      fetchSchedules()
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <Calendar className="w-10 h-10" />
              განრიგის მართვა
            </h1>
            <p className="text-gray-400">დაამატე ახალი მატჩები და ტურნირები</p>
          </div>
          <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-5 h-5" />
            ახალი მატჩი
          </Button>
        </div>

        {isAdding && (
          <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-blue-400">ახალი მატჩის დამატება</CardTitle>
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
                  <Label className="text-gray-200">აღწერა</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-200">თარიღი</Label>
                    <Input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-gray-900/50 border-blue-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200">დრო</Label>
                    <Input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="bg-gray-900/50 border-blue-500/30 text-white"
                    />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-200">რუკა</Label>
                    <Input
                      value={formData.mapName}
                      onChange={(e) => setFormData({ ...formData, mapName: e.target.value })}
                      placeholder="Erangel, Miramar, etc."
                      className="bg-gray-900/50 border-blue-500/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-200">მაქს. გუნდები</Label>
                    <Input
                      type="number"
                      required
                      value={formData.maxTeams}
                      onChange={(e) => setFormData({ ...formData, maxTeams: e.target.value })}
                      className="bg-gray-900/50 border-blue-500/30 text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                    დამატება
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    variant="outline"
                    className="border-gray-500/50"
                  >
                    გაუქმება
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className="bg-black/50 border-blue-500/20 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-blue-400 mb-2">{schedule.title}</h3>
                    {schedule.description && <p className="text-gray-400 mb-4">{schedule.description}</p>}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                      <span>თარიღი: {new Date(schedule.date).toLocaleDateString("ka-GE")}</span>
                      <span>დრო: {new Date(schedule.date).toLocaleTimeString("ka-GE")}</span>
                      {schedule.map_name && <span>რუკა: {schedule.map_name}</span>}
                      <span>მაქს. გუნდები: {schedule.max_teams}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteSchedule(schedule.id)}
                    size="sm"
                    variant="outline"
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {schedules.length === 0 && (
            <Card className="bg-black/50 border-blue-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">მატჩები ჯერ არ არის დამატებული</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
