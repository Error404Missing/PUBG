"use client"

import type React from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { User, Lock, Mail, ArrowRight, UserPlus, Image as ImageIcon, Check, ChevronLeft, Sparkles } from "lucide-react"

const DEFAULT_AVATARS = [
  "https://i.ibb.co/vzD7Z0M/default-avatar-dark.png",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Felix",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Aria",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Jack",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Zoe",
  "https://api.dicebear.com/7.x/bottts/svg?seed=Leo"
]

const DEFAULT_BANNERS = [
  "https://i.ibb.co/vYm0C2M/default-banner-dark.jpg",
  "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1614850523296-e8c041848bb4?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1534423861386-85a16f5d53ca?auto=format&fit=crop&q=80&w=1000"
]

export default function RegisterPage() {
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [username, setUsername] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0])
  const [selectedBanner, setSelectedBanner] = useState(DEFAULT_BANNERS[0])
  
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
            avatar_url: selectedAvatar,
            banner_url: selectedBanner
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

  const nextStep = (e: React.FormEvent) => {
     e.preventDefault()
     if (username && email && password) {
        setStep(1)
     }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-[#050505]">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,180,0,0.03),transparent_70%)]" />
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-primary/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-2xl relative animate-reveal">
        <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[2rem] glass border border-primary/20 mb-6 animate-float-subtle">
               {step === 0 ? <UserPlus className="w-10 h-10 text-primary" /> : <Sparkles className="w-10 h-10 text-primary" />}
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase mb-3">Unit <span className="text-primary tracking-normal">{step === 0 ? 'Creation' : 'Identity'}</span></h1>
            <p className="text-muted-foreground font-light tracking-widest uppercase text-[10px]">{step === 0 ? 'შექმენით ახალი ანგარიში Arena-სთვის' : 'აირჩიეთ თქვენი ტაქტიკური ვიზუალი'}</p>
        </div>

        <div className="glass-card p-1 shadow-[0_0_100px_rgba(255,200,0,0.02)] border-white/5">
           <div className="p-8 lg:p-12">
              <form onSubmit={step === 0 ? nextStep : handleRegister} className="space-y-8">
                 {step === 0 ? (
                    <div className="space-y-6 animate-reveal">
                       <div className="group relative">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors italic">Identity: Username</label>
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
                               className="bg-white/[0.03] border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                             />
                          </div>
                       </div>

                       <div className="group relative">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors italic">Contact: Email</label>
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
                               className="bg-white/[0.03] border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                             />
                          </div>
                       </div>

                       <div className="group relative">
                          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-3 block px-1 group-focus-within:text-primary transition-colors italic">Security: Password</label>
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
                               className="bg-white/[0.03] border-white/5 h-16 pl-14 text-white placeholder:text-white/10 focus:border-primary/50 focus:bg-white/10 transition-all rounded-2xl font-bold tracking-tight"
                             />
                          </div>
                       </div>
                    </div>
                 ) : (
                    <div className="space-y-10 animate-reveal">
                       {/* Preview Section */}
                       <div className="relative overflow-hidden rounded-[2rem] border border-white/5 group">
                          <div 
                             className="h-32 bg-cover bg-center transition-all duration-700" 
                             style={{ backgroundImage: `url(${selectedBanner})` }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                          
                          <div className="absolute bottom-4 left-6 flex items-end gap-4">
                             <div className="w-16 h-16 rounded-2xl border-2 border-background glass overflow-hidden shadow-2xl">
                                <img src={selectedAvatar} alt="Preview" className="w-full h-full object-cover" />
                             </div>
                             <div className="pb-1">
                                <h4 className="text-lg font-black text-white italic tracking-tighter uppercase leading-none">{username || 'OPERATOR'}</h4>
                                <p className="text-[8px] font-black text-primary uppercase tracking-[0.3em] mt-1">Ready for deployment</p>
                             </div>
                          </div>
                       </div>

                       {/* Avatar Selection */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic flex items-center gap-2">
                                <User className="w-3 h-3 text-primary" />
                                Tactical Avatar
                             </label>
                             <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">Default selection</span>
                          </div>
                          <div className="grid grid-cols-6 gap-3">
                             {DEFAULT_AVATARS.map((url, i) => (
                                <button
                                   key={i}
                                   type="button"
                                   onClick={() => setSelectedAvatar(url)}
                                   className={`aspect-square rounded-xl border-2 transition-all p-0.5 relative group overflow-hidden ${
                                      selectedAvatar === url ? 'border-primary ring-4 ring-primary/20' : 'border-white/5 hover:border-white/20'
                                   }`}
                                >
                                   <img src={url} alt={`Avatar ${i}`} className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform duration-500" />
                                   {selectedAvatar === url && (
                                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                                         <Check className="w-4 h-4 text-primary" />
                                      </div>
                                   )}
                                </button>
                             ))}
                          </div>
                       </div>

                       {/* Banner Selection */}
                       <div className="space-y-4">
                          <div className="flex items-center justify-between px-1">
                             <label className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic flex items-center gap-2">
                                <ImageIcon className="w-3 h-3 text-primary" />
                                Deployment Banner
                             </label>
                             <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest italic">Default selection</span>
                          </div>
                          <div className="grid grid-cols-5 gap-3">
                             {DEFAULT_BANNERS.map((url, i) => (
                                <button
                                   key={i}
                                   type="button"
                                   onClick={() => setSelectedBanner(url)}
                                   className={`h-16 rounded-xl border-2 transition-all overflow-hidden relative group ${
                                      selectedBanner === url ? 'border-primary ring-4 ring-primary/20' : 'border-white/5 hover:border-white/20'
                                   }`}
                                >
                                   <div 
                                      className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-700" 
                                      style={{ backgroundImage: `url(${url})` }}
                                   />
                                   <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                                   {selectedBanner === url && (
                                      <div className="absolute inset-0 bg-primary/10 flex items-center justify-center pointer-events-none">
                                         <Check className="w-6 h-6 text-primary drop-shadow-lg" />
                                      </div>
                                   )}
                                </button>
                             ))}
                          </div>
                       </div>
                    </div>
                 )}

                 {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] font-black tracking-widest uppercase italic animate-reveal text-center">
                       ERROR_CODE: {error}
                    </div>
                 )}

                 <div className="flex items-center gap-4 pt-4">
                    {step === 1 && (
                       <Button 
                          type="button" 
                          variant="outline" 
                          className="h-16 w-16 rounded-2xl border-white/5 hover:bg-white/5 transition-all text-white/50 hover:text-white"
                          onClick={() => setStep(0)}
                          disabled={isLoading}
                       >
                          <ChevronLeft className="w-6 h-6" />
                       </Button>
                    )}
                    <Button 
                       type="submit" 
                       variant="premium"
                       className="flex-1 h-16 text-lg group rounded-2xl" 
                       disabled={isLoading}
                    >
                       {isLoading ? (
                          <span className="flex items-center gap-3 font-black uppercase italic tracking-widest text-xs">
                             <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                             Processing_Request...
                          </span>
                       ) : (
                          <span className="flex items-center gap-3 font-black uppercase italic tracking-widest text-sm">
                             {step === 0 ? 'Continue Strategy' : 'Finalize Deployment'}
                             <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </span>
                       )}
                    </Button>
                 </div>

                 {step === 0 && (
                    <div className="text-center pt-4">
                       <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest italic">
                          უკვე გაქვთ ანგარიში?{" "}
                          <Link href="/auth/login" className="text-primary hover:underline underline-offset-4 ml-2">
                             შესვლა
                          </Link>
                       </p>
                    </div>
                 )}
              </form>
           </div>
        </div>
      </div>
    </div>
  )
}
