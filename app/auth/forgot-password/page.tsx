"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useState } from "react"
import { User, ArrowRight, ShieldCheck, Mail, ChevronLeft } from "lucide-react"
import { LuxuryToast, ToastType } from "@/components/ui/luxury-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string, type: ToastType } | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
      })
      if (error) throw error
      setToast({ message: "პაროლის აღდგენის ბმული გამოგზავნილია თქვენს ელ-ფოსტაზე.", type: 'success' })
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : "შეცდომა მოხდა"
      setError(errMsg)
      setToast({ message: "შეცდომა: " + errMsg, type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,180,0,0.05),transparent_50%)]" />
      
      <div className="w-full max-w-xl relative animate-reveal">
        <div className="mb-12">
           <Link 
             href="/auth/login" 
             className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group mb-8"
           >
             <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] italic">უკან შესვლაზე</span>
           </Link>

           <div className="text-center">
               <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8 animate-float-subtle">
                  <Mail className="w-10 h-10 text-primary" />
               </div>
               <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Password <span className="text-primary tracking-normal">Recover</span></h1>
               <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">შეიყვანეთ თქვენი ელ-ფოსტა პაროლის აღსადგენად</p>
           </div>
        </div>

        <div className="glass-card p-1 shadow-[0_0_100px_rgba(255,200,0,0.05)]">
           <div className="p-10 lg:p-14">
              <form onSubmit={handleReset} className="space-y-8">
                 <div className="space-y-6">
                    <div className="group relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors">Protocol: Registered Email</label>
                       <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="OPERATOR_EMAIL@GMAIL.COM"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="bg-white/5 border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                          />
                       </div>
                    </div>
                 </div>

                 {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-reveal">
                       {error}
                    </div>
                 )}

                  <Button 
                     type="submit" 
                     variant="premium"
                     className="w-full h-16 text-lg group" 
                     disabled={isLoading || !!toast}
                  >
                     {isLoading ? (
                        <span className="flex items-center gap-3">
                           <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                           Sending link...
                        </span>
                     ) : (
                        <span className="flex items-center gap-3">
                           Send Recovery Link
                           <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </span>
                     )}
                  </Button>
              </form>
           </div>
        </div>
        
        <div className="mt-12 text-center opacity-30">
           <div className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground">PUBG SCRIM ARENA // RECOVERY_SUBSYS_V1.0</div>
        </div>
      </div>
    </div>
  )
}
