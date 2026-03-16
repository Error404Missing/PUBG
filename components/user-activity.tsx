"use client"

import { useEffect, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"

export function UserActivity() {
  const supabase = createBrowserClient()

  const updateLastSeen = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", user.id)
  }, [supabase])

  useEffect(() => {
    // Update immediately on mount
    updateLastSeen()

    // Update every 2 minutes
    const interval = setInterval(() => {
      updateLastSeen()
    }, 1000 * 60 * 2)

    return () => clearInterval(interval)
  }, [updateLastSeen])

  return null
}
