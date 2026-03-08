import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminUsersClient } from "@/components/admin-users-client"

export default async function AdminUsersPage() {
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

  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })

  const userIds = users?.map((u) => u.id) || []

  let vipMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const { data: vipStatuses } = await supabase
      .from("user_vip_status")
      .select("user_id, vip_until")
      .in("user_id", userIds)

    if (vipStatuses) {
      for (const v of vipStatuses) {
        if (new Date(v.vip_until) > new Date()) {
          vipMap[v.user_id] = v.vip_until
        }
      }
    }
  }

  return <AdminUsersClient users={users || []} vipMap={vipMap} />
}
