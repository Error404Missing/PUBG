"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Users } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function RegisterTeamPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    teamName: "",
    teamTag: "",
    playersCount: "4",
    mapsCount: "1",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/auth/login")
      } else {
        setUserId(user.id)
      }
    })
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const supabase = createClient()

    try {
      const { error } = await supabase.from("teams").insert({
        team_name: formData.teamName,
        team_tag: formData.teamTag,
        leader_id: userId,
        players_count: Number.parseInt(formData.playersCount),
        maps_count: Number.parseInt(formData.mapsCount),
        status: "draft",
      })

      if (error) throw error

      router.push("/profile")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "შეცდომა მოხდა")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-2">
            <Users className="w-10 h-10 text-blue-400" />
            გუნდის რეგისტრაცია
          </h1>
          <p className="text-gray-400">შეავსეთ ყველა ველი თქვენი გუნდის რეგისტრაციისთვის</p>
        </div>

        <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-blue-400">გუნდის ინფორმაცია</CardTitle>
            <CardDescription className="text-gray-400">ყველა ველი სავალდებულოა</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="teamName" className="text-gray-200">
                    გუნდის სახელი
                  </Label>
                  <Input
                    id="teamName"
                    name="teamName"
                    required
                    value={formData.teamName}
                    onChange={handleChange}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="teamTag" className="text-gray-200">
                    გუნდის ტეგი
                  </Label>
                  <Input
                    id="teamTag"
                    name="teamTag"
                    required
                    placeholder="TAG"
                    value={formData.teamTag}
                    onChange={handleChange}
                    className="bg-gray-900/50 border-blue-500/30 text-white"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-blue-500/20">
                <div>
                  <Label htmlFor="playersCount" className="text-gray-200">
                    მოთამაშეების რაოდენობა
                  </Label>
                  <Select
                    value={formData.playersCount}
                    onValueChange={(value) => setFormData({ ...formData, playersCount: value })}
                  >
                    <SelectTrigger className="bg-gray-900/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-blue-500/30">
                      <SelectItem value="1">1 მოთამაშე</SelectItem>
                      <SelectItem value="2">2 მოთამაშე</SelectItem>
                      <SelectItem value="3">3 მოთამაშე</SelectItem>
                      <SelectItem value="4">4 მოთამაშე</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="mapsCount" className="text-gray-200">
                    მაპების რაოდენობა
                  </Label>
                  <Select
                    value={formData.mapsCount}
                    onValueChange={(value) => setFormData({ ...formData, mapsCount: value })}
                  >
                    <SelectTrigger className="bg-gray-900/50 border-blue-500/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-blue-500/30">
                      <SelectItem value="1">1 მაპი</SelectItem>
                      <SelectItem value="2">2 მაპი</SelectItem>
                      <SelectItem value="3">3 მაპი</SelectItem>
                      <SelectItem value="4">4 მაპი</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-md">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="pt-4">
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? "რეგისტრაცია..." : "გუნდის რეგისტრაცია"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
