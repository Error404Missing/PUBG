import { auth, signOut } from "@/auth";
import Link from "next/link";
import { LogOut, User as UserIcon, Shield } from "lucide-react";

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
        <Link href="/login" className="text-sm font-medium hover:text-yellow-500">შესვლა</Link>
        <Link href="/register" className="text-sm font-medium bg-yellow-600 hover:bg-yellow-700 px-4 py-2 rounded text-black">რეგისტრაცია</Link>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
        {/* User Info */}
      <div className="flex items-center space-x-2">
        {session.user.image ? (
            <img src={session.user.image} alt="Profile" className="w-8 h-8 rounded-full" />
        ) : (
            <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center">
                <span className="text-sm font-bold">{session.user.username?.[0]?.toUpperCase()}</span>
            </div>
        )}
        <span className="text-sm font-medium">{session.user.username}</span>
      </div>
      
      {/* Admin Link */}
      {(session.user.role === 'ADMIN' || session.user.role === 'FOUNDER') && (
        <Link href="/admin" className="text-xs bg-red-900 text-red-200 px-2 py-1 rounded flex items-center gap-1 hover:bg-red-800">
            <Shield className="w-3 h-3" />
            Admin
        </Link>
      )}
        
        {/* Profile Link */}
       <Link href="/profile" className="text-gray-400 hover:text-white" title="Profile">
          <UserIcon className="w-5 h-5" />
       </Link>

       {/* Sign Out */}
       <form
          action={async () => {
            "use server"
            await signOut()
          }}
        >
          <button className="text-gray-400 hover:text-white pt-1" title="Sign Out">
            <LogOut className="w-5 h-5" />
          </button>
        </form>
    </div>
  );
}
