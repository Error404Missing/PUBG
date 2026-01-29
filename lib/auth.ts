import { createClient } from '@/lib/supabase/server';

export type UserRole = 'GUEST' | 'MANAGER' | 'ADMIN' | 'FOUNDER';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  coins: number;
  team_id: string | null;
}

export async function getUser(): Promise<AuthUser | null> {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null;
  }

  // Get the profile with additional user data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return null;
  }

  return {
    id: user.id,
    email: user.email || '',
    username: profile.username,
    role: profile.role as UserRole,
    coins: profile.coins,
    team_id: profile.team_id,
  };
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUser> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden');
  }
  return user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getUser();
  return user?.role === 'ADMIN' || user?.role === 'FOUNDER';
}
