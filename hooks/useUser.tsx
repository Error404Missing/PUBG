"use client";

import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface UserProfile {
  id: string;
  email: string;
  username: string | null;
  role: string;
  is_vip: boolean;
  vip_until: string | null;
  is_blocked: boolean;
  team_id: string | null;
}

interface UseUserReturn {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isAuthenticated: boolean;
  refresh: () => Promise<void>;
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileData) {
          setProfile({
            id: profileData.id,
            email: profileData.email || user.email || "",
            username: profileData.username,
            role: profileData.role,
            is_vip: profileData.is_vip,
            vip_until: profileData.vip_until,
            is_blocked: profileData.is_blocked,
            team_id: profileData.team_id,
          });
        }
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const isAdmin = profile?.role === "ADMIN" || profile?.role === "FOUNDER";
  const isAuthenticated = !!user;

  return {
    user,
    profile,
    isLoading,
    isAdmin,
    isAuthenticated,
    refresh: fetchUser,
  };
}
