import { auth } from "@/auth";
import Link from "next/link";
import { LogOut, User as UserIcon, Shield, LogIn, UserPlus } from "lucide-react";
import { handleSignOut } from "@/app/actions/auth-actions";

export default async function UserNav() {
  let session: Awaited<ReturnType<typeof auth>> | null = null;
  try {
    session = await auth();
  } catch {
    session = null;
  }

  if (!session?.user) {
    return (
      <div className="flex space-x-4 items-center">
        <Link
          href="/login"
          className="flex items-center gap-2 text-[10px] font-black text-white/60 hover:text-white uppercase tracking-[0.2em] transition-colors"
        >
          <LogIn className="w-3 h-3" />
          შესვლა
        </Link>
        <Link
          href="/register"
          className="flex items-center gap-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-lg text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          <UserPlus className="w-3 h-3" />
          რეგისტრაცია
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-6">
      {/* Admin Link */}
      {(session.user.role === 'ADMIN' || session.user.role === 'FOUNDER') && (
        <Link
          href="/admin"
          className="flex items-center gap-2 px-3 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all"
        >
          <Shield className="w-3 h-3" />
          Admin
        </Link>
      )}

      {/* User Info */}
      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <p className="text-[10px] font-black text-white uppercase tracking-wider">{session.user.username}</p>
          <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{session.user.role || 'USER'}</p>
        </div>

        <Link href="/profile" className="relative group">
          {session.user.image ? (
            <img src={session.user.image} alt="Profile" className="w-9 h-9 rounded-xl border border-white/10 group-hover:border-primary/50 transition-colors object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/50 transition-colors">
              <span className="text-xs font-black text-primary/80">{session.user.username?.[0]?.toUpperCase()}</span>
            </div>
          )}
          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-500 border-2 border-[#020305] rounded-full" />
        </Link>
      </div>

      {/* Sign Out */}
      <form action={handleSignOut}>
        <button
          title="Sign Out"
          className="p-2 text-white/30 hover:text-rose-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
