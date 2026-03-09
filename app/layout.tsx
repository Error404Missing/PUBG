import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { SupportChat } from "@/components/support-chat"
import { BannedScreen } from "@/components/banned-screen"
import { createClient } from "@/lib/supabase/server"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ARENA | Cyber-Luxury Scrims",
  description: "ელიტარული PUBG ტურნირები და სკრიმები. შექმენი შენი გუნდი და გახდი ჩემპიონი.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
    shortcut: "/favicon.png",
  },
}

import { Toaster } from "sonner"
import { Suspense } from "react"

async function AuthShield({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return <>{children}</>

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_banned, ban_reason, ban_until")
    .eq("id", user.id)
    .single()

  if (profile?.is_banned) {
     // Check expiration
     if (profile.ban_until && new Date(profile.ban_until) < new Date()) {
       return <>{children}</>
     } else {
       return <BannedScreen reason={profile.ban_reason} until={profile.ban_until} />
     }
  }

  return <>{children}</>
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ka" className="dark">
      <body className={`font-sans antialiased bg-background min-h-screen relative overflow-x-hidden`}>
        <div className="fixed inset-0 bg-mesh -z-20 opacity-50" />
        <Navigation />
        <main className="relative z-10">
          <Suspense fallback={null}>
            <AuthShield>
              {children}
            </AuthShield>
          </Suspense>
        </main>
        <SupportChat />
        <Analytics />
        <Toaster position="top-right" theme="dark" richColors />
      </body>
    </html>
  )
}
