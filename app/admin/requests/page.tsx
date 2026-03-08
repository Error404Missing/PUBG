import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  ChevronLeft,
  Clock,
  CheckCircle,
  XCircle,
  Gamepad2,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { ka } from "date-fns/locale"
import { AdminRequestActions } from "@/components/admin-request-actions"

export default async function AdminRequestsPage() {
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

  const { data: requests } = await supabase
    .from("scrim_requests")
    .select(`
      *,
      teams (id, team_name, team_tag, leader_id),
      schedules (id, title, date)
    `)
    .order("created_at", { ascending: false })

  // Get team leader usernames
  const leaderIds = [...new Set(requests?.map((r) => r.teams?.leader_id).filter(Boolean) || [])]
  let leaderMap: Record<string, string> = {}
  if (leaderIds.length > 0) {
    const { data: leaders } = await supabase
      .from("profiles")
      .select("id, username")
      .in("id", leaderIds)

    if (leaders) {
      for (const l of leaders) {
        leaderMap[l.id] = l.username || "უცნობი"
      }
    }
  }

  const pendingCount = requests?.filter((r) => r.status === "pending").length || 0
  const approvedCount = requests?.filter((r) => r.status === "approved").length || 0
  const rejectedCount = requests?.filter((r) => r.status === "rejected").length || 0

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
            <Gamepad2 className="w-10 h-10" />
            თამაშის მოთხოვნები
          </h1>
          <p className="text-gray-400">გუნდების თამაშის მოთხოვნების მართვა</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-black/50 border-yellow-500/20">
            <CardContent className="pt-6 text-center">
              <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-yellow-400">{pendingCount}</p>
              <p className="text-sm text-gray-400">მოლოდინში</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-green-500/20">
            <CardContent className="pt-6 text-center">
              <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-green-400">{approvedCount}</p>
              <p className="text-sm text-gray-400">დადასტურებული</p>
            </CardContent>
          </Card>
          <Card className="bg-black/50 border-red-500/20">
            <CardContent className="pt-6 text-center">
              <XCircle className="w-6 h-6 text-red-400 mx-auto mb-2" />
              <p className="text-3xl font-bold text-red-400">{rejectedCount}</p>
              <p className="text-sm text-gray-400">უარყოფილი</p>
            </CardContent>
          </Card>
        </div>

        {/* Requests List */}
        <div className="space-y-3">
          {requests && requests.length > 0 ? (
            requests.map((req) => {
              const statusColor =
                req.status === "approved"
                  ? "border-green-500/30"
                  : req.status === "rejected"
                    ? "border-red-500/30"
                    : "border-yellow-500/30"

              return (
                <Card key={req.id} className={`bg-black/50 backdrop-blur-sm ${statusColor}`}>
                  <CardContent className="py-4">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="font-semibold text-white">
                            {req.teams?.team_name || "უცნობი გუნდი"}
                          </span>
                          <span className="text-gray-500 text-sm">
                            [{req.teams?.team_tag}]
                          </span>
                          {req.has_vip && (
                            <Badge className="bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 text-xs flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              VIP
                            </Badge>
                          )}
                          <Badge
                            className={
                              req.status === "approved"
                                ? "bg-green-600 text-white text-xs"
                                : req.status === "rejected"
                                  ? "bg-red-600 text-white text-xs"
                                  : "bg-yellow-600 text-white text-xs"
                            }
                          >
                            {req.status === "approved"
                              ? "დადასტურებული"
                              : req.status === "rejected"
                                ? "უარყოფილი"
                                : "მოლოდინში"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-400">
                          მატჩი: {req.schedules?.title || "უცნობი"}{" "}
                          {req.schedules?.date && (
                            <span className="text-gray-500">
                              ({format(new Date(req.schedules.date), "PPP", { locale: ka })})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500">
                          ლიდერი: {req.teams?.leader_id ? leaderMap[req.teams.leader_id] || "უცნობი" : "უცნობი"}
                          {" | "}
                          გაიგზავნა: {format(new Date(req.created_at), "PPP p", { locale: ka })}
                        </p>
                      </div>

                      {req.status === "pending" && (
                        <AdminRequestActions requestId={req.id} />
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <Card className="bg-black/50 border-blue-500/20">
              <CardContent className="py-12 text-center">
                <p className="text-gray-400">თამაშის მოთხოვნები არ არის</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
