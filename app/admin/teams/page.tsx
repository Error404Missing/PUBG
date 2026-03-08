"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Check, X, Ban, Crown, Trash2, Users, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"

type Team = {
  id: string
  team_name: string
  team_tag: string
  status: string
  is_vip: boolean
  slot_number: number | null
  players_count: number
  maps_count: number
  profiles: {
    username: string
  }
}

export default function AdminTeamsPage() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [filter, setFilter] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [editingSlot, setEditingSlot] = useState<string | null>(null)
  const [slotValue, setSlotValue] = useState<string>("")

  useEffect(() => {
    checkAuth()
    fetchTeams()
  }, [filter])

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

  const fetchTeams = async () => {
    setIsLoading(true)
    const supabase = createClient()

    let query = supabase.from("teams").select("*, profiles!teams_leader_id_fkey(username)").order("created_at", {
      ascending: false,
    })

    if (filter !== "all") {
      query = query.eq("status", filter)
    }

    const { data } = await query
    console.log("[v0] Fetched teams data:", data)
    setTeams((data as Team[]) || [])
    setIsLoading(false)
  }

  const updateTeamStatus = async (teamId: string, status: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("teams").update({ status }).eq("id", teamId)

    if (!error) {
      fetchTeams()
    }
  }

  const toggleVIP = async (teamId: string, currentVipStatus: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("teams").update({ is_vip: !currentVipStatus }).eq("id", teamId)

    if (!error) {
      fetchTeams()
    }
  }

  const updateSlot = async (teamId: string) => {
    const supabase = createClient()
    const slot = slotValue ? Number.parseInt(slotValue) : null
    const { error } = await supabase.from("teams").update({ slot_number: slot }).eq("id", teamId)

    if (!error) {
      setEditingSlot(null)
      setSlotValue("")
      fetchTeams()
    }
  }

  const deleteTeam = async (teamId: string) => {
    if (!confirm("დარწმუნებული ხართ რომ გსურთ გუნდის წაშლა?")) return

    const supabase = createClient()

    const { data: team } = await supabase.from("teams").select("leader_id").eq("id", teamId).single()

    const { error } = await supabase.from("teams").delete().eq("id", teamId)

    if (!error && team?.leader_id) {
      // Reset the user's role to guest
      await supabase.from("profiles").update({ role: "guest" }).eq("id", team.leader_id)
    }

    if (!error) {
      fetchTeams()
    }
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-2">
            <Users className="w-10 h-10" />
            გუნდების მართვა
          </h1>
          <p className="text-gray-400">დაადასტურე, უარყავი, დაბლოკე ან წაშალე გუნდები</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            onClick={() => setFilter("all")}
            variant={filter === "all" ? "default" : "outline"}
            className={filter === "all" ? "bg-blue-600" : "border-blue-500/50 text-blue-400 hover:bg-blue-500/10"}
          >
            ყველა
          </Button>
          <Button
            onClick={() => setFilter("pending")}
            variant={filter === "pending" ? "default" : "outline"}
            className={
              filter === "pending" ? "bg-yellow-600" : "border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10"
            }
          >
            განხილვაში
          </Button>
          <Button
            onClick={() => setFilter("approved")}
            variant={filter === "approved" ? "default" : "outline"}
            className={
              filter === "approved" ? "bg-green-600" : "border-green-500/50 text-green-400 hover:bg-green-500/10"
            }
          >
            დადასტურებული
          </Button>
          <Button
            onClick={() => setFilter("rejected")}
            variant={filter === "rejected" ? "default" : "outline"}
            className={filter === "rejected" ? "bg-red-600" : "border-red-500/50 text-red-400 hover:bg-red-500/10"}
          >
            უარყოფილი
          </Button>
          <Button
            onClick={() => setFilter("blocked")}
            variant={filter === "blocked" ? "default" : "outline"}
            className={filter === "blocked" ? "bg-red-800" : "border-red-500/50 text-red-400 hover:bg-red-500/10"}
          >
            დაბლოკილი
          </Button>
        </div>

        {isLoading ? (
          <Card className="bg-black/50 border-blue-500/20">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">იტვირთება...</p>
            </CardContent>
          </Card>
        ) : teams.length > 0 ? (
          <div className="grid gap-6">
            {teams.map((team) => (
              <Card
                key={team.id}
                className={`${
                  team.is_vip
                    ? "bg-gradient-to-br from-yellow-950/30 to-orange-950/30 border-yellow-500/50"
                    : "bg-black/50 border-blue-500/20"
                } backdrop-blur-sm`}
              >
                <CardHeader>
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <CardTitle
                        className={`text-2xl ${team.is_vip ? "text-yellow-400" : "text-blue-400"} flex items-center gap-2`}
                      >
                        {team.is_vip && <Crown className="w-6 h-6" />}
                        {team.team_name}
                      </CardTitle>
                      <CardDescription className="text-gray-300 mt-1">
                        [{team.team_tag}] - ლიდერი: {team.profiles?.username}
                      </CardDescription>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {team.status === "pending" && (
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400">
                          განხილვაში
                        </Badge>
                      )}
                      {team.status === "approved" && (
                        <Badge variant="outline" className="border-green-500/50 text-green-400">
                          დადასტურებული
                        </Badge>
                      )}
                      {team.status === "rejected" && (
                        <Badge variant="outline" className="border-red-500/50 text-red-400">
                          უარყოფილი
                        </Badge>
                      )}
                      {team.status === "blocked" && (
                        <Badge variant="outline" className="border-red-500/50 text-red-400">
                          დაბლოკილი
                        </Badge>
                      )}
                      {team.is_vip && <Badge className="bg-yellow-600">VIP</Badge>}
                      {team.slot_number && (
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400">
                          Slot #{team.slot_number}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6 mb-6 p-4 bg-blue-950/20 rounded-lg border border-blue-500/20">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">მოთამაშეების რაოდენობა</p>
                        <p className="text-2xl font-bold text-blue-400">{team.players_count}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center">
                        <MapPin className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">მაპების რაოდენობა</p>
                        <p className="text-2xl font-bold text-purple-400">{team.maps_count}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 pt-4 border-t border-blue-500/20">
                    <div className="flex flex-wrap gap-2">
                      {team.status !== "approved" && (
                        <Button
                          onClick={() => updateTeamStatus(team.id, "approved")}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
                        >
                          <Check className="w-4 h-4" />
                          დადასტურება
                        </Button>
                      )}
                      {team.status !== "rejected" && (
                        <Button
                          onClick={() => updateTeamStatus(team.id, "rejected")}
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 flex items-center gap-1"
                        >
                          <X className="w-4 h-4" />
                          უარყოფა
                        </Button>
                      )}
                      {team.status !== "blocked" && (
                        <Button
                          onClick={() => updateTeamStatus(team.id, "blocked")}
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                        >
                          <Ban className="w-4 h-4" />
                          დაბლოკვა
                        </Button>
                      )}
                      <Button
                        onClick={() => toggleVIP(team.id, team.is_vip)}
                        size="sm"
                        variant="outline"
                        className="border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/10 flex items-center gap-1"
                      >
                        <Crown className="w-4 h-4" />
                        {team.is_vip ? "VIP ამოღება" : "VIP დამატება"}
                      </Button>
                      <Button
                        onClick={() => deleteTeam(team.id)}
                        size="sm"
                        variant="outline"
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        წაშლა
                      </Button>
                    </div>

                    <div className="flex items-end gap-2">
                      {editingSlot === team.id ? (
                        <>
                          <div className="flex-1">
                            <Label className="text-gray-400 text-xs">Slot Number</Label>
                            <Input
                              type="number"
                              value={slotValue}
                              onChange={(e) => setSlotValue(e.target.value)}
                              placeholder="Slot რიცხვი"
                              className="bg-gray-900/50 border-blue-500/30 text-white"
                            />
                          </div>
                          <Button onClick={() => updateSlot(team.id)} size="sm" className="bg-blue-600">
                            შენახვა
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingSlot(null)
                              setSlotValue("")
                            }}
                            size="sm"
                            variant="outline"
                            className="border-gray-500/50"
                          >
                            გაუქმება
                          </Button>
                        </>
                      ) : (
                        <Button
                          onClick={() => {
                            setEditingSlot(team.id)
                            setSlotValue(team.slot_number?.toString() || "")
                          }}
                          size="sm"
                          variant="outline"
                          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                        >
                          Slot {team.slot_number ? "შეცვლა" : "დამატება"}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-black/50 border-blue-500/20">
            <CardContent className="py-12 text-center">
              <p className="text-gray-400">გუნდები არ მოიძებნა</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
