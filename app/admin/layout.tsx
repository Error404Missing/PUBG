import Link from "next/link";
import { 
  LayoutDashboard, 
  Users, 
  Shield, 
  Settings, 
  Calendar 
} from "lucide-react";
import { getUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getUser();
  
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    redirect("/");
  }

  const adminLinks = [
    { name: "მიმოხილვა", href: "/admin", icon: LayoutDashboard },
    { name: "გუნდები", href: "/admin/teams", icon: Users },
    { name: "სკრიმები", href: "/admin/scrims", icon: Calendar },
    { name: "მომხმარებლები", href: "/admin/users", icon: Shield },
    { name: "პარამეტრები", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="flex flex-col space-y-6">
      <header className="bg-neutral-900/90 backdrop-blur-md border border-neutral-800 p-1 rounded-2xl flex items-center justify-between shadow-xl shadow-black/50 sticky top-0 z-40">
        <div className="px-4 py-2 flex items-center gap-3">
          <div className="p-2 bg-red-900/20 rounded-lg border border-red-900/50">
            <Shield className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-none">ADMIN</h2>
            <p className="text-[10px] text-red-500 font-mono tracking-widest">PANEL</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 pr-2 overflow-x-auto">
          {adminLinks.map(link => (
            <Link 
              key={link.href} 
              href={link.href}
              className="px-4 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 flex items-center gap-2 text-sm font-medium transition-all hover:shadow-lg hover:shadow-black/20"
            >
              <link.icon className="w-4 h-4" />
              {link.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="bg-[#0f1014]/50 border border-white/5 rounded-2xl p-6 min-h-[600px] shadow-2xl backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}
