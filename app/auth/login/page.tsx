"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { User, Lock, ArrowRight, ShieldCheck } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/profile")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "შეცდომა მოხდა")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  const handleBiometricLogin = async () => {
    // For now, we'll show a toast that this is coming soon or use WebAuthn if it was configured
    // Supabase supports WebAuthn, but it requires prior registration.
    // I will add a placeholder for future implementation or basic detection.
    if (!window.PublicKeyCredential) {
      setError("თქვენს მოწყობილობას არ აქვს ბიომეტრიული ავტორიზაციის მხარდაჭერა")
      return
    }
    setError("ბიომეტრიული ავტორიზაცია (Passkey) დაემატება შემდეგ განახლებაში. გამოიყენეთ Google შესვლა სწრაფი წვდომისთვის.")
  }

  const searchParams = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "")
  const msgFromUrl = searchParams.get("message")
  const errFromUrl = searchParams.get("error")

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,180,0,0.05),transparent_50%)]" />
      
      <div className="w-full max-w-xl relative animate-reveal">
        <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-8 animate-float-subtle">
               <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-black text-white italic tracking-tighter uppercase mb-4">Secure <span className="text-primary tracking-normal">Access</span></h1>
            <p className="text-muted-foreground font-light tracking-widest uppercase text-xs">აირჩიეთ ავტორიზაციის სასურველი მეთოდი</p>
        </div>

        <div className="glass-card p-1 shadow-[0_0_100px_rgba(255,200,0,0.05)]">
           <div className="p-10 lg:p-14">
              {/* Social Login Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                 <Button 
                    onClick={handleGoogleLogin} 
                    variant="outline" 
                    className="h-16 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 flex items-center gap-3 transition-all group"
                 >
                    <img src="https://www.google.com/favicon.ico" className="w-5 h-5 grayscale group-hover:grayscale-0 transition-all" alt="Google" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Google Login</span>
                 </Button>
                 <Button 
                    onClick={handleBiometricLogin} 
                    variant="outline" 
                    className="h-16 rounded-2xl border-white/5 bg-white/5 hover:bg-white/10 flex items-center gap-3 transition-all group border-dashed"
                 >
                    <Lock className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-white transition-colors">FaceID / TouchID</span>
                 </Button>
              </div>

              <div className="relative mb-10">
                 <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/5"></div>
                 </div>
                 <div className="relative flex justify-center text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground">
                    <span className="bg-[#0A0A0A] px-4">OR_USE_TRADITIONAL_PROTOCOL</span>
                 </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                 <div className="space-y-6">
                    <div className="group relative">
                       <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors">Protocol: Email</label>
                       <div className="relative">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
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
                        <div className="flex justify-between items-center mb-3">
                           <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground block px-1 group-focus-within:text-primary transition-colors">Credential: Password</label>
                           <Link href="/auth/forgot-password"  className="text-[9px] font-black uppercase tracking-widest text-primary/50 hover:text-primary transition-colors">დაგავიწყდათ პაროლი?</Link>
                        </div>
                        <div className="relative">
                           <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary transition-colors" />
                           <Input
                             id="password"
                             type="password"
                             placeholder="••••••••"
                             required
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             autoComplete="current-password"
                             className="bg-white/5 border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                           />
                        </div>
                     </div>
                 </div>

                 {(error || errFromUrl) && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-reveal">
                       {error || (errFromUrl === 'Invalid_Code' ? 'ბმული არასწორია' : errFromUrl)}
                    </div>
                 )}

                 {msgFromUrl && (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold animate-reveal">
                       {msgFromUrl === 'Password_Reset_Success' ? 'პაროლი წარმატებით შეიცვალა' : msgFromUrl}
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
                          Authorizing...
                       </span>
                    ) : (
                       <span className="flex items-center gap-3">
                          Access Account
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                       </span>
                    )}
                 </Button>

                 <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground font-light">
                       არ გაქვთ ანგარიში?{" "}
                       <Link href="/auth/register" className="text-primary font-black uppercase tracking-widest text-[10px] ml-2 hover:underline underline-offset-4">
                          რეგისტრაცია
                       </Link>
                    </p>
                 </div>
              </form>
           </div>
        </div>
        
        <div className="mt-12 text-center opacity-30">
           <div className="text-[8px] font-black uppercase tracking-[0.5em] text-muted-foreground">PUBG SCRIM ARENA // AUTH_SUBSYSTEM_V2.0</div>
        </div>
      </div>
    </div>
  )
}
