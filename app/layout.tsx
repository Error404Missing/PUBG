import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import UserNav from "@/components/UserNav";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";
import { ToastProvider } from "@/components/providers/ToastProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Prekebi Scrims",
  description: "Elite PUBG Scrims Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka" className="dark">
      <body className={`${inter.variable} font-sans flex min-h-screen relative overflow-hidden bg-cyber-bg text-cyber-text antialiased selection:bg-primary/30 selection:text-white`}>
        <AuthProvider>
          <ToastProvider>
            <AnimatedBackground />

            {/* Sidebar z-index must be higher than content */}
            <div className="relative z-50">
              <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-500 relative z-10 h-screen overflow-y-auto lg:ml-[280px]">
              <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                <header className="flex justify-between items-center mb-8 pb-4 border-b border-white/5 relative">
                  <div className="flex flex-col">
                    <h2 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                      <span className="w-2 h-8 bg-gradient-to-b from-primary to-secondary rounded-sm block shadow-[0_0_15px_rgba(59,130,246,0.6)]" />
                      Dashboard
                    </h2>
                    <p className="text-sm text-cyber-muted mt-1 font-medium tracking-wide">
                      OPERATIONAL // <span className="text-success">SYSTEM ONLINE</span>
                    </p>
                  </div>
                  <div className="relative z-20">
                    <UserNav />
                  </div>
                </header>

                <div className="animate-slide-up">
                  {children}
                </div>
              </div>
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
