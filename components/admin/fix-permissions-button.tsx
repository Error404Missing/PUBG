"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ShieldAlert, CheckCircle2, Loader2 } from "lucide-react"

export function FixPermissionsButton() {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleFix = async () => {
    setLoading(true)
    setStatus('idle')
    try {
      const res = await fetch('/api/admin/fix-rls', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        setStatus('success')
        setTimeout(() => setStatus('idle'), 5000)
      } else {
        setStatus('error')
        alert("შეცდომა სინქრონიზაციისას: " + data.error)
      }
    } catch (err) {
      setStatus('error')
      alert("კავშირის შეცდომა")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleFix}
      disabled={loading}
      variant="outline" 
      className={`h-16 px-10 rounded-[2rem] font-black uppercase tracking-widest italic flex items-center gap-3 transition-all ${
        status === 'success' ? 'border-emerald-500/50 text-emerald-400' : 
        status === 'error' ? 'border-rose-500/50 text-rose-400' : 'border-secondary/20 text-secondary'
      }`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 
       status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
       <ShieldAlert className="w-5 h-5" />}
      
      {loading ? "სინქრონიზაცია..." : 
       status === 'success' ? "სინქრონიზებულია" : 
       "ბაზის გასწორება (Fix RLS)"}
    </Button>
  )
}
