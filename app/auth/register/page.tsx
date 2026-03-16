"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { User, Lock, Mail, ArrowRight, UserPlus } from "lucide-react"

export default function RegisterPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      })
      if (error) throw error
      router.push("/auth/success")
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("შეცდომა მოხდა")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,180,0,0.05),transparent_50%)]" />
      
      <div className="w-full max-w-xl relative animate-reveal">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8 animate-float-subtle">
               <UserPlus className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Unit <span className="text-primary tracking-normal">Creation</span></h1>
            <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">შექმენით ახალი ანგარიში Arena-სთვის</p>
        </div>

        <div className="glass-card p-1 shadow-[0_0_100px_rgba(255,200,0,0.05)]">
           <div className="p-10 lg:p-14">
              <form onSubmit={handleRegister} className="space-y-8">
                 <div className="space-y-6">
                    <div className="group relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors">Identity: Username</label>
                       <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="username"
                            type="text"
                            placeholder="OPERATOR_NAME"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            autoComplete="username"
                            className="bg-white/5 border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                          />
                       </div>
                    </div>

                    <div className="group relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors">Contact: Email</label>
                       <div className="relative">
                          <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="email"
                            type="email"
                            placeholder="OPERATOR_EMAIL@GMAIL.COM"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            className="bg-white/5 border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                          />
                       </div>
                    </div>

                    <div className="group relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors">Security: Password</label>
                       <div className="relative">
                          <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                          <Input
                            id="password"
                            type="password"
                            placeholder="••••••••"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
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
                    disabled={isLoading}
                 >
                    {isLoading ? (
                       <span className="flex items-center gap-3">
                          <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          Processing...
                       </span>
                    ) : (
                       <span className="flex items-center gap-3">
                          Create Account
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </span>
                    )}
                 </Button>

                 <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground font-light">
                       უკვე გაქვთ ანგარიში?{" "}
                       <Link href="/auth/login" className="text-primary font-black uppercase tracking-widest text-[10px] ml-2 hover:underline underline-offset-4">
                          შესვლა
                       </Link>
                    </p>
                 </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  )
}
