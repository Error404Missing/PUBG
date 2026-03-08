import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { SupportChat } from "@/components/support-chat"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "ARENA | Cyber-Luxury Scrims",
  description: "ელიტარული PUBG ტურნირები და სკრიმები. შექმენი შენი გუნდი და გახდი ჩემპიონი.",
  icons: {
    icon: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-gaming-V5o8O2Z2qW6P3n7M1f9S8L7K5J4H3G.png?v=2",
    apple: "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-gaming-V5o8O2Z2qW6P3n7M1f9S8L7K5J4H3G.png?v=2",
  },
}

export default function RootLayout({
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
          {children}
        </main>
        <SupportChat />
        <Analytics />
      </body>
    </html>
  )
}
