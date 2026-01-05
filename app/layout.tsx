import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import UserNav from "@/components/UserNav";

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PUBG Scrims Registration",
  description: "Register your team for PUBG Scrims",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body className={`${inter.className} flex bg-black text-gray-100 min-h-screen`}>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-64 p-8">
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-gray-400">Welcome</h2>
                <UserNav />
            </header>
            {children}
        </main>
      </body>
    </html>
  );
}
