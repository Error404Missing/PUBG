"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Menu, X, KeyRound, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function Navigation() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [hasApprovedTeam, setHasApprovedTeam] = useState(false)
  const [roomInfo, setRoomInfo] = useState<{
    room_id: string | null
    room_password: string | null
    start_time: string | null
    map: string | null
  } | null>(null)

  useEffect(() => {
    const supabase = createClient()

    const checkUserStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase.from("profiles").select("is_admin, role").eq("id", user.id).single()
        setIsAdmin(data?.is_admin || false)

        const { data: teamData } = await supabase
          .from("teams")
          .select("id, status")
          .eq("leader_id", user.id)
          .eq("status", "approved")
          .single()

        const hasTeam = !!teamData
        setHasApprovedTeam(hasTeam)

        if (hasTeam) {
          const { data: settingsData } = await supabase
            .from("site_settings")
            .select("key, value")
            .in("key", ["room_id", "room_password", "start_time", "map"])

          if (settingsData) {
            const roomData = {
              room_id: settingsData.find((s) => s.key === "room_id")?.value || "",
              room_password: settingsData.find((s) => s.key === "room_password")?.value || "",
              start_time: settingsData.find((s) => s.key === "start_time")?.value || "",
              map: settingsData.find((s) => s.key === "map")?.value || "",
            }

            if (roomData.room_id || roomData.room_password || roomData.start_time || roomData.map) {
              setRoomInfo(roomData)
            }
          }
        }
      }
    }

    checkUserStatus()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      if (session?.user) {
        checkUserStatus()
      } else {
        setIsAdmin(false)
        setHasApprovedTeam(false)
        setRoomInfo(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const navItems = [
    { href: "/", label: "მთავარი" },
    { href: "/schedule", label: "განრიგი" },
    { href: "/teams", label: "გუნდები" },
    { href: "/results", label: "შედეგები" },
    { href: "/blocked", label: "დაბლოკილები" },
    { href: "/case-opening", label: "Case", special: "case" },
    { href: "/vip", label: "VIP", special: "vip" },
    { href: "/rules", label: "წესები" },
    { href: "/contact", label: "კონტაქტი" },
  ]

  const adminItems = [
    { href: "/admin", label: "ადმინ პანელი" },
    { href: "/admin/teams", label: "გუნდების მართვა" },
    { href: "/admin/settings", label: "პარამეტრები" },
  ]

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-7xl">
      <div className="glass-darker border border-white/10 rounded-2xl px-6 py-3 shadow-2xl backdrop-blur-3xl">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="text-2xl font-black tracking-tighter text-white group-hover:scale-105 transition-transform duration-300">
              PUBG<span className="text-primary italic">ARENA</span>
            </div>
          </Link>

          {/* Nav Items - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-300 relative group overflow-hidden ${
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {isActive && (
                    <div className="absolute inset-0 bg-primary/10 -z-0" />
                  )}
                  {item.special === 'case' && (
                     <div className="absolute top-0 right-0 w-1 h-1 bg-secondary rounded-full animate-ping" />
                  )}
                </Link>
              )
            })}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
             {isAdmin && (
                <Link 
                  href="/admin" 
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-secondary/20 text-secondary border border-secondary/30 hover:bg-secondary/30 transition-all"
                >
                  Admin
                </Link>
             )}
             
             {user ? (
               <div className="flex items-center gap-2">
                 <Link href="/profile" className="w-10 h-10 rounded-full border border-white/10 glass flex items-center justify-center hover:border-primary/50 transition-colors overflow-hidden">
                    <Users className="w-5 h-5 text-muted-foreground" />
                 </Link>
                 <button 
                   onClick={handleLogout}
                   className="hidden md:block text-xs font-bold text-muted-foreground hover:text-red-400 transition-colors px-2"
                 >
                   გასვლა
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-2">
                 <Link href="/auth/login" className="px-5 py-2 text-xs font-bold text-white hover:bg-white/5 rounded-xl transition-all">
                   Login
                 </Link>
                 <Link href="/auth/register" className="btn-premium px-5 py-2.5 text-xs text-white">
                   Join Arena
                 </Link>
               </div>
             )}

             {/* Mobile Menu Toggle */}
             <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-white glass rounded-lg"
             >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
             </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 glass-darker border border-white/10 rounded-2xl p-6 animate-reveal">
           <div className="grid grid-cols-2 gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 rounded-xl glass border border-white/5 text-sm font-bold text-center hover:bg-white/5 active:scale-95 transition-all text-white"
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                 <button 
                  onClick={() => { handleLogout(); setIsOpen(false); }}
                  className="px-4 py-3 rounded-xl glass border border-red-500/20 text-red-400 text-sm font-bold text-center"
                 >
                   გასვლა
                 </button>
              )}
           </div>
        </div>
      )}
    </nav>
  )
}

const handleLogout = async () => {
  const supabase = createClient()
  await supabase.auth.signOut()
}
