import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Users, Crown, Mail, Hash } from "lucide-react";
import CancelTeamButton from "@/components/CancelTeamButton";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  // Get profile with team info
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) {
    return <div>მომხმარებელი არ მოიძებნა</div>;
  }

  // Get team if user has one
  let team = null;
  let slots: any[] = [];

  if (profile.team_id) {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('id', profile.team_id)
      .single();
    team = teamData;

    // Get active registrations for the team
    if (team) {
      const { data: slotsData } = await supabase
        .from('slots')
        .select(`
          *,
          scrim:scrims(id, title, date, time, map, status)
        `)
        .eq('team_id', team.id);
      slots = slotsData || [];
    }
  }

  // Check if user owns a team (is the owner)
  const { data: ownedTeam } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  const displayTeam = team || ownedTeam;

  const roleColors: Record<string, string> = {
    GUEST: "text-gray-400",
    MANAGER: "text-blue-400",
    ADMIN: "text-red-400",
    FOUNDER: "text-purple-400"
  };

  const roleLabels: Record<string, string> = {
    GUEST: "სტუმარი",
    MANAGER: "მენეჯერი",
    ADMIN: "ადმინისტრატორი",
    FOUNDER: "დამფუძნებელი"
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">პროფილი</h1>

      <div className="grid gap-6 md:grid-cols-2">
        {/* User Info */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              პირადი ინფორმაცია
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-zinc-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center text-xl font-bold text-white">
                  {profile.username[0].toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-white">{profile.username}</p>
                  <p className={`text-sm ${roleColors[profile.role] || 'text-gray-400'}`}>
                    {roleLabels[profile.role] || profile.role}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-400">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-400">
                <Shield className="w-4 h-4" />
                <span>ID: {user.id.slice(0, 8)}...</span>
              </div>
              <div className="flex items-center gap-2 text-yellow-500">
                <Crown className="w-4 h-4" />
                <span>Coins: {profile.coins || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Info */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-yellow-500" />
              გუნდის ინფორმაცია
            </CardTitle>
          </CardHeader>
          <CardContent>
            {displayTeam ? (
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-bold text-white">{displayTeam.name}</h3>
                    <span className="text-sm text-yellow-500 font-mono">[{displayTeam.tag}]</span>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold 
                    ${displayTeam.status === 'APPROVED' ? 'bg-green-900 text-green-300' : 
                      displayTeam.status === 'BLOCKED' ? 'bg-red-900 text-red-300' : 
                      'bg-yellow-900 text-yellow-300'}`}>
                    {displayTeam.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="p-3 bg-zinc-800/50 rounded text-center">
                    <p className="text-xs text-gray-500">მოთამაშეები</p>
                    <p className="text-lg font-bold text-white">{displayTeam.player_count || 0}</p>
                  </div>
                  <div className="p-3 bg-zinc-800/50 rounded text-center">
                    <p className="text-xs text-gray-500">რუკები</p>
                    <p className="text-lg font-bold text-white">{displayTeam.maps_count || 0}</p>
                  </div>
                </div>

                {displayTeam.is_vip && (
                  <div className="flex items-center gap-2 text-yellow-500 bg-yellow-900/20 p-2 rounded justify-center">
                    <Crown className="w-4 h-4" />
                    <span className="font-bold text-sm">VIP სტატუსი აქტიურია</span>
                  </div>
                )}
                
                {ownedTeam && (
                  <div className="pt-4 border-t border-zinc-800">
                    <CancelTeamButton />
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <p>თქვენ არ გაქვთ შექმნილი გუნდი</p>
                <a 
                  href="/teams/create" 
                  className="mt-4 inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors"
                >
                  გუნდის შექმნა
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Scrims */}
      {displayTeam && slots.length > 0 && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>აქტიური რეგისტრაციები</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.id} className="flex justify-between items-center p-3 bg-zinc-800/50 rounded border border-zinc-700">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-500" />
                    <div>
                      <p className="font-bold text-white">{slot.scrim?.map || 'Unknown'}</p>
                      <p className="text-xs text-gray-400">
                        {slot.scrim ? `${slot.scrim.date} ${slot.scrim.time}` : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-yellow-500 font-mono">Slot #{slot.slot_number}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
