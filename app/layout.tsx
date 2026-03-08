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
  title: "PUBG Scrims Registration",
  description: "რეგისტრაცია PUBG ტურნირებში - კონკურენტული გუნდური თამაში",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
