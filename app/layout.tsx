import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/providers/ToastProvider";
import Sidebar from "@/components/Sidebar";
import { AnimatedBackground } from "@/components/ui/AnimatedBackground";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "PREKEBI | Tactical Scrims Portal",
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
            <div className="relative z-[100]">
              <Sidebar />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 transition-all duration-500 relative z-10 h-screen overflow-y-auto lg:ml-[280px]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
              </div>
            </main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
