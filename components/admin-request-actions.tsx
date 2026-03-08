"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function AdminRequestActions({ requestId }: { requestId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleAction = async (status: "approved" | "rejected") => {
    setIsLoading(true)
    const { error } = await supabase
      .from("scrim_requests")
      .update({ status })
      .eq("id", requestId)

    if (!error) {
      router.refresh()
    }
    setIsLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        onClick={() => handleAction("approved")}
        disabled={isLoading}
        className="bg-green-600 hover:bg-green-700 text-white"
      >
        <CheckCircle className="w-4 h-4 mr-1" />
        დადასტურება
      </Button>
      <Button
        size="sm"
        onClick={() => handleAction("rejected")}
        disabled={isLoading}
        variant="outline"
        className="border-red-500/30 text-red-400 hover:bg-red-500/10 bg-transparent"
      >
        <XCircle className="w-4 h-4 mr-1" />
        უარყოფა
      </Button>
    </div>
  )
}
