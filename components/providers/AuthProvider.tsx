"use client";

// This provider is no longer needed with Supabase Auth
// Keeping it as a simple passthrough for backwards compatibility
export function AuthProvider({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
