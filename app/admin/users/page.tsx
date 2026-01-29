import { createClient } from "@/lib/supabase/server";
import { getUser } from "@/lib/auth";
import AdminUserList from "@/components/AdminUserList";

export default async function AdminUsersPage() {
  const currentUser = await getUser();
  
  const supabase = await createClient();

  const { data: users } = await supabase
    .from('profiles')
    .select(`
      id,
      username,
      role,
      created_at,
      team_id
    `)
    .order('created_at', { ascending: false });

  // Get teams for users who have them
  const teamIds = (users || []).filter(u => u.team_id).map(u => u.team_id);
  let teamsMap: Record<string, { name: string; tag: string }> = {};
  
  if (teamIds.length > 0) {
    const { data: teams } = await supabase
      .from('teams')
      .select('id, name, tag')
      .in('id', teamIds);
    
    teamsMap = (teams || []).reduce((acc, t) => {
      acc[t.id] = { name: t.name, tag: t.tag };
      return acc;
    }, {} as Record<string, { name: string; tag: string }>);
  }

  const usersWithTeams = (users || []).map(u => ({
    id: u.id,
    username: u.username,
    email: '', // Not stored in profiles for privacy
    role: u.role,
    createdAt: u.created_at,
    team: u.team_id ? teamsMap[u.team_id] : null
  }));

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">მომხმარებლების მართვა</h1>
        <span className="text-sm text-gray-500">სულ: {usersWithTeams.length}</span>
      </div>
      
      <AdminUserList users={usersWithTeams} currentUserRole={currentUser?.role || 'GUEST'} />
    </div>
  );
}
