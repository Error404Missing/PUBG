"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2, CheckCircle2 } from "lucide-react"
import { CustomConfirm } from "@/components/ui/custom-confirm"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"
import { useRouter } from "next/navigation"

export function UnbanTeamButton({ teamId }: { teamId: string }) {
  const [isLoading, setIsLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  const router = useRouter()

  const handleUnban = async () => {
    setIsLoading(true)
    setShowConfirm(false)
    try {
      const res = await fetch("/api/unban-team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ team_id: teamId })
      })

      const data = await res.json()
      if (!res.ok) {
         throw new Error(data.error || "შეცდომა ბანის მოხსნისას")
      }

      setToast({ message: data.message || "ბანი წარმატებით მოიხსნა", type: "success" })
      
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch (error: any) {
      setToast({ message: "შეცდომა: " + error.message, type: "error" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button 
        onClick={() => setShowConfirm(true)}
        disabled={isLoading}
        variant="outline" 
        className="w-full mt-4 h-12 bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors uppercase font-black text-xs tracking-widest gap-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        ბანის მოხსნა (10 ₾)
      </Button>

      <CustomConfirm
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleUnban}
        title="გუნდის რეაბილიტაცია"
        description="ამ მოქმედებით თქვენს ბალანსს ჩამოეჭრება 10 ლარი და გუნდს შეეძლება ხელახლა ითამაშოს სკრიმები მოდერაციის გავლის შემდეგ. გაგრძელება?"
        confirmText="გადახდა და მოხსნა"
        variant="warning"
      />

      {toast && (
        <LuxuryToast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </>
  )
}
