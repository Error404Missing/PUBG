"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Users,
  Search,
  Shield,
  Ban,
  Unlock,
  Award,
  Zap,
  ChevronLeft,
} from "lucide-react"
import Link from "next/link"

interface UserProfile {
  id: string
  username: string | null
  email?: string | null
  is_admin: boolean
  is_banned?: boolean
  ban_reason?: string | null
  badge?: string | null
  created_at: string
}



export function AdminUsersClient({
  users,
  vipMap,
}: {
  users: UserProfile[]
  vipMap: Record<string, string>
}) {
  const supabase = createClient()
  const [searchTerm, setSearchTerm] = useState("")
  const [userList, setUserList] = useState(users)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [banReason, setBanReason] = useState("")
  const [badgeText, setBadgeText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)

  const filteredUsers = userList.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBanUser = async (userId: string) => {
    setIsLoading(true)
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: true, ban_reason: banReason || "წესების დარღვევა" })
      .eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_banned: true, ban_reason: banReason || "წესების დარღვევა" } : u
        )
      )
      setBanReason("")
    }
    setIsLoading(false)
  }

  const handleUnbanUser = async (userId: string) => {
    setIsLoading(true)
    const { error } = await supabase
      .from("profiles")
      .update({ is_banned: false, ban_reason: null })
      .eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u))
      )
    }
    setIsLoading(false)
  }

  const handleSetBadge = async (userId: string) => {
    setIsLoading(true)
    const badgeValue = badgeText.trim() || null
    const { error } = await supabase.from("profiles").update({ badge: badgeValue }).eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, badge: badgeValue } : u))
      )
      setDialogOpen(false)
      setBadgeText("")
    }
    setIsLoading(false)
  }

  const handleRemoveBadge = async (userId: string) => {
    setIsLoading(true)
    const { error } = await supabase.from("profiles").update({ badge: null }).eq("id", userId)

    if (!error) {
      setUserList((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, badge: null } : u))
      )
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-gray-400 hover:text-blue-400 transition-colors flex items-center gap-1 mb-4"
          >
            <ChevronLeft className="w-4 h-4" />
            ადმინ პანელი
          </Link>
          <h1 className="text-4xl font-bold text-yellow-400 mb-2 flex items-center gap-3">
            <Users className="w-10 h-10" />
            მომხმარებლების მართვა
          </h1>
          <p className="text-gray-400">ყველა რეგისტრირებული მომხმარებლის მართვა</p>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
          <Input
            placeholder="ძიება სახელით ან ID-ით..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-gray-900/50 border-blue-500/30 text-white"
          />
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-black/50 border-blue-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-blue-400">{userList.length}</p>
              <p className="text-sm text-gray-400">სულ</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-green-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-green-400">
                {Object.keys(vipMap).length}
              </p>
              <p className="text-sm text-gray-400">VIP</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-red-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-red-400">
                {userList.filter((u) => u.is_banned).length}
              </p>
              <p className="text-sm text-gray-400">დაბანილი</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-yellow-500/20">
            <CardContent className="pt-6 text-center">
              <p className="text-3xl font-bold text-yellow-400">
                {userList.filter((u) => u.is_admin).length}
              </p>
              <p className="text-sm text-gray-400">ადმინი</p>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="space-y-3">
          {filteredUsers.map((u) => {
            const hasVip = !!vipMap[u.id]

            return (
              <Card
                key={u.id}
                className={`bg-black/50 backdrop-blur-sm transition-all ${
                  u.is_banned
                    ? "border-red-500/40"
                    : u.is_admin
                      ? "border-yellow-500/30"
                      : "border-blue-500/20 hover:border-blue-500/40"
                }`}
              >
                <CardContent className="py-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="font-semibold text-white truncate">
                          {u.username || "უცნობი"}
                        </span>
                        {u.is_admin && (
                          <Badge className="bg-yellow-600 text-yellow-100 text-xs flex items-center gap-1">
                            <Shield className="w-3 h-3" />
                            ადმინი
                          </Badge>
                        )}
                        {u.is_banned && (
                          <Badge className="bg-red-600 text-red-100 text-xs flex items-center gap-1">
                            <Ban className="w-3 h-3" />
                            დაბანილი
                          </Badge>
                        )}
                        {hasVip && (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            VIP
                          </Badge>
                        )}
                        {u.badge && (
                          <Badge className="bg-blue-600 text-white text-xs flex items-center gap-1">
                            <Award className="w-3 h-3" />
                            {u.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">ID: {u.id}</p>
                      {u.is_banned && u.ban_reason && (
                        <p className="text-xs text-red-400 mt-1">
                          მიზეზი: {u.ban_reason}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Badge Dialog */}
                      <Dialog open={dialogOpen && selectedUser?.id === u.id} onOpenChange={(open) => {
                        setDialogOpen(open)
                        if (open) {
                          setSelectedUser(u)
                          setBadgeText(u.badge || "")
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 bg-transparent"
                          >
                            <Award className="w-4 h-4 mr-1" />
                            ბეჯი
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-950 border-blue-500/30">
                          <DialogHeader>
                            <DialogTitle className="text-blue-400">
                              ბეჯის მინიჭება - {u.username}
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 pt-4">
                            <div>
                              <Label className="text-gray-300">ჩაწერეთ ბეჯის ტექსტი</Label>
                              <Input
                                value={badgeText}
                                onChange={(e) => setBadgeText(e.target.value)}
                                placeholder="მაგ: PRO, ჩემპიონი, ვეტერანი..."
                                className="bg-gray-900/50 border-blue-500/30 text-white mt-2"
                              />
                              <p className="text-xs text-gray-500 mt-1">რაც ჩაწერთ, ის გამოჩნდება მომხმარებლის პროფილზე</p>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSetBadge(u.id)}
                                disabled={isLoading || !badgeText.trim()}
                                className="flex-1 bg-blue-600 hover:bg-blue-700"
                              >
                                {isLoading ? "იტვირთება..." : "მინიჭება"}
                              </Button>
                              {u.badge && (
                                <Button
                                  onClick={() => handleRemoveBadge(u.id)}
                                  disabled={isLoading}
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                                >
                                  წაშლა
                                </Button>
                              )}
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>

                      {/* Ban/Unban */}
                      {!u.is_admin && (
                        <>
                          {u.is_banned ? (
                            <Button
                              size="sm"
                              onClick={() => handleUnbanUser(u.id)}
                              disabled={isLoading}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <Unlock className="w-4 h-4 mr-1" />
                              განბანვა
                            </Button>
                          ) : (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
                                  onClick={() => setSelectedUser(u)}
                                >
                                  <Ban className="w-4 h-4 mr-1" />
                                  დაბანვა
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-gray-950 border-red-500/30">
                                <DialogHeader>
                                  <DialogTitle className="text-red-400">
                                    მომხმარებლის დაბანვა - {u.username}
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 pt-4">
                                  <div>
                                    <Label className="text-gray-300">დაბანვის მიზეზი</Label>
                                    <Textarea
                                      placeholder="მიუთითეთ მიზეზი..."
                                      value={banReason}
                                      onChange={(e) => setBanReason(e.target.value)}
                                      className="bg-gray-900/50 border-red-500/30 text-white mt-2"
                                    />
                                  </div>
                                  <Button
                                    onClick={() => handleBanUser(u.id)}
                                    disabled={isLoading}
                                    className="w-full bg-red-600 hover:bg-red-700"
                                  >
                                    {isLoading ? "იტვირთება..." : "დაბანვა"}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {filteredUsers.length === 0 && (
            <Card className="bg-black/50 border-blue-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">მომხმარებლები ვერ მოიძებნა</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
