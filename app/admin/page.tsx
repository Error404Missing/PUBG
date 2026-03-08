import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, Trophy, Ban, Gamepad2, UserCog } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    redirect("/")
  }

  const { count: pendingTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { count: approvedTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("status", "approved")

  const { count: blockedTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true })
    .eq("status", "blocked")

  const { count: totalSchedules } = await supabase.from("schedules").select("*", { count: "exact", head: true })

  const { count: totalUsers } = await supabase.from("profiles").select("*", { count: "exact", head: true })

  const { count: pendingRequests } = await supabase
    .from("scrim_requests")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">ადმინისტრატორის პანელი</h1>
          <p className="text-gray-400">გუნდების, განრიგის და შედეგების მართვა</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-950/20 to-orange-950/20 border-yellow-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-yellow-400">განხილვაში</CardTitle>
              <CardDescription className="text-gray-400">ახალი გუნდები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-yellow-400">{pendingTeams || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-950/20 to-emerald-950/20 border-green-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-green-400">დადასტურებული</CardTitle>
              <CardDescription className="text-gray-400">აქტიური გუნდები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-green-400">{approvedTeams || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-950/20 to-rose-950/20 border-red-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-red-400">დაბლოკილი</CardTitle>
              <CardDescription className="text-gray-400">დაბლოკილი გუნდები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-red-400">{blockedTeams || 0}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-950/20 to-indigo-950/20 border-blue-500/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-blue-400">განრიგი</CardTitle>
              <CardDescription className="text-gray-400">მატჩები</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-blue-400">{totalSchedules || 0}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/teams">
            <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <Users className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-blue-400">გუნდების მართვა</CardTitle>
                <CardDescription className="text-gray-400">დადასტურება, უარყოფა, სლოტი, VIP</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/schedule">
            <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <Calendar className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-blue-400">განრიგის მართვა</CardTitle>
                <CardDescription className="text-gray-400">დაამატე ახალი მატჩები</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/results">
            <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <Trophy className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-blue-400">შედეგების მართვა</CardTitle>
                <CardDescription className="text-gray-400">დაამატე შედეგები და სურათები</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/rules">
            <Card className="bg-black/50 border-blue-500/20 backdrop-blur-sm hover:border-blue-500/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <Ban className="w-12 h-12 text-blue-400 mb-2" />
                <CardTitle className="text-blue-400">წესების მართვა</CardTitle>
                <CardDescription className="text-gray-400">დაამატე ან შეცვალე წესები</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="bg-black/50 border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <UserCog className="w-12 h-12 text-yellow-400 mb-2" />
                <CardTitle className="text-yellow-400">მომხმარებლები ({totalUsers || 0})</CardTitle>
                <CardDescription className="text-gray-400">ბეჯი, ბანი, VIP სტატუსი</CardDescription>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin/requests">
            <Card className="bg-black/50 border-green-500/20 backdrop-blur-sm hover:border-green-500/50 transition-all cursor-pointer h-full">
              <CardHeader>
                <Gamepad2 className="w-12 h-12 text-green-400 mb-2" />
                <CardTitle className="text-green-400">თამაშის მოთხოვნები ({pendingRequests || 0})</CardTitle>
                <CardDescription className="text-gray-400">გუნდების მოთხოვნები VIP ინდიკატორით</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
